import { Component, OnInit, computed, inject, input, output, signal } from '@angular/core';
import { CursoResumen, Cursos } from '../../servicios/cursos';
import { CurriculoResumen, Curriculos, etiquetaNivel } from '../../servicios/curriculos';

/** Detalle (en modal) de un curriculo: sus cursos, con opcion de agregar y quitar */
@Component({
  selector: 'app-detalle-curriculo',
  imports: [],
  templateUrl: './detalle-curriculo.html',
})
export class DetalleCurriculo implements OnInit {
  private readonly servicio = inject(Curriculos);
  private readonly cursosServicio = inject(Cursos);

  readonly curriculo = input.required<CurriculoResumen>();
  readonly cerrado = output<void>();

  protected readonly detalle = signal<CurriculoResumen | null>(null);
  protected readonly activos = signal<CursoResumen[]>([]);
  protected readonly error = signal('');
  protected readonly trabajando = signal(false);
  protected readonly porQuitar = signal<number | null>(null); //Curso que espera confirmacion
  protected readonly etiquetaNivel = etiquetaNivel;

  //Los cursos activos que todavia no estan en este curriculo
  protected readonly disponibles = computed(() => {
    const yaEstan = new Set((this.detalle()?.cursos ?? []).map((c) => c.idCurso));
    return this.activos().filter((c) => !yaEstan.has(c.idCurso));
  });

  ngOnInit(): void {
    this.cargar();
    this.cursosServicio.listar(1, 100, '').subscribe({
      next: (lista) => this.activos.set(lista.filter((c) => c.estado === 'ACTIVO')),
      error: (e) => this.error.set(e.error?.mensaje ?? 'No se pudieron cargar los cursos'),
    });
  }

  private cargar(): void {
    this.servicio.consultar(this.curriculo().idCurriculo).subscribe({
      next: (c) => this.detalle.set(c),
      error: (e) => this.error.set(e.error?.mensaje ?? 'No se pudo cargar el currículo'),
    });
  }

  protected agregar(valor: string): void {
    const idCurso = Number(valor);
    if (!idCurso) {
      return;
    }
    this.trabajando.set(true);
    this.error.set('');
    this.servicio.agregarCurso(this.curriculo().idCurriculo, idCurso).subscribe({
      next: () => {
        this.trabajando.set(false);
        this.cargar();
      },
      error: (e) => {
        this.trabajando.set(false);
        this.error.set(e.error?.mensaje ?? 'No se pudo agregar el curso');
      },
    });
  }

  protected pedirQuitar(idCurso: number): void {
    this.porQuitar.set(idCurso);
  }

  protected cancelarQuitar(): void {
    this.porQuitar.set(null);
  }

  protected quitar(idCurso: number): void {
    this.trabajando.set(true);
    this.error.set('');
    this.servicio.quitarCurso(this.curriculo().idCurriculo, idCurso).subscribe({
      next: () => {
        this.trabajando.set(false);
        this.porQuitar.set(null);
        this.cargar();
      },
      error: (e) => {
        this.trabajando.set(false);
        this.porQuitar.set(null);
        this.error.set(e.error?.mensaje ?? 'No se pudo quitar el curso');
      },
    });
  }

  protected cerrar(): void {
    this.cerrado.emit();
  }
}
