'use client';

import type { JSX } from 'react';
import { LuChevronRight } from 'react-icons/lu';
import { decodificarVariable, resolverTextoPantalla, resolverUnidad } from './pantalla-utils';
import { COLORES, resolverColor } from './colors';
import { resolverIconoVariableCTI40Plus } from './iconos-cti40plus';
import type { DescriptorPantalla } from '../pantalla-types';

// Umbral para distinguir punteros de pantalla (>65535) de índices idUnicoEdicion (<=65535)
const SCREEN_PTR_MIN = 65536;

interface ObjLineaTextVarProps {
  obj: Record<string, unknown>;
  onNavegar: (descriptor: DescriptorPantalla) => void;
  idPantallaActual: number;
  indicePantallaActual: number;
  textoConcatenados?: Map<number, string>;
  responsive?: boolean;
  lang?: string;
}

const TIPOS_TEXTO = new Set([30, 31, 43]);

export default function ObjLineaTextVar({ obj, onNavegar, idPantallaActual, indicePantallaActual, textoConcatenados, responsive, lang }: ObjLineaTextVarProps): JSX.Element {
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

  const tipoVar = (obj.tipoVar as number | undefined) ?? 0;
  const variable = (obj.variable as number | undefined) ?? 0;
  const texto = resolverTextoPantalla((obj.texto as number | undefined) ?? 0, textoConcatenados, lang);
  const IconoValor = tipoVar === 40 ? resolverIconoVariableCTI40Plus(variable) : null;
  const valor = TIPOS_TEXTO.has(tipoVar) ? resolverTextoPantalla(variable & 0xffff, textoConcatenados, lang) : decodificarVariable(variable, tipoVar);
  const unidad = resolverUnidad((obj.unidad as number | undefined) ?? 0);

  // Aplicar la misma lógica de colores que ObjLineaText
  const coloresLineaEdit = (obj.coloresLineaEdit as number | undefined) ?? 0;
  const colorTexto = resolverColor(coloresLineaEdit);
  const inhabilitada = coloresLineaEdit === 15;

  return (
    <div
      className={`flex items-center justify-between cursor-pointer hover:bg-white/5 transition-colors ${responsive === true ? 'px-4 py-3' : 'px-3 py-7'}`}
      onClick={handleClick}
    >
      {/* Texto etiqueta */}
      <span
        className={`font-light ${responsive === true ? 'text-lg' : 'text-5xl'}`}
        style={{ color: inhabilitada ? COLORES.disabled : colorTexto }}
      >
        {texto}
      </span>

      {/* Valor + unidad + chevron */}
      <div className={`flex items-center gap-2 ${nav === 0 ? 'pr-4' : ''}`}>
        {IconoValor ? (
          // eslint-disable-next-line react-hooks/static-components
          <IconoValor
            size={responsive === true ? 24 : 56}
            color={COLORES.light}
          />
        ) : (
          <span
            className={responsive === true ? 'text-lg' : 'text-5xl'}
            style={{ color: inhabilitada ? COLORES.disabled : coloresLineaEdit === 1 ? COLORES.success : colorTexto }}
          >
            {valor}
            {unidad ?? ''}
          </span>
        )}

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
