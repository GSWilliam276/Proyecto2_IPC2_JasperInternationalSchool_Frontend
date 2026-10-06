import { Routes } from '@angular/router';
import { Login } from './paginas/login/login';

/**
 * Cada ruta asocia una direccion del navegador con una pantalla.
 */
export const routes: Routes = [
  { path: 'login', component: Login },
  //Si alguien entra a la raiz (localhost:4200), se manda al login
  { path: '', redirectTo: 'login', pathMatch: 'full' },
];
