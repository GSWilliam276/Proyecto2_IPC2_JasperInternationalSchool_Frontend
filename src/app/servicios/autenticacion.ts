import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { URL_API } from '../configuracion';

/**
 * Forma de lo que devuelve el backend al iniciar sesion
 * Coincide con la clase RespuestaInicioSesion del backend
 */
export interface Sesion {
  token: string;
  idUsuario: number;
  nombre: string;
  rol: string;
}

/**
 * Servicio de autenticacion (CU001, CU004).
 * Guarda logica que varias pantallas pueden compartir, como hablar con el backend
 */
@Injectable({ providedIn: 'root' }) //Una sola instancia para toda la aplicacion
export class Autenticacion {
  private readonly http = inject(HttpClient); //Pieza que hace las peticiones HTTP
  private readonly urlBase = URL_API;

  /**
   * Manda el correo y la contrasena al backend.
   * Devuelve un Observable: la peticion NO se envia hasta que alguien
   * se suscribe, y eso lo hace login.ts con subscribe()
   */
  iniciarSesion(correo: string, contrasena: string): Observable<Sesion> {
    return this.http
      .post<Sesion>(`${this.urlBase}/auth/login`, { correo, contrasena })
      //tap ejecuta algo con la respuesta sin cambiarla: aqui guarda la sesion
      .pipe(tap((sesion) => sessionStorage.setItem('sesion', JSON.stringify(sesion))));
  }

  /** Devuelve la sesion guardada, o null si no hay nadie con sesion iniciada */
  obtenerSesion(): Sesion | null {
    const texto = sessionStorage.getItem('sesion');
    return texto ? (JSON.parse(texto) as Sesion) : null;
  }

  /** Cerrar sesion con JWT es borrar el token del navegador */
  cerrarSesion(): void {
    //sessionStorage y no localStorage: cada pestana tiene su propia sesion,
    //asi no se mezclan cuentas si abren dos usuarios en el mismo navegador
    sessionStorage.removeItem('sesion');
  }

  /** CU102: cambia la contrasena de quien tiene la sesion iniciada */
  cambiarContrasena(contrasenaActual: string, contrasenaNueva: string): Observable<void> {
    return this.http.put<void>(`${this.urlBase}/auth/contrasena`, { contrasenaActual, contrasenaNueva });
  }
}
