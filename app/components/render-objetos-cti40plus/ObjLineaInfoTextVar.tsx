'use client';

import type { JSX } from 'react';
import { decodificarVariable, resolverTextoPantalla, resolverUnidad } from './pantalla-utils';
import { COLORES, resolverColor } from './colors';
import { resolverIconoCTI40Plus } from './iconos-cti40plus';

interface ObjLineaInfoTextVarProps {
  obj: Record<string, unknown>;
  textoConcatenados?: Map<number, string>;
  responsive?: boolean;
}

const TIPOS_TEXTO = new Set([30, 31, 43]);

export default function ObjLineaInfoTextVar({ obj, textoConcatenados, responsive }: ObjLineaInfoTextVarProps): JSX.Element {
  const tipoVar = (obj.tipoVar as number | undefined) ?? 0;
  const variable = (obj.variable as number | undefined) ?? 0;
  const texto = resolverTextoPantalla((obj.texto as number | undefined) ?? 0, textoConcatenados);
  const unidad = resolverUnidad((obj.unidad as number | undefined) ?? 0);

  const coloresLineaEdit = (obj.coloresLineaEdit as number | undefined) ?? 0;
  const color = coloresLineaEdit === 4 ? COLORES.influences : resolverColor(coloresLineaEdit);

  const Icono = tipoVar === 40 ? resolverIconoCTI40Plus(variable & 0xff) : null;
  const valor = TIPOS_TEXTO.has(tipoVar) ? resolverTextoPantalla(variable & 0xffff, textoConcatenados) : decodificarVariable(variable, tipoVar);
  const iconSize = responsive ? 28 : 75;
  const textSize = responsive ? 'text-lg' : 'text-5xl';
  const leading = responsive ? '' : 'leading-[50px]';

  return (
    <div className={`flex items-center justify-between pl-3 pr-6 rounded-2xl ${responsive ? 'py-3' : 'py-7'}`}>
      <span
        className={`${textSize} font-light ${leading}`}
        style={{ color }}
      >
        {texto}
      </span>
      {Icono ? (
        // eslint-disable-next-line react-hooks/static-components
        <Icono
          size={iconSize}
          color={COLORES.light}
        />
      ) : (
        <span
          className={`${textSize} ${leading}`}
          style={{ color: color }}
        >
          {valor}
          {unidad}
        </span>
      )}
    </div>
  );
}
