import { Component, OnInit, inject, input, output, signal } from '@angular/core';
import { formatearFecha } from '../../servicios/actividades';
import { etiquetaNivel } from '../../servicios/curriculos';
import { EstudianteResumen, Estudiantes, etiquetaEstado } from '../../servicios/estudiantes';

/** Expediente (en modal) de un estudiante: solo lectura (CU034) */
@Component({
  selector: 'app-detalle-estudiante',
  imports: [],
  templateUrl: './detalle-estudiante.html',
})
export class DetalleEstudiante implements OnInit {
  private readonly servicio = inject(Estudiantes);

  readonly estudiante = input.required<EstudianteResumen>();
  readonly cerrado = output<void>();

  protected readonly detalle = signal<EstudianteResumen | null>(null);
  protected readonly error = signal('');
  protected readonly formatearFecha = formatearFecha;
  protected readonly etiquetaEstado = etiquetaEstado;
  protected readonly etiquetaNivel = etiquetaNivel;

  ngOnInit(): void {
    //Se muestra de inmediato lo que ya se tiene, y se completa con el historial de graduaciones
    this.detalle.set(this.estudiante());
    this.servicio.consultar(this.estudiante().idUsuario).subscribe({
      next: (completo) => this.detalle.set(completo),
      error: (e) => this.error.set(e.error?.mensaje ?? 'No se pudo cargar el historial de graduaciones'),
    });
  }

  protected cerrar(): void {
    this.cerrado.emit();
  }
}
