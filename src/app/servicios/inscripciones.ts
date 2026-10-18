import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { URL_API } from '../configuracion';

export interface InscripcionResumen {
  idInscripcion: number;
  idEstudiante: number;
  estudianteNombre: string;
  estudianteCui: string;
  idSeccion: number;
  seccionNombre: string;
  idGrado: number;
  gradoNombre: string;
  nivel: string;
  carreraNombre: string | null;
  idAnioLectivo: number;
  anioNombre: string;
  anioEstado: string;
  fecha: string;
  estado: string;
  contrasenaProvisional: string | null; //Solo al inscribir con acceso nuevo
}

export interface SolicitudInscripcion {
  idEstudiante: number;
  idSeccion: number;
  correo: string | null;
}

/** Consultas de inscripciones al backend */
@Injectable({ providedIn: 'root' })
export class Inscripciones {
  private readonly http = inject(HttpClient);
  private readonly url = `${URL_API}/inscripciones`;

  /** Sin idSeccion se listan las del año lectivo activo */
  listar(pagina: number, tamano: number, idSeccion: number | null): Observable<InscripcionResumen[]> {
    let params = new HttpParams().set('pagina', pagina).set('tamano', tamano);
    if (idSeccion !== null) {
      params = params.set('idSeccion', idSeccion);
    }
    return this.http.get<InscripcionResumen[]>(this.url, { params });
  }

  inscribir(datos: SolicitudInscripcion): Observable<InscripcionResumen> {
    return this.http.post<InscripcionResumen>(this.url, datos);
  }

  anular(id: number): Observable<void> {
    return this.http.put<void>(`${this.url}/${id}/anular`, null);
  }
}
