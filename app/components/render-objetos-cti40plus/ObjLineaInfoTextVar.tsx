'use client';

import type { JSX } from 'react';
import { resolveText } from './textos/resolverTexto';
import { decodificarVariable, resolverUnidad } from './pantalla-utils';
import { COLORES, resolverColor } from './colors';
import { resolverIconoCTI40Plus } from './iconos-cti40plus';

interface ObjLineaInfoTextVarProps {
  obj: Record<string, unknown>;
  responsive?: boolean;
}

export default function ObjLineaInfoTextVar({ obj, responsive }: ObjLineaInfoTextVarProps): JSX.Element {
  const tipoVar = (obj.tipoVar as number | undefined) ?? 0;
  const variable = (obj.variable as number | undefined) ?? 0;
  const texto = resolveText((obj.texto as number | undefined) ?? 0);
  const unidad = resolverUnidad((obj.unidad as number | undefined) ?? 0);

  const coloresLineaEdit = (obj.coloresLineaEdit as number | undefined) ?? 0;
  const color = coloresLineaEdit === 4 ? COLORES.influences : resolverColor(coloresLineaEdit);

  const Icono = tipoVar === 40 ? resolverIconoCTI40Plus(variable & 0xff) : null;
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
        <Icono size={iconSize} />
      ) : (
        <span
          className={`${textSize} ${leading}`}
          style={{ color: color }}
        >
          {decodificarVariable(variable, tipoVar)}
          {unidad}
        </span>
      )}
    </div>
  );
}
