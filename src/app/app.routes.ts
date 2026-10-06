import { Routes } from '@angular/router';
import { Login } from './paginas/login/login';
import { PanelSuperadmin } from './paginas/panel-superadmin/panel-superadmin';
import { SinAcceso } from './paginas/sin-acceso/sin-acceso';
import { sesionGuard } from './guards/sesion-guard';
import { rolGuard } from './guards/rol-guard';

/**
 * Cada ruta asocia una direccion del navegador con una pantalla.
 */
export const routes: Routes = [
  { path: 'login', component: Login },
  {
    path: 'superadmin',
    component: PanelSuperadmin,
    //Primero se revisa que haya sesion, y despues que el rol sea el correcto
    canActivate: [sesionGuard, rolGuard],
    data: { roles: ['SUPERADMIN'] },
  },
  { path: 'sin-acceso', component: SinAcceso },
  //Si alguien entra a la raiz (localhost:4200), se manda al login
  { path: '', redirectTo: 'login', pathMatch: 'full' },
];
