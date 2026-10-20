import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { LibroResumen, Libros } from '../../servicios/libros';
import { FormularioLibro } from '../formulario-libro/formulario-libro';

/** Listado de libros: busqueda en tiempo real, registrar, editar, activar y desactivar */
@Component({
  selector: 'app-lista-libros',
  imports: [FormularioLibro],
  templateUrl: './lista-libros.html',
})
export class ListaLibros implements OnInit {
  private readonly servicio = inject(Libros);

  protected readonly tamano = 10;
  protected readonly libros = signal<LibroResumen[]>([]);
  protected readonly pagina = signal(1);
  protected readonly cargando = signal(false);
  protected readonly error = signal('');
  protected readonly pendiente = signal<LibroResumen | null>(null);
  protected readonly procesando = signal(false);
  protected readonly creando = signal(false);
  protected readonly editando = signal<LibroResumen | null>(null);
  protected readonly hayMas = computed(() => this.libros().length === this.tamano);
  protected readonly portadas = signal<Record<number, string>>({});

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
        this.libros.set(lista);
        this.cargando.set(false);
      },
      error: (e) => {
        this.cargando.set(false);
        this.error.set(e.error?.mensaje ?? 'No se pudo cargar la lista');
      },
    });
  }

  /** Busqueda en tiempo real: espera 300 ms despues de la ultima tecla */
  protected alEscribir(texto: string): void {
    clearTimeout(this.temporizador);
    this.temporizador = setTimeout(() => {
      this.busqueda = texto.trim();
      this.pagina.set(1);
      this.cargar();
    }, 300);
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

  protected confirmar(): void {
    const l = this.pendiente();
    if (!l) {
      return;
    }
    this.procesando.set(true);
    const peticion = l.estado === 'ACTIVO' ? this.servicio.desactivar(l.idLibro) : this.servicio.activar(l.idLibro);
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

  protected alGuardar(): void {
    const eraCreacion = this.creando();
    this.creando.set(false);
    this.editando.set(null);
    if (eraCreacion) {
      this.pagina.set(1);
    }
    this.cargar();
  }

  private cargarPortadas(lista: LibroResumen[]): void {
    for (const l of lista) {
      if (l.tieneImagen && !this.portadas()[l.idLibro]) {
        this.servicio.imagen(l.idLibro).subscribe({
          next: (blob) => this.portadas.update((p) => ({ ...p, [l.idLibro]: URL.createObjectURL(blob) })),
        });
      }
    }
  }
}
