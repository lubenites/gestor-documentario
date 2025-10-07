import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback } from 'react';
import { Rol } from '../types';
import { servicioRoles } from '../api/roleService';
import { useAuth } from './AuthContext';

interface RoleContextType {
  roles: Rol[];
  cargando: boolean;
  agregarRol: (rol: Omit<Rol, 'id'>) => Promise<void>;
  actualizarRol: (rol: Rol) => Promise<void>;
  eliminarRol: (rolId: number) => Promise<void>;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export const RoleProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { usuario } = useAuth();
  const [roles, setRoles] = useState<Rol[]>([]);
  const [cargando, setCargando] = useState(true);

  const obtenerRoles = useCallback(async () => {
    setCargando(true);
    try {
      const listaRoles = await servicioRoles.obtenerRoles();
      setRoles(listaRoles);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    if (usuario?.area === 'admin') {
      obtenerRoles();
    }
  }, [usuario, obtenerRoles]);

  const agregarRol = async (datosRol: Omit<Rol, 'id'>) => {
    const nuevoRol = await servicioRoles.crearRol(datosRol);
    setRoles(prev => [...prev, nuevoRol]);
  };

  const actualizarRol = async (rolActualizado: Rol) => {
    const rol = await servicioRoles.actualizarRol(rolActualizado);
    setRoles(prev => prev.map(r => r.id === rol.id ? rol : r));
  };

  const eliminarRol = async (rolId: number) => {
    const exito = await servicioRoles.eliminarRol(rolId);
    if (exito) {
      setRoles(prev => prev.filter(r => r.id !== rolId));
    }
  };

  return (
    <RoleContext.Provider value={{ roles, cargando, agregarRol, actualizarRol, eliminarRol }}>
      {children}
    </RoleContext.Provider>
  );
};

export const useRoles = () => {
  const context = useContext(RoleContext);
  if (context === undefined) {
    throw new Error('useRoles debe ser utilizado dentro de un RoleProvider');
  }
  return context;
};
