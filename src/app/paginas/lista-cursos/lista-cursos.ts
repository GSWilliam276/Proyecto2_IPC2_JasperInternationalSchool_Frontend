import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { Cursos, CursoResumen } from '../../servicios/cursos';
import { FormularioCurso } from '../formulario-curso/formulario-curso';

/** Listado paginado de cursos: busqueda, crear, editar, activar y desactivar */
@Component({
  selector: 'app-lista-cursos',
  imports: [FormularioCurso],
  templateUrl: './lista-cursos.html',
})
export class ListaCursos implements OnInit {
  private readonly servicio = inject(Cursos);

  protected readonly tamano = 10;
  protected readonly cursos = signal<CursoResumen[]>([]);
  protected readonly pagina = signal(1);
  protected readonly cargando = signal(false);
  protected readonly error = signal('');

  protected readonly pendiente = signal<CursoResumen | null>(null);
  protected readonly procesando = signal(false);
  protected readonly creando = signal(false);
  protected readonly editando = signal<CursoResumen | null>(null);

  protected readonly hayMas = computed(() => this.cursos().length === this.tamano);

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
        this.cursos.set(lista);
        this.cargando.set(false);
      },
      error: (e) => {
        this.cargando.set(false);
        this.error.set(e.error?.mensaje ?? 'No se pudo cargar la lista');
      },
    });
  }

  /**El debounce espera 350 ms despues de la ultima tecla antes de consultar */
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

  protected pedirConfirmacion(curso: CursoResumen): void {
    this.pendiente.set(curso);
  }

  protected cancelarConfirmacion(): void {
    this.pendiente.set(null);
  }

  protected confirmar(): void {
    const curso = this.pendiente();
    if (!curso) {
      return;
    }
    this.procesando.set(true);

    const peticion =
      curso.estado === 'ACTIVO'
        ? this.servicio.desactivar(curso.idCurso)
        : this.servicio.activar(curso.idCurso);

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
