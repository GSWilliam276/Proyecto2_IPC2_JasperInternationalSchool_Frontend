import { CurrencyPipe } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { Autenticacion } from '../../servicios/autenticacion';
import { MultaResumen, Multas } from '../../servicios/multas';
import { Pagos } from '../../servicios/pagos';

/** Consulta de multas (CU078). La Secretaria ademas cobra las pendientes (CU065) */
@Component({
  selector: 'app-lista-multas',
  imports: [CurrencyPipe],
  templateUrl: './lista-multas.html',
})
export class ListaMultas implements OnInit {
  private readonly servicio = inject(Multas);
  private readonly pagosServicio = inject(Pagos);
  private readonly autenticacion = inject(Autenticacion);

  protected readonly tamano = 10;
  protected readonly multas = signal<MultaResumen[]>([]);
  protected readonly pagina = signal(1);
  protected readonly cargando = signal(false);
  protected readonly error = signal('');
  protected readonly estado = signal('');

  protected readonly puedeCobrar = this.autenticacion.obtenerSesion()?.rol === 'SECRETARIA';
  protected readonly pendiente = signal<MultaResumen | null>(null);
  protected readonly procesando = signal(false);

  protected readonly hayMas = computed(() => this.multas().length === this.tamano);

  ngOnInit(): void {
    this.cargar();
  }

  protected cargar(): void {
    this.cargando.set(true);
    this.error.set('');
    this.servicio.listar(this.pagina(), this.tamano, this.estado()).subscribe({
      next: (l) => {
        this.multas.set(l);
        this.cargando.set(false);
      },
      error: (e) => {
        this.cargando.set(false);
        this.error.set(e.error?.mensaje ?? 'No se pudo cargar la lista');
      },
    });
  }

  protected alCambiarEstado(v: string): void {
    this.estado.set(v);
    this.pagina.set(1);
    this.cargar();
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

  protected confirmarCobro(): void {
    const m = this.pendiente();
    if (!m) {
      return;
    }
    this.procesando.set(true);
    this.pagosServicio.pagarMulta(m.idMulta).subscribe({
      next: () => {
        this.procesando.set(false);
        this.pendiente.set(null);
        this.cargar();
      },
      error: (e) => {
        this.procesando.set(false);
        this.pendiente.set(null);
        this.error.set(e.error?.mensaje ?? 'No se pudo cobrar la multa');
      },
    });
  }
}
