import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { URL_API } from '../configuracion';
import { SolicitudCrearUsuario, SolicitudEditarUsuario, UsuarioResumen } from './superadmins';

/** Consultas de Admin al backend (CU005, CU008, CU009, CU010) */
@Injectable({ providedIn: 'root' })
export class Admins {
  private readonly http = inject(HttpClient);

  listar(pagina: number, tamano: number, busqueda: string): Observable<UsuarioResumen[]> {
    let params = new HttpParams().set('pagina', pagina).set('tamano', tamano);
    if (busqueda) {
      params = params.set('busqueda', busqueda);
    }
    return this.http.get<UsuarioResumen[]>(`${URL_API}/admins`, { params });
  }

  crear(datos: SolicitudCrearUsuario): Observable<UsuarioResumen> {
    return this.http.post<UsuarioResumen>(`${URL_API}/admins`, datos);
  }

  activar(id: number): Observable<void> {
    return this.http.put<void>(`${URL_API}/admins/${id}/activar`, null);
  }

  desactivar(id: number): Observable<void> {
    return this.http.put<void>(`${URL_API}/admins/${id}/desactivar`, null);
  }

  editar(id: number, datos: SolicitudEditarUsuario): Observable<void> {
    return this.http.put<void>(`${URL_API}/admins/${id}`, datos);
  }
}
