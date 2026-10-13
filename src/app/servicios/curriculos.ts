import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { URL_API } from '../configuracion';

export interface CursoDeCurriculo {
  idCurso: number;
  nombre: string;
  descripcion: string | null;
  estado: string;
}

/** En el listado "cursos" viene null: se pide al abrir el detalle */
export interface CurriculoResumen {
  idCurriculo: number;
  idGrado: number;
  gradoNombre: string;
  nivel: string;
  idCarrera: number | null;
  carreraNombre: string | null;
  cursos: CursoDeCurriculo[] | null;
}

export interface SolicitudCurriculo {
  idGrado: number;
  idCarrera: number | null;
}

/** "BASICO" -> "Básico", para mostrar */
export function etiquetaNivel(nivel: string): string {
  const etiquetas: Record<string, string> = {
    PRE_PRIMARIA: 'Pre-primaria',
    PRIMARIA: 'Primaria',
    BASICO: 'Básico',
    DIVERSIFICADO: 'Diversificado',
  };
  return etiquetas[nivel] ?? nivel;
}

/** Consultas de currículos al backend */
@Injectable({ providedIn: 'root' })
export class Curriculos {
  private readonly http = inject(HttpClient);
  private readonly url = `${URL_API}/curriculos`;

  listar(pagina: number, tamano: number, busqueda: string): Observable<CurriculoResumen[]> {
    let params = new HttpParams().set('pagina', pagina).set('tamano', tamano);
    if (busqueda) {
      params = params.set('busqueda', busqueda);
    }
    return this.http.get<CurriculoResumen[]>(this.url, { params });
  }

  consultar(id: number): Observable<CurriculoResumen> {
    return this.http.get<CurriculoResumen>(`${this.url}/${id}`);
  }

  crear(datos: SolicitudCurriculo): Observable<CurriculoResumen> {
    return this.http.post<CurriculoResumen>(this.url, datos);
  }

  agregarCurso(id: number, idCurso: number): Observable<void> {
    return this.http.post<void>(`${this.url}/${id}/cursos`, { idCurso });
  }

  quitarCurso(id: number, idCurso: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}/cursos/${idCurso}`);
  }
}
