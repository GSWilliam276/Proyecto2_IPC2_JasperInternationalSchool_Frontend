import { Component, OnInit, computed, inject, input, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { Superadmins, UsuarioResumen } from '../../servicios/superadmins';

/** Formulario (en modal) para crear o editar un SuperAdmin (CU006 y CU007) */
@Component({
  selector: 'app-formulario-superadmin',
  imports: [ReactiveFormsModule],
  templateUrl: './formulario-superadmin.html',
})
export class FormularioSuperadmin implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly servicio = inject(Superadmins);

  //Si llega un superadmin, el formulario edita; si no llega, crea
  readonly superadmin = input<UsuarioResumen | null>(null);
  readonly guardado = output<void>();
  readonly cancelado = output<void>();

  protected readonly esEdicion = computed(() => this.superadmin() !== null);
  protected readonly guardando = signal(false);
  protected readonly error = signal('');

  protected readonly campos = [
    { nombre: 'cui', etiqueta: 'CUI', tipo: 'text', aviso: 'Debe tener exactamente 13 dígitos' },
    { nombre: 'nombre', etiqueta: 'Nombre completo', tipo: 'text', aviso: 'El nombre es obligatorio' },
    { nombre: 'correo', etiqueta: 'Correo', tipo: 'email', aviso: 'Ingrese un correo válido' },
    { nombre: 'telefono', etiqueta: 'Teléfono', tipo: 'text', aviso: 'Entre 8 y 15 dígitos' },
    { nombre: 'direccion', etiqueta: 'Dirección', tipo: 'text', aviso: 'La dirección es obligatoria' },
    { nombre: 'contrasena', etiqueta: 'Contraseña provisional', tipo: 'password', aviso: 'Entre 8 y 64 caracteres' },
  ];

  //al editar no se muestra la contraseña: tiene su propio caso de uso
  protected readonly camposVisibles = computed(() =>
    this.esEdicion() ? this.campos.filter((c) => c.nombre !== 'contrasena') : this.campos,
  );

  protected readonly formulario = this.fb.nonNullable.group({
    cui: ['', [Validators.required, Validators.pattern(/^\d{13}$/)]],
    nombre: ['', [Validators.required, Validators.maxLength(100)]],
    correo: ['', [Validators.required, Validators.email, Validators.maxLength(100)]],
    telefono: ['', [Validators.required, Validators.pattern(/^\d{8,15}$/)]],
    direccion: ['', [Validators.required, Validators.maxLength(100)]],
    contrasena: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(64)]],
  });

  /** Al editar: se rellenan los datos y se bloquean los campos que no cambian */
  ngOnInit(): void {
    const actual = this.superadmin();
    if (actual) {
      this.formulario.patchValue(actual);
      //Un control deshabilitado no cuenta en la validacion del formulario
      this.formulario.controls.cui.disable();
      this.formulario.controls.correo.disable();
      this.formulario.controls.contrasena.disable();
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
    const actual = this.superadmin();
    // y aqui solo importa si la peticion salio bien o mal
    const peticion: Observable<unknown> = actual
      ? this.servicio.editar(actual.idUsuario, {
          nombre: datos.nombre,
          telefono: datos.telefono,
          direccion: datos.direccion,
        })
      : this.servicio.crear(datos);

    peticion.subscribe({
      next: () => {
        this.guardando.set(false);
        this.guardado.emit();
      },
      error: (e) => {
        this.guardando.set(false);
        this.error.set(e.error?.mensaje ?? 'No se pudo guardar el super administrador');
      },
    });
  }

  protected cancelar(): void {
    this.cancelado.emit();
  }
}
