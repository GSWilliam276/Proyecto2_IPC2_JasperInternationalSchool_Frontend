import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { URL_API } from '../configuracion';

export interface LibroResumen {
  idLibro: number;
  titulo: string;
  autor: string;
  editorial: string;
  ejemplaresTotales: number;
  ejemplaresDisponibles: number;
  ejemplaresPrestados: number;
  estado: string;
  tieneImagen: boolean;
}

export interface SolicitudLibro {
  titulo: string;
  autor: string;
  editorial: string;
  ejemplares: number;
}

/** Consultas de libros al backend */
@Injectable({ providedIn: 'root' })
export class Libros {
  private readonly http = inject(HttpClient);
  private readonly url = `${URL_API}/libros`;

  listar(pagina: number, tamano: number, busqueda: string): Observable<LibroResumen[]> {
    let params = new HttpParams().set('pagina', pagina).set('tamano', tamano);
    if (busqueda) {
      params = params.set('busqueda', busqueda);
    }
    return this.http.get<LibroResumen[]>(this.url, { params });
  }

  registrar(datos: SolicitudLibro): Observable<LibroResumen> {
    return this.http.post<LibroResumen>(this.url, datos);
  }

  editar(id: number, datos: SolicitudLibro): Observable<void> {
    return this.http.put<void>(`${this.url}/${id}`, datos);
  }

  activar(id: number): Observable<void> {
    return this.http.put<void>(`${this.url}/${id}/activar`, null);
  }

  desactivar(id: number): Observable<void> {
    return this.http.put<void>(`${this.url}/${id}/desactivar`, null);
  }

  subirImagen(id: number, archivo: File): Observable<void> {
    const datos = new FormData();
    datos.append('archivo', archivo);
    return this.http.post<void>(`${this.url}/${id}/imagen`, datos);
  }

  /** La imagen se pide con el token (un <img> no lo manda) y se muestra como URL temporal */
  imagen(id: number): Observable<Blob> {
    return this.http.get(`${this.url}/${id}/imagen`, { responseType: 'blob' });
  }
}
