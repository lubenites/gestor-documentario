import React, { useEffect, useState } from 'react';

interface FilePreviewModalProps {
  archivo: File;
  onClose: () => void;
}

const IconoX = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
);


const FilePreviewModal: React.FC<FilePreviewModalProps> = ({ archivo, onClose }) => {
  const [urlArchivo, setUrlArchivo] = useState<string | null>(null);

  useEffect(() => {
    const url = URL.createObjectURL(archivo);
    setUrlArchivo(url);

    return () => {
      URL.revokeObjectURL(url);
      setUrlArchivo(null);
    };
  }, [archivo]);

  const renderizarPrevisualizacion = () => {
    if (!urlArchivo) {
      return <p>Cargando vista previa...</p>;
    }

    if (archivo.type.startsWith('image/')) {
      return <img src={urlArchivo} alt={archivo.name} className="max-w-full max-h-full object-contain" />;
    }

    if (archivo.type === 'application/pdf') {
      return <iframe src={urlArchivo} className="w-full h-full" title={archivo.name} />;
    }

    // Fallback para otros tipos de archivo
    return (
      <div className="text-center p-8 bg-slate-100 rounded-lg">
        <h3 className="text-lg font-bold mb-2">{archivo.name}</h3>
        <p className="text-slate-600 mb-4">La vista previa no está disponible para este tipo de archivo.</p>
        <a
          href={urlArchivo}
          download={archivo.name}
          className="inline-block px-6 py-2 bg-sky-600 text-white font-semibold rounded-md hover:bg-sky-700 transition"
        >
          Descargar
        </a>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl w-full h-full max-w-4xl max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <header className="flex items-center justify-between p-4 border-b border-slate-200">
          <h2 className="text-lg font-bold text-slate-800 truncate" title={archivo.name}>{archivo.name}</h2>
          <button onClick={onClose} className="p-2 text-slate-500 hover:text-red-600 rounded-full hover:bg-slate-100">
            <IconoX className="w-6 h-6" />
          </button>
        </header>
        <main className="flex-1 p-4 flex items-center justify-center overflow-auto">
          {renderizarPrevisualizacion()}
        </main>
      </div>
    </div>
  );
};

export default FilePreviewModal;
