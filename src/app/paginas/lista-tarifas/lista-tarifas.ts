import { CurrencyPipe } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { etiquetaNivel } from '../../servicios/curriculos';
import { GradoResumen, Grados } from '../../servicios/grados';
import { etiquetaConcepto, TarifaResumen, Tarifas } from '../../servicios/tarifas';
import { FormularioTarifa } from '../formulario-tarifa/formulario-tarifa';

/** Listado paginado de tarifas: filtro por grado, años anteriores, crear y editar el monto */
@Component({
  selector: 'app-lista-tarifas',
  imports: [FormularioTarifa, CurrencyPipe],
  templateUrl: './lista-tarifas.html',
})
export class ListaTarifas implements OnInit {
  private readonly servicio = inject(Tarifas);
  private readonly gradosServicio = inject(Grados);

  protected readonly tamano = 10;
  protected readonly tarifas = signal<TarifaResumen[]>([]);
  protected readonly grados = signal<GradoResumen[]>([]);
  protected readonly pagina = signal(1);
  protected readonly cargando = signal(false);
  protected readonly error = signal('');
  protected readonly etiquetaNivel = etiquetaNivel;
  protected readonly etiquetaConcepto = etiquetaConcepto;

  protected readonly filtroGrado = signal<number | null>(null);
  protected readonly verAnteriores = signal(false);
  protected readonly creando = signal(false);
  protected readonly editando = signal<TarifaResumen | null>(null);

  protected readonly hayMas = computed(() => this.tarifas().length === this.tamano);

  ngOnInit(): void {
    this.gradosServicio.listar(1, 100, '').subscribe({
      next: (lista) => this.grados.set(lista),
      error: (e) => this.error.set(e.error?.mensaje ?? 'No se pudieron cargar los grados'),
    });
    this.cargar();
  }

  protected cargar(): void {
    this.cargando.set(true);
    this.error.set('');
    this.servicio.listar(this.pagina(), this.tamano, this.filtroGrado(), this.verAnteriores()).subscribe({
      next: (lista) => {
        this.tarifas.set(lista);
        this.cargando.set(false);
      },
      error: (e) => {
        this.cargando.set(false);
        this.error.set(e.error?.mensaje ?? 'No se pudo cargar la lista');
      },
    });
  }

  protected alCambiarGrado(valor: string): void {
    this.filtroGrado.set(valor ? Number(valor) : null);
    this.pagina.set(1);
    this.cargar();
  }

  protected alCambiarAnteriores(marcado: boolean): void {
    this.verAnteriores.set(marcado);
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

  /** Una tarifa de un año cerrado queda en solo lectura */
  protected esDeAnioCerrado(t: TarifaResumen): boolean {
    return t.anioEstado !== 'ACTIVO';
  }

  /** El formulario guardo (creando o editando): se cierra y se recarga */
  protected alGuardar(): void {
    const eraCreacion = this.creando();
    this.creando.set(false);
    this.editando.set(null);
    if (eraCreacion) {
      this.pagina.set(1);
    }
    this.cargar();
  }
}
