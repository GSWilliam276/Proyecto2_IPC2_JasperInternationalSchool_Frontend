import { Component, OnInit, computed, inject, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { EstudianteResumen, Estudiantes } from '../../servicios/estudiantes';
import { InscripcionResumen, Inscripciones } from '../../servicios/inscripciones';
import { SeccionResumen, Secciones } from '../../servicios/secciones';

/** Formulario (en modal) para inscribir a un estudiante (CU059). El correo solo se pide si todavia no tiene acceso */
@Component({
  selector: 'app-formulario-inscripcion',
  imports: [ReactiveFormsModule],
  templateUrl: './formulario-inscripcion.html',
})
export class FormularioInscripcion implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly servicio = inject(Inscripciones);
  private readonly estudiantesServicio = inject(Estudiantes);
  private readonly seccionesServicio = inject(Secciones);

  readonly guardado = output<InscripcionResumen>();
  readonly cancelado = output<void>();

  protected readonly estudiantes = signal<EstudianteResumen[]>([]);
  protected readonly secciones = signal<SeccionResumen[]>([]);
  protected readonly elegido = signal<EstudianteResumen | null>(null);
  protected readonly sinAcceso = computed(() => this.elegido() !== null && !this.elegido()!.tieneAcceso);
  protected readonly guardando = signal(false);
  protected readonly error = signal('');

  protected readonly formulario = this.fb.group({
    idEstudiante: this.fb.control<number | null>(null, Validators.required),
    idSeccion: this.fb.control<number | null>(null, Validators.required),
    correo: this.fb.nonNullable.control('', [Validators.email, Validators.maxLength(100)]),
  });

  ngOnInit(): void {
    this.estudiantesServicio.listar(1, 100, '', 'ACTIVO').subscribe({
      next: (l) => this.estudiantes.set(l),
      error: (e) => this.error.set(e.error?.mensaje ?? 'No se pudieron cargar los estudiantes'),
    });
    //Sin "todos", el backend devuelve las secciones del año lectivo activo
    this.seccionesServicio.listar(1, 100, '', null, false).subscribe({
      next: (l) => this.secciones.set(l.filter((s) => s.estado === 'ACTIVO')),
      error: (e) => this.error.set(e.error?.mensaje ?? 'No se pudieron cargar las secciones'),
    });
    this.formulario.controls.idEstudiante.valueChanges.subscribe((id) => {
      const e = this.estudiantes().find((x) => x.idUsuario === id) ?? null;
      this.elegido.set(e);
      const correo = this.formulario.controls.correo;
      correo.setValidators(e && !e.tieneAcceso
        ? [Validators.required, Validators.email, Validators.maxLength(100)]
        : [Validators.email, Validators.maxLength(100)]);
      correo.updateValueAndValidity();
    });
  }

  protected guardar(): void {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }
    this.guardando.set(true);
    this.error.set('');
    const v = this.formulario.getRawValue();
    this.servicio.inscribir({
      idEstudiante: v.idEstudiante as number,
      idSeccion: v.idSeccion as number,
      correo: this.sinAcceso() ? v.correo.trim() : null,
    }).subscribe({
      next: (inscripcion) => {
        this.guardando.set(false);
        this.guardado.emit(inscripcion);
      },
      error: (e) => {
        this.guardando.set(false);
        this.error.set(e.error?.mensaje ?? 'No se pudo inscribir al estudiante');
      },
    });
  }

  protected cancelar(): void {
    this.cancelado.emit();
  }
}
