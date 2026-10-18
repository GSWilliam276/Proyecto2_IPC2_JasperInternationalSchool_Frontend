import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { URL_API } from '../configuracion';

export interface SaldoResumen {
  idEstudiante: number;
  anioNombre: string;
  solvente: boolean;
  saldo: number;
  inscripcionPendiente: boolean;
  mesesPendientes: number[];
}

export interface SolvenciaResumen {
  idSolvencia: number;
  idEstudiante: number;
  estudianteNombre: string;
  anioNombre: string;
  secretariaNombre: string;
  fechaEmision: string;
  yaExistia: boolean;
}

/** Consultas de saldo y solvencias al backend. */
@Injectable({ providedIn: 'root' })
export class Solvencias {
  private readonly http = inject(HttpClient);
  private readonly url = `${URL_API}/solvencias`;

  saldo(idEstudiante: number): Observable<SaldoResumen> {
    return this.http.get<SaldoResumen>(`${this.url}/saldo/${idEstudiante}`);
  }

  emitir(idEstudiante: number): Observable<SolvenciaResumen> {
    return this.http.post<SolvenciaResumen>(this.url, { idEstudiante });
  }

  listar(pagina: number, tamano: number, idEstudiante: number | null): Observable<SolvenciaResumen[]> {
    let params = new HttpParams().set('pagina', pagina).set('tamano', tamano);
    if (idEstudiante !== null) {
      params = params.set('idEstudiante', idEstudiante);
    }
    return this.http.get<SolvenciaResumen[]>(this.url, { params });
  }
}
