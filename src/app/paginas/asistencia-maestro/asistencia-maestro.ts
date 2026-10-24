import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { AsignacionResumen } from '../../servicios/asignaciones';
import { fechaDeHoy, formatearFecha } from '../../servicios/actividades';
import { Maestro, RegistroAsistencia } from '../../servicios/maestro';

/** Asistencia del maestro: tomar (CU081), corregir (CU082) y consultar (CU083) */
@Component({
  selector: 'app-asistencia-maestro',
  imports: [],
  templateUrl: './asistencia-maestro.html',
})
export class AsistenciaMaestro implements OnInit {
  private readonly servicio = inject(Maestro);

  protected readonly asignaciones = signal<AsignacionResumen[]>([]);
  protected readonly idAsignacion = signal<number | null>(null);
  protected readonly fecha = signal(fechaDeHoy());
  protected readonly hoy = fechaDeHoy();
  protected readonly planilla = signal<RegistroAsistencia[]>([]);
  protected readonly marcas = signal<Record<number, boolean>>({});
  protected readonly cargando = signal(false);
  protected readonly guardando = signal(false);
  protected readonly error = signal('');
  protected readonly exito = signal('');
  protected readonly formatearFecha = formatearFecha;

  //La fecha ya tiene asistencia si alguien tiene marca guardada
  protected readonly yaTomada = computed(() => this.planilla().some((p) => p.presente !== null));

  //Historial
  protected readonly historial = signal<RegistroAsistencia[]>([]);
  protected readonly filtroEstudiante = signal<number | null>(null);
  protected readonly desde = signal('');
  protected readonly hasta = signal('');

  ngOnInit(): void {
    this.servicio.asignaciones().subscribe({
      next: (l) => this.asignaciones.set(l),
      error: (e) => this.error.set(e.error?.mensaje ?? 'No se pudieron cargar sus cursos'),
    });
  }

  protected alElegirCurso(valor: string): void {
    this.idAsignacion.set(valor ? Number(valor) : null);
    this.filtroEstudiante.set(null);
    this.historial.set([]);
    this.cargarPlanilla();
    this.cargarHistorial();
  }

  protected alCambiarFecha(valor: string): void {
    if (valor) {
      this.fecha.set(valor);
      this.cargarPlanilla();
    }
  }

  protected cargarPlanilla(): void {
    const id = this.idAsignacion();
    this.error.set('');
    this.exito.set('');
    this.planilla.set([]);
    if (id === null) {
      return;
    }
    this.cargando.set(true);
    this.servicio.planilla(id, this.fecha()).subscribe({
      next: (lista) => {
        this.planilla.set(lista);
        const m: Record<number, boolean> = {};
        const tomada = lista.some((p) => p.presente !== null);
        for (const p of lista) {
          //Fecha nueva: todos presentes por defecto; fecha ya tomada: lo guardado (el que entro tarde queda sin marcar)
          if (p.presente !== null) {
            m[p.idEstudiante] = p.presente;
          } else if (!tomada) {
            m[p.idEstudiante] = true;
          }
        }
        this.marcas.set(m);
        this.cargando.set(false);
      },
      error: (e) => {
        this.cargando.set(false);
        this.error.set(e.error?.mensaje ?? 'No se pudo cargar la planilla');
      },
    });
  }

  protected marcar(idEstudiante: number, presente: boolean): void {
    this.marcas.update((m) => ({ ...m, [idEstudiante]: presente }));
  }

  protected todos(presente: boolean): void {
    const m: Record<number, boolean> = {};
    for (const p of this.planilla()) {
      m[p.idEstudiante] = presente;
    }
    this.marcas.set(m);
  }

  protected guardar(): void {
    const id = this.idAsignacion();
    if (id === null) {
      return;
    }
    const lista = this.planilla()
      .filter((p) => this.marcas()[p.idEstudiante] !== undefined)
      .map((p) => ({ idEstudiante: p.idEstudiante, presente: this.marcas()[p.idEstudiante] }));
    if (lista.length === 0) {
      this.error.set('Marque al menos un estudiante');
      return;
    }
    this.guardando.set(true);
    this.error.set('');
    this.exito.set('');
    const edita = this.yaTomada();
    const peticion = edita
      ? this.servicio.editarAsistencia(id, this.fecha(), lista)
      : this.servicio.registrarAsistencia(id, this.fecha(), lista);
    peticion.subscribe({
      next: () => {
        this.guardando.set(false);
        this.exito.set(edita ? 'La asistencia se corrigió.' : 'La asistencia se registró.');
        this.cargarPlanilla();
        this.cargarHistorial();
      },
      error: (e) => {
        this.guardando.set(false);
        this.error.set(e.error?.mensaje ?? 'No se pudo guardar la asistencia');
      },
    });
  }

  protected cargarHistorial(): void {
    const id = this.idAsignacion();
    if (id === null) {
      return;
    }
    this.servicio.historialAsistencia(id, this.filtroEstudiante(), this.desde(), this.hasta()).subscribe({
      next: (l) => this.historial.set(l),
      error: (e) => this.error.set(e.error?.mensaje ?? 'No se pudo cargar el historial'),
    });
  }

  protected alFiltrar(): void {
    this.cargarHistorial();
  }
}
