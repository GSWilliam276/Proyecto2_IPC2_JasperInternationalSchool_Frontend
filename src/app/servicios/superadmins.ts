import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { URL_API } from '../configuracion';

/** Forma de cada fila que devuelve el backend (RespuestaUsuario). No incluye contraseña */
export interface UsuarioResumen {
  idUsuario: number;
  cui: string;
  nombre: string;
  correo: string;
  telefono: string;
  direccion: string;
  estado: string;
}

/** Datos del formulario de creacion (coincide con SolicitudCrearUsuario del backend). */
export interface SolicitudCrearUsuario {
  cui: string;
  nombre: string;
  correo: string;
  telefono: string;
  direccion: string;
  contrasena: string;
}

/** Datos editables de un usuario (coincide con SolicitudEditarUsuario del backend) */
export interface SolicitudEditarUsuario {
  nombre: string;
  telefono: string;
  direccion: string;
}

/** Consultas de SuperAdmin al backend (parte de CU010). */
@Injectable({ providedIn: 'root' })
export class Superadmins {
  private readonly http = inject(HttpClient);

  listar(pagina: number, tamano: number, busqueda: string): Observable<UsuarioResumen[]> {
    //HttpParams para no concatenar a mano
    let params = new HttpParams().set('pagina', pagina).set('tamano', tamano);
    if (busqueda) {
      params = params.set('busqueda', busqueda);
    }
    //Aqui no se agrega el token: lo pega el interceptor
    return this.http.get<UsuarioResumen[]>(`${URL_API}/superadmins`, { params });
  }

  crear(datos: SolicitudCrearUsuario): Observable<UsuarioResumen> {
    return this.http.post<UsuarioResumen>(`${URL_API}/superadmins`, datos);
  }

  activar(id: number): Observable<void> {
    return this.http.put<void>(`${URL_API}/superadmins/${id}/activar`, null);
  }

  desactivar(id: number): Observable<void> {
    return this.http.put<void>(`${URL_API}/superadmins/${id}/desactivar`, null);
  }

  editar(id: number, datos: SolicitudEditarUsuario): Observable<void> {
    return this.http.put<void>(`${URL_API}/superadmins/${id}`, datos);
  }
}
