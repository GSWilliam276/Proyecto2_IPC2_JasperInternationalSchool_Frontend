/** Una opcion del menu lateral y de las tarjetas de la pantalla de inicio*/
export interface OpcionMenu {
  ruta: string;
  etiqueta: string;
  icono: string; //Bootstrap Icons
}

/** Un grupo de opciones con su titulo: asi el menu y el inicio no son una lista larga y plana */
export interface GrupoMenu {
  titulo: string;
  opciones: OpcionMenu[];
}

//Opciones, definidas una sola vez 

const SUPERADMINS: OpcionMenu = { ruta: '/superadmin', etiqueta: 'Super administradores', icono: 'shield-lock' };
const ADMINS: OpcionMenu = { ruta: '/admins', etiqueta: 'Administradores', icono: 'person-badge' };
const ANIOS: OpcionMenu = { ruta: '/anios-lectivos', etiqueta: 'Años lectivos', icono: 'calendar-event' };
const GRADOS: OpcionMenu = { ruta: '/grados', etiqueta: 'Grados', icono: 'mortarboard' };
const CARRERAS: OpcionMenu = { ruta: '/carreras', etiqueta: 'Carreras', icono: 'journal-bookmark' };
const EMPLEADOS: OpcionMenu = { ruta: '/empleados', etiqueta: 'Empleados', icono: 'people' };
const CURSOS: OpcionMenu = { ruta: '/cursos', etiqueta: 'Cursos', icono: 'book' };
const CURRICULOS: OpcionMenu = { ruta: '/curriculos', etiqueta: 'Currículos', icono: 'diagram-3' };
const SECCIONES: OpcionMenu = { ruta: '/secciones', etiqueta: 'Secciones', icono: 'grid-3x3-gap' };
const ASIGNACIONES: OpcionMenu = { ruta: '/asignaciones', etiqueta: 'Asignaciones', icono: 'person-workspace' };
const ESTUDIANTES: OpcionMenu = { ruta: '/estudiantes', etiqueta: 'Estudiantes', icono: 'person-lines-fill' };
const TARIFAS: OpcionMenu = { ruta: '/tarifas', etiqueta: 'Tarifas', icono: 'cash-coin' };
const ACTIVIDADES: OpcionMenu = { ruta: '/actividades', etiqueta: 'Actividades', icono: 'trophy' };
const PARAMETROS: OpcionMenu = { ruta: '/parametros-biblioteca', etiqueta: 'Parámetros de biblioteca', icono: 'gear' };
const INSCRIPCIONES: OpcionMenu = { ruta: '/inscripciones', etiqueta: 'Inscripciones', icono: 'clipboard-check' };
const PAGOS: OpcionMenu = { ruta: '/pagos', etiqueta: 'Pagos', icono: 'receipt' };
const SOLVENCIAS: OpcionMenu = { ruta: '/solvencias', etiqueta: 'Solvencias', icono: 'patch-check' };
const LIBROS: OpcionMenu = { ruta: '/libros', etiqueta: 'Libros', icono: 'book-half' };
const PRESTAMOS: OpcionMenu = { ruta: '/prestamos', etiqueta: 'Préstamos', icono: 'arrow-left-right' };
const MULTAS: OpcionMenu = { ruta: '/multas', etiqueta: 'Multas', icono: 'exclamation-diamond' };

//Grupos que comparten Admin y SuperAdmin

const ACADEMICO: GrupoMenu = {
  titulo: 'Académico',
  opciones: [CURSOS, CURRICULOS, SECCIONES, ASIGNACIONES, ESTUDIANTES],
};
const FINANZAS: GrupoMenu = { titulo: 'Finanzas', opciones: [TARIFAS, ACTIVIDADES] };
const BIBLIOTECA: GrupoMenu = { titulo: 'Biblioteca', opciones: [PARAMETROS] };

/** Grupos del menu para cada rol. El SuperAdmin ve lo del Admin y, ademas, lo suyo */
export function gruposPorRol(rol: string | undefined): GrupoMenu[] {
  switch (rol) {
    case 'SUPERADMIN':
      return [
        { titulo: 'Configuración global', opciones: [ANIOS, GRADOS, CARRERAS] },
        { titulo: 'Personal', opciones: [SUPERADMINS, ADMINS, EMPLEADOS] },
        ACADEMICO,
        FINANZAS,
        BIBLIOTECA,
      ];
    case 'ADMIN':
      return [{ titulo: 'Personal', opciones: [EMPLEADOS] }, ACADEMICO, FINANZAS, BIBLIOTECA];
    case 'SECRETARIA':
      return [
        { titulo: 'Secretaría', opciones: [INSCRIPCIONES, PAGOS, SOLVENCIAS] },
        { titulo: 'Biblioteca', opciones: [MULTAS] },
      ];
    case 'BIBLIOTECARIO':
      return [{ titulo: 'Biblioteca', opciones: [LIBROS, PRESTAMOS, MULTAS] }];
    default:
      return [];
  }
}

/** Lista plana de opciones, para quien no necesite los grupos */
export function opcionesPorRol(rol: string | undefined): OpcionMenu[] {
  return gruposPorRol(rol).flatMap((g) => g.opciones);
}
