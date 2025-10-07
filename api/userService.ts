import { usuariosDB } from './db_usuarios';
import { Usuario } from '../types';

const RETRASO_SIMULADO = 500;

export const servicioUsuarios = {
  obtenerUsuarios: (): Promise<Usuario[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Excluimos las contraseñas
        resolve(usuariosDB.map(({ password, ...user }) => user) as Usuario[]);
      }, RETRASO_SIMULADO);
    });
  },

  crearUsuario: (datosUsuario: Omit<Usuario, 'id'>): Promise<Usuario> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const nuevoUsuario: Usuario = { ...datosUsuario, id: Date.now() };
        usuariosDB.push(nuevoUsuario);
        const { password, ...usuarioSinPassword } = nuevoUsuario;
        resolve(usuarioSinPassword as Usuario);
      }, RETRASO_SIMULADO);
    });
  },

  actualizarUsuario: (usuarioActualizado: Usuario): Promise<Usuario> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const indice = usuariosDB.findIndex(u => u.id === usuarioActualizado.id);
        if (indice !== -1) {
          // Mantener la contraseña existente si no se proporciona una nueva
          if (!usuarioActualizado.password) {
            usuarioActualizado.password = usuariosDB[indice].password;
          }
          usuariosDB[indice] = { ...usuariosDB[indice], ...usuarioActualizado };
          const { password, ...usuarioSinPassword } = usuariosDB[indice];
          resolve(usuarioSinPassword as Usuario);
        } else {
          // En una API real, esto sería un error 404
          resolve(usuarioActualizado); 
        }
      }, RETRASO_SIMULADO);
    });
  },

  eliminarUsuario: (usuarioId: number): Promise<boolean> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const indice = usuariosDB.findIndex(u => u.id === usuarioId);
        if (indice > -1) {
          usuariosDB.splice(indice, 1);
          resolve(true);
        } else {
          resolve(false);
        }
      }, RETRASO_SIMULADO);
    });
  },
};