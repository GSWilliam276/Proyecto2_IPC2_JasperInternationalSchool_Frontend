import { Component, OnInit, computed, inject, input, output, signal } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { etiquetaNivel } from '../../servicios/curriculos';
import { GradoResumen, Grados } from '../../servicios/grados';
import { etiquetaConcepto, TarifaResumen, Tarifas } from '../../servicios/tarifas';

/** El monto admite como maximo dos decimales (centavos) */
const dosDecimales = (c: AbstractControl): ValidationErrors | null => {
  const centavos = Number(c.value) * 100;
  return Math.abs(centavos - Math.round(centavos)) < 1e-6 ? null : { decimales: true };
};

/** Formulario (en modal) para crear o editar una tarifa. Al editar solo cambia el monto */
@Component({
  selector: 'app-formulario-tarifa',
  imports: [ReactiveFormsModule],
  templateUrl: './formulario-tarifa.html',
})
export class FormularioTarifa implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly servicio = inject(Tarifas);
  private readonly gradosServicio = inject(Grados);

  //Si llega una tarifa, el formulario edita; si no llega, crea
  readonly tarifa = input<TarifaResumen | null>(null);
  readonly guardado = output<void>();
  readonly cancelado = output<void>();

  protected readonly esEdicion = computed(() => this.tarifa() !== null);
  protected readonly grados = signal<GradoResumen[]>([]);
  protected readonly guardando = signal(false);
  protected readonly error = signal('');
  protected readonly etiquetaNivel = etiquetaNivel;
  protected readonly etiquetaConcepto = etiquetaConcepto;

  protected readonly conceptos = [
    { valor: 'MENSUALIDAD', etiqueta: 'Mensualidad' },
    { valor: 'INSCRIPCION', etiqueta: 'Inscripción' },
  ];

  protected readonly formulario = this.fb.group({
    idGrado: this.fb.control<number | null>(null, Validators.required),
    concepto: this.fb.nonNullable.control('', Validators.required),
    monto: this.fb.control<number | null>(null, [
      Validators.required,
      Validators.min(0.01),
      Validators.max(100000),
      dosDecimales,
    ]),
  });

  ngOnInit(): void {
    const actual = this.tarifa();
    if (actual) {
      this.formulario.patchValue({ monto: actual.monto });
      //Grado y concepto no cambian: un control deshabilitado no cuenta en la validacion
      this.formulario.controls.idGrado.disable({ emitEvent: false });
      this.formulario.controls.concepto.disable({ emitEvent: false });
      return;
    }
    //Solo se ofrecen grados activos
    this.gradosServicio.listar(1, 100, '').subscribe({
      next: (lista) => this.grados.set(lista.filter((g) => g.estado === 'ACTIVO')),
      error: (e) => this.error.set(e.error?.mensaje ?? 'No se pudieron cargar los grados'),
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
    const actual = this.tarifa();
    //Crear devuelve la tarifa y editar no devuelve nada
    const peticion: Observable<unknown> = actual
      ? this.servicio.editar(actual.idTarifa, v.monto as number)
      : this.servicio.crear({ idGrado: v.idGrado as number, concepto: v.concepto, monto: v.monto as number });

    peticion.subscribe({
      next: () => {
        this.guardando.set(false);
        this.guardado.emit();
      },
      error: (e) => {
        this.guardando.set(false);
        //Aqui llegan los 409: "Ya existe una tarifa", "No hay un año lectivo activo"
        this.error.set(e.error?.mensaje ?? 'No se pudo guardar la tarifa');
      },
    });
  }

  protected cancelar(): void {
    this.cancelado.emit();
  }
}
