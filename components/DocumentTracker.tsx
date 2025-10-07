import React, { useMemo } from 'react';
import { Documento, Area, EstadoDocumento, Cargo } from '../types';
import { ETAPAS_FLUJO } from '../constants';
import { useDocumentos } from '../context/DocumentContext';
import { useAuth } from '../context/AuthContext';

interface DocumentTrackerProps {}

const IconoCheck = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${className}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
);

const IconoReloj = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${className}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);


const DocumentTracker: React.FC<DocumentTrackerProps> = () => {
  const { documentos, cargando } = useDocumentos();
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
    // Otros asistentes ven todos los documentos para seguir el flujo
    return documentos;
  }, [documentos, usuarioLogueado]);

  const obtenerEstadoEtapa = (doc: Documento, areaEtapa: Area): 'completado' | 'pendiente' | 'futuro' => {
      const indiceEtapa = ETAPAS_FLUJO.indexOf(areaEtapa);
      
      let indiceEtapaDoc = -1;
      if(doc.estado === EstadoDocumento.PENDIENTE_COMPRAS) indiceEtapaDoc = 1;
      if(doc.estado === EstadoDocumento.PENDIENTE_FACTURACION) indiceEtapaDoc = 2;
      if(doc.estado === EstadoDocumento.PENDIENTE_OPERACIONES) indiceEtapaDoc = 3;
      if(doc.estado === EstadoDocumento.COMPLETADO) indiceEtapaDoc = 4;
      
      if (indiceEtapa < indiceEtapaDoc) return 'completado';
      if (indiceEtapa === indiceEtapaDoc -1) return 'pendiente';
      return 'futuro';
  };

  const obtenerColorEstadoEntrega = (estado: string | undefined) => {
    switch (estado) {
        case 'En Ruta':
            return 'bg-blue-100 text-blue-700';
        case 'Entregado':
            return 'bg-green-100 text-green-700';
        case 'En Espera':
            return 'bg-orange-100 text-orange-700';
        default:
            return 'bg-slate-100 text-slate-700';
    }
  };

  if (cargando) {
    return <p className="text-center text-slate-500 p-8">Cargando documentos...</p>;
  }

  return (
    <div>
        <h3 className="text-2xl font-bold text-slate-800 mb-6">Tracking de Documentos por OC</h3>
        {documentosVisibles.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {documentosVisibles.map(doc => (
                <div key={doc.id} className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                        <h4 className="text-xl font-bold text-sky-600">{doc.oc}</h4>
                        <div className="flex flex-col items-end gap-1">
                          <span className={`text-xs font-bold px-2 py-1 rounded-full ${doc.estado === EstadoDocumento.COMPLETADO ? 'text-green-600 bg-green-100' : 'text-yellow-600 bg-yellow-100'}`}>{doc.estado}</span>
                          {doc.estado === EstadoDocumento.COMPLETADO && doc.estadoEntrega && (
                              <span className={`text-xs font-bold px-2 py-1 rounded-full ${obtenerColorEstadoEntrega(doc.estadoEntrega)}`}>
                                  {doc.estadoEntrega}
                              </span>
                          )}
                        </div>
                    </div>

                    <div className="relative">
                        <div aria-hidden="true" className="absolute left-4 top-4 h-full w-0.5 bg-slate-200"></div>
                        <ul className="space-y-4">
                            {ETAPAS_FLUJO.map((area) => {
                                const estado = obtenerEstadoEtapa(doc, area);
                                const esCompletado = estado === 'completado';
                                const esPendiente = estado === 'pendiente';
                                
                                return (
                                    <li key={area} className="flex items-center gap-4">
                                        <div className={`z-10 flex items-center justify-center w-8 h-8 rounded-full ${
                                            esCompletado ? 'bg-green-500' : esPendiente ? 'bg-sky-500 ring-4 ring-sky-100' : 'bg-slate-300'
                                        }`}>
                                            {esCompletado ? <IconoCheck className="text-white h-4 w-4" /> : esPendiente ? <IconoReloj className="text-white h-5 w-5"/> : <div className="w-2 h-2 bg-white rounded-full"></div>}
                                        </div>
                                        <div>
                                            <p className={`font-semibold capitalize ${esPendiente ? 'text-sky-600' : 'text-slate-800'}`}>{area}</p>
                                            <span className="text-sm text-slate-500">
                                                { area === Area.VENTAS && doc.archivoPrincipal.name }
                                                { area !== Area.VENTAS && doc.anexos[area as Exclude<Area, Area.VENTAS>]?.[doc.anexos[area as Exclude<Area, Area.VENTAS>].length - 1]?.name }
                                            </span>
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                </div>
            ))}
            </div>
        ) : (
            <p className="text-center text-slate-500 p-8 bg-white rounded-lg border border-slate-200">
                No hay documentos en seguimiento. Registre un documento para comenzar.
            </p>
        )}
    </div>
  );
};

export default DocumentTracker;
