import { CurrencyPipe } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ActividadResumen, Actividades, fechaDeHoy, formatearFecha } from '../../servicios/actividades';
import { FormularioActividad } from '../formulario-actividad/formulario-actividad';

/** Listado paginado de actividades: busqueda, crear, editar, activar y desactivar */
@Component({
  selector: 'app-lista-actividades',
  imports: [FormularioActividad, CurrencyPipe],
  templateUrl: './lista-actividades.html',
})
export class ListaActividades implements OnInit {
  private readonly servicio = inject(Actividades);

  protected readonly tamano = 10;
  protected readonly actividades = signal<ActividadResumen[]>([]);
  protected readonly pagina = signal(1);
  protected readonly cargando = signal(false);
  protected readonly error = signal('');
  protected readonly soloActivas = signal(false);
  protected readonly formatearFecha = formatearFecha;

  protected readonly pendiente = signal<ActividadResumen | null>(null);
  protected readonly procesando = signal(false);
  protected readonly creando = signal(false);
  protected readonly editando = signal<ActividadResumen | null>(null);

  protected readonly hayMas = computed(() => this.actividades().length === this.tamano);

  private readonly hoy = fechaDeHoy();
  private busqueda = '';
  private temporizador: ReturnType<typeof setTimeout> | undefined;

  ngOnInit(): void {
    this.cargar();
  }

  protected cargar(): void {
    this.cargando.set(true);
    this.error.set('');
    this.servicio.listar(this.pagina(), this.tamano, this.busqueda, this.soloActivas()).subscribe({
      next: (lista) => {
        this.actividades.set(lista);
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

  protected alCambiarSoloActivas(marcado: boolean): void {
    this.soloActivas.set(marcado);
    this.pagina.set(1);
    this.cargar();
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

  /** Una actividad cuya fecha ya paso se marca como realizada */
  protected esPasada(a: ActividadResumen): boolean {
    return a.fecha < this.hoy;
  }

  //Activar / desactivar con confirmacion

  protected pedirConfirmacion(actividad: ActividadResumen): void {
    this.pendiente.set(actividad);
  }

  protected cancelarConfirmacion(): void {
    this.pendiente.set(null);
  }

  protected confirmar(): void {
    const actividad = this.pendiente();
    if (!actividad) {
      return;
    }
    this.procesando.set(true);

    const peticion =
      actividad.estado === 'ACTIVO'
        ? this.servicio.desactivar(actividad.idActividad)
        : this.servicio.activar(actividad.idActividad);

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
