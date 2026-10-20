import { Component, OnInit, computed, inject, input, output, signal } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { LibroResumen, Libros } from '../../servicios/libros';

const entero = (c: AbstractControl): ValidationErrors | null =>
  Number.isInteger(c.value) ? null : { entero: true };

/** Formulario (en modal) para registrar o editar un libro (CU070 y CU071) */
@Component({
  selector: 'app-formulario-libro',
  imports: [ReactiveFormsModule],
  templateUrl: './formulario-libro.html',
})
export class FormularioLibro implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly servicio = inject(Libros);

  readonly libro = input<LibroResumen | null>(null);
  readonly guardado = output<void>();
  readonly cancelado = output<void>();

  protected readonly esEdicion = computed(() => this.libro() !== null);
  protected readonly guardando = signal(false);
  protected readonly error = signal('');
  protected readonly archivo = signal<File | null>(null);

  protected readonly formulario = this.fb.group({
    titulo: this.fb.nonNullable.control('', [Validators.required, Validators.pattern(/\S/), Validators.maxLength(150)]),
    autor: this.fb.nonNullable.control('', [Validators.required, Validators.pattern(/\S/), Validators.maxLength(100)]),
    editorial: this.fb.nonNullable.control('', [Validators.required, Validators.pattern(/\S/), Validators.maxLength(100)]),
    ejemplares: this.fb.control<number | null>(null, [Validators.required, Validators.min(1), Validators.max(1000), entero]),
  });

  ngOnInit(): void {
    const actual = this.libro();
    if (actual) {
      this.formulario.patchValue({
        titulo: actual.titulo,
        autor: actual.autor,
        editorial: actual.editorial,
        ejemplares: actual.ejemplaresTotales,
      });
      //La cantidad no puede quedar por debajo de los ejemplares prestados
      this.formulario.controls.ejemplares.setValidators([
        Validators.required, Validators.min(Math.max(1, actual.ejemplaresPrestados)), Validators.max(1000), entero,
      ]);
      this.formulario.controls.ejemplares.updateValueAndValidity();
    }
  }

  protected avisoEjemplares(): string {
    const prestados = this.libro()?.ejemplaresPrestados ?? 0;
    return prestados > 1 ? `Entre ${prestados} (los prestados) y 1000` : 'Un número entero entre 1 y 1000';
  }

  protected guardar(): void {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }
    this.guardando.set(true);
    this.error.set('');
    const v = this.formulario.getRawValue();
    const datos = { titulo: v.titulo, autor: v.autor, editorial: v.editorial, ejemplares: v.ejemplares as number };
    const actual = this.libro();
    const peticion: Observable<unknown> = actual
      ? this.servicio.editar(actual.idLibro, datos)
      : this.servicio.registrar(datos);
    peticion.subscribe({
      next: (resultado) => {
        const id = actual ? actual.idLibro : (resultado as LibroResumen).idLibro;
        const f = this.archivo();
        if (!f) {
          this.guardando.set(false);
          this.guardado.emit();
          return;
        }
        this.servicio.subirImagen(id, f).subscribe({
          next: () => {
            this.guardando.set(false);
            this.guardado.emit();
          },
          error: (e) => {
            this.guardando.set(false);
            this.error.set(e.error?.mensaje ?? 'El libro se guardó, pero no se pudo subir la imagen');
          },
        });
      },
      error: (e) => {
        this.guardando.set(false);
        this.error.set(e.error?.mensaje ?? 'No se pudo guardar el libro');
      },
    });
  }

  protected alElegirArchivo(evento: Event): void {
    const f = (evento.target as HTMLInputElement).files?.[0] ?? null;
    if (f && !['image/jpeg', 'image/png', 'image/webp'].includes(f.type)) {
      this.error.set('La imagen debe ser JPG, PNG o WebP');
      this.archivo.set(null);
      return;
    }
    if (f && f.size > 2 * 1024 * 1024) {
      this.error.set('La imagen no puede pasar de 2 MB');
      this.archivo.set(null);
      return;
    }
    this.error.set('');
    this.archivo.set(f);
  }

  protected cancelar(): void {
    this.cancelado.emit();
  }
}
