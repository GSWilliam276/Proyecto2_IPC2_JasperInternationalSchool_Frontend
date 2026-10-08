import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { AniosLectivos, AnioLectivoResumen } from '../../servicios/anios-lectivos';
import { FormularioAnioLectivo } from '../formulario-anio-lectivo/formulario-anio-lectivo';

/** Listado paginado de años lectivos: busqueda, crear, editar y cerrar */
@Component({
  selector: 'app-lista-anios-lectivos',
  imports: [FormularioAnioLectivo],
  templateUrl: './lista-anios-lectivos.html',
})
export class ListaAniosLectivos implements OnInit {
  private readonly servicio = inject(AniosLectivos);

  protected readonly tamano = 10;
  protected readonly anios = signal<AnioLectivoResumen[]>([]);
  protected readonly pagina = signal(1);
  protected readonly cargando = signal(false);
  protected readonly error = signal('');

  //Modal por cada accion: cerrar (con confirmacion), crear y editar
  protected readonly pendiente = signal<AnioLectivoResumen | null>(null);
  protected readonly procesando = signal(false);
  protected readonly creando = signal(false);
  protected readonly editando = signal<AnioLectivoResumen | null>(null);

  protected readonly hayMas = computed(() => this.anios().length === this.tamano);

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
        this.anios.set(lista);
        this.cargando.set(false);
      },
      error: (e) => {
        this.cargando.set(false);
        this.error.set(e.error?.mensaje ?? 'No se pudo cargar la lista');
      },
    });
  }

  /** El debounce que espera 350 ms despues de la ultima tecla antes de consultar */
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

  /** "2026-01-15" -> "15/01/2026", para mostrar */
  protected formatear(fecha: string): string {
    const [anio, mes, dia] = fecha.split('-');
    return `${dia}/${mes}/${anio}`;
  }

  //Cerrar, con confirmacion (es irreversible) 

  protected pedirCierre(anio: AnioLectivoResumen): void {
    this.pendiente.set(anio);
  }

  protected cancelarCierre(): void {
    this.pendiente.set(null);
  }

  protected confirmarCierre(): void {
    const anio = this.pendiente();
    if (!anio) {
      return;
    }
    this.procesando.set(true);
    this.servicio.cerrar(anio.idAnioLectivo).subscribe({
      next: () => {
        this.procesando.set(false);
        this.pendiente.set(null);
        this.cargar();
      },
      error: (e) => {
        this.procesando.set(false);
        this.pendiente.set(null);
        this.error.set(e.error?.mensaje ?? 'No se pudo cerrar el año lectivo');
      },
    });
  }

  //Crear y editar 

  /** El formulario guardo: se cierran los modales y se recarga */
  protected alGuardar(): void {
    const eraCreacion = this.creando();
    this.creando.set(false);
    this.editando.set(null);
    if (eraCreacion) {
      this.pagina.set(1); //Un año nuevo se ve desde la primera pagina
    }
    this.cargar();
  }
}
