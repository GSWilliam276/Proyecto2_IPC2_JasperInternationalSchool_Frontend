import { Component, OnInit, computed, inject, input, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { Cursos, CursoResumen } from '../../servicios/cursos';

/** Formulario (en modal) para crear o editar un curso */
@Component({
  selector: 'app-formulario-curso',
  imports: [ReactiveFormsModule],
  templateUrl: './formulario-curso.html',
})
export class FormularioCurso implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly servicio = inject(Cursos);

  //Si llega un curso, el formulario edita; si no llega, crea
  readonly curso = input<CursoResumen | null>(null);
  readonly guardado = output<void>();
  readonly cancelado = output<void>();

  protected readonly esEdicion = computed(() => this.curso() !== null);
  protected readonly guardando = signal(false);
  protected readonly error = signal('');

  protected readonly formulario = this.fb.nonNullable.group({
    //el pattern rechaza un nombre hecho solo de espacios, que "required" deja pasar
    nombre: ['', [Validators.required, Validators.pattern(/\S/), Validators.maxLength(100)]],
    descripcion: ['', [Validators.maxLength(255)]],
  });

  ngOnInit(): void {
    const actual = this.curso();
    if (actual) {
      this.formulario.patchValue({ nombre: actual.nombre, descripcion: actual.descripcion ?? '' });
    }
  }

  protected guardar(): void {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }
    this.guardando.set(true);
    this.error.set('');

    const datos = this.formulario.getRawValue();
    const actual = this.curso();
    //Observable<unknown>: crear devuelve el curso y editar no devuelve nada
    const peticion: Observable<unknown> = actual
      ? this.servicio.editar(actual.idCurso, datos)
      : this.servicio.crear(datos);

    peticion.subscribe({
      next: () => {
        this.guardando.set(false);
        this.guardado.emit();
      },
      error: (e) => {
        this.guardando.set(false);
        // aqui llega el 409: "Ya existe un curso con ese nombre"
        this.error.set(e.error?.mensaje ?? 'No se pudo guardar el curso');
      },
    });
  }

  protected cancelar(): void {
    this.cancelado.emit();
  }
}
