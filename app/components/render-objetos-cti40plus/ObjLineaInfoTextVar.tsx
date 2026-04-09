'use client';

import type { JSX } from 'react';
import { resolverTexto, resolverUnidad, decodificarVariable } from './pantalla-utils';
import { COLORES, resolverColor } from './colors';

interface ObjLineaInfoTextVarProps {
  obj: Record<string, unknown>;
}

export default function ObjLineaInfoTextVar({ obj }: ObjLineaInfoTextVarProps): JSX.Element {
  const texto = resolverTexto((obj.texto as number | undefined) ?? 0);
  const valor = decodificarVariable((obj.variable as number | undefined) ?? 0, (obj.tipoVar as number | undefined) ?? 0);
  const unidad = resolverUnidad((obj.unidad as number | undefined) ?? 0);

  const coloresLineaEdit = (obj.coloresLineaEdit as number | undefined) ?? 0;
  const color = resolverColor(coloresLineaEdit);

  return (
    <div className="flex items-center justify-between pl-3 pr-6 py-7 rounded-2xl">
      <span
        className="text-5xl font-light leading-[50px]"
        style={{ color }}
      >
        {texto}
      </span>
      <span
        className="text-5xl leading-[50px]"
        style={{ color: COLORES.light }}
      >
        {valor}
        {unidad}
      </span>
    </div>
  );
}
