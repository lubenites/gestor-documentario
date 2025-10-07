import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback } from 'react';
import { Documento, Area, EstadoEntrega } from '../types';
import { servicioDocumentos } from '../api/documentService';
import { useAuth } from './AuthContext';

interface DocumentContextType {
  documentos: Documento[];
  cargando: boolean;
  error: string | null;
  agregarDocumento: (oc: string, archivoPrincipal: File) => Promise<void>;
  eliminarDocumento: (docId: number) => Promise<void>;
  anexarArchivoParaArea: (oc: string, area: Area.COMPRAS | Area.FACTURACION | Area.OPERACIONES, archivo: File) => Promise<void>;
  agregarVersionAnexo: (oc: string, area: Area.COMPRAS | Area.FACTURACION | Area.OPERACIONES, archivo: File) => Promise<void>;
  eliminarAnexo: (oc: string, area: Area.COMPRAS | Area.FACTURACION | Area.OPERACIONES, archivoAEliminar: File) => Promise<void>;
  actualizarEstadoEntrega: (oc: string, estado: EstadoEntrega) => Promise<void>;
}

const DocumentContext = createContext<DocumentContextType | undefined>(undefined);

export const DocumentProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { usuario } = useAuth();
  const [documentos, setDocumentos] = useState<Documento[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const obtenerDocumentos = useCallback(async () => {
    setCargando(true);
    setError(null);
    try {
      const docs = await servicioDocumentos.obtenerDocumentos();
      setDocumentos(docs);
    } catch (e) {
      setError('Falló la obtención de documentos.');
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    if (usuario) {
        obtenerDocumentos();
    } else {
        setDocumentos([]);
    }
  }, [usuario, obtenerDocumentos]);

  const agregarDocumento = async (oc: string, archivoPrincipal: File) => {
    if (!usuario) return;
    const nuevoDoc = await servicioDocumentos.crearDocumento(oc, archivoPrincipal, { id: usuario.id, area: usuario.area });
    setDocumentos(prev => [...prev, nuevoDoc]);
  };

  const eliminarDocumento = async (docId: number) => {
    const exito = await servicioDocumentos.eliminarDocumento(docId);
    if (exito) {
      setDocumentos(prev => prev.filter(d => d.id !== docId));
    }
  };

  const anexarArchivoParaArea = async (oc: string, area: Area.COMPRAS | Area.FACTURACION | Area.OPERACIONES, archivo: File) => {
    if (!usuario) return;
    const docActualizado = await servicioDocumentos.agregarAnexo(oc, area, archivo, { id: usuario.id, area: usuario.area }, false);
    if (docActualizado) {
      setDocumentos(prev => prev.map(d => d.id === docActualizado.id ? docActualizado : d));
    }
  };
  
  const agregarVersionAnexo = async (oc: string, area: Area.COMPRAS | Area.FACTURACION | Area.OPERACIONES, archivo: File) => {
    if (!usuario) return;
    const docActualizado = await servicioDocumentos.agregarAnexo(oc, area, archivo, { id: usuario.id, area: usuario.area }, true);
    if (docActualizado) {
      setDocumentos(prev => prev.map(d => d.id === docActualizado.id ? docActualizado : d));
    }
  };
  
  const eliminarAnexo = async (oc: string, area: Area.COMPRAS | Area.FACTURACION | Area.OPERACIONES, archivoAEliminar: File) => {
    if (!usuario) return;
    const docActualizado = await servicioDocumentos.eliminarAnexo(oc, area, archivoAEliminar, { id: usuario.id, area: usuario.area });
    if (docActualizado) {
      setDocumentos(prev => prev.map(d => d.id === docActualizado.id ? docActualizado : d));
    }
  };
  
  const actualizarEstadoEntrega = async (oc: string, estado: EstadoEntrega) => {
    if (!usuario) return;
    const docActualizado = await servicioDocumentos.actualizarEstadoEntrega(oc, estado, { id: usuario.id, area: usuario.area });
     if (docActualizado) {
      setDocumentos(prev => prev.map(d => d.id === docActualizado.id ? docActualizado : d));
    }
  };

  return (
    <DocumentContext.Provider value={{ documentos, cargando, error, agregarDocumento, eliminarDocumento, anexarArchivoParaArea, agregarVersionAnexo, eliminarAnexo, actualizarEstadoEntrega }}>
      {children}
    </DocumentContext.Provider>
  );
};

export const useDocumentos = () => {
  const context = useContext(DocumentContext);
  if (context === undefined) {
    throw new Error('useDocumentos debe ser utilizado dentro de un DocumentProvider');
  }
  return context;
};
