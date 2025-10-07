import React, { useState, useRef, useMemo } from 'react';
import { EstadoDocumento, Area, Cargo } from '../types';
import { useDocumentos } from '../context/DocumentContext';
import { useAuth } from '../context/AuthContext';
import PlusIcon from './icons/PlusIcon';
import TrashIcon from './icons/TrashIcon';

const IconoArchivo = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0011.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
    </svg>
);

const IconoClip = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
    </svg>
);


const RegisterDocument: React.FC = () => {
  const [oc, setOc] = useState('');
  const [archivoPrincipal, setArchivoPrincipal] = useState<File | null>(null);
  const [enviando, setEnviando] = useState(false);
  const inputArchivoRef = useRef<HTMLInputElement>(null);
  
  const { documentos, agregarDocumento, eliminarDocumento, cargando } = useDocumentos();
  const { usuario: usuarioLogueado } = useAuth();

  const documentosVisibles = useMemo(() => {
    if (!usuarioLogueado) return [];
    const { area, cargo } = usuarioLogueado;
    
    if (area === Area.ADMIN || (area === Area.VENTAS && cargo === Cargo.SUPERVISOR)) {
        return documentos;
    }
    if (area === Area.VENTAS && cargo === Cargo.ASISTENTE) {
        return documentos.filter(doc => doc.creadoPor === usuarioLogueado.id);
    }
    return [];
  }, [documentos, usuarioLogueado]);

  const handleCambioArchivo = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setArchivoPrincipal(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (oc.trim() && archivoPrincipal) {
      setEnviando(true);
      await agregarDocumento(oc.trim(), archivoPrincipal);
      setOc('');
      setArchivoPrincipal(null);
      if(inputArchivoRef.current) {
        inputArchivoRef.current.value = "";
      }
      setEnviando(false);
    }
  };

  const obtenerColorEstado = (estado: EstadoDocumento) => {
    if (estado === EstadoDocumento.COMPLETADO) {
      return 'text-green-600 bg-green-100';
    }
    return 'text-yellow-600 bg-yellow-100';
  }

  if (!usuarioLogueado) return null;
  const puedeEliminar = usuarioLogueado.area === Area.ADMIN || (usuarioLogueado.area === Area.VENTAS && usuarioLogueado.cargo === Cargo.SUPERVISOR);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      <div className="md:col-span-1">
        <h3 className="text-2xl font-bold mb-4 text-slate-800">Registrar Documento</h3>
        <form onSubmit={handleSubmit} className="p-6 bg-slate-50 rounded-lg space-y-6 border border-slate-200">
          <div>
            <label htmlFor="oc" className="block text-sm font-medium text-slate-600 mb-1">
              N° de Orden de Compra (OC)
            </label>
            <input
              id="oc"
              type="text"
              value={oc}
              onChange={(e) => setOc(e.target.value)}
              placeholder="Ej: OC-2024-001"
              className="w-full px-4 py-2 bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Documento Principal (Ventas)</label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-300 border-dashed rounded-md">
                <div className="space-y-1 text-center">
                    <svg className="mx-auto h-12 w-12 text-slate-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <div className="flex text-sm text-slate-600">
                        <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-sky-600 hover:text-sky-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-sky-500">
                            <span>Subir un archivo</span>
                            <input id="file-upload" name="file-upload" type="file" className="sr-only" ref={inputArchivoRef} onChange={handleCambioArchivo} accept=".pdf,.doc,.docx,.xls,.xlsx" required/>
                        </label>
                        <p className="pl-1">o arrastrar y soltar</p>
                    </div>
                    <p className="text-xs text-slate-500">PDF, WORD, EXCEL</p>
                </div>
            </div>
            {archivoPrincipal && <p className="text-sm text-slate-500 mt-2">Archivo seleccionado: {archivoPrincipal.name}</p>}
          </div>

          <button 
            type="submit"
            className="w-full flex items-center justify-center px-4 py-3 bg-sky-600 text-white font-semibold rounded-md hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:bg-sky-300 disabled:cursor-not-allowed transition duration-300"
            disabled={!oc.trim() || !archivoPrincipal || enviando}
          >
            <PlusIcon className="w-5 h-5 mr-2" />
            {enviando ? 'Registrando...' : 'Registrar Documento'}
          </button>
        </form>
      </div>

      <div className="md:col-span-2">
        <h3 className="text-2xl font-bold mb-4 text-slate-800">Documentos Registrados</h3>
        <div className="bg-white rounded-lg border border-slate-200">
          {cargando ? <p className="text-center text-slate-500 p-8">Cargando documentos...</p> : (
            <ul className="divide-y divide-slate-200">
              {documentosVisibles.length > 0 ? documentosVisibles.map(doc => (
                <li key={doc.id} className="p-4">
                  <div className="flex items-center justify-between">
                      <p className="font-bold text-lg text-sky-600">{doc.oc}</p>
                      <div className="flex items-center gap-2">
                          <span className={`text-xs font-bold px-2 py-1 rounded-full ${obtenerColorEstado(doc.estado)}`}>{doc.estado}</span>
                          {puedeEliminar && (
                              <button onClick={() => eliminarDocumento(doc.id)} className="p-1 text-slate-400 hover:text-red-600" title="Eliminar OC">
                                  <TrashIcon className="w-4 h-4" />
                              </button>
                          )}
                      </div>
                  </div>
                  <div className="mt-3 space-y-2">
                      <div className="flex items-center gap-2 text-sm text-slate-700">
                          <IconoArchivo/>
                          <strong>Principal (Ventas):</strong>
                          <span>{doc.archivoPrincipal.name}</span>
                      </div>
                      {(doc.anexos[Area.COMPRAS].length > 0 || doc.anexos[Area.FACTURACION].length > 0 || doc.anexos[Area.OPERACIONES].length > 0) && (
                          <div className="flex items-start gap-2 text-sm text-slate-700 pt-2 border-t border-slate-100">
                            <div className="flex-shrink-0">
                              <IconoClip/>
                            </div>
                            <div>
                                <strong>Anexos:</strong>
                                <ul className="list-disc pl-5">
                                    {doc.anexos[Area.COMPRAS].length > 0 && <li>(Compras) {doc.anexos[Area.COMPRAS].slice(-1)[0]!.name}</li>}
                                    {doc.anexos[Area.FACTURACION].length > 0 && <li>(Facturación) {doc.anexos[Area.FACTURACION].slice(-1)[0]!.name}</li>}
                                    {doc.anexos[Area.OPERACIONES].length > 0 && <li>(Operaciones) {doc.anexos[Area.OPERACIONES].slice(-1)[0]!.name}</li>}
                                </ul>
                            </div>
                          </div>
                      )}
                  </div>
                </li>
              )) : (
                <p className="text-center text-slate-500 p-8">No hay documentos registrados. Agregue uno para comenzar.</p>
              )}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default RegisterDocument;
