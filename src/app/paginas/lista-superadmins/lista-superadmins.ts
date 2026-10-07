import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { Superadmins, UsuarioResumen } from '../../servicios/superadmins';

/** Listado paginado de SuperAdmins, con busqueda y activar/desactivar. */
@Component({
  selector: 'app-lista-superadmins',
  templateUrl: './lista-superadmins.html',
})
export class ListaSuperadmins implements OnInit {
  private readonly servicio = inject(Superadmins);

  protected readonly tamano = 10;
  protected readonly usuarios = signal<UsuarioResumen[]>([]);
  protected readonly pagina = signal(1);
  protected readonly cargando = signal(false);
  protected readonly error = signal('');

  //Fila sobre la que se pidio confirmacion; null = el modal esta cerrado
  protected readonly pendiente = signal<UsuarioResumen | null>(null);
  protected readonly procesando = signal(false);

  //El backend no manda el total: si llegaron menos filas que el tamano, no hay mas paginas
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

  /** Espera 350 ms despues de la ultima tecla antes de consultar (debounce). */
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

  //activar / desactivar con confirmacion 

  protected pedirConfirmacion(usuario: UsuarioResumen): void {
    this.pendiente.set(usuario); //abre el modal
  }

  protected cancelar(): void {
    this.pendiente.set(null); //cierra el modal sin hacer nada
  }

  protected confirmar(): void {
    const usuario = this.pendiente();
    if (!usuario) {
      return;
    }
    this.procesando.set(true);

    //segun el estado actual, la accion es una u otra
    const peticion =
      usuario.estado === 'ACTIVO'
        ? this.servicio.desactivar(usuario.idUsuario)
        : this.servicio.activar(usuario.idUsuario);

    peticion.subscribe({
      next: () => {
        this.procesando.set(false);
        this.pendiente.set(null);
        this.cargar(); //Recarga para ver el estado nuevo
      },
      error: (e) => {
        this.procesando.set(false);
        this.pendiente.set(null);
        //aqui aparece, por ejemplo, el mensaje de "unico SuperAdmin activo"
        this.error.set(e.error?.mensaje ?? 'No se pudo completar la acción');
      },
    });
  }
}
