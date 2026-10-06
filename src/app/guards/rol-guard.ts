import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Autenticacion } from '../servicios/autenticacion';

/**
 * Guard de rol: deja pasar solo si el rol de la sesion esta en la lista
 * que la ruta declara en su propiedad "data"
 */
export const rolGuard: CanActivateFn = (ruta) => {
  const autenticacion = inject(Autenticacion);
  const router = inject(Router);

  const sesion = autenticacion.obtenerSesion();
  const permitidos = (ruta.data['roles'] as string[]) ?? [];

  if (sesion && permitidos.includes(sesion.rol)) {
    return true;
  }
  //con sesion pero sin permiso: a la pantalla de acceso denegado
  //Sin sesion: al login.
  return router.createUrlTree([sesion ? '/sin-acceso' : '/login']);
};
