import { Component, inject, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Superadmins } from '../../servicios/superadmins';

/** Formulario (en modal) para crear un SuperAdmin (CU006). */
@Component({
  selector: 'app-formulario-superadmin',
  imports: [ReactiveFormsModule],
  templateUrl: './formulario-superadmin.html',
})
export class FormularioSuperadmin {
  private readonly fb = inject(FormBuilder);
  private readonly servicio = inject(Superadmins);

  //output() son los "avisos" que este componente le manda a la pantalla que lo usa
  readonly creado = output<void>();
  readonly cancelado = output<void>();

  protected readonly guardando = signal(false);
  protected readonly error = signal('');

  //Lista de campos: el HTML la recorre con @for, para no repetir el mismo bloque seis veces
  protected readonly campos = [
    { nombre: 'cui', etiqueta: 'CUI', tipo: 'text', aviso: 'Debe tener exactamente 13 dígitos' },
    { nombre: 'nombre', etiqueta: 'Nombre completo', tipo: 'text', aviso: 'El nombre es obligatorio' },
    { nombre: 'correo', etiqueta: 'Correo', tipo: 'email', aviso: 'Ingrese un correo válido' },
    { nombre: 'telefono', etiqueta: 'Teléfono', tipo: 'text', aviso: 'Entre 8 y 15 dígitos' },
    { nombre: 'direccion', etiqueta: 'Dirección', tipo: 'text', aviso: 'La dirección es obligatoria' },
    { nombre: 'contrasena', etiqueta: 'Contraseña provisional', tipo: 'password', aviso: 'Entre 8 y 64 caracteres' },
  ];

  //Mismas reglas que el backend: aqui se avisa rapido, alla se garantiza
  protected readonly formulario = this.fb.nonNullable.group({
    cui: ['', [Validators.required, Validators.pattern(/^\d{13}$/)]],
    nombre: ['', [Validators.required, Validators.maxLength(100)]],
    correo: ['', [Validators.required, Validators.email, Validators.maxLength(100)]],
    telefono: ['', [Validators.required, Validators.pattern(/^\d{8,15}$/)]],
    direccion: ['', [Validators.required, Validators.maxLength(100)]],
    contrasena: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(64)]],
  });

  protected guardar(): void {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }
    this.guardando.set(true);
    this.error.set('');

    this.servicio.crear(this.formulario.getRawValue()).subscribe({
      next: () => {
        this.guardando.set(false);
        this.creado.emit(); //le avisa a la lista que recargue y cierre el modal
      },
      error: (e) => {
        this.guardando.set(false);
        //aqui llegan los 409 de "El correo ya está registrado" o "El CUI ya está registrado"
        this.error.set(e.error?.mensaje ?? 'No se pudo crear el usuario');
      },
    });
  }

  protected cancelar(): void {
    this.cancelado.emit();
  }
}
