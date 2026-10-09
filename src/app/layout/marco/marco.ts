import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { Autenticacion } from '../../servicios/autenticacion';

/** Enlace del menu lateral */
interface OpcionMenu {
  ruta: string;
  etiqueta: string;
}

/**
 * Marco comun de todas las pantallas con sesion: menu lateral, barra superior y pie
 * Lo unico que cambia entre pantallas es lo que va en <router-outlet />
 */
@Component({
  selector: 'app-marco',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './marco.html',
})
export class Marco {
  private readonly autenticacion = inject(Autenticacion);
  private readonly router = inject(Router);

  protected readonly sesion = this.autenticacion.obtenerSesion();
  protected readonly anio = new Date().getFullYear();

  //el menu depende del rol; se ira completando con los demas roles
  protected readonly menu: OpcionMenu[] = this.opcionesPorRol(this.sesion?.rol);

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

    private opcionesPorRol(rol: string | undefined): OpcionMenu[] {
      switch (rol) {
        case 'SUPERADMIN':
          return [
            { ruta: '/superadmin', etiqueta: 'Super Administradores' },
            { ruta: '/admins', etiqueta: 'Administradores' },
            { ruta: '/anios-lectivos', etiqueta: 'Años lectivos' },
            { ruta: '/grados', etiqueta: 'Grados' },
            { ruta: '/carreras', etiqueta: 'Carreras' },
          ];
        default:
          return [];
      }
    }
  }
