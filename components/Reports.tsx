import React, { useMemo, useState } from 'react';
import { Documento, Area, EstadoDocumento, Usuario, Cargo } from '../types';
import { useDocumentos } from '../context/DocumentContext';
import { useUsuarios } from '../context/UserContext';
import { useAuth } from '../context/AuthContext';

interface ReportsProps {}

const ReportesSimples: React.FC<{ documentos: Documento[]; usuarioLogueado: Usuario }> = ({ documentos, usuarioLogueado }) => {
    const documentosUsuario = useMemo(() => {
        if (usuarioLogueado.area === Area.VENTAS) {
            return documentos.filter(d => d.creadoPor === usuarioLogueado.id);
        }
        let estadoPendiente: EstadoDocumento | null = null;
        if (usuarioLogueado.area === Area.COMPRAS) estadoPendiente = EstadoDocumento.PENDIENTE_COMPRAS;
        if (usuarioLogueado.area === Area.FACTURACION) estadoPendiente = EstadoDocumento.PENDIENTE_FACTURACION;
        if (usuarioLogueado.area === Area.OPERACIONES) estadoPendiente = EstadoDocumento.PENDIENTE_OPERACIONES;
        
        if (estadoPendiente) {
            return documentos.filter(d => d.estado === estadoPendiente);
        }
        return [];

    }, [documentos, usuarioLogueado]);

    const misDocumentosAnexados = useMemo(() => {
       return documentos.filter(d => 
           d.historial.some(h => h.usuarioId === usuarioLogueado.id && h.accion.includes('Anexo'))
       ).length;
    }, [documentos, usuarioLogueado]);
    
    if (usuarioLogueado.area === Area.VENTAS) {
        return (
            <div>
                <h3 className="text-xl font-bold text-slate-800 mb-4">Mis Reportes de Ventas</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    <TarjetaKpi titulo="Mis OCs Registradas" valor={documentosUsuario.length} />
                    <TarjetaKpi titulo="Mis OCs Completadas" valor={documentosUsuario.filter(d => d.estado === EstadoDocumento.COMPLETADO).length} color="text-green-500" />
                    <TarjetaKpi titulo="Mis OCs Pendientes" valor={documentosUsuario.filter(d => d.estado !== EstadoDocumento.COMPLETADO).length} color="text-yellow-500"/>
                </div>
            </div>
        );
    }

    return (
        <div>
            <h3 className="text-xl font-bold text-slate-800 mb-4">Mis Reportes de {usuarioLogueado.area}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <TarjetaKpi titulo="OCs Pendientes para Mi Área" valor={documentosUsuario.length} color="text-orange-500"/>
                <TarjetaKpi titulo="Total de Anexos Realizados por Mí" valor={misDocumentosAnexados} />
            </div>
        </div>
    );
};

