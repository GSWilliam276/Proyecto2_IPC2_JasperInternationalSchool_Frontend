import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { URL_API } from '../configuracion';
import { CursoResumen } from './cursos';

export interface AsignacionResumen {
  idAsignacion: number;
  idSeccion: number;
  seccionNombre: string;
  idGrado: number;
  gradoNombre: string;
  nivel: string;
  idCarrera: number | null;
  carreraNombre: string | null;
  idAnioLectivo: number;
  anioNombre: string;
  anioEstado: string;
  idCurso: number;
  cursoNombre: string;
  idMaestro: number;
  maestroNombre: string;
}

export interface MaestroResumen {
  idUsuario: number;
  cui: string;
  nombre: string;
}

export interface SolicitudAsignacion {
  idSeccion: number;
  idCurso: number;
  idMaestro: number;
}

/** Consultas de asignaciones de maestros al backend */
@Injectable({ providedIn: 'root' })
export class Asignaciones {
  private readonly http = inject(HttpClient);
  private readonly url = `${URL_API}/asignaciones`;

  /** todos = false muestra solo las del año lectivo activo; true incluye las de años anteriores */
  listar(
    pagina: number,
    tamano: number,
    idMaestro: number | null,
    idGrado: number | null,
    idSeccion: number | null,
    todos: boolean,
  ): Observable<AsignacionResumen[]> {
    let params = new HttpParams().set('pagina', pagina).set('tamano', tamano).set('todos', todos);
    if (idMaestro !== null) {
      params = params.set('idMaestro', idMaestro);
    }
    if (idGrado !== null) {
      params = params.set('idGrado', idGrado);
    }
    if (idSeccion !== null) {
      params = params.set('idSeccion', idSeccion);
    }
    return this.http.get<AsignacionResumen[]>(this.url, { params });
  }

  /** Maestros con cuenta activa, para elegir a quien asignar */
  maestros(): Observable<MaestroResumen[]> {
    return this.http.get<MaestroResumen[]>(`${this.url}/maestros`);
  }

  /** Cursos del curriculo de la seccion que todavia no tienen maestro */
  cursosSinMaestro(idSeccion: number): Observable<CursoResumen[]> {
    return this.http.get<CursoResumen[]>(`${this.url}/secciones/${idSeccion}/cursos-sin-maestro`);
  }

  asignar(datos: SolicitudAsignacion): Observable<AsignacionResumen> {
    return this.http.post<AsignacionResumen>(this.url, datos);
  }

  quitar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}
