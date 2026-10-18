import { Component, OnInit, inject, input, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AniosLectivos } from '../../servicios/anios-lectivos';
import { EstudianteResumen, Estudiantes } from '../../servicios/estudiantes';
import { MESES, Pagos } from '../../servicios/pagos';
import { Observable } from 'rxjs';

/** Formulario (en modal) para cobrar la inscripcion (CU062) o una o varias mensualidades (CU063) */
@Component({
  selector: 'app-formulario-pago',
  imports: [ReactiveFormsModule],
  templateUrl: './formulario-pago.html',
})
export class FormularioPago implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly servicio = inject(Pagos);
  private readonly estudiantesServicio = inject(Estudiantes);
  private readonly aniosServicio = inject(AniosLectivos);

  readonly tipo = input.required<'INSCRIPCION' | 'MENSUALIDAD'>();
  readonly guardado = output<void>();
  readonly cancelado = output<void>();

  protected readonly estudiantes = signal<EstudianteResumen[]>([]);
  protected readonly mesesDisponibles = signal<number[]>([]);
  protected readonly mesesElegidos = signal<number[]>([]);
  protected readonly guardando = signal(false);
  protected readonly error = signal('');
  protected readonly nombreMes = (m: number) => MESES[m - 1].charAt(0).toUpperCase() + MESES[m - 1].slice(1);

  protected readonly formulario = this.fb.group({
    idEstudiante: this.fb.control<number | null>(null, Validators.required),
  });

  ngOnInit(): void {
    this.estudiantesServicio.listar(1, 100, '', 'ACTIVO').subscribe({
      next: (l) => this.estudiantes.set(l),
      error: (e) => this.error.set(e.error?.mensaje ?? 'No se pudieron cargar los estudiantes'),
    });
    if (this.tipo() === 'MENSUALIDAD') {
      //Los meses salen de las fechas del año lectivo activo
      this.aniosServicio.activo().subscribe({
        next: (anio) => {
          if (!anio) {
            return;
          }
          const primero = Number(anio.fechaInicio.substring(5, 7));
          const ultimo = Number(anio.fechaFin.substring(5, 7));
          const lista: number[] = [];
          for (let m = primero; m <= ultimo; m++) {
            lista.push(m);
          }
          this.mesesDisponibles.set(lista);
        },
      });
    }
  }

  protected alternarMes(mes: number): void {
    this.mesesElegidos.update((l) => (l.includes(mes) ? l.filter((m) => m !== mes) : [...l, mes].sort((a, b) => a - b)));
  }

  protected todoElAnio(): void {
    this.mesesElegidos.set([...this.mesesDisponibles()]);
  }

  protected guardar(): void {
    if (this.formulario.invalid || (this.tipo() === 'MENSUALIDAD' && this.mesesElegidos().length === 0)) {
      this.formulario.markAllAsTouched();
      if (this.tipo() === 'MENSUALIDAD' && this.mesesElegidos().length === 0) {
        this.error.set('Seleccione al menos un mes');
      }
      return;
    }
    this.guardando.set(true);
    this.error.set('');
    const id = this.formulario.controls.idEstudiante.value as number;
    const peticion: Observable<unknown> = this.tipo() === 'INSCRIPCION'
      ? this.servicio.pagarInscripcion(id)
      : this.servicio.pagarMensualidad(id, this.mesesElegidos());
    peticion.subscribe({
      next: () => {
        this.guardando.set(false);
        this.guardado.emit();
      },
      error: (e) => {
        this.guardando.set(false);
        //Aqui llegan los 409: ya pagado, sin tarifa, no inscrito...
        this.error.set(e.error?.mensaje ?? 'No se pudo registrar el pago');
      },
    });
  }

  protected cancelar(): void {
    this.cancelado.emit();
  }
}
