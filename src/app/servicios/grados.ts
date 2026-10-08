import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { URL_API } from '../configuracion';

/** Forma de cada fila que devuelve el backend */
export interface GradoResumen {
  idGrado: number;
  nombre: string;
  nivel: string;
  estado: string;
}

/** Datos del formulario (coincide con SolicitudGrado del backend) */
export interface SolicitudGrado {
  nombre: string;
  nivel: string;
}

/** Consultas de grado al backend (CU014 a CU018) */
@Injectable({ providedIn: 'root' })
export class Grados {
  private readonly http = inject(HttpClient);
  private readonly url = `${URL_API}/grados`;

  listar(pagina: number, tamano: number, busqueda: string): Observable<GradoResumen[]> {
    let params = new HttpParams().set('pagina', pagina).set('tamano', tamano);
    if (busqueda) {
      params = params.set('busqueda', busqueda);
    }
    return this.http.get<GradoResumen[]>(this.url, { params });
  }

  crear(datos: SolicitudGrado): Observable<void> {
    return this.http.post<void>(this.url, datos);
  }

  editar(id: number, datos: SolicitudGrado): Observable<void> {
    return this.http.put<void>(`${this.url}/${id}`, datos);
  }

  activar(id: number): Observable<void> {
    return this.http.put<void>(`${this.url}/${id}/activar`, null);
  }

  desactivar(id: number): Observable<void> {
    return this.http.put<void>(`${this.url}/${id}/desactivar`, null);
  }
}
