import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Autenticacion } from '../../servicios/autenticacion';

/**
 * Panel del SuperAdmin. Por ahora solo muestra quien inicio sesion
 * y permite cerrarla. Luego va a llevar el menu y el contenido.
 */
@Component({
  selector: 'app-panel-superadmin',
  templateUrl: './panel-superadmin.html',
})
export class PanelSuperadmin {
  private readonly autenticacion = inject(Autenticacion);
  private readonly router = inject(Router);

  //la sesion se lee una vez al crear la pantalla
  protected readonly sesion = this.autenticacion.obtenerSesion();

  protected cerrarSesion(): void {
    this.autenticacion.cerrarSesion(); //borra el token del navegador
    this.router.navigate(['/login']);
  }
}
