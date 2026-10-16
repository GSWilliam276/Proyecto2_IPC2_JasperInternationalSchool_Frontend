import { Component, OnInit, inject, input, output, signal } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { fechaDeHoy } from '../../servicios/actividades';
import { EstudianteResumen, Estudiantes } from '../../servicios/estudiantes';

/** Formulario (en modal) para registrar que un estudiante termino un nivel (CU106). No cambia su estado */
@Component({
  selector: 'app-formulario-graduacion',
  imports: [ReactiveFormsModule],
  templateUrl: './formulario-graduacion.html',
})
export class FormularioGraduacion implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly servicio = inject(Estudiantes);

  readonly estudiante = input<EstudianteResumen | null>(null);
  readonly guardado = output<void>();
  readonly cancelado = output<void>();

  protected readonly guardando = signal(false);
  protected readonly error = signal('');
  protected readonly hoy = fechaDeHoy();

  //Diversificado no esta: ese es el egreso, y se hace con el boton "Graduar"
  protected readonly niveles = [
    { valor: 'PRE_PRIMARIA', etiqueta: 'Pre-primaria' },
    { valor: 'PRIMARIA', etiqueta: 'Primaria' },
    { valor: 'BASICO', etiqueta: 'Básico' },
  ];

  /** La fecha no puede ser futura ni anterior al nacimiento. Se compara como texto "AAAA-MM-DD" */
  private readonly validarFecha = (c: AbstractControl): ValidationErrors | null => {
    const v = c.value as string;
    if (!v) {
      return null;
    }
    if (v > this.hoy) {
      return { futura: true };
    }
    const nacimiento = this.estudiante()?.fechaNacimiento;
    return nacimiento && v < nacimiento ? { anteriorNacimiento: true } : null;
  };

  protected readonly formulario = this.fb.nonNullable.group({
    nivel: ['', Validators.required],
    fecha: [this.hoy, [Validators.required, this.validarFecha]],
  });

  ngOnInit(): void {
    //El estudiante ya esta disponible: se revalida la fecha contra su nacimiento
    this.formulario.controls.fecha.updateValueAndValidity();
  }

  protected guardar(): void {
    const e = this.estudiante();
    if (this.formulario.invalid || !e) {
      this.formulario.markAllAsTouched();
      return;
    }
    this.guardando.set(true);
    this.error.set('');

    const { nivel, fecha } = this.formulario.getRawValue();
    this.servicio.registrarGraduacion(e.idUsuario, nivel, fecha).subscribe({
      next: () => {
        this.guardando.set(false);
        this.guardado.emit();
      },
      error: (err) => {
        this.guardando.set(false);
        //Aqui llega el 409: "El estudiante ya está graduado de ese nivel"
        this.error.set(err.error?.mensaje ?? 'No se pudo registrar la graduación');
      },
    });
  }

  protected cancelar(): void {
    this.cancelado.emit();
  }
}
