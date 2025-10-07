import { Usuario, Area, Cargo } from '../types';

// Simulación de la base de datos para el servicio de Usuarios y Autenticación
export let usuariosDB: Usuario[] = [
  { id: 1, nombres: 'Admin', apellidos: 'Sadda', email: 'admin@gruposadda.com', password: '123', area: Area.ADMIN },
  { id: 2, nombres: 'Juan', apellidos: 'Pérez', email: 'juan.perez@example.com', password: '123', area: Area.COMPRAS, cargo: Cargo.SUPERVISOR },
  { id: 3, nombres: 'María', apellidos: 'Rodríguez', email: 'maria.r@example.com', password: '123', area: Area.VENTAS, cargo: Cargo.ASISTENTE },
  { id: 4, nombres: 'Carlos', apellidos: 'López', email: 'carlos.lopez@example.com', password: '123', area: Area.FACTURACION, cargo: Cargo.SUPERVISOR },
  { id: 5, nombres: 'Ana', apellidos: 'Gomez', email: 'ana.gomez@example.com', password: '123', area: Area.VENTAS, cargo: Cargo.SUPERVISOR },
];