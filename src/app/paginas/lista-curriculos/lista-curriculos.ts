import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CurriculoResumen, Curriculos, etiquetaNivel } from '../../servicios/curriculos';
import { DetalleCurriculo } from '../detalle-curriculo/detalle-curriculo';
import { FormularioCurriculo } from '../formulario-curriculo/formulario-curriculo';

/** Listado paginado de curriculos. Desde aqui se crean y se abre su detalle para gestionar los cursos */
@Component({
  selector: 'app-lista-curriculos',
  imports: [FormularioCurriculo, DetalleCurriculo],
  templateUrl: './lista-curriculos.html',
})
export class ListaCurriculos implements OnInit {
  private readonly servicio = inject(Curriculos);

  protected readonly tamano = 10;
  protected readonly curriculos = signal<CurriculoResumen[]>([]);
  protected readonly pagina = signal(1);
  protected readonly cargando = signal(false);
  protected readonly error = signal('');
  protected readonly creando = signal(false);
  protected readonly viendo = signal<CurriculoResumen | null>(null);
  protected readonly etiquetaNivel = etiquetaNivel;

  protected readonly hayMas = computed(() => this.curriculos().length === this.tamano);

  private busqueda = '';
  private temporizador: ReturnType<typeof setTimeout> | undefined;

  ngOnInit(): void {
    this.cargar();
  }

  protected cargar(): void {
    this.cargando.set(true);
    this.error.set('');
    this.servicio.listar(this.pagina(), this.tamano, this.busqueda).subscribe({
      next: (lista) => {
        this.curriculos.set(lista);
        this.cargando.set(false);
      },
      error: (e) => {
        this.cargando.set(false);
        this.error.set(e.error?.mensaje ?? 'No se pudo cargar la lista');
      },
    });
  }

  /** El debounce espera 350 ms despues de la ultima tecla antes de consultar */
  protected alEscribir(texto: string): void {
    clearTimeout(this.temporizador);
    this.temporizador = setTimeout(() => {
      this.busqueda = texto.trim();
      this.pagina.set(1);
      this.cargar();
    }, 350);
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

  /** Se creo un curriculo: se recarga la lista y se abre su detalle para agregarle cursos */
  protected alCrear(curriculo: CurriculoResumen): void {
    this.creando.set(false);
    this.pagina.set(1);
    this.cargar();
    this.viendo.set(curriculo);
  }
}
