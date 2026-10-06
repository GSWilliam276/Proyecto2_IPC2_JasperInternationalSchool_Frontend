import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { interceptorSesion } from './interceptores/interceptor-sesion-interceptor';

/**
 * Configuracion global de la aplicacion.
 * Lista providers que Angular prepara al arrancar.
 */
export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(), //Activa el sistema de rutas
    provideRouter(routes),
    //Registra el interceptor para que actue en todas las peticiones
    provideHttpClient(withInterceptors([interceptorSesion])),//Permite hacer peticiones HTTP al backend
  ],
};
