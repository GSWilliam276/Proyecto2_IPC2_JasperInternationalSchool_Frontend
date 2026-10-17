import { RouterLink } from '@angular/router';
import { opcionesPorRol } from '../../menu';
import { Autenticacion } from '../../servicios/autenticacion';
import { Component, OnInit, inject, signal } from '@angular/core';
import { AniosLectivos, AnioLectivoResumen } from '../../servicios/anios-lectivos';

/** Pantalla de inicio: saludo y una tarjeta por cada modulo que el rol puede usar */
@Component({
  selector: 'app-inicio',
  imports: [RouterLink],
  templateUrl: './inicio.html',
})
export class Inicio {
  private readonly autenticacion = inject(Autenticacion);
  private readonly anios = inject(AniosLectivos);
  protected readonly anioActivo = signal<AnioLectivoResumen | null>(null);
  protected readonly anioCargado = signal(false);

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

  ngOnInit(): void {
    this.anios.activo().subscribe({
      next: (anio) => {
        this.anioActivo.set(anio);
        this.anioCargado.set(true);
      },
      error: () => this.anioCargado.set(true), //Si falla, simplemente no se muestra la etiqueta
    });
  }
}
