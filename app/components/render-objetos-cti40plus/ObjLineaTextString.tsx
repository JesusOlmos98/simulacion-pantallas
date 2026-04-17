'use client';

import type { JSX } from 'react';
import { LuChevronRight } from 'react-icons/lu';
import { resolveText } from './textos/resolverTexto';
import { decodificarStringVariable } from './pantalla-utils';
import { COLORES, resolverColor } from './colors';
import type { DescriptorPantalla } from '../pantalla-types';

// Umbral para distinguir punteros de pantalla (>65535) de índices idUnicoEdicion (<=65535)
const SCREEN_PTR_MIN = 65536;

interface ObjLineaTextStringProps {
  obj: Record<string, unknown>;
  onNavegar: (descriptor: DescriptorPantalla) => void;
  idPantallaActual: number;
}

export default function ObjLineaTextString({ obj, onNavegar, idPantallaActual }: ObjLineaTextStringProps): JSX.Element {
  const nav = (obj.valorEditableONav as number | undefined) ?? 0;

  const handleClick = (): void => {
    if (nav <= 0) return;
    if (nav >= SCREEN_PTR_MIN) {
      // Puntero a otra pantalla
      onNavegar({ idPantalla: nav, indicePantalla: (obj.indicePantalla as number | undefined) ?? 0, esPrincipal: false });
    } else {
      // Índice de edición — misma pantalla con idUnicoEdicion
      onNavegar({ idPantalla: idPantallaActual, indicePantalla: (obj.indicePantalla as number | undefined) ?? 0, esPrincipal: false, idUnicoEdicion: nav });
    }
  };

  const texto = resolveText((obj.texto as number | undefined) ?? 0);
  const valor = decodificarStringVariable(obj.variable);

  // Aplicar la misma lógica de colores que ObjLineaTextVar
  const coloresLineaEdit = (obj.coloresLineaEdit as number | undefined) ?? 0;
  const colorTexto = resolverColor(coloresLineaEdit);
  const inhabilitada = coloresLineaEdit === 15;

  return (
    <div
      className="flex items-center justify-between px-3 py-7 cursor-pointer hover:bg-white/5 transition-colors"
      onClick={handleClick}
    >
      {/* Texto etiqueta */}
      <span
        className="text-5xl font-light"
        style={{ color: inhabilitada ? COLORES.light_gray : colorTexto }}
      >
        {texto}
      </span>

      {/* Valor + chevron */}
      <div className={`flex items-center gap-2 ${nav === 0 ? 'pr-4' : ''}`}>
        <span
          className="text-5xl break-words"
          style={{ color: inhabilitada ? COLORES.light_gray : COLORES.success }}
        >
          {valor}
        </span>

        {nav > 0 && (
          <LuChevronRight
            size={50}
            color={COLORES.light}
          />
        )}
      </div>
    </div>
  );
}
