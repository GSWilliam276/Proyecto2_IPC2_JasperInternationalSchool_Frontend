import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { URL_API } from '../configuracion';

export interface MultaResumen {
  idMulta: number;
  idPrestamo: number;
  libroTitulo: string;
  idEstudiante: number;
  estudianteNombre: string;
  diasAtraso: number;
  monto: number;
  estado: string;
  fechaGeneracion: string;
  idPago: number | null;
}

/** Consultas de multas al backend */
@Injectable({ providedIn: 'root' })
export class Multas {
  private readonly http = inject(HttpClient);
  private readonly url = `${URL_API}/multas`;

  /** estado vacio = todas; PENDIENTE o PAGADA */
  listar(pagina: number, tamano: number, estado: string): Observable<MultaResumen[]> {
    let params = new HttpParams().set('pagina', pagina).set('tamano', tamano);
    if (estado) {
      params = params.set('estado', estado);
    }
    return this.http.get<MultaResumen[]>(this.url, { params });
  }
}
