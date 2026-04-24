'use client';

import type { JSX } from 'react';
import { resolveText } from './textos/resolverTexto';
import { resolverUnidad, decodificarVariable } from './pantalla-utils';
import { COLORES, resolverColor } from './colors';

interface ObjLineaInfoTextTextVarVarProps {
  obj: Record<string, unknown>;
  responsive?: boolean;
}

export default function ObjLineaInfoTextTextVarVar({ obj, responsive }: ObjLineaInfoTextTextVarVarProps): JSX.Element {
  const texto = resolveText((obj.texto as number | undefined) ?? 0);

  const tipoVar1 = (obj.tipoVar1 as number | undefined) ?? 0;
  const var1Raw = tipoVar1 === 31 ? resolveText(((obj.variable1 as number | undefined) ?? 0) & 0xffff) : decodificarVariable((obj.variable1 as number | undefined) ?? 0, tipoVar1);
  // En el firmware CTI40+ las etiquetas textG0…textGN (IDs 254…) son sondas S0…SN
  const var1 = var1Raw.replace(/^G (\d+)$/, 'S$1');

  const var2 = decodificarVariable((obj.variable2 as number | undefined) ?? 0, (obj.tipoVar2 as number | undefined) ?? 0);
  const unidad2 = resolverUnidad((obj.unidad2 as number | undefined) ?? 0);

  const coloresLineaEdit = (obj.coloresLineaEdit as number | undefined) ?? 0;
  const color = coloresLineaEdit === 4 ? COLORES.influences : resolverColor(coloresLineaEdit);

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

      <div className={`flex items-center ${responsive ? 'gap-3' : 'gap-6'}`}>
        <span
          className={`${textSize} ${leading}`}
          style={{ color: color }}
        >
          {var1}
        </span>
        <span
          className={`${textSize} ${leading}`}
          style={{ color: color }}
        >
          {var2}
          {unidad2}
        </span>
      </div>
    </div>
  );
}
