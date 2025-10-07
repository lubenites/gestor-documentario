
// FIX: Imported missing Permiso type
import { Area, Permiso } from './types';

export const TODAS_LAS_AREAS: Area[] = [
    Area.VENTAS,
    Area.COMPRAS,
    Area.FACTURACION,
    Area.OPERACIONES,
    Area.ADMIN,
];

export const ETAPAS_FLUJO: Area[] = [
    Area.VENTAS,
    Area.COMPRAS,
    Area.FACTURACION,
    Area.OPERACIONES,
];

// FIX: Added missing TODOS_LOS_PERMISOS constant
export const TODOS_LOS_PERMISOS: Permiso[] = [
    Permiso.VER,
    Permiso.EDITAR,
    Permiso.CREAR,
    Permiso.ELIMINAR,
];
