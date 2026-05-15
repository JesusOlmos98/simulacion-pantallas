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
  indicePantallaActual: number;
  responsive?: boolean;
  lang?: string;
}

export default function ObjLineaTextString({ obj, onNavegar, idPantallaActual, indicePantallaActual, responsive, lang }: ObjLineaTextStringProps): JSX.Element {
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

  const texto = resolveText((obj.texto as number | undefined) ?? 0, lang);
  const valor = decodificarStringVariable(obj.variable);

  // Aplicar la misma lógica de colores que ObjLineaTextVar
  const coloresLineaEdit = (obj.coloresLineaEdit as number | undefined) ?? 0;
  const colorTexto = resolverColor(coloresLineaEdit);
  const inhabilitada = coloresLineaEdit === 15;

  const textSize = responsive === true ? 'text-lg' : 'text-5xl';

  return (
    <div
      className={`flex items-center justify-between cursor-pointer hover:bg-white/5 transition-colors ${responsive === true ? 'px-4 py-3' : 'px-3 py-7'}`}
      onClick={handleClick}
    >
      {/* Texto etiqueta */}
      <span
        className={`${textSize} font-light`}
        style={{ color: inhabilitada ? COLORES.disabled : colorTexto }}
      >
        {texto}
      </span>

      {/* Valor + chevron */}
      <div className={`flex items-center gap-2 ${nav === 0 ? 'pr-4' : ''}`}>
        <span
          className={`${textSize} break-words`}
          style={{ color: inhabilitada ? COLORES.disabled : COLORES.success }}
        >
          {valor}
        </span>

        {nav > 0 && (
          <LuChevronRight
            size={responsive === true ? 20 : 50}
            color={COLORES.light}
          />
        )}
      </div>
    </div>
  );
}
