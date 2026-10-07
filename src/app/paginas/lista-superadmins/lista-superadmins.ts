import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { Superadmins, UsuarioResumen } from '../../servicios/superadmins';

/** Listado paginado de SuperAdmins con busqueda en tiempo real. */
@Component({
  selector: 'app-lista-superadmins',
  templateUrl: './lista-superadmins.html',
})
export class ListaSuperadmins implements OnInit {
  private readonly servicio = inject(Superadmins);

  protected readonly tamano = 10;
  protected readonly usuarios = signal<UsuarioResumen[]>([]);
  protected readonly pagina = signal(1);
  protected readonly cargando = signal(false);
  protected readonly error = signal('');

  //El backend no manda el total: si llegaron menos filas que el tamano, no hay mas paginas
  protected readonly hayMas = computed(() => this.usuarios().length === this.tamano);

  private busqueda = '';
  private temporizador: ReturnType<typeof setTimeout> | undefined;

  /** Se ejecuta una vez, cuando la pantalla aparece. */
  ngOnInit(): void {
    this.cargar();
  }

  protected cargar(): void {
    this.cargando.set(true);
    this.error.set('');
    this.servicio.listar(this.pagina(), this.tamano, this.busqueda).subscribe({
      next: (lista) => {
        this.usuarios.set(lista);
        this.cargando.set(false);
      },
      error: (e) => {
        this.cargando.set(false);
        this.error.set(e.error?.mensaje ?? 'No se pudo cargar la lista');
      },
    });
  }

  /**
   * El Debounce espera 350 ms despues de la ultima tecla antes de consultar,
   * para no mandar una peticion por cada letra que se escribe.
   */
  protected alEscribir(texto: string): void {
    clearTimeout(this.temporizador);
    this.temporizador = setTimeout(() => {
      this.busqueda = texto.trim();
      this.pagina.set(1); //Una busqueda nueva siempre empieza en la primera pagina
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
}
