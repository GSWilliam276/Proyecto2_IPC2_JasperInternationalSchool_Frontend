import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { URL_API } from '../configuracion';

export interface CursoResumen {
  idCurso: number;
  nombre: string;
  descripcion: string | null;
  estado: string;
}

export interface SolicitudCurso {
  nombre: string;
  descripcion: string;
}

/** Consultas de cursos al backend*/
@Injectable({ providedIn: 'root' })
export class Cursos {
  private readonly http = inject(HttpClient);
  private readonly url = `${URL_API}/cursos`;

  listar(pagina: number, tamano: number, busqueda: string): Observable<CursoResumen[]> {
    let params = new HttpParams().set('pagina', pagina).set('tamano', tamano);
    if (busqueda) {
      params = params.set('busqueda', busqueda);
    }
    return this.http.get<CursoResumen[]>(this.url, { params });
  }

  crear(datos: SolicitudCurso): Observable<CursoResumen> {
    return this.http.post<CursoResumen>(this.url, datos);
  }

  editar(id: number, datos: SolicitudCurso): Observable<void> {
    return this.http.put<void>(`${this.url}/${id}`, datos);
  }

  activar(id: number): Observable<void> {
    return this.http.put<void>(`${this.url}/${id}/activar`, null);
  }

  desactivar(id: number): Observable<void> {
    return this.http.put<void>(`${this.url}/${id}/desactivar`, null);
  }
}
