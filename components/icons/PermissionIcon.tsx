import React from 'react';
import { Permiso } from '../../types';

interface PermissionIconProps {
  permiso: Permiso;
}

const estilosPermiso: { [key in Permiso]: { icono: React.ReactElement; clases: string } } = {
  [Permiso.VER]: {
    icono: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
      </svg>
    ),
    clases: 'bg-blue-100 text-blue-800',
  },
  [Permiso.EDITAR]: {
    icono: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z" />
      </svg>
    ),
    clases: 'bg-yellow-100 text-yellow-800',
  },
  [Permiso.CREAR]: {
    icono: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    clases: 'bg-green-100 text-green-800',
  },
  [Permiso.ELIMINAR]: {
    icono: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
      </svg>
    ),
    clases: 'bg-red-100 text-red-800',
  },
};

const PermissionIcon: React.FC<PermissionIconProps> = ({ permiso }) => {
  const estilo = estilosPermiso[permiso];

  if (!estilo) return null;

  return (
    <span className={`inline-flex items-center gap-x-1.5 py-1 px-2.5 rounded-full text-xs font-medium ${estilo.clases}`}>
      {estilo.icono}
      <span className="capitalize">{permiso}</span>
    </span>
  );
};

export default PermissionIcon;