const ReportesAvanzados: React.FC<{ documentos: Documento[], usuarios: Usuario[], usuarioLogueado: Usuario }> = ({ documentos, usuarios, usuarioLogueado }) => {
    const asistentesEnArea = useMemo(() => {
        if (usuarioLogueado.area === Area.ADMIN) {
             return usuarios.filter(u => u.cargo === Cargo.ASISTENTE);
        }
        return usuarios.filter(u => u.area === usuarioLogueado.area && u.cargo === Cargo.ASISTENTE);
    }, [usuarios, usuarioLogueado]);
    
    const [asistenteSeleccionadoId, setAsistenteSeleccionadoId] = useState<string>('all');

    const documentosFiltrados = useMemo(() => {
        if (asistenteSeleccionadoId === 'all') return documentos;
        const idAsistente = parseInt(asistenteSeleccionadoId, 10);
        return documentos.filter(doc => doc.creadoPor === idAsistente);
    }, [documentos, asistenteSeleccionadoId]);

    const { totalDocs, docsCompletados, docsPendientes, estancadosEnVentas, docsPorArea, distribucionEstados } = useMemo(() => {
        const docs = documentosFiltrados;
        const totalDocs = docs.length;
        const docsCompletados = docs.filter(d => d.estado === EstadoDocumento.COMPLETADO).length;
        const docsPendientes = totalDocs - docsCompletados;
        const estancadosEnVentas = docs.filter(d => d.estado === EstadoDocumento.PENDIENTE_COMPRAS).length;

        const docsPorArea = {
            [Area.VENTAS]: docs.length,
            [Area.COMPRAS]: docs.filter(d => d.anexos[Area.COMPRAS].length > 0).length,
            [Area.FACTURACION]: docs.filter(d => d.anexos[Area.FACTURACION].length > 0).length,
            [Area.OPERACIONES]: docs.filter(d => d.anexos[Area.OPERACIONES].length > 0).length,
        };
        
        const distribucionEstados = docs.reduce((acc, doc) => {
            acc[doc.estado] = (acc[doc.estado] || 0) + 1;
            return acc;
        }, {} as Record<EstadoDocumento, number>);

        return { totalDocs, docsCompletados, docsPendientes, estancadosEnVentas, docsPorArea, distribucionEstados };
    }, [documentosFiltrados]);

    const maxDocsEnArea = Math.max(...(Object.values(docsPorArea) as number[]), 1);
    const coloresEstado: Record<EstadoDocumento, string> = {
        [EstadoDocumento.PENDIENTE_COMPRAS]: '#facc15', [EstadoDocumento.PENDIENTE_FACTURACION]: '#fb923c',
        [EstadoDocumento.PENDIENTE_OPERACIONES]: '#60a5fa', [EstadoDocumento.COMPLETADO]: '#34d399',
    };

    const crearGradienteConico = () => {
        if (totalDocs === 0) return 'conic-gradient(#e5e7eb 0% 100%)';
        let gradiente = 'conic-gradient(';
        let porcentajeActual = 0;
        (Object.entries(distribucionEstados) as [EstadoDocumento, number][]).forEach(([estado, contador]) => {
            const porcentaje = (contador / totalDocs) * 100;
            gradiente += `${coloresEstado[estado]} ${porcentajeActual}% ${porcentajeActual + porcentaje}%, `;
            porcentajeActual += porcentaje;
        });
        return gradiente.slice(0, -2) + ')';
    };
    
    return (
        <div className="space-y-8">
            {usuarioLogueado.area === Area.VENTAS && asistentesEnArea.length > 0 && (
                <div>
                    <label htmlFor="assistant-filter" className="block text-sm font-medium text-slate-600 mb-1">Filtrar por Asistente de Ventas</label>
                    <select id="assistant-filter" value={asistenteSeleccionadoId} onChange={e => setAsistenteSeleccionadoId(e.target.value)} className="w-full max-w-xs px-3 py-2 bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-sky-500">
                        <option value="all">Todas las Asistentes</option>
                        {asistentesEnArea.map(a => <option key={a.id} value={a.id}>{a.nombres} {a.apellidos}</option>)}
                    </select>
                </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <TarjetaKpi titulo="Total Documentos" valor={totalDocs} />
                <TarjetaKpi titulo="Completados" valor={docsCompletados} color="text-green-500" />
                <TarjetaKpi titulo="Pendientes" valor={docsPendientes} color="text-yellow-500" />
                <TarjetaKpi titulo="Estancados en Ventas" valor={estancadosEnVentas} color="text-red-500" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                <div className="lg:col-span-3 p-6 bg-white rounded-lg border border-slate-200">
                    <h3 className="text-xl font-bold text-slate-800 mb-4">Documentos Subidos por Área</h3>
                    <div className="space-y-4 pt-2">
                        {(Object.entries(docsPorArea) as [string, number][]).map(([area, contador]) => (
                            <div key={area} className="flex items-center gap-4">
                                <span className="w-28 text-sm font-medium text-slate-600 capitalize">{area}</span>
                                <div className="flex-1 bg-slate-200 rounded-full h-6"><div className="bg-sky-500 h-6 rounded-full text-white text-xs font-bold flex items-center justify-end pr-2" style={{ width: `${(contador / maxDocsEnArea) * 100}%` }}>{contador}</div></div>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="lg:col-span-2 p-6 bg-white rounded-lg border border-slate-200">
                    <h3 className="text-xl font-bold text-slate-800 mb-4">Distribución de Estados</h3>
                    <div className="flex items-center justify-center gap-8">
                        <div className="relative"><div className="w-40 h-40 rounded-full" style={{ background: crearGradienteConico() }}></div><div className="absolute inset-2 bg-white rounded-full flex items-center justify-center"><span className="text-3xl font-bold">{totalDocs}</span></div></div>
                        <ul className="space-y-2 text-sm">
                            {(Object.entries(distribucionEstados) as [EstadoDocumento, number][]).map(([estado, contador]) => (<li key={estado} className="flex items-center gap-2"><span className="w-3 h-3 rounded-full" style={{ backgroundColor: coloresEstado[estado] }}></span><span>{estado}: <strong>{contador}</strong></span></li>))}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

const Reports: React.FC<ReportsProps> = () => {
  const { documentos, cargando: cargandoDocs } = useDocumentos();
  const { usuarios, cargando: cargandoUsuarios } = useUsuarios();
  const { usuario: usuarioLogueado } = useAuth();

  if (cargandoDocs || cargandoUsuarios) {
    return <p className="text-center p-8">Cargando reportes...</p>;
  }

  if (!usuarioLogueado) return null;

  if (documentos.length === 0) {
    return (
      <div className="text-center text-slate-500 p-8 bg-white rounded-lg border border-slate-200">
          <h3 className="text-xl font-bold text-slate-800 mb-2">Panel de Reportería</h3>
          <p>No hay datos disponibles. Registre documentos para generar reportes.</p>
      </div>
    )
  }

  const esSupervisorOAdmin = usuarioLogueado.area === Area.ADMIN || usuarioLogueado.cargo === Cargo.SUPERVISOR;

  return esSupervisorOAdmin
    ? <ReportesAvanzados documentos={documentos} usuarios={usuarios} usuarioLogueado={usuarioLogueado} />
    : <ReportesSimples documentos={documentos} usuarioLogueado={usuarioLogueado} />;
};

const TarjetaKpi: React.FC<{ titulo: string; valor: number; color?: string }> = ({ titulo, valor, color = 'text-slate-800' }) => (
  <div className="p-6 bg-white rounded-lg border border-slate-200">
    <p className="text-sm font-medium text-slate-500">{titulo}</p>
    <p className={`text-4xl font-bold mt-1 ${color}`}>{valor}</p>
  </div>
);

export default Reports;
