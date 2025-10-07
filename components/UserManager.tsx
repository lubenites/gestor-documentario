import React, { useState } from 'react';
import { Usuario, Area, Cargo } from '../types';
import { TODAS_LAS_AREAS } from '../constants';
import { useUsuarios } from '../context/UserContext';
import AreaBadge from './AreaBadge';
import PlusIcon from './icons/PlusIcon';
import EditIcon from './icons/EditIcon';
import TrashIcon from './icons/TrashIcon';

interface UserManagerProps {}

const etiquetasArea: Record<Area, string> = {
    [Area.VENTAS]: 'Ventas',
    [Area.COMPRAS]: 'Compras',
    [Area.FACTURACION]: 'Facturación',
    [Area.OPERACIONES]: 'Operaciones',
    [Area.ADMIN]: 'Administrador',
};

const UserManager: React.FC<UserManagerProps> = () => {
  const { usuarios, agregarUsuario, actualizarUsuario, eliminarUsuario, cargando } = useUsuarios();
  const [modalAbierto, setModalAbierto] = useState(false);
  const [usuarioEditando, setUsuarioEditando] = useState<Usuario | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [datosFormulario, setDatosFormulario] = useState({
    nombres: '',
    apellidos: '',
    email: '',
    password: '',
    area: Area.VENTAS,
    cargo: Cargo.ASISTENTE,
  });

  const abrirModal = (usuario: Usuario | null = null) => {
    setUsuarioEditando(usuario);
    if (usuario) {
        setDatosFormulario({
            nombres: usuario.nombres,
            apellidos: usuario.apellidos,
            email: usuario.email,
            password: '',
            area: usuario.area,
            cargo: usuario.cargo || Cargo.ASISTENTE,
        });
    } else {
        setDatosFormulario({
            nombres: '',
            apellidos: '',
            email: '',
            password: '',
            area: Area.VENTAS,
            cargo: Cargo.ASISTENTE,
        });
    }
    setModalAbierto(true);
  };
  
  const cerrarModal = () => {
    setModalAbierto(false);
    setUsuarioEditando(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setDatosFormulario(prev => {
        const nuevoEstado = { ...prev, [name]: value };
        if (name === 'area') {
            if (value === Area.ADMIN) {
                const { cargo, ...resto } = nuevoEstado;
                return resto as typeof datosFormulario;
            } else if (prev.area === Area.ADMIN) {
                nuevoEstado.cargo = Cargo.ASISTENTE;
            }
        }
        return nuevoEstado;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (datosFormulario.nombres.trim() === '' || datosFormulario.apellidos.trim() === '' || datosFormulario.email.trim() === '') return;
    if (!usuarioEditando && datosFormulario.password.trim() === '') {
        alert('La contraseña es obligatoria para nuevos usuarios.');
        return;
    };

    setEnviando(true);
    const datosUsuario: Omit<Usuario, 'id' | 'password'> & { password?: string, cargo?: Cargo } = {
        nombres: datosFormulario.nombres,
        apellidos: datosFormulario.apellidos,
        email: datosFormulario.email,
        area: datosFormulario.area as Area,
    };
    
    if (datosFormulario.password.trim() !== '') {
        datosUsuario.password = datosFormulario.password;
    }

    if (datosFormulario.area !== Area.ADMIN) {
        datosUsuario.cargo = datosFormulario.cargo as Cargo;
    }

    if (usuarioEditando) {
      await actualizarUsuario({ ...usuarioEditando, ...datosUsuario });
    } else {
      await agregarUsuario(datosUsuario as Omit<Usuario, 'id'>);
    }
    setEnviando(false);
    cerrarModal();
  };
  
  if (cargando) {
      return <p className="text-center p-8 text-slate-500">Cargando usuarios...</p>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-2xl font-bold text-slate-800">Listado de Usuarios</h3>
        <button onClick={() => abrirModal()} className="flex items-center justify-center px-4 py-2 bg-sky-600 text-white font-semibold rounded-md hover:bg-sky-700 transition">
          <PlusIcon className="w-5 h-5 mr-2" />
          Agregar Usuario
        </button>
      </div>
      
      <div className="bg-white rounded-lg border border-slate-200 overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200 text-sm text-slate-600">
            <tr>
              <th className="p-4">Nombre</th>
              <th className="p-4">Email</th>
              <th className="p-4">Área</th>
              <th className="p-4">Cargo</th>
              <th className="p-4">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {usuarios.map(usuario => (
              <tr key={usuario.id} className="hover:bg-slate-50">
                <td className="p-4 font-medium text-slate-800">{usuario.nombres} {usuario.apellidos}</td>
                <td className="p-4 text-slate-600">{usuario.email}</td>
                <td className="p-4"><AreaBadge area={usuario.area} /></td>
                <td className="p-4 capitalize text-slate-600">{usuario.cargo || 'N/A'}</td>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <button onClick={() => abrirModal(usuario)} className="p-2 text-slate-500 hover:text-sky-600"><EditIcon className="w-5 h-5" /></button>
                    <button onClick={() => eliminarUsuario(usuario.id)} className="p-2 text-slate-500 hover:text-red-600"><TrashIcon className="w-5 h-5" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modalAbierto && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-6">{usuarioEditando ? 'Editar Usuario' : 'Agregar Usuario'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="nombres" className="block text-sm font-medium text-slate-600 mb-1">Nombre</label>
                <input id="nombres" name="nombres" type="text" value={datosFormulario.nombres} onChange={handleChange} required className="w-full px-4 py-2 bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-sky-500"/>
              </div>
               <div>
                <label htmlFor="apellidos" className="block text-sm font-medium text-slate-600 mb-1">Apellido</label>
                <input id="apellidos" name="apellidos" type="text" value={datosFormulario.apellidos} onChange={handleChange} required className="w-full px-4 py-2 bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-sky-500"/>
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-600 mb-1">Email</label>
                <input id="email" name="email" type="email" value={datosFormulario.email} onChange={handleChange} required className="w-full px-4 py-2 bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-sky-500"/>
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-slate-600 mb-1">Contraseña</label>
                <input id="password" name="password" type="password" value={datosFormulario.password} onChange={handleChange} placeholder={usuarioEditando ? 'Dejar en blanco para no cambiar' : ''} required={!usuarioEditando} className="w-full px-4 py-2 bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-sky-500"/>
              </div>
              <div>
                <label htmlFor="area" className="block text-sm font-medium text-slate-600 mb-1">Área</label>
                <select id="area" name="area" value={datosFormulario.area} onChange={handleChange} className="w-full px-4 py-2 bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-sky-500">
                  {TODAS_LAS_AREAS.map(a => <option key={a} value={a}>{etiquetasArea[a]}</option>)}
                </select>
              </div>
              {datosFormulario.area !== Area.ADMIN && (
                 <div>
                    <label htmlFor="cargo" className="block text-sm font-medium text-slate-600 mb-1">Cargo</label>
                    <select id="cargo" name="cargo" value={datosFormulario.cargo} onChange={handleChange} className="w-full px-4 py-2 bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-sky-500">
                        <option value={Cargo.SUPERVISOR}>Supervisor</option>
                        <option value={Cargo.ASISTENTE}>Asistente</option>
                    </select>
                 </div>
              )}
              <div className="flex justify-end gap-4 pt-4">
                <button type="button" onClick={cerrarModal} className="px-4 py-2 bg-slate-200 text-slate-800 font-semibold rounded-md hover:bg-slate-300">Cancelar</button>
                <button type="submit" disabled={enviando} className="px-4 py-2 bg-sky-600 text-white font-semibold rounded-md hover:bg-sky-700 disabled:bg-sky-400">
                  {enviando ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManager;