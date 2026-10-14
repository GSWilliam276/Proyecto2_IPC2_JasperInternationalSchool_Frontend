import { Component, OnInit, computed, inject, input, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { CarreraResumen, Carreras } from '../../servicios/carreras';
import { etiquetaNivel } from '../../servicios/curriculos';
import { GradoResumen, Grados } from '../../servicios/grados';
import { SeccionResumen, Secciones } from '../../servicios/secciones';

/** Formulario (en modal) para crear o editar una seccion. Al editar solo cambian nombre y cupo */
@Component({
  selector: 'app-formulario-seccion',
  imports: [ReactiveFormsModule],
  templateUrl: './formulario-seccion.html',
})
export class FormularioSeccion implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly servicio = inject(Secciones);
  private readonly gradosServicio = inject(Grados);
  private readonly carrerasServicio = inject(Carreras);

  //Si llega una seccion, el formulario edita; si no llega, crea
  readonly seccion = input<SeccionResumen | null>(null);
  readonly guardado = output<void>();
  readonly cancelado = output<void>();

  protected readonly esEdicion = computed(() => this.seccion() !== null);
  protected readonly grados = signal<GradoResumen[]>([]);
  protected readonly carreras = signal<CarreraResumen[]>([]);
  protected readonly esDiversificado = signal(false);
  protected readonly guardando = signal(false);
  protected readonly error = signal('');
  protected readonly etiquetaNivel = etiquetaNivel;

  protected readonly formulario = this.fb.group({
    //El pattern rechaza un nombre hecho solo de espacios, que "required" deja pasar
    nombre: this.fb.nonNullable.control('', [Validators.required, Validators.pattern(/\S/), Validators.maxLength(10)]),
    idGrado: this.fb.control<number | null>(null, Validators.required),
    idCarrera: this.fb.control<number | null>(null),
    cupoMaximo: this.fb.control<number | null>(null, [Validators.required, Validators.min(1), Validators.max(200)]),
  });

  ngOnInit(): void {
    const actual = this.seccion();
    if (actual) {
      this.formulario.patchValue({ nombre: actual.nombre, cupoMaximo: actual.cupoMaximo });
      //Grado y carrera no cambian: un control deshabilitado no cuenta en la validacion
      this.formulario.controls.idGrado.disable({ emitEvent: false });
      this.formulario.controls.idCarrera.disable({ emitEvent: false });
      //El cupo no puede bajar de los estudiantes ya inscritos
      this.formulario.controls.cupoMaximo.setValidators([
        Validators.required,
        Validators.min(Math.max(1, actual.inscritos)),
        Validators.max(200),
      ]);
      this.formulario.controls.cupoMaximo.updateValueAndValidity();
      return;
    }

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

  /** La carrera solo se pide (y valida) cuando el grado elegido es de Diversificado */
  private alCambiarGrado(): void {
    const id = this.formulario.controls.idGrado.value;
    const diversificado = this.grados().find((g) => g.idGrado === id)?.nivel === 'DIVERSIFICADO';
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

  protected avisoCupo(): string {
    const actual = this.seccion();
    return actual && actual.inscritos > 1
      ? `Entre ${actual.inscritos} (los ya inscritos) y 200`
      : 'Entre 1 y 200';
  }

  protected guardar(): void {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }
    this.guardando.set(true);
    this.error.set('');

    const v = this.formulario.getRawValue();
    const actual = this.seccion();
    //Crear devuelve la seccion y editar no devuelve nada
    const peticion: Observable<unknown> = actual
      ? this.servicio.editar(actual.idSeccion, { nombre: v.nombre, cupoMaximo: v.cupoMaximo as number })
      : this.servicio.crear({
          nombre: v.nombre,
          idGrado: v.idGrado as number,
          idCarrera: this.esDiversificado() ? v.idCarrera : null,
          cupoMaximo: v.cupoMaximo as number,
        });

    peticion.subscribe({
      next: () => {
        this.guardando.set(false);
        this.guardado.emit();
      },
      error: (e) => {
        this.guardando.set(false);
        //Aqui llegan los 409: nombre repetido, grado sin curriculo, no hay año activo
        this.error.set(e.error?.mensaje ?? 'No se pudo guardar la sección');
      },
    });
  }

  protected cancelar(): void {
    this.cancelado.emit();
  }
}
