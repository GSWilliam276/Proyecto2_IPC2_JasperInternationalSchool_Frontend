import { Component, OnInit, inject, signal } from '@angular/core';
import { AsignacionResumen } from '../../servicios/asignaciones';
import { AlumnoResumen, Maestro } from '../../servicios/maestro';

/** Cursos asignados al maestro (CU079) y nomina de cada uno (CU080) */
@Component({
  selector: 'app-lista-mis-cursos',
  imports: [],
  templateUrl: './lista-mis-cursos.html',
})
export class ListaMisCursos implements OnInit {
  private readonly servicio = inject(Maestro);

  protected readonly asignaciones = signal<AsignacionResumen[]>([]);
  protected readonly cargando = signal(true);
  protected readonly error = signal('');

  protected readonly viendo = signal<AsignacionResumen | null>(null);
  protected readonly alumnos = signal<AlumnoResumen[]>([]);
  protected readonly cargandoNomina = signal(false);

  ngOnInit(): void {
    this.servicio.asignaciones().subscribe({
      next: (l) => {
        this.asignaciones.set(l);
        this.cargando.set(false);
      },
      error: (e) => {
        this.cargando.set(false);
        this.error.set(e.error?.mensaje ?? 'No se pudieron cargar sus cursos');
      },
    });
  }

  protected verNomina(a: AsignacionResumen): void {
    this.viendo.set(a);
    this.alumnos.set([]);
    this.error.set('');
    this.cargandoNomina.set(true);
    this.servicio.nomina(a.idAsignacion).subscribe({
      next: (l) => {
        this.alumnos.set(l);
        this.cargandoNomina.set(false);
      },
      error: (e) => {
        this.cargandoNomina.set(false);
        this.error.set(e.error?.mensaje ?? 'No se pudo cargar la nómina');
      },
    });
  }
}
