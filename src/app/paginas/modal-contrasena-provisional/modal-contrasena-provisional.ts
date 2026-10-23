import { Component, inject, output, signal } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Autenticacion } from '../../servicios/autenticacion';

const reglas = (g: AbstractControl): ValidationErrors | null => {
  const actual = g.get('contrasenaActual')?.value;
  const nueva = g.get('contrasenaNueva')?.value;
  const confirmar = g.get('confirmar')?.value;
  const e: ValidationErrors = {};
  if (nueva && confirmar && nueva !== confirmar) {
    e['noCoinciden'] = true;
  }
  if (actual && nueva && actual === nueva) {
    e['igualAActual'] = true;
  }
  return Object.keys(e).length ? e : null;
};

/** Modal obligatorio: no se puede cerrar hasta cambiar la contraseña provisional (solo cerrar sesion)*/
@Component({
  selector: 'app-modal-contrasena-provisional',
  imports: [ReactiveFormsModule],
  templateUrl: './modal-contrasena-provisional.html',
})
export class ModalContrasenaProvisional {
  private readonly fb = inject(FormBuilder);
  private readonly autenticacion = inject(Autenticacion);

  readonly cambiada = output<void>();
  readonly salir = output<void>();

  protected readonly guardando = signal(false);
  protected readonly error = signal('');
  //Nombres de los campos cuya contraseña se esta mostrando en texto
  protected readonly visibles = signal<string[]>([]);

  protected readonly campos = [
    { nombre: 'contrasenaActual', etiqueta: 'Contraseña actual (la provisional)', aviso: 'Ingrese su contraseña actual' },
    { nombre: 'contrasenaNueva', etiqueta: 'Contraseña nueva', aviso: 'Entre 8 y 64 caracteres' },
    { nombre: 'confirmar', etiqueta: 'Confirmar contraseña nueva', aviso: 'Confirme la contraseña nueva' },
  ];

  protected esVisible(nombre: string): boolean {
    return this.visibles().includes(nombre);
  }

  protected alternarVisibilidad(nombre: string): void {
    this.visibles.update((lista) =>
      lista.includes(nombre) ? lista.filter((n) => n !== nombre) : [...lista, nombre],
    );
  }

  protected readonly formulario = this.fb.nonNullable.group(
    {
      contrasenaActual: ['', Validators.required],
      contrasenaNueva: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(64)]],
      confirmar: ['', Validators.required],
    },
    { validators: [reglas] },
  );

  protected guardar(): void {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }
    this.guardando.set(true);
    this.error.set('');
    const { contrasenaActual, contrasenaNueva } = this.formulario.getRawValue();
    this.autenticacion.cambiarContrasena(contrasenaActual, contrasenaNueva).subscribe({
      next: () => {
        this.guardando.set(false);
        this.autenticacion.marcarContrasenaCambiada();
        this.cambiada.emit();
      },
      error: (e) => {
        this.guardando.set(false);
        this.error.set(e.error?.mensaje ?? 'No se pudo cambiar la contraseña');
      },
    });
  }
}
