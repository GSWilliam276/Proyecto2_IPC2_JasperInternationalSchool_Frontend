import { Component, OnInit, computed, inject, input, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, ValidatorFn, Validators } from '@angular/forms';
import { AniosLectivos, AnioLectivoResumen } from '../../servicios/anios-lectivos';

/** Validador del grupo completo: la fecha de fin debe ser posterior a la de inicios */
const rangoValido: ValidatorFn = (grupo) => {
  const inicio = grupo.get('fechaInicio')?.value;
  const fin = grupo.get('fechaFin')?.value;
  //las fechas "AAAA-MM-DD" se pueden comparar como texto
  return inicio && fin && fin <= inicio ? { rangoInvalido: true } : null;
};

/** Formulario (en modal) para crear o editar un año lectivo (CU011 y CU012) */
@Component({
  selector: 'app-formulario-anio-lectivo',
  imports: [ReactiveFormsModule],
  templateUrl: './formulario-anio-lectivo.html',
})
export class FormularioAnioLectivo implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly servicio = inject(AniosLectivos);

  //si llega un año, el formulario edita; si no llega, crea
  readonly anio = input<AnioLectivoResumen | null>(null);
  readonly guardado = output<void>();
  readonly cancelado = output<void>();

  protected readonly esEdicion = computed(() => this.anio() !== null);
  protected readonly guardando = signal(false);
  protected readonly error = signal('');

  protected readonly campos = [
    { nombre: 'nombre', etiqueta: 'Nombre', tipo: 'text', aviso: 'El nombre es obligatorio (máximo 50 caracteres)' },
    { nombre: 'fechaInicio', etiqueta: 'Fecha de inicio', tipo: 'date', aviso: 'La fecha de inicio es obligatoria' },
    { nombre: 'fechaFin', etiqueta: 'Fecha de fin', tipo: 'date', aviso: 'La fecha de fin es obligatoria' },
  ];

  protected readonly formulario = this.fb.nonNullable.group(
    {
      nombre: ['', [Validators.required, Validators.maxLength(50)]],
      fechaInicio: ['', [Validators.required]],
      fechaFin: ['', [Validators.required]],
    },
    { validators: [rangoValido] },
  );

  /** Si se esta editando, se rellenan los campos con los datos actuales */
  ngOnInit(): void {
    const actual = this.anio();
    if (actual) {
      this.formulario.patchValue({
        nombre: actual.nombre,
        fechaInicio: actual.fechaInicio,
        fechaFin: actual.fechaFin,
      });
    }
  }

  protected guardar(): void {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }
    this.guardando.set(true);
    this.error.set('');

    const datos = this.formulario.getRawValue();
    const actual = this.anio();
    const peticion = actual
      ? this.servicio.editar(actual.idAnioLectivo, datos)
      : this.servicio.crear(datos);

    peticion.subscribe({
      next: () => {
        this.guardando.set(false);
        this.guardado.emit();
      },
      error: (e) => {
        this.guardando.set(false);
        // aqui llegan los 409: "ya existe un año activo" o "se solapa"
        this.error.set(e.error?.mensaje ?? 'No se pudo guardar el año lectivo');
      },
    });
  }

  protected cancelar(): void {
    this.cancelado.emit();
  }
}
