import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Autenticacion } from '../../servicios/autenticacion';

/** Se muestra cuando hay sesion, pero el rol no puede entrar a esa ruta. */
@Component({
  selector: 'app-sin-acceso',
  templateUrl: './sin-acceso.html',
})
export class SinAcceso {
  private readonly autenticacion = inject(Autenticacion);
  private readonly router = inject(Router);

  protected volver(): void {
    this.autenticacion.cerrarSesion();
    this.router.navigate(['/login']);
  }
}
