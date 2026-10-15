import { Component, OnInit, inject, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Asignaciones, MaestroResumen } from '../../servicios/asignaciones';
import { CursoResumen } from '../../servicios/cursos';
import { SeccionResumen, Secciones } from '../../servicios/secciones';

/** Formulario (en modal) para asignar un maestro a un curso de una seccion del año activo */
@Component({
  selector: 'app-formulario-asignacion',
  imports: [ReactiveFormsModule],
  templateUrl: './formulario-asignacion.html',
})
export class FormularioAsignacion implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly servicio = inject(Asignaciones);
  private readonly seccionesServicio = inject(Secciones);

  readonly guardado = output<void>();
  readonly cancelado = output<void>();

  protected readonly secciones = signal<SeccionResumen[]>([]);
  protected readonly cursos = signal<CursoResumen[]>([]);
  protected readonly maestros = signal<MaestroResumen[]>([]);
  protected readonly cargandoCursos = signal(false);
  protected readonly guardando = signal(false);
  protected readonly error = signal('');

  protected readonly formulario = this.fb.group({
    idSeccion: this.fb.control<number | null>(null, Validators.required),
    idCurso: this.fb.control<number | null>(null, Validators.required),
    idMaestro: this.fb.control<number | null>(null, Validators.required),
  });

  ngOnInit(): void {
    // sin filtro "todos", el backend devuelve solo las secciones del año lectivo activo
    this.seccionesServicio.listar(1, 100, '', null, false).subscribe({
      next: (lista) => this.secciones.set(lista.filter((s) => s.estado === 'ACTIVO')),
      error: (e) => this.error.set(e.error?.mensaje ?? 'No se pudieron cargar las secciones'),
    });
    this.servicio.maestros().subscribe({
      next: (lista) => this.maestros.set(lista),
      error: (e) => this.error.set(e.error?.mensaje ?? 'No se pudieron cargar los maestros'),
    });
    this.formulario.controls.idSeccion.valueChanges.subscribe((id) => this.alCambiarSeccion(id));
  }

  /** Al elegir una seccion se piden solo los cursos de su curriculo que todavia no tienen maestro. */
  private alCambiarSeccion(id: number | null): void {
    this.formulario.controls.idCurso.setValue(null);
    this.cursos.set([]);
    this.error.set('');
    if (id === null) {
      return;
    }
    this.cargandoCursos.set(true);
    this.servicio.cursosSinMaestro(id).subscribe({
      next: (lista) => {
        //Si la persona ya eligio otra seccion mientras tanto, esta respuesta se descarta
        if (this.formulario.controls.idSeccion.value === id) {
          this.cursos.set(lista);
          this.cargandoCursos.set(false);
        }
      },
      error: (e) => {
        this.cargandoCursos.set(false);
        this.error.set(e.error?.mensaje ?? 'No se pudieron cargar los cursos');
      },
    });
  }

  protected seccionElegida(): boolean {
    return this.formulario.controls.idSeccion.value !== null;
  }

  protected guardar(): void {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }
    this.guardando.set(true);
    this.error.set('');

    const v = this.formulario.getRawValue();
    this.servicio
      .asignar({ idSeccion: v.idSeccion as number, idCurso: v.idCurso as number, idMaestro: v.idMaestro as number })
      .subscribe({
        next: () => {
          this.guardando.set(false);
          this.guardado.emit();
        },
        error: (e) => {
          this.guardando.set(false);
          //Aqui llegan los 409: curso fuera del curriculo, maestro inactivo, ya asignado
          this.error.set(e.error?.mensaje ?? 'No se pudo asignar el maestro');
        },
      });
  }

  protected cancelar(): void {
    this.cancelado.emit();
  }
}
