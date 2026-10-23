import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { URL_API } from '../configuracion';
import { AsignacionResumen } from './asignaciones';

export interface AlumnoResumen {
  idEstudiante: number;
  nombre: string;
  cui: string;
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
}
