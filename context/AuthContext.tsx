import React, { createContext, useState, useContext, ReactNode } from 'react';
import { Usuario } from '../types';
import { servicioAuth } from '../api/authService';

interface AuthContextType {
  usuario: Usuario | null;
  iniciarSesion: (email: string, password: string) => Promise<boolean>;
  cerrarSesion: () => void;
  cargando: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [cargando, setCargando] = useState(false);

  const iniciarSesion = async (email: string, password: string): Promise<boolean> => {
    setCargando(true);
    try {
      const usuarioLogueado = await servicioAuth.iniciarSesion(email, password);
      if (usuarioLogueado) {
        setUsuario(usuarioLogueado);
        return true;
      }
      return false;
    } finally {
      setCargando(false);
    }
  };

  const cerrarSesion = () => {
    setUsuario(null);
  };

  return (
    <AuthContext.Provider value={{ usuario, iniciarSesion, cerrarSesion, cargando }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser utilizado dentro de un AuthProvider');
  }
  return context;
};
