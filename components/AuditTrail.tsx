import React, { useState, useMemo } from 'react';
import { RegistroAuditoria, Area, Cargo } from '../types';
import { useDocumentos } from '../context/DocumentContext';
import { useUsuarios } from '../context/UserContext';
import { useAuth } from '../context/AuthContext';
import ChevronDownIcon from './icons/ChevronDownIcon';
import AreaBadge from './AreaBadge';

interface AuditTrailProps {}

const IconoUsuario: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
  </svg>
);

const IconoReloj: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);


const AuditTrail: React.FC<AuditTrailProps> = () => {
  const [docExpandidoId, setDocExpandidoId] = useState<number | null>(null);
  const { documentos, cargando: cargandoDocs } = useDocumentos();
  const { usuarios, cargando: cargandoUsuarios } = useUsuarios();
  const { usuario: usuarioLogueado } = useAuth();


  const documentosVisibles = useMemo(() => {
    if (!usuarioLogueado) return [];
    const { area, cargo } = usuarioLogueado;
    
    if (area === Area.ADMIN || cargo === Cargo.SUPERVISOR) {
        return documentos;
    }
    if (area === Area.VENTAS && cargo === Cargo.ASISTENTE) {
        return documentos.filter(doc => doc.creadoPor === usuarioLogueado.id);
    }
    return documentos;
  }, [documentos, usuarioLogueado]);

  const obtenerNombreUsuario = (usuarioId: number) => {
    const usuario = usuarios.find(u => u.id === usuarioId);
    return usuario ? `${usuario.nombres} ${usuario.apellidos}` : 'Usuario Desconocido';
  };

  const formatearTimestamp = (isoString: string) => {
    const fecha = new Date(isoString);
    return `${fecha.toLocaleDateString()} ${fecha.toLocaleTimeString()}`;
  };

  if (cargandoDocs || cargandoUsuarios) {
    return <p className="text-center p-8 text-slate-500">Cargando auditoría...</p>;
  }

  if (documentosVisibles.length === 0) {
    return (
      <div className="text-center text-slate-500 p-8 bg-white rounded-lg border border-slate-200">
        <h3 className="text-xl font-bold text-slate-800 mb-2">Auditoría de Documentos</h3>
        <p>No hay documentos para auditar.</p>
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-2xl font-bold text-slate-800 mb-6">Historial de Interacciones por OC</h3>
      <div className="space-y-4">
        {documentosVisibles.map(doc => {
          const estaExpandido = docExpandidoId === doc.id;
          return (
            <div key={doc.id} className="bg-white rounded-lg border border-slate-200 shadow-sm">
              <div
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-50"
                onClick={() => setDocExpandidoId(estaExpandido ? null : doc.id)}
              >
                <div className="flex items-center gap-4">
                  <span className="font-bold text-lg text-sky-700">{doc.oc}</span>
                  <span className="text-sm text-slate-500">
                    Última actividad: {formatearTimestamp(doc.historial[doc.historial.length - 1].timestamp)}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                   <span className="text-sm text-slate-600">
                    {doc.historial.length} {doc.historial.length === 1 ? 'interacción' : 'interacciones'}
                   </span>
                   <ChevronDownIcon className={`w-6 h-6 text-slate-500 transition-transform ${estaExpandido ? 'rotate-180' : ''}`} />
                </div>
              </div>
              
              {estaExpandido && (
                <div className="border-t border-slate-200 p-4">
                  <ul className="space-y-4">
                    {doc.historial.slice().reverse().map((log: RegistroAuditoria, indice: number) => (
                      <li key={indice} className="relative pl-8">
                        <div className="absolute left-0 top-1 h-full border-l-2 border-slate-200"></div>
                        <div className="absolute left-[-9px] top-1 w-4 h-4 bg-white border-2 border-sky-500 rounded-full"></div>
                        
                        <div className="ml-4">
                          <div className="flex items-center justify-between">
                            <p className="font-bold text-slate-800">{log.accion}</p>
                            <AreaBadge area={log.area} />
                          </div>
                          <p className="text-sm text-slate-600 mt-1">
                            Archivo: <span className="font-medium">{log.nombreArchivo}</span>
                          </p>
                          <div className="flex items-center gap-4 text-xs text-slate-500 mt-2">
                             <div className="flex items-center gap-1">
                                <IconoUsuario className="w-4 h-4" />
                                <span>{obtenerNombreUsuario(log.usuarioId)}</span>
                             </div>
                             <div className="flex items-center gap-1">
                                <IconoReloj className="w-4 h-4" />
                                <span>{formatearTimestamp(log.timestamp)}</span>
                             </div>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AuditTrail;
