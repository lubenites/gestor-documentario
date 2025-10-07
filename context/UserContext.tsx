import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback } from 'react';
import { Usuario } from '../types';
import { servicioUsuarios } from '../api/userService';
import { useAuth } from './AuthContext';

interface UserContextType {
  usuarios: Usuario[];
  cargando: boolean;
  error: string | null;
  agregarUsuario: (usuario: Omit<Usuario, 'id'>) => Promise<void>;
  actualizarUsuario: (usuario: Usuario) => Promise<void>;
  eliminarUsuario: (usuarioId: number) => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { usuario: usuarioLogueado } = useAuth();
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const obtenerUsuarios = useCallback(async () => {
    setCargando(true);
    setError(null);
    try {
      const listaUsuarios = await servicioUsuarios.obtenerUsuarios();
      setUsuarios(listaUsuarios);
    } catch (e) {
      setError('Falló la obtención de usuarios.');
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    // Solo el admin puede gestionar usuarios
    if (usuarioLogueado?.area === 'admin') {
      obtenerUsuarios();
    }
  }, [usuarioLogueado, obtenerUsuarios]);

  const agregarUsuario = async (datosUsuario: Omit<Usuario, 'id'>) => {
    const nuevoUsuario = await servicioUsuarios.crearUsuario(datosUsuario);
    setUsuarios(prev => [...prev, nuevoUsuario]);
  };

  const actualizarUsuario = async (datosUsuarioActualizado: Usuario) => {
    const usuarioActualizado = await servicioUsuarios.actualizarUsuario(datosUsuarioActualizado);
    setUsuarios(prev => prev.map(u => u.id === usuarioActualizado.id ? usuarioActualizado : u));
  };

  const eliminarUsuario = async (usuarioId: number) => {
    const exito = await servicioUsuarios.eliminarUsuario(usuarioId);
    if (exito) {
      setUsuarios(prev => prev.filter(u => u.id !== usuarioId));
    }
  };

  return (
    <UserContext.Provider value={{ usuarios, cargando, error, agregarUsuario, actualizarUsuario, eliminarUsuario }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUsuarios = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUsuarios debe ser utilizado dentro de un UserProvider');
  }
  return context;
};
