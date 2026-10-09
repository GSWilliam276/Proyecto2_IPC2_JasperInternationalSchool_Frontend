import { Routes } from '@angular/router';
import { Login } from './paginas/login/login';
import { SinAcceso } from './paginas/sin-acceso/sin-acceso';
import { Marco } from './layout/marco/marco'; //el marco con menu lateral, barra superior y pie
import { ListaSuperadmins } from './paginas/lista-superadmins/lista-superadmins'; //la tabla pasa a ser una pantalla del marco
import { sesionGuard } from './guards/sesion-guard';
import { rolGuard } from './guards/rol-guard';
import { Bienvenida } from './paginas/bienvenida/bienvenida';
import { ListaAdmins } from './paginas/lista-admins/lista-admins';
import { ListaAniosLectivos } from './paginas/lista-anios-lectivos/lista-anios-lectivos';
import { ListaGrados } from './paginas/lista-grados/lista-grados';
import { ListaCarreras } from './paginas/lista-carreras/lista-carreras';
import { Inicio } from './paginas/inicio/inicio';

/**
 * Cada ruta asocia una direccion del navegador con una pantalla.
 */
export const routes: Routes = [
  { path: 'login', component: Login },
  { path: 'sin-acceso', component: SinAcceso },
  { path: '', component: Bienvenida, pathMatch: 'full' },
  {
    //El marco envuelve todas las pantallas que requieren sesion
    //Se pone el guard de sesion una sola vez aqui, y cubre a todas las hijas
    path: '',
    component: Marco,
    canActivate: [sesionGuard],
    children: [
      { path: 'inicio', component: Inicio },
      {
        path: 'superadmin',
        component: ListaSuperadmins,
        //El guard de sesion ya se reviso en el marco; aqui solo se revisa el rol
        canActivate: [rolGuard],
        data: { roles: ['SUPERADMIN'] },
      }, 
      {
        path: 'admins',
        component: ListaAdmins,
        canActivate: [rolGuard],
        data: { roles: ['SUPERADMIN'] },
      },
      {
        path: 'anios-lectivos',
        component: ListaAniosLectivos,
        canActivate: [rolGuard],
        data: { roles: ['SUPERADMIN'] },
      },
      {
        path: 'grados',
        component: ListaGrados,
        canActivate: [rolGuard],
        data: { roles: ['SUPERADMIN'] },
      },
      {
        path: 'carreras',
        component: ListaCarreras,
        canActivate: [rolGuard],
        data: { roles: ['SUPERADMIN'] },
      },
    ],
  },
  //Cualquier direccion que no exista se manda al login
  { path: '**', redirectTo: 'login' },
];
