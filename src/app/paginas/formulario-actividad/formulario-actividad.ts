import { Component, OnInit, computed, inject, input, output, signal } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { ActividadResumen, Actividades, fechaDeHoy } from '../../servicios/actividades';

/** El cupo se cuenta en personas enteras*/
const entero = (c: AbstractControl): ValidationErrors | null =>
  Number.isInteger(c.value) ? null : { entero: true };

/** El costo admite como maximo dos decimales (centavos) */
const dosDecimales = (c: AbstractControl): ValidationErrors | null => {
  const centavos = Number(c.value) * 100;
  return Math.abs(centavos - Math.round(centavos)) < 1e-6 ? null : { decimales: true };
};

/** Formulario (en modal) para crear o editar una actividad */
@Component({
  selector: 'app-formulario-actividad',
  imports: [ReactiveFormsModule],
  templateUrl: './formulario-actividad.html',
})
export class FormularioActividad implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly servicio = inject(Actividades);

  //Si llega una actividad, el formulario edita; si no llega, crea
  readonly actividad = input<ActividadResumen | null>(null);
  readonly guardado = output<void>();
  readonly cancelado = output<void>();

  protected readonly esEdicion = computed(() => this.actividad() !== null);
  protected readonly guardando = signal(false);
  protected readonly error = signal('');
  protected readonly hoy = fechaDeHoy();

  protected readonly formulario = this.fb.group({
    //El pattern rechaza un nombre hecho solo de espacios, que "required" deja pasar
    nombre: this.fb.nonNullable.control('', [Validators.required, Validators.pattern(/\S/), Validators.maxLength(100)]),
    descripcion: this.fb.nonNullable.control('', [Validators.maxLength(255)]),
    fecha: this.fb.nonNullable.control('', Validators.required),
    cupo: this.fb.control<number | null>(null, [Validators.required, Validators.min(1), Validators.max(1000), entero]),
    costo: this.fb.control<number | null>(0, [Validators.required, Validators.min(0), Validators.max(100000), dosDecimales]),
  });

  /** Solo al crear: la fecha no puede ser anterior a hoy. Al editar se puede corregir una actividad ya realizada */
  private readonly noPasada = (c: AbstractControl): ValidationErrors | null =>
    c.value && c.value < this.hoy ? { pasada: true } : null;

  ngOnInit(): void {
    const actual = this.actividad();
    if (actual) {
      this.formulario.patchValue({
        nombre: actual.nombre,
        descripcion: actual.descripcion ?? '',
        fecha: actual.fecha,
        cupo: actual.cupo,
        costo: actual.costo,
      });
    } else {
      this.formulario.controls.fecha.addValidators(this.noPasada);
      this.formulario.controls.fecha.updateValueAndValidity();
    }
  }

  protected guardar(): void {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }
    this.guardando.set(true);
    this.error.set('');

    const v = this.formulario.getRawValue();
    const datos = {
      nombre: v.nombre,
      descripcion: v.descripcion,
      fecha: v.fecha,
      cupo: v.cupo as number,
      costo: v.costo as number,
    };
    const actual = this.actividad();
    //Crear devuelve la actividad y editar no devuelve nada
    const peticion: Observable<unknown> = actual
      ? this.servicio.editar(actual.idActividad, datos)
      : this.servicio.crear(datos);

    peticion.subscribe({
      next: () => {
        this.guardando.set(false);
        this.guardado.emit();
      },
      error: (e) => {
        this.guardando.set(false);
        //Aqui llega el 409: "Ya existe una actividad con ese nombre en esa fecha"
        this.error.set(e.error?.mensaje ?? 'No se pudo guardar la actividad');
      },
    });
  }

  protected cancelar(): void {
    this.cancelado.emit();
  }
}
