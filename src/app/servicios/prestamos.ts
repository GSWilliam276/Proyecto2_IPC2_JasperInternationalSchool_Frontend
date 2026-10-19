import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { URL_API } from '../configuracion';

export interface PrestamoResumen {
  idPrestamo: number;
  idLibro: number;
  libroTitulo: string;
  idPrestatario: number;
  prestatarioNombre: string;
  tipoPrestatario: string;
  bibliotecarioNombre: string;
  fechaPrestamo: string;
  fechaEsperada: string;
  fechaDevolucion: string | null;
  devuelto: boolean;
  enMora: boolean;
  diasAtraso: number;
  multaMonto: number | null;
  multaEstado: string | null;
}

export interface PrestatarioResumen {
  idUsuario: number;
  nombre: string;
  cui: string;
  tipo: string;
}

/** Consultas de prestamos al backend */
@Injectable({ providedIn: 'root' })
export class Prestamos {
  private readonly http = inject(HttpClient);
  private readonly url = `${URL_API}/prestamos`;

  /** estado vacio = todos; PRESTADO, DEVUELTO o EN_MORA */
  listar(pagina: number, tamano: number, estado: string, desde: string, hasta: string): Observable<PrestamoResumen[]> {
    let params = new HttpParams().set('pagina', pagina).set('tamano', tamano);
    if (estado) {
      params = params.set('estado', estado);
    }
    if (desde) {
      params = params.set('desde', desde);
    }
    if (hasta) {
      params = params.set('hasta', hasta);
    }
    return this.http.get<PrestamoResumen[]>(this.url, { params });
  }

  prestatarios(busqueda: string): Observable<PrestatarioResumen[]> {
    let params = new HttpParams();
    if (busqueda) {
      params = params.set('busqueda', busqueda);
    }
    return this.http.get<PrestatarioResumen[]>(`${this.url}/prestatarios`, { params });
  }

  prestar(idLibro: number, idPrestatario: number): Observable<PrestamoResumen> {
    return this.http.post<PrestamoResumen>(this.url, { idLibro, idPrestatario });
  }

  devolver(id: number): Observable<PrestamoResumen> {
    return this.http.put<PrestamoResumen>(`${this.url}/${id}/devolver`, null);
  }
}
