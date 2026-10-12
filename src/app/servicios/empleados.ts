import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { URL_API } from '../configuracion';

export interface EmpleadoResumen {
  idEmpleado: number;
  cui: string;
  nombre: string;
  telefono: string;
  direccion: string;
  puesto: string;
  fechaContratacion: string;
  salario: number;
  estado: string;
  idUsuario: number | null; //null = sin cuenta de acceso
}

/** correo y contrasena solo viajan para los puestos con cuenta propia */
export interface SolicitudCrearEmpleado {
  cui: string;
  nombre: string;
  telefono: string;
  direccion: string;
  puesto: string;
  fechaContratacion: string;
  salario: number;
  correo?: string;
  contrasena?: string;
}

export interface SolicitudEditarEmpleado {
  nombre: string;
  telefono: string;
  direccion: string;
  fechaContratacion: string;
  salario: number;
}

/** Consultas de empleados al backend */
@Injectable({ providedIn: 'root' })
export class Empleados {
  private readonly http = inject(HttpClient);
  private readonly url = `${URL_API}/empleados`;

  listar(pagina: number, tamano: number, busqueda: string): Observable<EmpleadoResumen[]> {
    let params = new HttpParams().set('pagina', pagina).set('tamano', tamano);
    if (busqueda) {
      params = params.set('busqueda', busqueda);
    }
    return this.http.get<EmpleadoResumen[]>(this.url, { params });
  }

  crear(datos: SolicitudCrearEmpleado): Observable<EmpleadoResumen> {
    return this.http.post<EmpleadoResumen>(this.url, datos);
  }

  editar(id: number, datos: SolicitudEditarEmpleado): Observable<void> {
    return this.http.put<void>(`${this.url}/${id}`, datos);
  }

  activar(id: number): Observable<void> {
    return this.http.put<void>(`${this.url}/${id}/activar`, null);
  }

  desactivar(id: number): Observable<void> {
    return this.http.put<void>(`${this.url}/${id}/desactivar`, null);
  }
}
