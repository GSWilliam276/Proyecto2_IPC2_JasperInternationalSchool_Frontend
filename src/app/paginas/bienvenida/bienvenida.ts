import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { COLEGIO } from '../../colegio';

/** Pantalla publica de entrada: presenta al colegio y lleva al inicio de sesion. */
@Component({
  selector: 'app-bienvenida',
  imports: [RouterLink],
  templateUrl: './bienvenida.html',
})
export class Bienvenida {
  protected readonly colegio = COLEGIO;
  protected readonly anio = new Date().getFullYear();
}
