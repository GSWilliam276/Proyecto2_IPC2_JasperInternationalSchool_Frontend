import { Component, OnInit, inject, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CarreraResumen, Carreras } from '../../servicios/carreras';
import { CurriculoResumen, Curriculos, etiquetaNivel } from '../../servicios/curriculos';
import { GradoResumen, Grados } from '../../servicios/grados';

/** Formulario (en modal) para crear un curriculo: un grado y, si es de Diversificado, su carrera */
@Component({
  selector: 'app-formulario-curriculo',
  imports: [ReactiveFormsModule],
  templateUrl: './formulario-curriculo.html',
})
export class FormularioCurriculo implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly gradosServicio = inject(Grados);
  private readonly carrerasServicio = inject(Carreras);
  private readonly servicio = inject(Curriculos);

  readonly creado = output<CurriculoResumen>();
  readonly cancelado = output<void>();

  protected readonly grados = signal<GradoResumen[]>([]);
  protected readonly carreras = signal<CarreraResumen[]>([]);
  protected readonly esDiversificado = signal(false);
  protected readonly guardando = signal(false);
  protected readonly error = signal('');
  protected readonly etiquetaNivel = etiquetaNivel;

  protected readonly formulario = this.fb.group({
    idGrado: this.fb.control<number | null>(null, Validators.required),
    idCarrera: this.fb.control<number | null>(null),
  });

  ngOnInit(): void {
    //Solo se ofrecen grados y carreras activos
    this.gradosServicio.listar(1, 100, '').subscribe({
      next: (lista) => this.grados.set(lista.filter((g) => g.estado === 'ACTIVO')),
      error: (e) => this.error.set(e.error?.mensaje ?? 'No se pudieron cargar los grados'),
    });
    this.carrerasServicio.listar(1, 100, '').subscribe({
      next: (lista) => this.carreras.set(lista.filter((c) => c.estado === 'ACTIVO')),
      error: (e) => this.error.set(e.error?.mensaje ?? 'No se pudieron cargar las carreras'),
    });
    this.formulario.controls.idGrado.valueChanges.subscribe(() => this.alCambiarGrado());
  }

  /** La carrera solo se pide (y valida) cuando el grado elegido es de Diversificado*/
  private alCambiarGrado(): void {
    const id = this.formulario.controls.idGrado.value;
    const grado = this.grados().find((g) => g.idGrado === id);
    const diversificado = grado?.nivel === 'DIVERSIFICADO';
    this.esDiversificado.set(diversificado);

    const carrera = this.formulario.controls.idCarrera;
    if (diversificado) {
      carrera.setValidators([Validators.required]);
    } else {
      carrera.clearValidators();
      carrera.setValue(null);
    }
    carrera.updateValueAndValidity();
  }

  protected guardar(): void {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }
    this.guardando.set(true);
    this.error.set('');

    const { idGrado, idCarrera } = this.formulario.getRawValue();
    this.servicio
      .crear({ idGrado: idGrado as number, idCarrera: this.esDiversificado() ? idCarrera : null })
      .subscribe({
        next: (curriculo) => {
          this.guardando.set(false);
          this.creado.emit(curriculo);
        },
        error: (e) => {
          this.guardando.set(false);
          //Aqui llega el 409: "Ese grado ya tiene un currículo"
          this.error.set(e.error?.mensaje ?? 'No se pudo crear el currículo');
        },
      });
  }

  protected cancelar(): void {
    this.cancelado.emit();
  }
}
