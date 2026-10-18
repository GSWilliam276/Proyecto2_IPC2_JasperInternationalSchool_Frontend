import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { etiquetaNivel } from '../../servicios/curriculos';
import { InscripcionResumen, Inscripciones } from '../../servicios/inscripciones';
import { SeccionResumen, Secciones } from '../../servicios/secciones';
import { FormularioInscripcion } from '../formulario-inscripcion/formulario-inscripcion';

/** Inscripciones del año activo: filtro por seccion, inscribir y anular */
@Component({
  selector: 'app-lista-inscripciones',
  imports: [FormularioInscripcion],
  templateUrl: './lista-inscripciones.html',
})
export class ListaInscripciones implements OnInit {
  private readonly servicio = inject(Inscripciones);
  private readonly seccionesServicio = inject(Secciones);

  protected readonly tamano = 10;
  protected readonly inscripciones = signal<InscripcionResumen[]>([]);
  protected readonly secciones = signal<SeccionResumen[]>([]);
  protected readonly pagina = signal(1);
  protected readonly cargando = signal(false);
  protected readonly error = signal('');
  protected readonly filtroSeccion = signal<number | null>(null);
  protected readonly etiquetaNivel = etiquetaNivel;

  protected readonly creando = signal(false);
  protected readonly resultado = signal<InscripcionResumen | null>(null); //Para mostrar la contraseña provisional
  protected readonly copiada = signal(false);
  protected readonly pendiente = signal<InscripcionResumen | null>(null);
  protected readonly procesando = signal(false);

  protected readonly hayMas = computed(() => this.inscripciones().length === this.tamano);

  ngOnInit(): void {
    this.seccionesServicio.listar(1, 100, '', null, false).subscribe({ next: (l) => this.secciones.set(l) });
    this.cargar();
  }

  protected cargar(): void {
    this.cargando.set(true);
    this.error.set('');
    this.servicio.listar(this.pagina(), this.tamano, this.filtroSeccion()).subscribe({
      next: (lista) => {
        this.inscripciones.set(lista);
        this.cargando.set(false);
      },
      error: (e) => {
        this.cargando.set(false);
        this.error.set(e.error?.mensaje ?? 'No se pudo cargar la lista');
      },
    });
  }

  protected alCambiarSeccion(valor: string): void {
    this.filtroSeccion.set(valor ? Number(valor) : null);
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

  /** Se inscribio: si se creo un acceso nuevo, la contraseña provisional se muestra una sola vez */
  protected alInscribir(inscripcion: InscripcionResumen): void {
    this.creando.set(false);
    this.copiada.set(false);
    if (inscripcion.contrasenaProvisional) {
      this.resultado.set(inscripcion);
    }
    this.pagina.set(1);
    this.cargar();
  }

  protected copiar(texto: string): void {
    navigator.clipboard?.writeText(texto).then(() => this.copiada.set(true));
  }

  protected confirmarAnular(): void {
    const i = this.pendiente();
    if (!i) {
      return;
    }
    this.procesando.set(true);
    this.servicio.anular(i.idInscripcion).subscribe({
      next: () => {
        this.procesando.set(false);
        this.pendiente.set(null);
        this.cargar();
      },
      error: (e) => {
        this.procesando.set(false);
        this.pendiente.set(null);
        this.error.set(e.error?.mensaje ?? 'No se pudo anular la inscripción');
      },
    });
  }
}
