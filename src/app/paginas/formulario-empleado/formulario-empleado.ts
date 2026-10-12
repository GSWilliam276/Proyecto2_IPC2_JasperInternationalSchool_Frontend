import { Component, OnInit, computed, inject, input, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { Empleados, EmpleadoResumen, SolicitudCrearEmpleado } from '../../servicios/empleados';

/** Puestos que llevan cuenta de acceso propia */
const PUESTOS_CON_CUENTA = ['MAESTRO', 'SECRETARIA', 'BIBLIOTECARIO'];

/** Formulario (en modal) para crear o editar un empleado */
@Component({
  selector: 'app-formulario-empleado',
  imports: [ReactiveFormsModule],
  templateUrl: './formulario-empleado.html',
})
export class FormularioEmpleado implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly servicio = inject(Empleados);

  //Si llega un empleado, el formulario edita; si no llega, crea
  readonly empleado = input<EmpleadoResumen | null>(null);
  readonly guardado = output<void>();
  readonly cancelado = output<void>();

  protected readonly esEdicion = computed(() => this.empleado() !== null);
  protected readonly guardando = signal(false);
  protected readonly error = signal('');
  protected readonly exigeCuenta = signal(false); //true = el puesto elegido pide correo y contraseña
  protected readonly verContrasena = signal(false);

  //Fecha de hoy en hora local, para que el selector no deje elegir una contratacion futura
  protected readonly hoy = (() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  })();

  protected readonly puestos = [
    { valor: 'MAESTRO', etiqueta: 'Maestro' },
    { valor: 'SECRETARIA', etiqueta: 'Secretaria' },
    { valor: 'BIBLIOTECARIO', etiqueta: 'Bibliotecario' },
    { valor: 'ADMINISTRATIVO', etiqueta: 'Administrativo' },
    { valor: 'MANTENIMIENTO', etiqueta: 'Mantenimiento' },
    { valor: 'LIMPIEZA', etiqueta: 'Limpieza' },
  ];

  protected readonly formulario = this.fb.nonNullable.group({
    cui: ['', [Validators.required, Validators.pattern(/^\d{13}$/)]],
    nombre: ['', [Validators.required, Validators.maxLength(100)]],
    telefono: ['', [Validators.required, Validators.pattern(/^\d{8,15}$/)]],
    direccion: ['', [Validators.required, Validators.maxLength(100)]],
    puesto: ['', [Validators.required]],
    fechaContratacion: ['', [Validators.required]],
    salario: [null as number | null, [Validators.required, Validators.min(0.01)]],
    correo: [''], // las reglas de correo y contrasena se activan segun el puesto
    contrasena: [''],
  });

  /** Al editar: se rellenan los datos y se bloquean los que no cambian (CUI y puesto) */
  ngOnInit(): void {
    const actual = this.empleado();
    if (actual) {
      this.formulario.patchValue({
        cui: actual.cui,
        nombre: actual.nombre,
        telefono: actual.telefono,
        direccion: actual.direccion,
        puesto: actual.puesto,
        fechaContratacion: actual.fechaContratacion,
        salario: actual.salario,
      });
      this.formulario.controls.cui.disable();
      this.formulario.controls.puesto.disable();
    }
  }

  /** Correo y contrasena solo se piden (y validan) para los puestos con cuenta propia */
  protected alCambiarPuesto(): void {
    const { puesto, correo, contrasena } = this.formulario.controls;
    this.exigeCuenta.set(PUESTOS_CON_CUENTA.includes(puesto.value));

    if (this.exigeCuenta()) {
      correo.setValidators([Validators.required, Validators.email, Validators.maxLength(100)]);
      contrasena.setValidators([Validators.required, Validators.minLength(8), Validators.maxLength(64)]);
    } else {
      correo.clearValidators();
      contrasena.clearValidators();
      correo.setValue('');
      contrasena.setValue('');
    }
    correo.updateValueAndValidity();
    contrasena.updateValueAndValidity();
  }

  protected guardar(): void {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }
    this.guardando.set(true);
    this.error.set('');

    const v = this.formulario.getRawValue();
    const actual = this.empleado();

    let peticion: Observable<unknown>;
    if (actual) {
      peticion = this.servicio.editar(actual.idEmpleado, {
        nombre: v.nombre,
        telefono: v.telefono,
        direccion: v.direccion,
        fechaContratacion: v.fechaContratacion,
        salario: v.salario as number,
      });
    } else {
      const solicitud: SolicitudCrearEmpleado = {
        cui: v.cui,
        nombre: v.nombre,
        telefono: v.telefono,
        direccion: v.direccion,
        puesto: v.puesto,
        fechaContratacion: v.fechaContratacion,
        salario: v.salario as number,
      };
      if (this.exigeCuenta()) {
        solicitud.correo = v.correo.trim();
        solicitud.contrasena = v.contrasena;
      }
      peticion = this.servicio.crear(solicitud);
    }

    peticion.subscribe({
      next: () => {
        this.guardando.set(false);
        this.guardado.emit();
      },
      error: (e) => {
        this.guardando.set(false);
        // aqui llegan los 409: "El CUI ya está registrado", "El correo ya está registrado"
        this.error.set(e.error?.mensaje ?? 'No se pudo guardar el empleado');
      },
    });
  }

  protected cancelar(): void {
    this.cancelado.emit();
  }
}
