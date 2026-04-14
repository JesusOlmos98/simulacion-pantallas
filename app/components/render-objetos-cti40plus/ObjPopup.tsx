'use client';

import { useState } from 'react';
import type { JSX } from 'react';
import { resolveText } from './textos/resolverTexto';
import { COLORES } from './colors';

interface ObjPopupProps {
  obj: Record<string, unknown>;
}

export default function ObjPopup({ obj }: ObjPopupProps): JSX.Element {
  const [isVisible, setIsVisible] = useState(true);

  const tituloId = (obj.titulo as number | undefined) ?? 0;
  const mensajeId = (obj.mensaje as number | undefined) ?? 0;
  const botonId = (obj.boton as number | undefined) ?? 0;

  const titulo = resolveText(tituloId);
  const mensaje = resolveText(mensajeId);
  const boton = resolveText(botonId);

  const handleAceptar = (): void => {
    setIsVisible(false);
  };

  if (!isVisible) {
    return <></>;
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div
        className="rounded-lg overflow-hidden max-w-md w-full mx-4 transition-colors"
        style={{ backgroundColor: '#1E1E1E' }}
      >
        {/* Header con título */}
        <div
          className="px-6 py-4"
          style={{ backgroundColor: COLORES.primary }}
        >
          <h2
            className="text-xl font-bold text-center"
            style={{ color: COLORES.light }}
          >
            {titulo}
          </h2>
        </div>

        {/* Contenido del mensaje */}
        <div className="px-6 py-6">
          <p
            className="text-left text-lg leading-relaxed"
            style={{ color: COLORES.light }}
          >
            {mensaje}
          </p>
        </div>

        {/* Botón */}
        <div className="px-6 pb-6">
          <button
            onClick={handleAceptar}
            className="w-full font-medium py-3 px-8 rounded-lg transition-colors text-lg"
            style={{ color: COLORES.light, backgroundColor: COLORES.tertiary }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = COLORES.quaternary;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = COLORES.tertiary;
            }}
          >
            {boton}
          </button>
        </div>
      </div>
    </div>
  );
}
