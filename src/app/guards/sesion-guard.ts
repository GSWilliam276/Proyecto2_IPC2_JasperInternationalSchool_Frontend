import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Autenticacion } from '../servicios/autenticacion';

/**
 * Guard de sesion: deja pasar solo si hay alguien con sesion iniciada.
 * Si no, manda al login.
 */
export const sesionGuard: CanActivateFn = () => {
  const autenticacion = inject(Autenticacion);
  const router = inject(Router);

  if (autenticacion.obtenerSesion()) {
    return true;
  }
  //createUrlTree arma una redireccion en lugar de simplemente bloquear
  return router.createUrlTree(['/login']);
};
