'use client';

import { useState } from 'react';
import type { JSX } from 'react';
import { LuX } from 'react-icons/lu';
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
  const mostrarBoton = botonId !== 0;

  const handleCerrar = (): void => {
    setIsVisible(false);
  };

  if (!isVisible) {
    return <></>;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div
        className="mx-4 w-full max-w-md overflow-hidden rounded-lg transition-colors"
        style={{ backgroundColor: '#1E1E1E' }}
      >
        {/* Header con título */}
        <div
          className="flex items-center gap-3 px-6 py-4"
          style={{ backgroundColor: COLORES.primary }}
        >
          <button
            onClick={handleCerrar}
            className="shrink-0 text-white transition-colors hover:text-gray-200"
            aria-label="Cerrar"
          >
            <LuX size={28} />
          </button>
          <h2
            className="flex-1 text-center text-xl font-bold"
            style={{ color: COLORES.light }}
          >
            {titulo}
          </h2>
          <div
            className="shrink-0"
            style={{ width: 28 }}
          />
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
        {mostrarBoton && (
          <div className="px-6 pb-6">
            <button
              onClick={handleCerrar}
              className="w-full rounded-lg px-8 py-3 text-lg font-medium transition-colors"
              style={{ color: COLORES.light, backgroundColor: COLORES.tertiary }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = COLORES.disabled;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = COLORES.tertiary;
              }}
            >
              {boton}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
