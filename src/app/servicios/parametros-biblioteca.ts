import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { URL_API } from '../configuracion';

export interface ParametrosActuales {
  diasPrestamo: number;
  multaPorDia: number;
}

/** Consultas de los parametros de biblioteca al backend */
@Injectable({ providedIn: 'root' })
export class Parametros {
  private readonly http = inject(HttpClient);
  private readonly url = `${URL_API}/parametros-biblioteca`;

  consultar(): Observable<ParametrosActuales> {
    return this.http.get<ParametrosActuales>(this.url);
  }

  editar(datos: ParametrosActuales): Observable<ParametrosActuales> {
    return this.http.put<ParametrosActuales>(this.url, datos);
  }
}
