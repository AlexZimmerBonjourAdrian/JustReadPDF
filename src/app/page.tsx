'use client';

import { useState } from 'react';
import { DocumentViewer } from '@shahajimbhosle/local-doc-viewer';
import '@shahajimbhosle/local-doc-viewer/style.css';

export default function Home() {
  const [pdfFile, setPdfFile] = useState<File | null>(null);

  const handlePdfUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      alert('Por favor sube un archivo PDF');
      return;
    }

    setPdfFile(file);
  };

  return (
    <div className="min-h-screen bg-gray-900 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">JustReadPDF - PDF Visual Completo</h1>
          <div className="flex items-center gap-4">
            <label className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors cursor-pointer">
              <span>Cargar PDF</span>
              <input
                type="file"
                accept=".pdf"
                onChange={handlePdfUpload}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {pdfFile && (
          <div className="bg-gray-800 rounded-lg overflow-hidden">
            <div className="bg-gray-700 px-4 py-3 border-b border-gray-600">
              <h2 className="text-lg font-semibold text-white">
                {pdfFile.name}
              </h2>
              <p className="text-sm text-gray-300">
                PDF visual completo - Sin pérdida de formato, imágenes o estructura
              </p>
            </div>
            <DocumentViewer
              source={pdfFile}
              height="75vh"
              className="rounded-lg overflow-hidden"
            />
          </div>
        )}

        {!pdfFile && (
          <div className="bg-gray-800 rounded-lg p-8 text-center text-gray-300">
            <p className="text-lg mb-2">Sube un archivo PDF para visualizarlo completo</p>
            <p className="text-sm mb-4">
              El PDF se muestra visualmente sin perder nada: formato, imágenes, tablas, estructura
            </p>
            <div className="text-xs text-gray-400">
              <p>• Visualización 100% fiel al original</p>
              <p>• Zoom, navegación por páginas</p>
              <p>• Modo oscuro integrado</p>
              <p>• Próximamente: extracción de texto por bloques para traducción</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
