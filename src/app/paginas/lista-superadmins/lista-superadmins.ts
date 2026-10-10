import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { Superadmins, UsuarioResumen } from '../../servicios/superadmins';
import { FormularioSuperadmin } from '../formulario-superadmin/formulario-superadmin';

/** Listado paginado de SuperAdmins: busqueda, crear, editar, activar y desactivar */
@Component({
  selector: 'app-lista-superadmins',
  imports: [FormularioSuperadmin],
  templateUrl: './lista-superadmins.html',
})
export class ListaSuperadmins implements OnInit {
  private readonly servicio = inject(Superadmins);

  protected readonly tamano = 10;
  protected readonly usuarios = signal<UsuarioResumen[]>([]);
  protected readonly pagina = signal(1);
  protected readonly cargando = signal(false);
  protected readonly error = signal('');

  //confirmacion de activar/desactivar, y los dos usos del formulario
  protected readonly pendiente = signal<UsuarioResumen | null>(null);
  protected readonly procesando = signal(false);
  protected readonly creando = signal(false);
  protected readonly editando = signal<UsuarioResumen | null>(null);

  protected readonly hayMas = computed(() => this.usuarios().length === this.tamano);

  private busqueda = '';
  private temporizador: ReturnType<typeof setTimeout> | undefined;

  ngOnInit(): void {
    this.cargar();
  }

  protected cargar(): void {
    this.cargando.set(true);
    this.error.set('');
    this.servicio.listar(this.pagina(), this.tamano, this.busqueda).subscribe({
      next: (lista) => {
        this.usuarios.set(lista);
        this.cargando.set(false);
      },
      error: (e) => {
        this.cargando.set(false);
        this.error.set(e.error?.mensaje ?? 'No se pudo cargar la lista');
      },
    });
  }

  /** El debounce espera 350 ms despues de la ultima tecla antes de consultar */
  protected alEscribir(texto: string): void {
    clearTimeout(this.temporizador);
    this.temporizador = setTimeout(() => {
      this.busqueda = texto.trim();
      this.pagina.set(1);
      this.cargar();
    }, 350);
  }

  protected anterior(): void {
    if (this.pagina() > 1) {
      this.pagina.update((p) => p - 1);
      this.cargar();
    }
  }

  protected siguiente(): void {
    if (this.hayMas()) {
      this.pagina.update((p) => p + 1);
      this.cargar();
    }
  }

  //Activar / desactivar con confirmacion 

  protected pedirConfirmacion(usuario: UsuarioResumen): void {
    this.pendiente.set(usuario);
  }

  protected cancelar(): void {
    this.pendiente.set(null);
  }

  protected confirmar(): void {
    const usuario = this.pendiente();
    if (!usuario) {
      return;
    }
    this.procesando.set(true);

    const peticion =
      usuario.estado === 'ACTIVO'
        ? this.servicio.desactivar(usuario.idUsuario)
        : this.servicio.activar(usuario.idUsuario);

    peticion.subscribe({
      next: () => {
        this.procesando.set(false);
        this.pendiente.set(null);
        this.cargar();
      },
      error: (e) => {
        this.procesando.set(false);
        this.pendiente.set(null);
        // aqui aparece, por ejemplo, "unico SuperAdmin activo"
        this.error.set(e.error?.mensaje ?? 'No se pudo completar la acción');
      },
    });
  }

  //Crear y editar

  /** El formulario guardo (creando o editando): se cierra y se recarga */
  protected alGuardar(): void {
    const eraCreacion = this.creando();
    this.creando.set(false);
    this.editando.set(null);
    if (eraCreacion) {
      this.pagina.set(1);
    }
    this.cargar();
  }
}
