import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { URL_API } from '../configuracion';

export interface PagoResumen {
  idPago: number;
  idEstudiante: number;
  estudianteNombre: string;
  idAnioLectivo: number;
  anioNombre: string;
  concepto: string;
  monto: number;
  mes: number | null;
  actividadNombre: string | null;
  fecha: string;
  secretariaNombre: string;
  estado: string;
  motivoAnulacion: string | null;
}

export interface ComprobanteResumen {
  idComprobante: number;
  numero: string;
  fechaEmision: string;
  estado: string;
  pago: PagoResumen;
}

export const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto',
  'septiembre', 'octubre', 'noviembre', 'diciembre'];

/** "Mensualidad de marzo", "Inscripción", "Actividad: Excursión"... para mostrar */
export function descripcionPago(p: PagoResumen): string {
  switch (p.concepto) {
    case 'INSCRIPCION':
      return 'Inscripción';
    case 'MENSUALIDAD':
      return `Mensualidad de ${p.mes ? MESES[p.mes - 1] : ''}`;
    case 'ACTIVIDAD':
      return `Actividad: ${p.actividadNombre ?? ''}`;
    default:
      return 'Multa';
  }
}

/** Consultas de pagos al backend */
@Injectable({ providedIn: 'root' })
export class Pagos {
  private readonly http = inject(HttpClient);
  private readonly url = `${URL_API}/pagos`;

  listar(pagina: number, tamano: number, idEstudiante: number | null, concepto: string,
         desde: string, hasta: string): Observable<PagoResumen[]> {
    let params = new HttpParams().set('pagina', pagina).set('tamano', tamano);
    if (idEstudiante !== null) {
      params = params.set('idEstudiante', idEstudiante);
    }
    if (concepto) {
      params = params.set('concepto', concepto);
    }
    if (desde) {
      params = params.set('desde', desde);
    }
    if (hasta) {
      params = params.set('hasta', hasta);
    }
    return this.http.get<PagoResumen[]>(this.url, { params });
  }

  pagarInscripcion(idEstudiante: number): Observable<PagoResumen> {
    return this.http.post<PagoResumen>(`${this.url}/inscripcion`, { idEstudiante });
  }

  pagarMensualidad(idEstudiante: number, meses: number[]): Observable<PagoResumen[]> {
    return this.http.post<PagoResumen[]>(`${this.url}/mensualidad`, { idEstudiante, meses });
  }

    pagarActividad(idEstudiante: number, idActividad: number): Observable<PagoResumen> {
    return this.http.post<PagoResumen>(`${this.url}/actividad`, { idEstudiante, idActividad });
  }

  anular(id: number, motivo: string): Observable<void> {
    return this.http.put<void>(`${this.url}/${id}/anular`, { motivo });
  }

  emitirComprobante(id: number): Observable<ComprobanteResumen> {
    return this.http.post<ComprobanteResumen>(`${this.url}/${id}/comprobante`, null);
  }

  /** 404 si el pago todavia no tiene comprobante */
  consultarComprobante(id: number): Observable<ComprobanteResumen> {
    return this.http.get<ComprobanteResumen>(`${this.url}/${id}/comprobante`);
  }

  pagarMulta(idMulta: number): Observable<PagoResumen> {
    return this.http.post<PagoResumen>(`${this.url}/multa`, { idMulta });
  }
}
