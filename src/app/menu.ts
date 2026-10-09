/** Una opcion del menu lateral y de las tarjetas de la pantalla de inicio. */
export interface OpcionMenu {
  ruta: string;
  etiqueta: string;
  icono: string; //Bootstrap Icons
}

/** Opciones que le corresponden a cada rol. Se ira completando con los demas roles */
export function opcionesPorRol(rol: string | undefined): OpcionMenu[] {
  switch (rol) {
    case 'SUPERADMIN':
      return [
        { ruta: '/superadmin', etiqueta: 'Super administradores', icono: 'shield-lock' },
        { ruta: '/admins', etiqueta: 'Administradores', icono: 'person-badge' },
        { ruta: '/anios-lectivos', etiqueta: 'Años lectivos', icono: 'calendar-event' },
        { ruta: '/grados', etiqueta: 'Grados', icono: 'mortarboard' },
        { ruta: '/carreras', etiqueta: 'Carreras', icono: 'journal-bookmark' },
      ];
    default:
      return [];
  }
}
