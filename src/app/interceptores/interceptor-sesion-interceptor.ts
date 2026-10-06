import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { URL_API } from '../configuracion';
import { Autenticacion } from '../servicios/autenticacion';

/**
 * Interceptor de sesion.
 * Se ejecuta con cada peticion HTTP que sale de Angular, antes de enviarla,
 * y tambien con cada respuesta de error que vuelve.
 */
export const interceptorSesion: HttpInterceptorFn = (peticion, siguiente) => {
  const autenticacion = inject(Autenticacion);
  const router = inject(Router);

  //El token solo se manda al backend, nunca a otras direcciones.
  if (!peticion.url.startsWith(URL_API)) {
    return siguiente(peticion);
  }

  const sesion = autenticacion.obtenerSesion();

  //Las peticiones son inmutables: para agregar un encabezado hay que clonarla.
  const peticionFinal = sesion
    ? peticion.clone({ setHeaders: { Authorization: `Bearer ${sesion.token}` } })
    : peticion;

  return siguiente(peticionFinal).pipe(
    catchError((error: HttpErrorResponse) => {
      //401 teniendo sesion guardada = el token vencio o no sirve:
      //se borra la sesion y se manda al login.
      if (error.status === 401 && sesion) {
        autenticacion.cerrarSesion();
        router.navigate(['/login']);
      }
      //el error se vuelve a lanzar para que la pantalla tambien lo reciba
      return throwError(() => error);
    }),
  );
};
