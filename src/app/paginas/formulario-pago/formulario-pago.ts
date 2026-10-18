import { Component, OnInit, inject, input, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { ActividadResumen, Actividades, fechaDeHoy, formatearFecha } from '../../servicios/actividades';
import { AniosLectivos } from '../../servicios/anios-lectivos';
import { EstudianteResumen, Estudiantes } from '../../servicios/estudiantes';
import { MESES, Pagos } from '../../servicios/pagos';

/** Formulario (en modal) para cobrar inscripcion (CU062), mensualidades (CU063) o una actividad (CU064)*/
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
  private readonly actividadesServicio = inject(Actividades);

  readonly tipo = input.required<'INSCRIPCION' | 'MENSUALIDAD' | 'ACTIVIDAD'>();
  readonly guardado = output<void>();
  readonly cancelado = output<void>();

  protected readonly estudiantes = signal<EstudianteResumen[]>([]);
  protected readonly actividades = signal<ActividadResumen[]>([]);
  protected readonly mesesDisponibles = signal<number[]>([]);
  protected readonly mesesElegidos = signal<number[]>([]);
  protected readonly guardando = signal(false);
  protected readonly error = signal('');
  protected readonly formatearFecha = formatearFecha;
  protected readonly nombreMes = (m: number) => MESES[m - 1].charAt(0).toUpperCase() + MESES[m - 1].slice(1);

  protected readonly formulario = this.fb.group({
    idEstudiante: this.fb.control<number | null>(null, Validators.required),
    idActividad: this.fb.control<number | null>(null),
  });

  protected titulo(): string {
    switch (this.tipo()) {
      case 'INSCRIPCION':
        return 'Cobrar inscripción';
      case 'MENSUALIDAD':
        return 'Cobrar mensualidad';
      default:
        return 'Cobrar actividad';
    }
  }

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
    if (this.tipo() === 'ACTIVIDAD') {
      this.formulario.controls.idActividad.addValidators(Validators.required);
      this.formulario.controls.idActividad.updateValueAndValidity();
      //Solo actividades activas que todavia no pasaron
      this.actividadesServicio.listar(1, 100, '', true).subscribe({
        next: (l) => this.actividades.set(l.filter((a) => a.fecha >= fechaDeHoy())),
        error: (e) => this.error.set(e.error?.mensaje ?? 'No se pudieron cargar las actividades'),
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
    const sinMeses = this.tipo() === 'MENSUALIDAD' && this.mesesElegidos().length === 0;
    if (this.formulario.invalid || sinMeses) {
      this.formulario.markAllAsTouched();
      if (sinMeses) {
        this.error.set('Seleccione al menos un mes');
      }
      return;
    }
    this.guardando.set(true);
    this.error.set('');
    const id = this.formulario.controls.idEstudiante.value as number;
    let peticion: Observable<unknown>;
    if (this.tipo() === 'INSCRIPCION') {
      peticion = this.servicio.pagarInscripcion(id);
    } else if (this.tipo() === 'MENSUALIDAD') {
      peticion = this.servicio.pagarMensualidad(id, this.mesesElegidos());
    } else {
      peticion = this.servicio.pagarActividad(id, this.formulario.controls.idActividad.value as number);
    }
    peticion.subscribe({
      next: () => {
        this.guardando.set(false);
        this.guardado.emit();
      },
      error: (e) => {
        this.guardando.set(false);
        //Aqui llegan los 409: ya pagado, sin cupo, sin tarifa, no inscrito
        this.error.set(e.error?.mensaje ?? 'No se pudo registrar el pago');
      },
    });
  }

  protected cancelar(): void {
    this.cancelado.emit();
  }
}
