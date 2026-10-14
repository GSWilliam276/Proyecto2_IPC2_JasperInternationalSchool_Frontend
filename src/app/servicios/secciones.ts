import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { URL_API } from '../configuracion';

export interface SeccionResumen {
  idSeccion: number;
  nombre: string;
  idGrado: number;
  gradoNombre: string;
  nivel: string;
  idCarrera: number | null;
  carreraNombre: string | null;
  idAnioLectivo: number;
  anioNombre: string;
  anioEstado: string;
  cupoMaximo: number;
  inscritos: number;
  estado: string;
}

export interface SolicitudSeccion {
  nombre: string;
  idGrado: number;
  idCarrera: number | null;
  cupoMaximo: number;
}

export interface SolicitudEditarSeccion {
  nombre: string;
  cupoMaximo: number;
}

/** Consultas de secciones al backend */
@Injectable({ providedIn: 'root' })
export class Secciones {
  private readonly http = inject(HttpClient);
  private readonly url = `${URL_API}/secciones`;

  /** todos = false muestra solo las del año lectivo activo; true incluye las de años anteriores */
  listar(pagina: number, tamano: number, busqueda: string, idGrado: number | null, todos: boolean): Observable<SeccionResumen[]> {
    let params = new HttpParams().set('pagina', pagina).set('tamano', tamano).set('todos', todos);
    if (busqueda) {
      params = params.set('busqueda', busqueda);
    }
    if (idGrado !== null) {
      params = params.set('idGrado', idGrado);
    }
    return this.http.get<SeccionResumen[]>(this.url, { params });
  }

  crear(datos: SolicitudSeccion): Observable<SeccionResumen> {
    return this.http.post<SeccionResumen>(this.url, datos);
  }

  editar(id: number, datos: SolicitudEditarSeccion): Observable<void> {
    return this.http.put<void>(`${this.url}/${id}`, datos);
  }

  activar(id: number): Observable<void> {
    return this.http.put<void>(`${this.url}/${id}/activar`, null);
  }

  desactivar(id: number): Observable<void> {
    return this.http.put<void>(`${this.url}/${id}/desactivar`, null);
  }
}
