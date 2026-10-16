import { Component, OnInit, computed, inject, input, output, signal } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { EstudianteResumen, Estudiantes, SolicitudEstudiante } from '../../servicios/estudiantes';

/**"AAAA-MM-DD" de hoy menos N años (mas unos dias), en hora local. Se puede comparar como texto */
function fechaHaceAnios(anios: number, sumarDias = 0): string {
  const d = new Date();
  d.setFullYear(d.getFullYear() - anios);
  d.setDate(d.getDate() + sumarDias);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** El segundo encargado se llena completo (nombre, telefono y parentesco) o no se llena */
const segundoEncargadoCompleto: ValidatorFn = (grupo: AbstractControl): ValidationErrors | null => {
  const llenos = ['encargado2Nombre', 'encargado2Telefono', 'encargado2Parentesco'].filter(
    (n) => String(grupo.get(n)?.value ?? '').trim() !== '',
  ).length;
  return llenos === 0 || llenos === 3 ? null : { segundoIncompleto: true };
};

/** Formulario (en modal) para registrar o editar un estudiante (CU029 y CU030) */
@Component({
  selector: 'app-formulario-estudiante',
  imports: [ReactiveFormsModule],
  templateUrl: './formulario-estudiante.html',
})
export class FormularioEstudiante implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly servicio = inject(Estudiantes);

  //Si llega un estudiante, el formulario edita; si no llega, registra
  readonly estudiante = input<EstudianteResumen | null>(null);
  readonly guardado = output<void>();
  readonly cancelado = output<void>();

  protected readonly esEdicion = computed(() => this.estudiante() !== null);
  protected readonly guardando = signal(false);
  protected readonly error = signal('');

  //Limites de la fecha de nacimiento al registrar: de 3 a 25 años
  protected readonly hoy = fechaHaceAnios(0);
  protected readonly maxNacimiento = fechaHaceAnios(3);
  protected readonly minNacimiento = fechaHaceAnios(26, 1);

  /** Al editar solo se exige que no sea futura: los limites de edad aplican al registrar */
  private readonly validarNacimiento = (c: AbstractControl): ValidationErrors | null => {
    const v = c.value as string;
    if (!v) {
      return null;
    }
    if (v > this.hoy) {
      return { futura: true };
    }
    if (this.esEdicion()) {
      return null;
    }
    if (v > this.maxNacimiento) {
      return { muyJoven: true };
    }
    if (v < this.minNacimiento) {
      return { muyMayor: true };
    }
    return null;
  };

  protected readonly formulario = this.fb.nonNullable.group(
    {
      cui: ['', [Validators.required, Validators.pattern(/^\d{13}$/)]],
      nombre: ['', [Validators.required, Validators.pattern(/\S/), Validators.maxLength(100)]],
      telefono: ['', [Validators.required, Validators.pattern(/^\d{8,15}$/)]],
      direccion: ['', [Validators.required, Validators.pattern(/\S/), Validators.maxLength(100)]],
      fechaNacimiento: ['', [Validators.required, this.validarNacimiento]],
      alergias: ['', [Validators.maxLength(255)]],
      condicionesMedicas: ['', [Validators.maxLength(255)]],
      encargadoNombre: ['', [Validators.required, Validators.pattern(/\S/), Validators.maxLength(100)]],
      encargadoTelefono: ['', [Validators.required, Validators.pattern(/^\d{8,15}$/)]],
      encargadoParentesco: ['', [Validators.required, Validators.pattern(/\S/), Validators.maxLength(50)]],
      encargado2Nombre: ['', [Validators.maxLength(100)]],
      encargado2Telefono: ['', [Validators.pattern(/^(\d{8,15})?$/)]],
      encargado2Parentesco: ['', [Validators.maxLength(50)]],
    },
    { validators: [segundoEncargadoCompleto] },
  );

  ngOnInit(): void {
    const actual = this.estudiante();
    if (actual) {
      this.formulario.patchValue({
        cui: actual.cui,
        nombre: actual.nombre,
        telefono: actual.telefono,
        direccion: actual.direccion,
        fechaNacimiento: actual.fechaNacimiento,
        alergias: actual.alergias ?? '',
        condicionesMedicas: actual.condicionesMedicas ?? '',
        encargadoNombre: actual.encargadoNombre,
        encargadoTelefono: actual.encargadoTelefono,
        encargadoParentesco: actual.encargadoParentesco,
        encargado2Nombre: actual.encargado2Nombre ?? '',
        encargado2Telefono: actual.encargado2Telefono ?? '',
        encargado2Parentesco: actual.encargado2Parentesco ?? '',
      });
      //El CUI identifica a la persona: no cambia
      this.formulario.controls.cui.disable();
      this.formulario.controls.fechaNacimiento.disable();
    }
  }

  protected segundoIncompletoVisible(): boolean {
    const c = this.formulario.controls;
    return (
      this.formulario.hasError('segundoIncompleto') &&
      (c.encargado2Nombre.touched || c.encargado2Telefono.touched || c.encargado2Parentesco.touched)
    );
  }

  protected guardar(): void {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }
    this.guardando.set(true);
    this.error.set('');

    const datos: SolicitudEstudiante = this.formulario.getRawValue();
    const actual = this.estudiante();
    //Registrar devuelve el estudiante y editar no devuelve nada
    const peticion: Observable<unknown> = actual
      ? this.servicio.editar(actual.idUsuario, datos)
      : this.servicio.registrar(datos);

    peticion.subscribe({
      next: () => {
        this.guardando.set(false);
        this.guardado.emit();
      },
      error: (e) => {
        this.guardando.set(false);
        //Aqui llega el 409: "El CUI ya está registrado", o "está graduado: no admite cambios"
        this.error.set(e.error?.mensaje ?? 'No se pudo guardar el estudiante');
      },
    });
  }

  protected cancelar(): void {
    this.cancelado.emit();
  }
}
