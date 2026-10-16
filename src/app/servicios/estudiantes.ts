import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { URL_API } from '../configuracion';

export interface GraduacionResumen {
  nivel: string;
  fecha: string;
}

export interface EstudianteResumen {
  idUsuario: number;
  cui: string;
  nombre: string;
  correo: string | null; //null mientras no tenga acceso
  telefono: string;
  direccion: string;
  fechaNacimiento: string;
  edad: number;
  alergias: string | null;
  condicionesMedicas: string | null;
  encargadoNombre: string;
  encargadoTelefono: string;
  encargadoParentesco: string;
  encargado2Nombre: string | null;
  encargado2Telefono: string | null;
  encargado2Parentesco: string | null;
  estado: string;
  tieneAcceso: boolean;
  graduaciones: GraduacionResumen[] | null; //Solo viene en el expediente, no en el listado
}

/** Al editar, el cui y la fecha de nacimiento se mandan igual pero el backend los ignora: no cambian */
export interface SolicitudEstudiante {
  cui: string;
  nombre: string;
  telefono: string;
  direccion: string;
  fechaNacimiento: string;
  alergias: string;
  condicionesMedicas: string;
  encargadoNombre: string;
  encargadoTelefono: string;
  encargadoParentesco: string;
  encargado2Nombre: string;
  encargado2Telefono: string;
  encargado2Parentesco: string;
}

/** "GRADUADO" -> "Graduado", para mostrar */
export function etiquetaEstado(estado: string): string {
  return estado.charAt(0) + estado.slice(1).toLowerCase();
}

/** Consultas de estudiantes al backend */
@Injectable({ providedIn: 'root' })
export class Estudiantes {
  private readonly http = inject(HttpClient);
  private readonly url = `${URL_API}/estudiantes`;

  /** estado vacio = todos los estados*/
  listar(pagina: number, tamano: number, busqueda: string, estado: string): Observable<EstudianteResumen[]> {
    let params = new HttpParams().set('pagina', pagina).set('tamano', tamano);
    if (busqueda) {
      params = params.set('busqueda', busqueda);
    }
    if (estado) {
      params = params.set('estado', estado);
    }
    return this.http.get<EstudianteResumen[]>(this.url, { params });
  }

  /** El expediente completo, con el historial de graduaciones */
  consultar(id: number): Observable<EstudianteResumen> {
    return this.http.get<EstudianteResumen>(`${this.url}/${id}`);
  }

  registrar(datos: SolicitudEstudiante): Observable<EstudianteResumen> {
    return this.http.post<EstudianteResumen>(this.url, datos);
  }

  editar(id: number, datos: SolicitudEstudiante): Observable<void> {
    return this.http.put<void>(`${this.url}/${id}`, datos);
  }

  activar(id: number): Observable<void> {
    return this.http.put<void>(`${this.url}/${id}/activar`, null);
  }

  desactivar(id: number): Observable<void> {
    return this.http.put<void>(`${this.url}/${id}/desactivar`, null);
  }

  /** Egreso de Diversificado: cierra al estudiante */
  graduar(id: number): Observable<void> {
    return this.http.put<void>(`${this.url}/${id}/graduar`, null);
  }

  /** Registra que termino un nivel (pre-primaria, primaria o basico) sin cambiar su estado */
  registrarGraduacion(id: number, nivel: string, fecha: string): Observable<void> {
    return this.http.post<void>(`${this.url}/${id}/graduaciones`, { nivel, fecha });
  }
}
