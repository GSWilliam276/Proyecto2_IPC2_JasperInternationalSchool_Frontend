import { Component, inject, signal } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Autenticacion } from '../../servicios/autenticacion';

/** Validador del grupo: la nueva debe coincidir con la confirmacion y ser distinta de la actual */
const reglasDelGrupo = (grupo: AbstractControl): ValidationErrors | null => {
  const actual = grupo.get('contrasenaActual')?.value;
  const nueva = grupo.get('contrasenaNueva')?.value;
  const confirmar = grupo.get('confirmar')?.value;
  const errores: ValidationErrors = {};
  if (nueva && confirmar && nueva !== confirmar) {
    errores['noCoinciden'] = true;
  }
  if (actual && nueva && actual === nueva) {
    errores['igualAActual'] = true;
  }
  return Object.keys(errores).length > 0 ? errores : null;
};

/** Pantalla para cambiar la contraseña propia (CU102). Sirve para cualquier rol */
@Component({
  selector: 'app-cambiar-contrasena',
  imports: [ReactiveFormsModule],
  templateUrl: './cambiar-contrasena.html',
})
export class CambiarContrasena {
  private readonly fb = inject(FormBuilder);
  private readonly autenticacion = inject(Autenticacion);

  protected readonly guardando = signal(false);
  protected readonly error = signal('');
  protected readonly exito = signal(false);

  protected readonly campos = [
    { nombre: 'contrasenaActual', etiqueta: 'Contraseña actual', aviso: 'Ingrese su contraseña actual' },
    { nombre: 'contrasenaNueva', etiqueta: 'Contraseña nueva', aviso: 'Entre 8 y 64 caracteres' },
    { nombre: 'confirmar', etiqueta: 'Confirmar contraseña nueva', aviso: 'Confirme la contraseña nueva' },
  ];

  protected readonly formulario = this.fb.nonNullable.group(
    {
      contrasenaActual: ['', [Validators.required]],
      contrasenaNueva: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(64)]],
      confirmar: ['', [Validators.required]],
    },
    { validators: [reglasDelGrupo] },
  );

  //Nombres de los campos cuya contraseña se esta mostrando en texto 
  protected readonly visibles = signal<string[]>([]);

  //Dice si un campo se esta mostrando en texto o con puntos
  protected esVisible(nombre: string): boolean {
    return this.visibles().includes(nombre);
  }

  //Muestra u oculta la contraseña de un campo
  protected alternarVisibilidad(nombre: string): void {
    this.visibles.update((lista) =>
      lista.includes(nombre) ? lista.filter((n) => n !== nombre) : [...lista, nombre],
    );
  }

  protected guardar(): void {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }
    this.guardando.set(true);
    this.error.set('');
    this.exito.set(false);

    const { contrasenaActual, contrasenaNueva } = this.formulario.getRawValue();
    this.autenticacion.cambiarContrasena(contrasenaActual, contrasenaNueva).subscribe({
      next: () => {
        this.guardando.set(false);
        this.exito.set(true);
        this.formulario.reset(); //Se limpian los tres campos
      },
      error: (e) => {
        this.guardando.set(false);
        //Aqui llega "La contraseña actual no es correcta"
        this.error.set(e.error?.mensaje ?? 'No se pudo cambiar la contraseña');
      },
    });
  }
}
