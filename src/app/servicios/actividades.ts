import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { URL_API } from '../configuracion';

export interface ActividadResumen {
  idActividad: number;
  nombre: string;
  descripcion: string | null;
  fecha: string;
  cupo: number;
  costo: number;
  gratuita: boolean;
  estado: string;
}

export interface SolicitudActividad {
  nombre: string;
  descripcion: string;
  fecha: string;
  cupo: number;
  costo: number;
}

/** Fecha de hoy en hora local, "AAAA-MM-DD". Se puede comparar como texto */
export function fechaDeHoy(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** "2030-05-20" -> "20/05/2030", para mostrar */
export function formatearFecha(fecha: string): string {
  const [anio, mes, dia] = fecha.split('-');
  return `${dia}/${mes}/${anio}`;
}

/** Consultas de actividades al backend */
@Injectable({ providedIn: 'root' })
export class Actividades {
  private readonly http = inject(HttpClient);
  private readonly url = `${URL_API}/actividades`;

  listar(pagina: number, tamano: number, busqueda: string, soloActivas: boolean): Observable<ActividadResumen[]> {
    let params = new HttpParams().set('pagina', pagina).set('tamano', tamano).set('soloActivas', soloActivas);
    if (busqueda) {
      params = params.set('busqueda', busqueda);
    }
    return this.http.get<ActividadResumen[]>(this.url, { params });
  }

  crear(datos: SolicitudActividad): Observable<ActividadResumen> {
    return this.http.post<ActividadResumen>(this.url, datos);
  }

  editar(id: number, datos: SolicitudActividad): Observable<void> {
    return this.http.put<void>(`${this.url}/${id}`, datos);
  }

  activar(id: number): Observable<void> {
    return this.http.put<void>(`${this.url}/${id}/activar`, null);
  }

  desactivar(id: number): Observable<void> {
    return this.http.put<void>(`${this.url}/${id}/desactivar`, null);
  }
}
