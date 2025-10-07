import { documentosDB } from './db_documentos';
import { Documento, Area, EstadoDocumento, RegistroAuditoria, EstadoEntrega } from '../types';

const RETRASO_SIMULADO = 500;

export const servicioDocumentos = {
  obtenerDocumentos: (): Promise<Documento[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Devolvemos una copia para evitar mutaciones directas del "DB"
        resolve(structuredClone(documentosDB));
      }, RETRASO_SIMULADO);
    });
  },

  crearDocumento: (oc: string, archivoPrincipal: File, usuario: {id: number, area: Area}): Promise<Documento> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const nuevoDocumento: Documento = {
          id: Date.now(),
          oc,
          archivoPrincipal,
          fechaCreacion: new Date().toISOString(),
          creadoPor: usuario.id,
          estado: EstadoDocumento.PENDIENTE_COMPRAS,
          anexos: {
            [Area.COMPRAS]: [],
            [Area.FACTURACION]: [],
            [Area.OPERACIONES]: [],
          },
          historial: [
            {
              timestamp: new Date().toISOString(),
              usuarioId: usuario.id,
              area: usuario.area,
              accion: 'Documento Registrado',
              nombreArchivo: archivoPrincipal.name,
            }
          ],
        };
        documentosDB.push(nuevoDocumento);
        resolve(structuredClone(nuevoDocumento));
      }, RETRASO_SIMULADO);
    });
  },

  eliminarDocumento: (docId: number): Promise<boolean> => {
     return new Promise((resolve) => {
      setTimeout(() => {
        const indice = documentosDB.findIndex(d => d.id === docId);
        if (indice > -1) {
          documentosDB.splice(indice, 1);
          resolve(true);
        } else {
          resolve(false);
        }
      }, RETRASO_SIMULADO);
    });
  },

  agregarAnexo: (oc: string, area: Area.COMPRAS | Area.FACTURACION | Area.OPERACIONES, archivo: File, usuario: {id: number, area: Area}, esNuevaVersion: boolean): Promise<Documento | null> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const docIndice = documentosDB.findIndex(d => d.oc === oc);
            if (docIndice > -1) {
                const doc = documentosDB[docIndice];
                doc.anexos[area].push(archivo);

                // Avanzar el estado solo si es la primera vez que se anexa en esta área
                if (!esNuevaVersion) {
                    if (area === Area.COMPRAS) doc.estado = EstadoDocumento.PENDIENTE_FACTURACION;
                    else if (area === Area.FACTURACION) doc.estado = EstadoDocumento.PENDIENTE_OPERACIONES;
                    else if (area === Area.OPERACIONES) doc.estado = EstadoDocumento.COMPLETADO;
                }

                const nuevoHistorial: RegistroAuditoria = {
                    timestamp: new Date().toISOString(),
                    usuarioId: usuario.id,
                    area: usuario.area,
                    accion: esNuevaVersion ? 'Nueva Versión Anexada' : 'Anexo Agregado',
                    nombreArchivo: archivo.name,
                };
                doc.historial.push(nuevoHistorial);

                documentosDB[docIndice] = doc;
                resolve(structuredClone(doc));
            } else {
                resolve(null);
            }
        }, RETRASO_SIMULADO);
    });
  },

  eliminarAnexo: (oc: string, area: Area.COMPRAS | Area.FACTURACION | Area.OPERACIONES, archivoAEliminar: File, usuario: {id: number, area: Area}): Promise<Documento | null> => {
      return new Promise((resolve) => {
          setTimeout(() => {
              const docIndice = documentosDB.findIndex(d => d.oc === oc);
              if (docIndice > -1) {
                  const doc = documentosDB[docIndice];
                  doc.anexos[area] = doc.anexos[area].filter(f => f.name !== archivoAEliminar.name);

                  const nuevoHistorial: RegistroAuditoria = {
                      timestamp: new Date().toISOString(),
                      usuarioId: usuario.id,
                      area: usuario.area,
                      accion: 'Anexo Eliminado',
                      nombreArchivo: archivoAEliminar.name,
                  };
                  doc.historial.push(nuevoHistorial);
                  
                  documentosDB[docIndice] = doc;
                  resolve(structuredClone(doc));
              } else {
                  resolve(null);
              }
          }, RETRASO_SIMULADO);
      });
  },
  
  actualizarEstadoEntrega: (oc: string, estado: EstadoEntrega, usuario: {id: number, area: Area}): Promise<Documento | null> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const docIndice = documentosDB.findIndex(d => d.oc === oc);
            if (docIndice > -1) {
                const doc = documentosDB[docIndice];
                doc.estadoEntrega = estado;

                const nuevoHistorial: RegistroAuditoria = {
                    timestamp: new Date().toISOString(),
                    usuarioId: usuario.id,
                    area: usuario.area,
                    accion: `Estado de entrega actualizado a: ${estado}`,
                    nombreArchivo: '-',
                };
                doc.historial.push(nuevoHistorial);
                
                documentosDB[docIndice] = doc;
                resolve(structuredClone(doc));
            } else {
                resolve(null);
            }
        }, RETRASO_SIMULADO);
    });
  },

};