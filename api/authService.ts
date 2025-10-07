import { usuariosDB } from './db_usuarios';
import { Usuario } from '../types';

const RETRASO_SIMULADO = 500;

export const servicioAuth = {
  iniciarSesion: (email: string, password: string): Promise<Usuario | null> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const usuario = usuariosDB.find(u => u.email === email && u.password === password);
        if (usuario) {
          // En una API real, nunca devolveríamos el password.
          const { password, ...usuarioSinPassword } = usuario;
          resolve(usuarioSinPassword as Usuario);
        } else {
          resolve(null);
        }
      }, RETRASO_SIMULADO);
    });
  },
};