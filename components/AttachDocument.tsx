import React, { useState, useRef, useEffect } from 'react';
import { Documento, Area, EstadoDocumento } from '../types';
import { useDocumentos } from '../context/DocumentContext';
import { useAuth } from '../context/AuthContext';

interface AttachDocumentProps {}

const IconoBusqueda = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
);

const IconoAlerta = () => (
    <svg className="fill-current h-6 w-6 text-yellow-500 mr-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
        <path d="M2.93 17.07A10 10 0 1 1 17.07 2.93 10 10 0 0 1 2.93 17.07zM9 5v6h2V5H9zm0 8v2h2v-2H9z"/>
    </svg>
);


const FormularioAnexo: React.FC<{
    oc: string;
    area: Area.COMPRAS | Area.FACTURACION | Area.OPERACIONES;
    setMensajeExito: (msg: string | null) => void;
}> = ({ oc, area, setMensajeExito }) => {
    const [archivo, setArchivo] = useState<File | null>(null);
    const [enviando, setEnviando] = useState(false);
    const inputArchivoRef = useRef<HTMLInputElement>(null);
    const { anexarArchivoParaArea } = useDocumentos();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (archivo) {
            setEnviando(true);
            await anexarArchivoParaArea(oc, area, archivo);
            setEnviando(false);
            setMensajeExito(`Archivo anexado correctamente para ${area} en la OC: ${oc}`);
            setArchivo(null);
            if (inputArchivoRef.current) {
                inputArchivoRef.current.value = "";
            }
        }
    };

    return (
        <form onSubmit={handleSubmit} className="mt-4 border-t border-slate-200 pt-4">
            <label className="block text-sm font-medium text-slate-700 mb-2">
                Anexar nuevo documento para esta área
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
                 <input
                    type="file"
                    ref={inputArchivoRef}
                    onChange={(e) => setArchivo(e.target.files ? e.target.files[0] : null)}
                    className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-sky-50 file:text-sky-700 hover:file:bg-sky-100"
                    accept=".pdf,.doc,.docx,.xls,.xlsx"
                    required
                />
                <button 
                    type="submit"
                    disabled={!archivo || enviando}
                    className="flex-shrink-0 px-4 py-2 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 disabled:bg-green-300 transition"
                >
                    {enviando ? 'Anexando...' : 'Anexar'}
                </button>
            </div>
        </form>
    );
};


