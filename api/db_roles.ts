import { Rol, Permiso } from '../types';

// Simulación de la base de datos para el servicio de Roles
export let rolesDB: Rol[] = [
  { id: 1, nombre: 'Administrador', permisos: [Permiso.VER, Permiso.EDITAR, Permiso.CREAR, Permiso.ELIMINAR] },
  { id: 2, nombre: 'Supervisor', permisos: [Permiso.VER, Permiso.EDITAR] },
  { id: 3, nombre: 'Asistente', permisos: [Permiso.VER] },
];
