import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { URL_API } from '../configuracion';
import { AsignacionResumen } from './asignaciones';

export interface AlumnoResumen {
  idEstudiante: number;
  nombre: string;
  cui: string;
}

export interface RegistroAsistencia {
  idEstudiante: number;
  estudianteNombre: string;
  cui: string;
  fecha: string;
  presente: boolean | null; //null = sin registro
}

export interface MarcaAsistencia {
  idEstudiante: number;
  presente: boolean;
}

/** Consultas del panel del Maestro: el backend solo devuelve lo suyo */
@Injectable({ providedIn: 'root' })
export class Maestro {
  private readonly http = inject(HttpClient);
  private readonly url = `${URL_API}/maestro`;

  asignaciones(): Observable<AsignacionResumen[]> {
    return this.http.get<AsignacionResumen[]>(`${this.url}/asignaciones`);
  }

  nomina(idAsignacion: number): Observable<AlumnoResumen[]> {
    return this.http.get<AlumnoResumen[]>(`${this.url}/asignaciones/${idAsignacion}/estudiantes`);
  }

    planilla(idAsignacion: number, fecha: string): Observable<RegistroAsistencia[]> {
    return this.http.get<RegistroAsistencia[]>(`${this.url}/asignaciones/${idAsignacion}/asistencia/${fecha}`);
  }

  registrarAsistencia(idAsignacion: number, fecha: string, marcas: MarcaAsistencia[]): Observable<void> {
    return this.http.post<void>(`${this.url}/asignaciones/${idAsignacion}/asistencia`, { fecha, marcas });
  }

  editarAsistencia(idAsignacion: number, fecha: string, marcas: MarcaAsistencia[]): Observable<void> {
    return this.http.put<void>(`${this.url}/asignaciones/${idAsignacion}/asistencia`, { fecha, marcas });
  }

  historialAsistencia(idAsignacion: number, idEstudiante: number | null, desde: string, hasta: string):
    Observable<RegistroAsistencia[]> {
    let params = new HttpParams();
    if (idEstudiante !== null) {
      params = params.set('idEstudiante', idEstudiante);
    }
    if (desde) {
      params = params.set('desde', desde);
    }
    if (hasta) {
      params = params.set('hasta', hasta);
    }
    return this.http.get<RegistroAsistencia[]>(`${this.url}/asignaciones/${idAsignacion}/asistencia`, { params });
  }
}
