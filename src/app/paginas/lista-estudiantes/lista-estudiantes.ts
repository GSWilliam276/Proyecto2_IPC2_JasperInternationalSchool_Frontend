import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { EstudianteResumen, Estudiantes, etiquetaEstado } from '../../servicios/estudiantes';
import { DetalleEstudiante } from '../detalle-estudiante/detalle-estudiante';
import { FormularioEstudiante } from '../formulario-estudiante/formulario-estudiante';
import { FormularioGraduacion } from '../formulario-graduacion/formulario-graduacion';

type Accion = 'activar' | 'desactivar' | 'graduar';

interface Pendiente {
  estudiante: EstudianteResumen;
  accion: Accion;
}

/** Listado paginado de estudiantes: busqueda, filtro por estado, registrar, editar, estados y expediente */
@Component({
  selector: 'app-lista-estudiantes',
  imports: [FormularioEstudiante, DetalleEstudiante, FormularioGraduacion],
  templateUrl: './lista-estudiantes.html',
})
export class ListaEstudiantes implements OnInit {
  private readonly servicio = inject(Estudiantes);

  protected readonly tamano = 10;
  protected readonly estudiantes = signal<EstudianteResumen[]>([]);
  protected readonly pagina = signal(1);
  protected readonly cargando = signal(false);
  protected readonly error = signal('');
  protected readonly etiquetaEstado = etiquetaEstado;

  protected readonly filtroEstado = signal('');

  protected readonly pendiente = signal<Pendiente | null>(null);
  protected readonly procesando = signal(false);
  protected readonly creando = signal(false);
  protected readonly editando = signal<EstudianteResumen | null>(null);
  protected readonly viendo = signal<EstudianteResumen | null>(null);

  protected readonly hayMas = computed(() => this.estudiantes().length === this.tamano);

  private busqueda = '';
  private temporizador: ReturnType<typeof setTimeout> | undefined;
  protected readonly graduando = signal<EstudianteResumen | null>(null);

  ngOnInit(): void {
    this.cargar();
  }

  protected cargar(): void {
    this.cargando.set(true);
    this.error.set('');
    this.servicio.listar(this.pagina(), this.tamano, this.busqueda, this.filtroEstado()).subscribe({
      next: (lista) => {
        this.estudiantes.set(lista);
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

  protected alCambiarEstado(valor: string): void {
    this.filtroEstado.set(valor);
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

  protected verbo(accion: Accion): string {
    return accion === 'activar' ? 'reactivar' : accion === 'desactivar' ? 'desactivar' : 'graduar';
  }

  //Activar / desactivar / graduar con confirmacion 

  protected pedirConfirmacion(estudiante: EstudianteResumen, accion: Accion): void {
    this.pendiente.set({ estudiante, accion });
  }

  protected cancelarConfirmacion(): void {
    this.pendiente.set(null);
  }

  protected confirmar(): void {
    const p = this.pendiente();
    if (!p) {
      return;
    }
    this.procesando.set(true);

    const id = p.estudiante.idUsuario;
    const peticion =
      p.accion === 'activar'
        ? this.servicio.activar(id)
        : p.accion === 'desactivar'
          ? this.servicio.desactivar(id)
          : this.servicio.graduar(id);

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

  /** El formulario guardo (registrando o editando): se cierra y se recarga */
  protected alGuardar(): void {
    const eraCreacion = this.creando();
    this.creando.set(false);
    this.editando.set(null);
    if (eraCreacion) {
      this.pagina.set(1);
    }
    this.cargar();
  }

  /** Se registro una graduacion de nivel: el estado no cambia, solo se cierra el modal */
  protected alGraduarNivel(): void {
    this.graduando.set(null);
  }
}
