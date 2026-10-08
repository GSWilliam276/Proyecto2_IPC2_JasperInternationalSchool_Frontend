import { Component, OnInit, computed, inject, input, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Grados, GradoResumen } from '../../servicios/grados';

/** Formulario (en modal) para crear o editar un grado (CU014 y CU015) */
@Component({
  selector: 'app-formulario-grado',
  imports: [ReactiveFormsModule],
  templateUrl: './formulario-grado.html',
})
export class FormularioGrado implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly servicio = inject(Grados);

  //Si llega un grado, el formulario edita; si no llega, crea
  readonly grado = input<GradoResumen | null>(null);
  readonly guardado = output<void>();
  readonly cancelado = output<void>();

  protected readonly esEdicion = computed(() => this.grado() !== null);
  protected readonly guardando = signal(false);
  protected readonly error = signal('');

  //El valor es lo que espera el backend; la etiqueta es lo que ve la persona
  protected readonly niveles = [
    { valor: 'PRE_PRIMARIA', etiqueta: 'Pre-primaria' },
    { valor: 'PRIMARIA', etiqueta: 'Primaria' },
    { valor: 'BASICO', etiqueta: 'Básico' },
    { valor: 'DIVERSIFICADO', etiqueta: 'Diversificado' },
  ];

  protected readonly formulario = this.fb.nonNullable.group({
    nombre: ['', [Validators.required, Validators.maxLength(50)]],
    nivel: ['', [Validators.required]],
  });

  /** Si se esta editando, se rellenan los campos con los datos actuales. */
  ngOnInit(): void {
    const actual = this.grado();
    if (actual) {
      this.formulario.patchValue({ nombre: actual.nombre, nivel: actual.nivel });
      //el nivel se fija al crear el grado y no se puede cambiar
      this.formulario.controls.nivel.disable();
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
    const actual = this.grado();
    const peticion = actual
      ? this.servicio.editar(actual.idGrado, datos)
      : this.servicio.crear(datos);

    peticion.subscribe({
      next: () => {
        this.guardando.set(false);
        this.guardado.emit();
      },
      error: (e) => {
        this.guardando.set(false);
        //Llegada de los 409: "Ya existe un grado con ese nombre"
        this.error.set(e.error?.mensaje ?? 'No se pudo guardar el grado');
      },
    });
  }

  protected cancelar(): void {
    this.cancelado.emit();
  }
}
