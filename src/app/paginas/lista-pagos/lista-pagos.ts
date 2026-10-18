import { CurrencyPipe } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { EstudianteResumen, Estudiantes } from '../../servicios/estudiantes';
import { ComprobanteResumen, PagoResumen, Pagos, descripcionPago } from '../../servicios/pagos';
import { FormularioPago } from '../formulario-pago/formulario-pago';

/** Listado de pagos con filtros, cobro de inscripcion, mensualidad y actividad, anulacion y comprobantes */
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

  protected readonly cobrando = signal<'INSCRIPCION' | 'MENSUALIDAD' | 'ACTIVIDAD' | null>(null);

  //Anular con motivo
  protected readonly anulando = signal<PagoResumen | null>(null);
  protected readonly motivo = signal('');
  protected readonly procesando = signal(false);
  protected readonly errorAnular = signal('');

  //Comprobante
  protected readonly comprobante = signal<ComprobanteResumen | null>(null);

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

  //Anular (CU067) 

  protected pedirAnular(pago: PagoResumen): void {
    this.motivo.set('');
    this.errorAnular.set('');
    this.anulando.set(pago);
  }

  protected confirmarAnular(): void {
    const pago = this.anulando();
    const motivo = this.motivo().trim();
    if (!pago) {
      return;
    }
    if (!motivo) {
      this.errorAnular.set('El motivo es obligatorio');
      return;
    }
    this.procesando.set(true);
    this.errorAnular.set('');
    this.servicio.anular(pago.idPago, motivo).subscribe({
      next: () => {
        this.procesando.set(false);
        this.anulando.set(null);
        this.cargar();
      },
      error: (e) => {
        this.procesando.set(false);
        this.errorAnular.set(e.error?.mensaje ?? 'No se pudo anular el pago');
      },
    });
  }

  //Comprobante (CU068): si el pago ya tiene uno se muestra, y si no, se emite 

  protected verComprobante(pago: PagoResumen): void {
    this.error.set('');
    this.servicio.consultarComprobante(pago.idPago).subscribe({
      next: (c) => this.comprobante.set(c),
      error: (e) => {
        if (e.status === 404) {
          this.servicio.emitirComprobante(pago.idPago).subscribe({
            next: (c) => this.comprobante.set(c),
            error: (e2) => this.error.set(e2.error?.mensaje ?? 'No se pudo emitir el comprobante'),
          });
        } else {
          this.error.set(e.error?.mensaje ?? 'No se pudo consultar el comprobante');
        }
      },
    });
  }

  protected fechaHora(texto: string): string {
    return texto.replace('T', ' ');
  }
}
