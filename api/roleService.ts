import { rolesDB } from './db_roles';
import { Rol } from '../types';

const RETRASO_SIMULADO = 500;

export const servicioRoles = {
  obtenerRoles: (): Promise<Rol[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([...rolesDB]);
      }, RETRASO_SIMULADO);
    });
  },

  crearRol: (datosRol: Omit<Rol, 'id'>): Promise<Rol> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const nuevoRol: Rol = { ...datosRol, id: Date.now() };
        rolesDB.push(nuevoRol);
        resolve(nuevoRol);
      }, RETRASO_SIMULADO);
    });
  },

  actualizarRol: (rolActualizado: Rol): Promise<Rol> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const indice = rolesDB.findIndex(r => r.id === rolActualizado.id);
        if (indice !== -1) {
          rolesDB[indice] = rolActualizado;
          resolve(rolActualizado);
        } else {
          resolve(rolActualizado); 
        }
      }, RETRASO_SIMULADO);
    });
  },

  eliminarRol: (rolId: number): Promise<boolean> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const indice = rolesDB.findIndex(r => r.id === rolId);
        if (indice > -1) {
          rolesDB.splice(indice, 1);
          resolve(true);
        } else {
          resolve(false);
        }
      }, RETRASO_SIMULADO);
    });
  },
};