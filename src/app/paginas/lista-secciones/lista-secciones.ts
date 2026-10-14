import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { etiquetaNivel } from '../../servicios/curriculos';
import { GradoResumen, Grados } from '../../servicios/grados';
import { SeccionResumen, Secciones } from '../../servicios/secciones';
import { FormularioSeccion } from '../formulario-seccion/formulario-seccion';

/** Listado paginado de secciones: filtro por grado, años anteriores, crear, editar, activar y desactivar */
@Component({
  selector: 'app-lista-secciones',
  imports: [FormularioSeccion],
  templateUrl: './lista-secciones.html',
})
export class ListaSecciones implements OnInit {
  private readonly servicio = inject(Secciones);
  private readonly gradosServicio = inject(Grados);

  protected readonly tamano = 10;
  protected readonly secciones = signal<SeccionResumen[]>([]);
  protected readonly grados = signal<GradoResumen[]>([]);
  protected readonly pagina = signal(1);
  protected readonly cargando = signal(false);
  protected readonly error = signal('');
  protected readonly etiquetaNivel = etiquetaNivel;

  //Filtros
  protected readonly filtroGrado = signal<number | null>(null);
  protected readonly verAnteriores = signal(false);

  protected readonly pendiente = signal<SeccionResumen | null>(null);
  protected readonly procesando = signal(false);
  protected readonly creando = signal(false);
  protected readonly editando = signal<SeccionResumen | null>(null);

  protected readonly hayMas = computed(() => this.secciones().length === this.tamano);

  private busqueda = '';
  private temporizador: ReturnType<typeof setTimeout> | undefined;

  ngOnInit(): void {
    this.gradosServicio.listar(1, 100, '').subscribe({
      next: (lista) => this.grados.set(lista),
      error: (e) => this.error.set(e.error?.mensaje ?? 'No se pudieron cargar los grados'),
    });
    this.cargar();
  }

  protected cargar(): void {
    this.cargando.set(true);
    this.error.set('');
    this.servicio.listar(this.pagina(), this.tamano, this.busqueda, this.filtroGrado(), this.verAnteriores()).subscribe({
      next: (lista) => {
        this.secciones.set(lista);
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

  protected alCambiarGrado(valor: string): void {
    this.filtroGrado.set(valor ? Number(valor) : null);
    this.pagina.set(1);
    this.cargar();
  }

  protected alCambiarAnteriores(marcado: boolean): void {
    this.verAnteriores.set(marcado);
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

  /** Una seccion de un año cerrado queda en solo lectura */
  protected esDeAnioCerrado(s: SeccionResumen): boolean {
    return s.anioEstado !== 'ACTIVO';
  }

  protected porcentaje(s: SeccionResumen): number {
    return Math.min(100, Math.round((100 * s.inscritos) / s.cupoMaximo));
  }

  //Activar / desactivar con confirmacion 

  protected pedirConfirmacion(seccion: SeccionResumen): void {
    this.pendiente.set(seccion);
  }

  protected cancelarConfirmacion(): void {
    this.pendiente.set(null);
  }

  protected confirmar(): void {
    const seccion = this.pendiente();
    if (!seccion) {
      return;
    }
    this.procesando.set(true);

    const peticion =
      seccion.estado === 'ACTIVO'
        ? this.servicio.desactivar(seccion.idSeccion)
        : this.servicio.activar(seccion.idSeccion);

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

  /** El formulario guardo (creando o editando): se cierra y se recarga*/
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
