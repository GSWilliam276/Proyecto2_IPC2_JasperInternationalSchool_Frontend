import { Component, OnInit, inject, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { LibroResumen, Libros } from '../../servicios/libros';
import { PrestatarioResumen, Prestamos } from '../../servicios/prestamos';

/** Formulario (en modal) para registrar un prestamo (CU075) */
@Component({
  selector: 'app-formulario-prestamo',
  imports: [ReactiveFormsModule],
  templateUrl: './formulario-prestamo.html',
})
export class FormularioPrestamo implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly servicio = inject(Prestamos);
  private readonly librosServicio = inject(Libros);

  readonly guardado = output<void>();
  readonly cancelado = output<void>();

  protected readonly libros = signal<LibroResumen[]>([]);
  protected readonly prestatarios = signal<PrestatarioResumen[]>([]);
  protected readonly guardando = signal(false);
  protected readonly error = signal('');

  private temporizador: ReturnType<typeof setTimeout> | undefined;

  protected readonly formulario = this.fb.group({
    idLibro: this.fb.control<number | null>(null, Validators.required),
    idPrestatario: this.fb.control<number | null>(null, Validators.required),
  });

  ngOnInit(): void {
    //Solo libros activos con ejemplares disponibles
    this.librosServicio.listar(1, 100, '').subscribe({
      next: (l) => this.libros.set(l.filter((x) => x.estado === 'ACTIVO' && x.ejemplaresDisponibles > 0)),
      error: (e) => this.error.set(e.error?.mensaje ?? 'No se pudieron cargar los libros'),
    });
    this.cargarPrestatarios('');
  }

  private cargarPrestatarios(texto: string): void {
    this.servicio.prestatarios(texto).subscribe({
      next: (l) => this.prestatarios.set(l),
      error: (e) => this.error.set(e.error?.mensaje ?? 'No se pudieron cargar los prestatarios'),
    });
  }

  /** Busqueda de prestatario por nombre o CUI, con espera de 300 ms */
  protected alBuscar(texto: string): void {
    clearTimeout(this.temporizador);
    this.temporizador = setTimeout(() => this.cargarPrestatarios(texto.trim()), 300);
  }

  protected guardar(): void {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }
    this.guardando.set(true);
    this.error.set('');
    const v = this.formulario.getRawValue();
    this.servicio.prestar(v.idLibro as number, v.idPrestatario as number).subscribe({
      next: () => {
        this.guardando.set(false);
        this.guardado.emit();
      },
      error: (e) => {
        this.guardando.set(false);
        //Aqui llegan los 409: mora, sin ejemplares, libro inactivo
        this.error.set(e.error?.mensaje ?? 'No se pudo registrar el préstamo');
      },
    });
  }

  protected cancelar(): void {
    this.cancelado.emit();
  }
}
