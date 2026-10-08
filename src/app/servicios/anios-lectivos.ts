import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { URL_API } from '../configuracion';

/** Forma de cada fila que devuelve el backend. Las fechas llegan como "2026-01-15" */
export interface AnioLectivoResumen {
  idAnioLectivo: number;
  nombre: string;
  fechaInicio: string;
  fechaFin: string;
  estado: string;
}

/** Datos del formulario (coincide con SolicitudAnioLectivo del backend) */
export interface SolicitudAnioLectivo {
  nombre: string;
  fechaInicio: string;
  fechaFin: string;
}

/** Consultas de año lectivo al backend (CU011 a CU013) */
@Injectable({ providedIn: 'root' })
export class AniosLectivos {
  private readonly http = inject(HttpClient);
  private readonly url = `${URL_API}/anios-lectivos`;

  listar(pagina: number, tamano: number, busqueda: string): Observable<AnioLectivoResumen[]> {
    let params = new HttpParams().set('pagina', pagina).set('tamano', tamano);
    if (busqueda) {
      params = params.set('busqueda', busqueda);
    }
    return this.http.get<AnioLectivoResumen[]>(this.url, { params });
  }

  crear(datos: SolicitudAnioLectivo): Observable<void> {
    return this.http.post<void>(this.url, datos);
  }

  editar(id: number, datos: SolicitudAnioLectivo): Observable<void> {
    return this.http.put<void>(`${this.url}/${id}`, datos);
  }

  cerrar(id: number): Observable<void> {
    return this.http.put<void>(`${this.url}/${id}/cerrar`, null);
  }
}
