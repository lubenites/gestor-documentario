import React, { createContext, useState, useContext, ReactNode } from 'react';
import { Vista } from '../types';

interface UIContextType {
  vistaActual: Vista;
  setVistaActual: (vista: Vista) => void;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

export const UIProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [vistaActual, setVistaActual] = useState<Vista>('seguimiento');

  return (
    <UIContext.Provider value={{ vistaActual, setVistaActual }}>
      {children}
    </UIContext.Provider>
  );
};

export const useUI = () => {
  const context = useContext(UIContext);
  if (context === undefined) {
    throw new Error('useUI debe ser utilizado dentro de un UIProvider');
  }
  return context;
};
