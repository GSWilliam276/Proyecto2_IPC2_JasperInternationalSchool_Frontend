import { Routes } from '@angular/router';
import { Login } from './paginas/login/login';
import { SinAcceso } from './paginas/sin-acceso/sin-acceso';
import { Marco } from './layout/marco/marco'; //el marco con menu lateral, barra superior y pie
import { ListaSuperadmins } from './paginas/lista-superadmins/lista-superadmins'; //NUEVO: la tabla pasa a ser una pantalla del marco
import { sesionGuard } from './guards/sesion-guard';
import { rolGuard } from './guards/rol-guard';


/**
 * Cada ruta asocia una direccion del navegador con una pantalla.
 */
export const routes: Routes = [
  { path: 'login', component: Login },
  { path: 'sin-acceso', component: SinAcceso },
  {
    //El marco envuelve todas las pantallas que requieren sesion
    //Se pone el guard de sesion una sola vez aqui, y cubre a todas las hijas
    path: '',
    component: Marco,
    canActivate: [sesionGuard],
    children: [
      {
        path: 'superadmin',
        component: ListaSuperadmins,
        //El guard de sesion ya se reviso en el marco; aqui solo se revisa el rol
        canActivate: [rolGuard],
        data: { roles: ['SUPERADMIN'] },
      },
    ],
  },
  //Cualquier direccion que no exista se manda al login
  //(reemplaza la redireccion anterior
  { path: '**', redirectTo: 'login' },
];
