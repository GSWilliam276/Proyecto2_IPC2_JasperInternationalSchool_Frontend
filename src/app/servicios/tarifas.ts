import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { URL_API } from '../configuracion';

export interface TarifaResumen {
  idTarifa: number;
  idGrado: number;
  gradoNombre: string;
  nivel: string;
  concepto: string;
  idAnioLectivo: number;
  anioNombre: string;
  anioEstado: string;
  monto: number;
}

export interface SolicitudTarifa {
  idGrado: number;
  concepto: string;
  monto: number;
}

/** "MENSUALIDAD" -> "Mensualidad", para mostrar */
export function etiquetaConcepto(concepto: string): string {
  return concepto === 'INSCRIPCION' ? 'Inscripción' : 'Mensualidad';
}

/** Consultas de tarifas al backend*/
@Injectable({ providedIn: 'root' })
export class Tarifas {
  private readonly http = inject(HttpClient);
  private readonly url = `${URL_API}/tarifas`;

  /** todos = false muestra solo las del año lectivo activo; true incluye las de años anteriores */
  listar(pagina: number, tamano: number, idGrado: number | null, todos: boolean): Observable<TarifaResumen[]> {
    let params = new HttpParams().set('pagina', pagina).set('tamano', tamano).set('todos', todos);
    if (idGrado !== null) {
      params = params.set('idGrado', idGrado);
    }
    return this.http.get<TarifaResumen[]>(this.url, { params });
  }

  crear(datos: SolicitudTarifa): Observable<TarifaResumen> {
    return this.http.post<TarifaResumen>(this.url, datos);
  }

  editar(id: number, monto: number): Observable<void> {
    return this.http.put<void>(`${this.url}/${id}`, { monto });
  }
}
