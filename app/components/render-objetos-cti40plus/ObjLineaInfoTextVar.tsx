'use client';

import type { JSX } from 'react';
import { resolveText } from './textos/resolverTexto';
import { decodificarVariable, resolverUnidad } from './pantalla-utils';
import { COLORES, resolverColor } from './colors';
import { resolverIconoCTI40Plus } from './iconos-cti40plus';

interface ObjLineaInfoTextVarProps {
  obj: Record<string, unknown>;
}

const ICON_SIZE = 75;

export default function ObjLineaInfoTextVar({ obj }: ObjLineaInfoTextVarProps): JSX.Element {
  const tipoVar = (obj.tipoVar as number | undefined) ?? 0;
  const variable = (obj.variable as number | undefined) ?? 0;
  const texto = resolveText((obj.texto as number | undefined) ?? 0);
  const unidad = resolverUnidad((obj.unidad as number | undefined) ?? 0);

  const coloresLineaEdit = (obj.coloresLineaEdit as number | undefined) ?? 0;
  const color = coloresLineaEdit === 4 ? COLORES.influences : resolverColor(coloresLineaEdit);

  const Icono = tipoVar === 40 ? resolverIconoCTI40Plus(variable & 0xff) : null;

  return (
    <div className="flex items-center justify-between pl-3 pr-6 py-7 rounded-2xl">
      <span
        className="text-5xl font-light leading-[50px]"
        style={{ color }}
      >
        {texto}
      </span>
      {Icono ? (
        <Icono size={ICON_SIZE} />
      ) : (
        <span
          className="text-5xl leading-[50px]"
          style={{ color: color }}
        >
          {decodificarVariable(variable, tipoVar)}
          {unidad}
        </span>
      )}
    </div>
  );
}
