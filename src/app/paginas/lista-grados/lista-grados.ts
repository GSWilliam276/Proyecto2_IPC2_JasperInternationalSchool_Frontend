import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { Grados, GradoResumen } from '../../servicios/grados';
import { FormularioGrado } from '../formulario-grado/formulario-grado';

/** Listado paginado de grados: busqueda, crear, editar, activar y desactivar */
@Component({
  selector: 'app-lista-grados',
  imports: [FormularioGrado],
  templateUrl: './lista-grados.html',
})
export class ListaGrados implements OnInit {
  private readonly servicio = inject(Grados);

  protected readonly tamano = 10;
  protected readonly grados = signal<GradoResumen[]>([]);
  protected readonly pagina = signal(1);
  protected readonly cargando = signal(false);
  protected readonly error = signal('');

  //Confirmacion de activar/desactivar, y los dos usos del formulario
  protected readonly pendiente = signal<GradoResumen | null>(null);
  protected readonly procesando = signal(false);
  protected readonly creando = signal(false);
  protected readonly editando = signal<GradoResumen | null>(null);

  protected readonly hayMas = computed(() => this.grados().length === this.tamano);

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
        this.grados.set(lista);
        this.cargando.set(false);
      },
      error: (e) => {
        this.cargando.set(false);
        this.error.set(e.error?.mensaje ?? 'No se pudo cargar la lista');
      },
    });
  }

  /** El debounce spera 350 ms despues de la ultima tecla antes de consultar */
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

  /** "BASICO" -> "Básico", para mostrar */
  protected etiquetaNivel(nivel: string): string {
    const etiquetas: Record<string, string> = {
      PRE_PRIMARIA: 'Pre-primaria',
      PRIMARIA: 'Primaria',
      BASICO: 'Básico',
      DIVERSIFICADO: 'Diversificado',
    };
    return etiquetas[nivel] ?? nivel;
  }

  //Activar / desactivar con confirmacion 

  protected pedirConfirmacion(grado: GradoResumen): void {
    this.pendiente.set(grado);
  }

  protected cancelarConfirmacion(): void {
    this.pendiente.set(null);
  }

  protected confirmar(): void {
    const grado = this.pendiente();
    if (!grado) {
      return;
    }
    this.procesando.set(true);

    const peticion =
      grado.estado === 'ACTIVO'
        ? this.servicio.desactivar(grado.idGrado)
        : this.servicio.activar(grado.idGrado);

    peticion.subscribe({
      next: () => {
        this.procesando.set(false);
        this.pendiente.set(null);
        this.cargar();
      },
      error: (e) => {
        this.procesando.set(false);
        this.pendiente.set(null);
        this.error.set(e.error?.mensaje ?? 'No se pudo completar la acción');
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
      this.pagina.set(1);
    }
    this.cargar();
  }
}
