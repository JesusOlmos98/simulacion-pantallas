'use client';

import type { JSX } from 'react';
import { LuChevronRight } from 'react-icons/lu';
import { resolveText } from './textos/resolverTexto';
import { decodificarVariable, resolverUnidad } from './pantalla-utils';
import { COLORES, resolverColor } from './colors';
import type { DescriptorPantalla } from '../pantalla-types';

// Umbral para distinguir punteros de pantalla (>65535) de índices idUnicoEdicion (<=65535)
const SCREEN_PTR_MIN = 65536;

interface ObjLineaTextVarProps {
  obj: Record<string, unknown>;
  onNavegar: (descriptor: DescriptorPantalla) => void;
  idPantallaActual: number;
  indicePantallaActual: number;
}

export default function ObjLineaTextVar({ obj, onNavegar, idPantallaActual, indicePantallaActual }: ObjLineaTextVarProps): JSX.Element {
  const nav = (obj.valorEditableONav as number | undefined) ?? 0;

  const handleClick = (): void => {
    if (nav <= 0) return;
    if (nav >= SCREEN_PTR_MIN) {
      // Puntero a otra pantalla — indicePantalla lo fija COMMAC en el objeto
      onNavegar({ idPantalla: nav, indicePantalla: (obj.indicePantalla as number | undefined) ?? 0, esPrincipal: false });
    } else {
      // Índice de edición — conservar el indicePantalla de la pantalla actual
      onNavegar({ idPantalla: idPantallaActual, indicePantalla: indicePantallaActual, esPrincipal: false, idUnicoEdicion: nav });
    }
  };

  const texto = resolveText((obj.texto as number | undefined) ?? 0);
  const valor = decodificarVariable((obj.variable as number | undefined) ?? 0, (obj.tipoVar as number | undefined) ?? 0);
  const unidad = resolverUnidad((obj.unidad as number | undefined) ?? 0);

  // Aplicar la misma lógica de colores que ObjLineaText
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

      {/* Valor + unidad + chevron */}
      <div className={`flex items-center gap-2 ${nav === 0 ? 'pr-4' : ''}`}>
        <span
          className="text-5xl "
          style={{ color: inhabilitada ? COLORES.light_gray : COLORES.success }}
        >
          {valor}
          {unidad ?? ''}
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