const AttachDocument: React.FC<AttachDocumentProps> = () => {
  const [terminoBusqueda, setTerminoBusqueda] = useState('');
  const [documentoEncontrado, setDocumentoEncontrado] = useState<Documento | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);
  
  const { documentos } = useDocumentos();
  const { usuario: usuarioLogueado } = useAuth();
  
  useEffect(() => {
    if (documentoEncontrado) {
        const docActualizado = documentos.find(d => d.id === documentoEncontrado.id);
        setDocumentoEncontrado(docActualizado || null);
    }
  }, [documentos, documentoEncontrado]);

  const handleBuscar = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMensajeExito(null);
    const doc = documentos.find(d => d.oc.toLowerCase() === terminoBusqueda.toLowerCase());
    if (doc) {
      setDocumentoEncontrado(doc);
    } else {
      setDocumentoEncontrado(null);
      setError(`No se encontró ningún documento con la OC: "${terminoBusqueda}"`);
    }
  };
  
  if (!usuarioLogueado) return null;

  const areasRelevantes: (Area.COMPRAS | Area.FACTURACION | Area.OPERACIONES)[] = [Area.COMPRAS, Area.FACTURACION, Area.OPERACIONES];
  const etiquetasArea: Record<Area.COMPRAS | Area.FACTURACION | Area.OPERACIONES, string> = {
      [Area.COMPRAS]: 'Compras',
      [Area.FACTURACION]: 'Facturación',
      [Area.OPERACIONES]: 'Operaciones',
  };

  return (
    <div>
      <div className="max-w-xl mx-auto">
        <h3 className="text-2xl font-bold mb-4 text-slate-800 text-center">Buscar por OC</h3>
        <form onSubmit={handleBuscar} className="flex gap-2 p-6 bg-slate-50 rounded-lg border border-slate-200">
            <input
                type="text"
                value={terminoBusqueda}
                onChange={(e) => setTerminoBusqueda(e.target.value)}
                placeholder="Ingrese el N° de OC a buscar..."
                className="flex-grow px-4 py-2 bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition"
                required
            />
            <button type="submit" className="flex-shrink-0 flex items-center justify-center px-4 py-2 bg-sky-600 text-white font-semibold rounded-md hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500">
                <IconoBusqueda/>
            </button>
        </form>
        {error && <p className="text-red-500 text-center mt-4">{error}</p>}
        {mensajeExito && <p className="text-green-500 text-center mt-4">{mensajeExito}</p>}
      </div>

      {documentoEncontrado && (
        <div className="max-w-3xl mx-auto mt-8 p-6 bg-white rounded-lg border border-slate-200">
            <div className="flex justify-between items-start">
                <h4 className="text-xl font-bold text-sky-700">OC Encontrada: {documentoEncontrado.oc}</h4>
                <span className={`text-sm font-bold px-3 py-1 rounded-full ${documentoEncontrado.estado === EstadoDocumento.COMPLETADO ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{documentoEncontrado.estado}</span>
            </div>
            <div className="mt-4 border-t pt-4">
                <p><strong>Documento Principal (Ventas):</strong> {documentoEncontrado.archivoPrincipal.name}</p>
            </div>
            
            <div className="mt-6 space-y-4">
                {areasRelevantes.map(area => {
                    const usuarioPerteneceAlArea = usuarioLogueado.area === area;
                    const estaCompletado = documentoEncontrado.estado === EstadoDocumento.COMPLETADO;

                    let puedeAnexar = false;
                    let mensajeAlerta: string | null = null;

                    switch(area) {
                        case Area.COMPRAS:
                            puedeAnexar = documentoEncontrado.estado === EstadoDocumento.PENDIENTE_COMPRAS;
                            break;
                        case Area.FACTURACION:
                            puedeAnexar = documentoEncontrado.estado === EstadoDocumento.PENDIENTE_FACTURACION;
                            if(usuarioPerteneceAlArea && documentoEncontrado.estado === EstadoDocumento.PENDIENTE_COMPRAS) {
                                mensajeAlerta = "Debe esperar a que Compras anexe su documento para continuar.";
                            }
                            break;
                        case Area.OPERACIONES:
                            puedeAnexar = documentoEncontrado.estado === EstadoDocumento.PENDIENTE_OPERACIONES;
                            if(usuarioPerteneceAlArea && documentoEncontrado.estado !== EstadoDocumento.PENDIENTE_OPERACIONES && !estaCompletado) {
                                mensajeAlerta = "Debe esperar a que Facturación anexe su documento para continuar.";
                            }
                            break;
                    }

                    const mostrarFormularioAnexo = usuarioPerteneceAlArea && puedeAnexar && !estaCompletado;
                    const mostrarAlerta = usuarioPerteneceAlArea && !puedeAnexar && !estaCompletado && mensajeAlerta;

                    return (
                        <div key={area} className="p-4 border border-slate-200 rounded-lg bg-slate-50/50">
                            <h5 className="font-bold text-slate-800 capitalize">Anexos de {etiquetasArea[area]}</h5>
                             <div className="mt-2 pl-4 border-l-2 border-sky-200">
                                {documentoEncontrado.anexos[area].length > 0 ? (
                                    <ul className="list-disc list-inside space-y-1">
                                        {documentoEncontrado.anexos[area].map((archivo, indice) => (
                                            <li key={indice} className="text-sm text-slate-700">{archivo.name}</li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-sm text-slate-500 italic">No hay archivos para esta área.</p>
                                )}
                            </div>
                            
                            {mostrarFormularioAnexo && (
                                <FormularioAnexo 
                                    oc={documentoEncontrado.oc}
                                    area={area}
                                    setMensajeExito={setMensajeExito}
                                />
                            )}

                            {mostrarAlerta && (
                                <div className="mt-4 border-t border-slate-200 pt-4">
                                    <div role="alert" className="p-3 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 rounded-r-md">
                                        <div className="flex">
                                            <div className="py-1"><IconoAlerta/></div>
                                            <div>
                                                <p className="font-bold">Acción Pendiente</p>
                                                <p className="text-sm">{mensajeAlerta}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                        </div>
                    );
                })}
            </div>

            {documentoEncontrado.estado === EstadoDocumento.COMPLETADO && (
                <div className="mt-6 border-t pt-6 text-center">
                    <p className="text-lg font-semibold text-green-700">Proceso finalizado.</p>
                </div>
            )}
        </div>
      )}
    </div>
  );
};

export default AttachDocument;
