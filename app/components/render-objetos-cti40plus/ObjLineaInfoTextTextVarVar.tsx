'use client';

import type { JSX } from 'react';
import { resolverTexto, resolverUnidad, decodificarVariable } from './pantalla-utils';
import { COLORES, resolverColor } from './colors';

interface ObjLineaInfoTextTextVarVarProps {
  obj: Record<string, unknown>;
}

export default function ObjLineaInfoTextTextVarVar({ obj }: ObjLineaInfoTextTextVarVarProps): JSX.Element {
  const texto = resolverTexto((obj.texto as number | undefined) ?? 0);

  const tipoVar1 = (obj.tipoVar1 as number | undefined) ?? 0;
  const var1Raw = tipoVar1 === 31
    ? resolverTexto(((obj.variable1 as number | undefined) ?? 0) & 0xffff)
    : decodificarVariable((obj.variable1 as number | undefined) ?? 0, tipoVar1);
  // En el firmware CTI40+ las etiquetas textG0…textGN (IDs 254…) son sondas S0…SN
  const var1 = var1Raw.replace(/^G (\d+)$/, 'S$1');

  const var2 = decodificarVariable((obj.variable2 as number | undefined) ?? 0, (obj.tipoVar2 as number | undefined) ?? 0);
  const unidad2 = resolverUnidad((obj.unidad2 as number | undefined) ?? 0);

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

      <div className="flex items-center gap-6">
        <span
          className="text-5xl leading-[50px]"
          style={{ color: COLORES.light }}
        >
          {var1}
        </span>
        <span
          className="text-5xl leading-[50px]"
          style={{ color: COLORES.light }}
        >
          {var2}{unidad2}
        </span>
      </div>
    </div>
  );
}
