/** Una opcion del menu lateral y de las tarjetas de la pantalla de inicio */
export interface OpcionMenu {
  ruta: string;
  etiqueta: string;
  descripcion: string;
}

/** Opciones que le corresponden a cada rol. Se ira completando con los demas roles */
export function opcionesPorRol(rol: string | undefined): OpcionMenu[] {
  switch (rol) {
    case 'SUPERADMIN':
      return [
        { ruta: '/superadmin', etiqueta: 'Super administradores', descripcion: 'Usuarios con acceso total al sistema.' },
        { ruta: '/admins', etiqueta: 'Administradores', descripcion: 'Personal que gestiona el día a día del colegio.' },
        { ruta: '/anios-lectivos', etiqueta: 'Años lectivos', descripcion: 'Ciclos escolares: crear, editar y cerrar.' },
        { ruta: '/grados', etiqueta: 'Grados', descripcion: 'Grados del colegio, agrupados por nivel.' },
        { ruta: '/carreras', etiqueta: 'Carreras', descripcion: 'Carreras del nivel diversificado.' },
      ];
    default:
      return [];
  }
}
