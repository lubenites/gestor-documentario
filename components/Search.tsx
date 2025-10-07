import React, { useState, useMemo, useRef } from 'react';
import { Documento, EstadoDocumento, Area, Cargo, EstadoEntrega } from '../types';
import FilePreviewModal from './FilePreviewModal';
import { useDocumentos } from '../context/DocumentContext';
import { useAuth } from '../context/AuthContext';
import ChevronDownIcon from './icons/ChevronDownIcon';
import UploadIcon from './icons/UploadIcon';
import TrashIcon from './icons/TrashIcon';

interface SearchProps {}

const ElementoListaArchivo: React.FC<{ archivo: File, area: string, onClick: () => void }> = ({ archivo, area, onClick }) => (
    <div 
        onClick={onClick}
        className="flex items-center justify-between p-2 rounded-md hover:bg-sky-50 cursor-pointer"
    >
        <div className="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0011.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            <span className="text-slate-700">{archivo.name}</span>
        </div>
        <span className="text-xs text-slate-500 capitalize">{area}</span>
    </div>
);


const Search: React.FC<SearchProps> = () => {
  const [terminoBusqueda, setTerminoBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState<EstadoDocumento | 'all'>('all');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');

  const [docExpandidoId, setDocExpandidoId] = useState<number | null>(null);
  const [archivoPrevisualizar, setArchivoPrevisualizar] = useState<File | null>(null);
  const inputArchivoRef = useRef<HTMLInputElement>(null);
  const [objetivoCarga, setObjetivoCarga] = useState<{oc: string, area: Area.COMPRAS | Area.FACTURACION | Area.OPERACIONES} | null>(null);

  const { documentos, agregarVersionAnexo, eliminarAnexo, actualizarEstadoEntrega, cargando } = useDocumentos();
  const { usuario: usuarioLogueado } = useAuth();

  const documentosVisibles = useMemo(() => {
    if (!usuarioLogueado) return [];
    const { area, cargo } = usuarioLogueado;
    
    let docsParaFiltrar = documentos;

    if (area === Area.VENTAS && cargo === Cargo.ASISTENTE) {
        docsParaFiltrar = documentos.filter(doc => doc.creadoPor === usuarioLogueado.id);
    }
    
    return docsParaFiltrar;
  }, [documentos, usuarioLogueado]);

  const documentosFiltrados = useMemo(() => {
    return documentosVisibles.filter(doc => {
      const termino = terminoBusqueda.toLowerCase();
      const enOc = doc.oc.toLowerCase().includes(termino);
      const enArchivoPrincipal = doc.archivoPrincipal.name.toLowerCase().includes(termino);
      const enAnexos = (Object.values(doc.anexos).flat() as File[]).some(archivo => archivo && archivo.name.toLowerCase().includes(termino));
      if (terminoBusqueda && !enOc && !enArchivoPrincipal && !enAnexos) {
        return false;
      }
      if (filtroEstado !== 'all' && doc.estado !== filtroEstado) return false;
      const fechaDoc = new Date(doc.fechaCreacion);
      if (fechaInicio) {
        const inicio = new Date(fechaInicio);
        inicio.setHours(0, 0, 0, 0);
        if (fechaDoc < inicio) return false;
      }
      if (fechaFin) {
        const fin = new Date(fechaFin);
        fin.setHours(23, 59, 59, 999);
        if (fechaDoc > fin) return false;
      }
      
      return true;
    });
  }, [documentosVisibles, terminoBusqueda, filtroEstado, fechaInicio, fechaFin]);

  const handleClicCargar = (oc: string, area: Area.COMPRAS | Area.FACTURACION | Area.OPERACIONES) => {
    setObjetivoCarga({ oc, area });
    inputArchivoRef.current?.click();
  };

  const handleArchivoSeleccionado = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0] && objetivoCarga) {
      agregarVersionAnexo(objetivoCarga.oc, objetivoCarga.area, e.target.files[0]);
      e.target.value = '';
      setObjetivoCarga(null);
    }
  };
  
  if (!usuarioLogueado) return null;

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <input 
        type="file" 
        className="hidden" 
        ref={inputArchivoRef} 
        onChange={handleArchivoSeleccionado} 
        accept=".pdf,.doc,.docx,.xls,.xlsx"
      />
      <aside className="lg:w-1/4">
        <div className="p-6 bg-white rounded-lg border border-slate-200 sticky top-8">
          <h3 className="text-xl font-bold text-slate-800 mb-4">Filtros</h3>
          <div className="space-y-4">
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-slate-600 mb-1">Estado</label>
              <select id="status" value={filtroEstado} onChange={e => setFiltroEstado(e.target.value as EstadoDocumento | 'all')} className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-sky-500">
                <option value="all">Todos</option>
                {Object.values(EstadoDocumento).map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-slate-600 mb-1">Desde</label>
              <input type="date" id="startDate" value={fechaInicio} onChange={e => setFechaInicio(e.target.value)} className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-sky-500" />
            </div>
            <div>
              <label htmlFor="endDate" className="block text-sm font-medium text-slate-600 mb-1">Hasta</label>
              <input type="date" id="endDate" value={fechaFin} onChange={e => setFechaFin(e.target.value)} className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-sky-500" />
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1">
        <div className="relative mb-6">
          <input
            type="text"
            placeholder="Buscar por OC o nombre de archivo..."
            value={terminoBusqueda}
            onChange={e => setTerminoBusqueda(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white border border-slate-300 rounded-full focus:ring-2 focus:ring-sky-500"
          />
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
        </div>
        
        {cargando ? <p className="text-center text-slate-500 p-8">Cargando...</p> : (
            <div className="space-y-4">
            {documentosFiltrados.length > 0 ? documentosFiltrados.map(doc => {
                const estaExpandido = docExpandidoId === doc.id;
                return (
                <div key={doc.id} className="p-4 bg-white rounded-lg border border-slate-200 transition-all duration-300">
                    <div 
                        className="flex items-center justify-between cursor-pointer"
                        onClick={() => setDocExpandidoId(estaExpandido ? null : doc.id)}
                    >
                        <div>
                            <p className="font-bold text-lg text-sky-600">{doc.oc}</p>
                            <p className="text-xs text-slate-400 mt-1">Registrado: {new Date(doc.fechaCreacion).toLocaleDateString()}</p>
                        </div>
                        <div className="flex items-center gap-4">
                        <span className={`text-xs font-bold px-2 py-1 rounded-full ${doc.estado === EstadoDocumento.COMPLETADO ? 'text-green-600 bg-green-100' : 'text-yellow-600 bg-yellow-100'}`}>{doc.estado}</span>
                        <ChevronDownIcon className={`w-5 h-5 text-slate-500 transition-transform ${estaExpandido ? 'rotate-180' : ''}`} />
                        </div>
                    </div>
                    {estaExpandido && (
                        <div className="mt-4 pt-4 border-t border-slate-200">
                            <h4 className="font-semibold text-slate-700 mb-2">Archivos Adjuntos:</h4>
                            <div className="p-2">
                                <ElementoListaArchivo archivo={doc.archivoPrincipal} area="Ventas" onClick={() => setArchivoPrevisualizar(doc.archivoPrincipal)} />
                            </div>
                            
                            {(Object.entries(doc.anexos) as [Area.COMPRAS | Area.FACTURACION | Area.OPERACIONES, File[]][]).map(([area, archivos]) => {
                               const puedeGestionarAnexos = usuarioLogueado.area === Area.ADMIN || usuarioLogueado.area === area;
                               return archivos.length > 0 && (
                                    <div key={area} className="p-2 border-t border-slate-100">
                                        <div className="flex justify-between items-center mb-1">
                                            <h5 className="font-semibold capitalize text-slate-600 text-sm">{area}</h5>
                                            <button 
                                                onClick={() => handleClicCargar(doc.oc, area)}
                                                className="flex items-center gap-1 text-xs px-2 py-1 rounded text-sky-600 bg-sky-100 hover:bg-sky-200 transition"
                                            >
                                                <UploadIcon className="w-4 h-4" />
                                                Nueva Versión
                                            </button>
                                        </div>
                                        <ul className="space-y-1 pl-4 border-l-2 border-slate-200">
                                            {archivos.slice().reverse().map((archivo, indice) => (
                                            <li key={archivo.name + indice} className="relative flex items-center justify-between group">
                                                <span className={`absolute -left-[11px] top-1/2 -translate-y-1/2 h-2 w-2 rounded-full ${indice === 0 ? 'bg-sky-500' : 'bg-slate-300'}`}></span>
                                                <ElementoListaArchivo 
                                                    archivo={archivo} 
                                                    area={`Versión ${archivos.length - indice}`}
                                                    onClick={() => setArchivoPrevisualizar(archivo)} 
                                                />
                                                {puedeGestionarAnexos && (
                                                    <button
                                                    onClick={() => eliminarAnexo(doc.oc, area, archivo)}
                                                    className="p-1 text-slate-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                                                    title="Eliminar anexo"
                                                    >
                                                    <TrashIcon className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </li>
                                            ))}
                                        </ul>
                                    </div>
                                )
                            })}

                            {doc.estado === EstadoDocumento.COMPLETADO && (
                            <div className="mt-4 pt-4 border-t border-slate-100">
                                <label htmlFor={`delivery-status-${doc.id}`} className="block text-sm font-medium text-slate-600 mb-1">Estado de Entrega</label>
                                <div className="flex items-center gap-4">
                                    <select 
                                        id={`delivery-status-${doc.id}`}
                                        value={doc.estadoEntrega || ''}
                                        onChange={e => actualizarEstadoEntrega(doc.oc, e.target.value as EstadoEntrega)}
                                        className="w-full max-w-xs px-3 py-2 bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-sky-500 disabled:bg-slate-50 disabled:cursor-not-allowed"
                                        disabled={!(usuarioLogueado.area === Area.OPERACIONES)}
                                    >
                                        <option value="" disabled>Seleccionar estado...</option>
                                        {Object.values(EstadoEntrega).map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                    <span className="text-sm font-bold capitalize">{doc.estadoEntrega}</span>
                                </div>
                            </div>
                            )}
                        </div>
                    )}
                </div>
                )
            }) : (
                <p className="text-center text-slate-500 p-8 bg-white rounded-lg border border-slate-200">No se encontraron documentos con los criterios seleccionados.</p>
            )}
            </div>
        )}
      </main>
      
      {archivoPrevisualizar && <FilePreviewModal archivo={archivoPrevisualizar} onClose={() => setArchivoPrevisualizar(null)} />}
    </div>
  );
};

export default Search;
