import { CurrencyPipe } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { PrestamoResumen, Prestamos } from '../../servicios/prestamos';
import { FormularioPrestamo } from '../formulario-prestamo/formulario-prestamo';

/** Prestamos y devoluciones (CU075 a CU077): filtros por estado y fechas, mora visible */
@Component({
  selector: 'app-lista-prestamos',
  imports: [FormularioPrestamo, CurrencyPipe],
  templateUrl: './lista-prestamos.html',
})
export class ListaPrestamos implements OnInit {
  private readonly servicio = inject(Prestamos);

  protected readonly tamano = 10;
  protected readonly prestamos = signal<PrestamoResumen[]>([]);
  protected readonly pagina = signal(1);
  protected readonly cargando = signal(false);
  protected readonly error = signal('');
  protected readonly estado = signal('');
  protected readonly desde = signal('');
  protected readonly hasta = signal('');

  protected readonly creando = signal(false);
  protected readonly pendiente = signal<PrestamoResumen | null>(null);
  protected readonly procesando = signal(false);
  protected readonly resultado = signal<PrestamoResumen | null>(null); //Devolucion hecha, para avisar de la multa

  protected readonly hayMas = computed(() => this.prestamos().length === this.tamano);

  ngOnInit(): void {
    this.cargar();
  }

  protected cargar(): void {
    this.cargando.set(true);
    this.error.set('');
    this.servicio.listar(this.pagina(), this.tamano, this.estado(), this.desde(), this.hasta()).subscribe({
      next: (l) => {
        this.prestamos.set(l);
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

  protected alCambiarEstado(v: string): void {
    this.estado.set(v);
    this.filtrar();
  }

  protected alCambiarDesde(v: string): void {
    this.desde.set(v);
    this.filtrar();
  }

  protected alCambiarHasta(v: string): void {
    this.hasta.set(v);
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
    this.creando.set(false);
    this.pagina.set(1);
    this.cargar();
  }

  protected confirmarDevolucion(): void {
    const p = this.pendiente();
    if (!p) {
      return;
    }
    this.procesando.set(true);
    this.servicio.devolver(p.idPrestamo).subscribe({
      next: (devuelto) => {
        this.procesando.set(false);
        this.pendiente.set(null);
        //Si hubo atraso se muestra el resultado (con la multa, si es estudiante)
        if (devuelto.diasAtraso > 0) {
          this.resultado.set(devuelto);
        }
        this.cargar();
      },
      error: (e) => {
        this.procesando.set(false);
        this.pendiente.set(null);
        this.error.set(e.error?.mensaje ?? 'No se pudo registrar la devolución');
      },
    });
  }
}
