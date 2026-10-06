import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

/**
 * Componente raiz de la aplicacion.
 * Solo contiene el router-outlet, que es el lugar donde Angular
 * muestra la pantalla que corresponde a cada ruta.
 */
@Component({
  imports: [RouterOutlet],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {}
