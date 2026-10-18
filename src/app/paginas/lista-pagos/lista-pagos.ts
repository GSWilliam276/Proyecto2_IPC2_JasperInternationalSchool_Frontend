import { CurrencyPipe } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { EstudianteResumen, Estudiantes } from '../../servicios/estudiantes';
import { PagoResumen, Pagos, descripcionPago } from '../../servicios/pagos';
import { FormularioPago } from '../formulario-pago/formulario-pago';

/** Listado de pagos con filtros, y cobro de inscripcion y mensualidad */
@Component({
  selector: 'app-lista-pagos',
  imports: [FormularioPago, CurrencyPipe],
  templateUrl: './lista-pagos.html',
})
export class ListaPagos implements OnInit {
  private readonly servicio = inject(Pagos);
  private readonly estudiantesServicio = inject(Estudiantes);

  protected readonly tamano = 10;
  protected readonly pagos = signal<PagoResumen[]>([]);
  protected readonly estudiantes = signal<EstudianteResumen[]>([]);
  protected readonly pagina = signal(1);
  protected readonly cargando = signal(false);
  protected readonly error = signal('');
  protected readonly descripcionPago = descripcionPago;

  protected readonly filtroEstudiante = signal<number | null>(null);
  protected readonly filtroConcepto = signal('');
  protected readonly desde = signal('');
  protected readonly hasta = signal('');

  protected readonly cobrando = signal<'INSCRIPCION' | 'MENSUALIDAD' | null>(null);

  protected readonly hayMas = computed(() => this.pagos().length === this.tamano);

  ngOnInit(): void {
    this.estudiantesServicio.listar(1, 100, '', '').subscribe({ next: (l) => this.estudiantes.set(l) });
    this.cargar();
  }

  protected cargar(): void {
    this.cargando.set(true);
    this.error.set('');
    this.servicio
      .listar(this.pagina(), this.tamano, this.filtroEstudiante(), this.filtroConcepto(), this.desde(), this.hasta())
      .subscribe({
        next: (lista) => {
          this.pagos.set(lista);
          this.cargando.set(false);
        },
        error: (e) => {
          this.cargando.set(false);
          this.error.set(e.error?.mensaje ?? 'No se pudo cargar la lista');
        },
      });
  }

  protected filtrar(): void {
    this.pagina.set(1);
    this.cargar();
  }

  protected alCambiarEstudiante(valor: string): void {
    this.filtroEstudiante.set(valor ? Number(valor) : null);
    this.filtrar();
  }

  protected alCambiarConcepto(valor: string): void {
    this.filtroConcepto.set(valor);
    this.filtrar();
  }

  protected alCambiarDesde(valor: string): void {
    this.desde.set(valor);
    this.filtrar();
  }

  protected alCambiarHasta(valor: string): void {
    this.hasta.set(valor);
    this.filtrar();
  }

  protected anterior(): void {
    if (this.pagina() > 1) {
      this.pagina.update((p) => p - 1);
      this.cargar();
    }
  }

  protected siguiente(): void {
    if (this.hayMas()) {
      this.pagina.update((p) => p + 1);
      this.cargar();
    }
  }

  protected alGuardar(): void {
    this.cobrando.set(null);
    this.pagina.set(1);
    this.cargar();
  }
}
