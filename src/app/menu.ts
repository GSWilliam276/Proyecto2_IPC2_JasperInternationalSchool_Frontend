/** Una opcion del menu lateral y de las tarjetas de la pantalla de inicio*/
export interface OpcionMenu {
  ruta: string;
  etiqueta: string;
  icono: string; //Bootstrap Icons
}

/** Lo que usa el Admin. El SuperAdmin tambien, por herencia */
const OPCIONES_ADMIN: OpcionMenu[] = [
  { ruta: '/empleados', etiqueta: 'Empleados', icono: 'people' },
];

const OPCIONES_EXCLUSIVAS_SUPERADMIN: OpcionMenu[] = [
  { ruta: '/superadmin', etiqueta: 'Super administradores', icono: 'shield-lock' },
  { ruta: '/admins', etiqueta: 'Administradores', icono: 'person-badge' },
  { ruta: '/anios-lectivos', etiqueta: 'Años lectivos', icono: 'calendar-event' },
  { ruta: '/grados', etiqueta: 'Grados', icono: 'mortarboard' },
  { ruta: '/carreras', etiqueta: 'Carreras', icono: 'journal-bookmark' },
  { ruta: '/cursos', etiqueta: 'Cursos', icono: 'book' },
];

export function opcionesPorRol(rol: string | undefined): OpcionMenu[] {
  switch (rol) {
    case 'SUPERADMIN':
      return [...OPCIONES_EXCLUSIVAS_SUPERADMIN, ...OPCIONES_ADMIN];
    case 'ADMIN':
      return OPCIONES_ADMIN;
    default:
      return [];
  }
}
