import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Autenticacion } from '../../servicios/autenticacion';
import { Router, RouterLink } from '@angular/router';

/**
 * Pantalla de inicio de sesion (CU001).
 * Un componente es una pantalla: esta clase tiene la logica y login.html
 * tiene lo que se ve
 */
@Component({
  selector: 'app-login', //Nombre de la etiqueta HTML de este componente
  imports: [ReactiveFormsModule, RouterLink], //Necesario para usar el formulario en la plantilla
  templateUrl: './login.html', //El HTML que muestra este componente
})
export class Login {
  //El inject() le pide a Angular una pieza ya construida, en vez de crearla con new
  private readonly fb = inject(FormBuilder);
  private readonly autenticacion = inject(Autenticacion);
  private readonly router = inject(Router); //El que cambia de pantalla

  //Signal es una variable que avisa a la pantalla cuando cambia su valor,
  //asi el HTML se actualiza solo. Se lee como funcion: cargando()
  protected readonly cargando = signal(false); //true mientras se espera al backend
  protected readonly error = signal(''); //mensaje de error para mostrar
  //se elimino "bienvenida", era temporal y ahora se redirige al panel

  //El formulario con sus validaciones. Cada campo empieza vacio
  //y lleva una lista de reglas que debe cumplir.
  protected readonly formulario = this.fb.nonNullable.group({
    correo: ['', [Validators.required, Validators.email]],
    contrasena: ['', [Validators.required]],
  });

  /** Se ejecuta cuando el usuario envia el formulario. */
  protected iniciarSesion(): void {
    //Validacion en el frontend: evita mandar peticiones con datos incorrectos.
    //El backend igual vuelve a validar, porque nunca se confia solo en el navegador.
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched(); //hace que aparezcan los avisos de cada campo
      return;
    }

    this.cargando.set(true);
    this.error.set('');
    const { correo, contrasena } = this.formulario.getRawValue();

    //subscribe es quien realmente dispara la peticion HTTP.
    //Sin subscribe, la peticion no se envia.
    this.autenticacion.iniciarSesion(correo, contrasena).subscribe({
      //next: el backend respondio con exito (200)
      next: (sesion) => {
        this.cargando.set(false);
        //segun el rol, cada persona entra a su propio panel
        this.router.navigate([this.rutaPorRol(sesion.rol)]);
      },
      //error: el backend respondio con 401 u otro error, o no se pudo conectar
      error: (e) => {
        this.cargando.set(false);
        //e.error.mensaje es el texto que manda el backend en RespuestaError
        this.error.set(e.error?.mensaje ?? 'No se pudo conectar con el servidor');
      },
    });
  }

  /**
   * Devuelve la ruta del panel que le corresponde a cada rol
   * Se ira completando conforme existan los paneles de los demas roles
   */
  private rutaPorRol(rol: string): string {
    switch (rol) {
      case 'SUPERADMIN':
        return '/inicio';
      default:
        return '/sin-acceso'; //los demas paneles todavia no existen por el momento
    }
  }
}
