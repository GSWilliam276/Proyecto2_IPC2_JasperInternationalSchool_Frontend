import { Component, inject, signal } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Autenticacion } from '../../servicios/autenticacion';

/** Validador del grupo: la confirmacion debe coincidir con la contraseña nueva */
const confirmacionCoincide = (grupo: AbstractControl): ValidationErrors | null => {
  const nueva = grupo.get('contrasenaNueva')?.value;
  const confirmar = grupo.get('confirmar')?.value;
  return nueva && confirmar && nueva !== confirmar ? { noCoinciden: true } : null;
};

/**
 * Recuperacion de contraseña (CU002 y CU003), en dos pasos:
 * 1) se pide un codigo con el correo, 2) se usa el codigo para elegir una contraseña nueva
 */
@Component({
  selector: 'app-recuperar-contrasena',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './recuperar-contrasena.html',
})
export class RecuperarContrasena {
  private readonly fb = inject(FormBuilder);
  private readonly autenticacion = inject(Autenticacion);

  protected readonly paso = signal<1 | 2>(1);
  protected readonly cargando = signal(false);
  protected readonly error = signal('');
  protected readonly aviso = signal(''); // mensaje informativo que manda el backend
  protected readonly terminado = signal(false); // true cuando la contraseña ya se cambio
  protected readonly verContrasena = signal(false); 

  // paso 1: solo el correo
  protected readonly formularioCorreo = this.fb.nonNullable.group({
    correo: ['', [Validators.required, Validators.email]],
  });

  // paso 2: correo, codigo y contraseña nueva con su confirmacion
  protected readonly formularioRestablecer = this.fb.nonNullable.group(
    {
      correo: ['', [Validators.required, Validators.email]],
      codigo: ['', [Validators.required, Validators.pattern(/^[A-Za-z0-9]{8}$/)]],
      contrasenaNueva: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(64)]],
      confirmar: ['', [Validators.required]],
    },
    { validators: [confirmacionCoincide] },
  );

  /** Paso 1: pide el codigo */
  protected solicitar(): void {
    if (this.formularioCorreo.invalid) {
      this.formularioCorreo.markAllAsTouched();
      return;
    }
    this.cargando.set(true);
    this.error.set('');

    const { correo } = this.formularioCorreo.getRawValue();
    this.autenticacion.solicitarCodigo(correo).subscribe({
      next: (respuesta) => {
        this.cargando.set(false);
        this.aviso.set(respuesta.mensaje);
        this.formularioRestablecer.patchValue({ correo }); // el correo pasa escrito al paso 2
        this.paso.set(2);
      },
      error: (e) => {
        this.cargando.set(false);
        this.error.set(e.error?.mensaje ?? 'No se pudo solicitar el código');
      },
    });
  }

  /** Paso 2: cambia la contraseña con el codigo */
  protected restablecer(): void {
    if (this.formularioRestablecer.invalid) {
      this.formularioRestablecer.markAllAsTouched();
      return;
    }
    this.cargando.set(true);
    this.error.set('');

    const { correo, codigo, contrasenaNueva } = this.formularioRestablecer.getRawValue();
    this.autenticacion.restablecerContrasena(correo, codigo, contrasenaNueva).subscribe({
      next: () => {
        this.cargando.set(false);
        this.terminado.set(true);
      },
      error: (e) => {
        this.cargando.set(false);
        // aqui llega "Código inválido o vencido"
        this.error.set(e.error?.mensaje ?? 'No se pudo restablecer la contraseña');
      },
    });
  }

  /** Para quien ya tiene un codigo y no necesita pedir otro */
  protected irAlPaso2(): void {
    this.error.set('');
    this.aviso.set('');
    this.paso.set(2);
  }

  protected volverAlPaso1(): void {
    this.error.set('');
    this.aviso.set('');
    this.paso.set(1);
  }
}
