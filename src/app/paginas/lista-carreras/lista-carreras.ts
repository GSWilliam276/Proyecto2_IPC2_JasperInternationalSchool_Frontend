import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { Carreras, CarreraResumen } from '../../servicios/carreras';
import { FormularioCarrera } from '../formulario-carrera/formulario-carrera';

/** Listado paginado de carreras: busqueda, crear, editar, activar y desactivar */
@Component({
  selector: 'app-lista-carreras',
  imports: [FormularioCarrera],
  templateUrl: './lista-carreras.html',
})
export class ListaCarreras implements OnInit {
  private readonly servicio = inject(Carreras);

  protected readonly tamano = 10;
  protected readonly carreras = signal<CarreraResumen[]>([]);
  protected readonly pagina = signal(1);
  protected readonly cargando = signal(false);
  protected readonly error = signal('');

  //Confirmacion de activar/desactivar, y los dos usos del formulario
  protected readonly pendiente = signal<CarreraResumen | null>(null);
  protected readonly procesando = signal(false);
  protected readonly creando = signal(false);
  protected readonly editando = signal<CarreraResumen | null>(null);

  protected readonly hayMas = computed(() => this.carreras().length === this.tamano);

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
        this.carreras.set(lista);
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

  protected pedirConfirmacion(carrera: CarreraResumen): void {
    this.pendiente.set(carrera);
  }

  protected cancelarConfirmacion(): void {
    this.pendiente.set(null);
  }

  protected confirmar(): void {
    const carrera = this.pendiente();
    if (!carrera) {
      return;
    }
    this.procesando.set(true);

    const peticion =
      carrera.estado === 'ACTIVO'
        ? this.servicio.desactivar(carrera.idCarrera)
        : this.servicio.activar(carrera.idCarrera);

    peticion.subscribe({
      next: () => {
        this.procesando.set(false);
        this.pendiente.set(null);
        this.cargar();
      },
      error: (e) => {
        this.procesando.set(false);
        this.pendiente.set(null);
        this.error.set(e.error?.mensaje ?? 'No se pudo completar la acción');
      },
    });
  }

  //Crear y editar 

  /** El formulario guardo: se cierran los modales y se recarga */
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
