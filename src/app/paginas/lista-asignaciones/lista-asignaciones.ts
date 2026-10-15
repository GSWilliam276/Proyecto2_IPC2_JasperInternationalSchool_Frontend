import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { AsignacionResumen, Asignaciones, MaestroResumen } from '../../servicios/asignaciones';
import { GradoResumen, Grados } from '../../servicios/grados';
import { SeccionResumen, Secciones } from '../../servicios/secciones';
import { FormularioAsignacion } from '../formulario-asignacion/formulario-asignacion';

/** Listado paginado de asignaciones: filtros por maestro, grado y seccion; asignar y quitar */
@Component({
  selector: 'app-lista-asignaciones',
  imports: [FormularioAsignacion],
  templateUrl: './lista-asignaciones.html',
})
export class ListaAsignaciones implements OnInit {
  private readonly servicio = inject(Asignaciones);
  private readonly gradosServicio = inject(Grados);
  private readonly seccionesServicio = inject(Secciones);

  protected readonly tamano = 10;
  protected readonly asignaciones = signal<AsignacionResumen[]>([]);
  protected readonly maestros = signal<MaestroResumen[]>([]);
  protected readonly grados = signal<GradoResumen[]>([]);
  protected readonly secciones = signal<SeccionResumen[]>([]);
  protected readonly pagina = signal(1);
  protected readonly cargando = signal(false);
  protected readonly error = signal('');

  protected readonly filtroMaestro = signal<number | null>(null);
  protected readonly filtroGrado = signal<number | null>(null);
  protected readonly filtroSeccion = signal<number | null>(null);
  protected readonly verAnteriores = signal(false);

  protected readonly pendiente = signal<AsignacionResumen | null>(null);
  protected readonly procesando = signal(false);
  protected readonly creando = signal(false);

  protected readonly hayMas = computed(() => this.asignaciones().length === this.tamano);

  ngOnInit(): void {
    this.servicio.maestros().subscribe({ next: (l) => this.maestros.set(l) });
    this.gradosServicio.listar(1, 100, '').subscribe({ next: (l) => this.grados.set(l) });
    //Para el filtro por seccion se traen tambien las de años anteriores
    this.seccionesServicio.listar(1, 100, '', null, true).subscribe({ next: (l) => this.secciones.set(l) });
    this.cargar();
  }

  protected cargar(): void {
    this.cargando.set(true);
    this.error.set('');
    this.servicio
      .listar(this.pagina(), this.tamano, this.filtroMaestro(), this.filtroGrado(), this.filtroSeccion(), this.verAnteriores())
      .subscribe({
        next: (lista) => {
          this.asignaciones.set(lista);
          this.cargando.set(false);
        },
        error: (e) => {
          this.cargando.set(false);
          this.error.set(e.error?.mensaje ?? 'No se pudo cargar la lista');
        },
      });
  }

  private aNumero(valor: string): number | null {
    return valor ? Number(valor) : null;
  }

  protected alCambiarMaestro(valor: string): void {
    this.filtroMaestro.set(this.aNumero(valor));
    this.pagina.set(1);
    this.cargar();
  }

  protected alCambiarGrado(valor: string): void {
    this.filtroGrado.set(this.aNumero(valor));
    this.pagina.set(1);
    this.cargar();
  }

  protected alCambiarSeccion(valor: string): void {
    this.filtroSeccion.set(this.aNumero(valor));
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

  /** Una asignacion de un año cerrado queda en solo lectura */
  protected esDeAnioCerrado(a: AsignacionResumen): boolean {
    return a.anioEstado !== 'ACTIVO';
  }

  //Quitar, con confirmacion 

  protected pedirConfirmacion(asignacion: AsignacionResumen): void {
    this.pendiente.set(asignacion);
  }

  protected cancelarConfirmacion(): void {
    this.pendiente.set(null);
  }

  protected confirmar(): void {
    const asignacion = this.pendiente();
    if (!asignacion) {
      return;
    }
    this.procesando.set(true);
    this.servicio.quitar(asignacion.idAsignacion).subscribe({
      next: () => {
        this.procesando.set(false);
        this.pendiente.set(null);
        this.cargar();
      },
      error: (e) => {
        this.procesando.set(false);
        this.pendiente.set(null);
        this.error.set(e.error?.mensaje ?? 'No se pudo quitar la asignación');
      },
    });
  }

  /** Se asigno un maestro: se cierra el modal y se recarga desde la primera pagina*/
  protected alGuardar(): void {
    this.creando.set(false);
    this.pagina.set(1);
    this.cargar();
  }
}
