import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { opcionesPorRol } from '../../menu';
import { Autenticacion } from '../../servicios/autenticacion';

/** Pantalla de inicio: saludo y una tarjeta por cada modulo que el rol puede usar */
@Component({
  selector: 'app-inicio',
  imports: [RouterLink],
  templateUrl: './inicio.html',
})
export class Inicio {
  private readonly autenticacion = inject(Autenticacion);

  protected readonly sesion = this.autenticacion.obtenerSesion();
  protected readonly opciones = opcionesPorRol(this.sesion?.rol);
  protected readonly saludo = this.calcularSaludo();
  protected readonly fecha = new Date().toLocaleDateString('es-GT', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  /** El saludo depende de la hora del dia */
  private calcularSaludo(): string {
    const hora = new Date().getHours();
    if (hora < 12) {
      return 'Buenos días';
    }
    return hora < 19 ? 'Buenas tardes' : 'Buenas noches';
  }
}
