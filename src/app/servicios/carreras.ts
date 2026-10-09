import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { URL_API } from '../configuracion';

/** Forma de cada fila que devuelve el backend */
export interface CarreraResumen {
  idCarrera: number;
  nombre: string;
  estado: string;
}

/** Datos del formulario (coincide con SolicitudCarrera del backend) */
export interface SolicitudCarrera {
  nombre: string;
}

/** Consultas de carrera al backend (CU019 a CU023) */
@Injectable({ providedIn: 'root' })
export class Carreras {
  private readonly http = inject(HttpClient);
  private readonly url = `${URL_API}/carreras`;

  listar(pagina: number, tamano: number, busqueda: string): Observable<CarreraResumen[]> {
    let params = new HttpParams().set('pagina', pagina).set('tamano', tamano);
    if (busqueda) {
      params = params.set('busqueda', busqueda);
    }
    return this.http.get<CarreraResumen[]>(this.url, { params });
  }

  crear(datos: SolicitudCarrera): Observable<void> {
    return this.http.post<void>(this.url, datos);
  }

  editar(id: number, datos: SolicitudCarrera): Observable<void> {
    return this.http.put<void>(`${this.url}/${id}`, datos);
  }

  activar(id: number): Observable<void> {
    return this.http.put<void>(`${this.url}/${id}/activar`, null);
  }

  desactivar(id: number): Observable<void> {
    return this.http.put<void>(`${this.url}/${id}/desactivar`, null);
  }
}
