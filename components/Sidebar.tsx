import React, { useMemo } from 'react';
import { Vista, Area } from '../types';
import { useUI } from '../context/UIContext';
import { useAuth } from '../context/AuthContext';
import DocumentPlusIcon from './icons/DocumentPlusIcon';
import DocumentAttachIcon from './icons/DocumentAttachIcon';
import UsersIcon from './icons/UsersIcon';
import ClipboardListIcon from './icons/ClipboardListIcon';
import MagnifyingGlassIcon from './icons/MagnifyingGlassIcon';
import ChartBarIcon from './icons/ChartBarIcon';
import HistoryIcon from './icons/HistoryIcon';

const itemsNavegacion = [
    { id: 'registrar', label: 'Registrar Documento', icon: DocumentPlusIcon },
    { id: 'anexar', label: 'Anexar Documento', icon: DocumentAttachIcon },
    { id: 'seguimiento', label: 'Tracking Documentario', icon: ClipboardListIcon },
    { id: 'busqueda', label: 'Búsqueda', icon: MagnifyingGlassIcon },
    { id: 'reportes', label: 'Reportería', icon: ChartBarIcon },
    { id: 'auditoria', label: 'Auditoría', icon: HistoryIcon },
    { id: 'usuarios', label: 'Usuarios', icon: UsersIcon },
];

const Sidebar: React.FC = () => {
  const { vistaActual, setVistaActual } = useUI();
  const { usuario: usuarioLogueado } = useAuth();
  
  const itemsNavegacionVisibles = useMemo(() => {
    if (!usuarioLogueado) return [];
    if (usuarioLogueado.area === Area.ADMIN) return itemsNavegacion;

    return itemsNavegacion.filter(item => {
        const { area } = usuarioLogueado;
        switch (item.id) {
            case 'registrar':
                return area === Area.VENTAS;
            case 'anexar':
                return [Area.COMPRAS, Area.FACTURACION, Area.OPERACIONES].includes(area);
            case 'usuarios':
                return false;
            default:
                // seguimiento, busqueda, reportes, auditoria son visibles para todos
                return true;
        }
    });
  }, [usuarioLogueado]);

  return (
    <aside className="w-64 flex-shrink-0 bg-white border-r border-slate-200 flex flex-col">
      <div className="h-20 flex items-center px-6 border-b border-slate-200">
        <h1 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-500 to-emerald-500">
          Gestor Documentario
        </h1>
      </div>
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {itemsNavegacionVisibles.map(item => {
            const esActivo = vistaActual === item.id;
            const Icono = item.icon;
            return (
              <li key={item.id}>
                <button
                  onClick={() => setVistaActual(item.id as Vista)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left text-sm font-medium transition-colors duration-200 ${
                    esActivo
                      ? 'bg-sky-100 text-sky-700'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                  aria-current={esActivo ? 'page' : undefined}
                >
                  <Icono className="w-6 h-6" />
                  <span>{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;