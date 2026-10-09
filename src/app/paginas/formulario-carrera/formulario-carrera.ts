import { Component, OnInit, computed, inject, input, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Carreras, CarreraResumen } from '../../servicios/carreras';

/** Formulario (en modal) para crear o editar una carrera (CU019 y CU020) */
@Component({
  selector: 'app-formulario-carrera',
  imports: [ReactiveFormsModule],
  templateUrl: './formulario-carrera.html',
})
export class FormularioCarrera implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly servicio = inject(Carreras);

  //Si llega una carrera, el formulario edita; si no llega, crea
  readonly carrera = input<CarreraResumen | null>(null);
  readonly guardado = output<void>();
  readonly cancelado = output<void>();

  protected readonly esEdicion = computed(() => this.carrera() !== null);
  protected readonly guardando = signal(false);
  protected readonly error = signal('');

  protected readonly formulario = this.fb.nonNullable.group({
    nombre: ['', [Validators.required, Validators.maxLength(100)]],
  });

  /** Si se esta editando, se rellena el campo con el nombre actual */
  ngOnInit(): void {
    const actual = this.carrera();
    if (actual) {
      this.formulario.patchValue({ nombre: actual.nombre });
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
    const actual = this.carrera();
    const peticion = actual
      ? this.servicio.editar(actual.idCarrera, datos)
      : this.servicio.crear(datos);

    peticion.subscribe({
      next: () => {
        this.guardando.set(false);
        this.guardado.emit();
      },
      error: (e) => {
        this.guardando.set(false);
        //Llegan los 409: "Ya existe una carrera con ese nombre"
        this.error.set(e.error?.mensaje ?? 'No se pudo guardar la carrera');
      },
    });
  }

  protected cancelar(): void {
    this.cancelado.emit();
  }
}
