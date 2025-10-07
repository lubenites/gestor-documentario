
export enum Cargo {
  SUPERVISOR = 'supervisor',
  ASISTENTE = 'asistente',
}

export enum EstadoEntrega {
  EN_ESPERA = 'En Espera',
  EN_RUTA = 'En Ruta',
  ENTREGADO = 'Entregado',
}

// FIX: Added missing Permiso enum
export enum Permiso {
  VER = 'ver',
  EDITAR = 'editar',
  CREAR = 'crear',
  ELIMINAR = 'eliminar',
}

// FIX: Added missing Rol interface
export interface Rol {
  id: number;
  nombre: string;
  permisos: Permiso[];
}

export interface Usuario {
  id: number;
  nombres: string;
  apellidos: string;
  email: string;
  area: Area;
  cargo?: Cargo;
  password?: string;
}

export interface RegistroAuditoria {
  timestamp: string; // ISO String
  usuarioId: number;
  area: Area;
  accion: string;
  nombreArchivo: string;
}

export interface Documento {
  id: number;
  oc: string;
  archivoPrincipal: File;
  fechaCreacion: string; // ISO String
  creadoPor: number; // usuarioId
  estado: EstadoDocumento;
  estadoEntrega?: EstadoEntrega;
  anexos: {
    [Area.COMPRAS]: File[];
    [Area.FACTURACION]: File[];
    [Area.OPERACIONES]: File[];
  };
  historial: RegistroAuditoria[];
}

export type Vista = 'registrar' | 'anexar' | 'usuarios' | 'seguimiento' | 'busqueda' | 'reportes' | 'auditoria';

export enum Area {
  VENTAS = 'ventas',
  COMPRAS = 'compras',
  FACTURACION = 'facturacion',
  OPERACIONES = 'operaciones',
  ADMIN = 'admin',
}

export enum EstadoDocumento {
  PENDIENTE_COMPRAS = 'Pendiente Compras',
  PENDIENTE_FACTURACION = 'Pendiente Facturación',
  PENDIENTE_OPERACIONES = 'Pendiente Operaciones',
  COMPLETADO = 'Completado',
}