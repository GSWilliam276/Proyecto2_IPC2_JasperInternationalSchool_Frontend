import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';

/**
 * Configuracion global de la aplicacion.
 * Lista providers que Angular prepara al arrancar.
 */
export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes), //Activa el sistema de rutas
    provideHttpClient(), //Permite hacer peticiones HTTP al backend
  ],
};
