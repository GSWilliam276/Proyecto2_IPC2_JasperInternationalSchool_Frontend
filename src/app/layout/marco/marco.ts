import { Component, inject, signal} from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { Autenticacion } from '../../servicios/autenticacion';
import { gruposPorRol } from '../../menu';
import { ModalContrasenaProvisional } from '../../paginas/modal-contrasena-provisional/modal-contrasena-provisional';

/**
 * Marco comun de todas las pantallas con sesion: menu lateral, barra superior y pie
 * Lo unico que cambia entre pantallas es lo que va en <router-outlet />
 */
@Component({
  selector: 'app-marco',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, ModalContrasenaProvisional],
  templateUrl: './marco.html',
})
export class Marco {
  private readonly autenticacion = inject(Autenticacion);
  private readonly router = inject(Router);

  protected readonly sesion = this.autenticacion.obtenerSesion();
  protected readonly anio = new Date().getFullYear();

  //el menu depende del rol y se muestra en grupos: Configuracion, Personal, Academico...
  protected readonly grupos = gruposPorRol(this.sesion?.rol);

  protected cerrarSesion(): void {
    this.autenticacion.cerrarSesion();
    this.router.navigate(['/login']);
  }

  /** Iniciales para el avatar: "Super Admin" -> "SA" */
  protected get iniciales(): string {
    const partes = (this.sesion?.nombre ?? '').split(' ').filter((p) => p.length > 0);
    return partes
      .slice(0, 2)
      .map((p) => p[0].toUpperCase())
      .join('');
  }

  protected readonly provisional = signal(this.sesion?.contrasenaProvisional ?? false);
}
