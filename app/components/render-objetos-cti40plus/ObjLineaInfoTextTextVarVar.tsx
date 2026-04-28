'use client';

import type { JSX } from 'react';
import { resolverTextoPantalla, resolverUnidad, decodificarVariable } from './pantalla-utils';
import { COLORES, resolverColor } from './colors';
import { resolverIconoCTI40Plus } from './iconos-cti40plus';

interface ObjLineaInfoTextTextVarVarProps {
  obj: Record<string, unknown>;
  textoConcatenados?: Map<number, string>;
  responsive?: boolean;
}

const TIPOS_TEXTO = new Set([30, 31, 43]);

export default function ObjLineaInfoTextTextVarVar({ obj, textoConcatenados, responsive }: ObjLineaInfoTextTextVarVarProps): JSX.Element {
  const texto = resolverTextoPantalla((obj.texto as number | undefined) ?? 0, textoConcatenados);

  const tipoVar1 = (obj.tipoVar1 as number | undefined) ?? 0;
  const variable1 = (obj.variable1 as number | undefined) ?? 0;
  const IconoVar1 = tipoVar1 === 40 ? resolverIconoCTI40Plus(variable1 & 0xff) : null;
  const var1Raw = TIPOS_TEXTO.has(tipoVar1) ? resolverTextoPantalla(variable1 & 0xffff, textoConcatenados) : decodificarVariable(variable1, tipoVar1);
  // En el firmware CTI40+ las etiquetas textG0…textGN (IDs 254…) son sondas S0…SN
  const var1 = var1Raw.replace(/^G (\d+)$/, 'S$1');

  const tipoVar2 = (obj.tipoVar2 as number | undefined) ?? 0;
  const variable2 = (obj.variable2 as number | undefined) ?? 0;
  const IconoVar2 = tipoVar2 === 40 ? resolverIconoCTI40Plus(variable2 & 0xff) : null;
  const var2 = TIPOS_TEXTO.has(tipoVar2) ? resolverTextoPantalla(variable2 & 0xffff, textoConcatenados) : decodificarVariable(variable2, tipoVar2);
  const unidad2 = resolverUnidad((obj.unidad2 as number | undefined) ?? 0);

  const coloresLineaEdit = (obj.coloresLineaEdit as number | undefined) ?? 0;
  const color = coloresLineaEdit === 4 ? COLORES.influences : resolverColor(coloresLineaEdit);

  const textSize = responsive === true ? 'text-lg' : 'text-5xl';
  const leading = responsive === true ? '' : 'leading-[50px]';
  const iconSize = responsive === true ? 28 : 75;

  return (
    <div className={`flex items-center justify-between pl-3 pr-6 rounded-2xl ${responsive === true ? 'py-3' : 'py-7'}`}>
      <span
        className={`${textSize} font-light ${leading}`}
        style={{ color }}
      >
        {texto}
      </span>

      <div className={`flex items-center ${responsive === true ? 'gap-3' : 'gap-6'}`}>
        {IconoVar1 ? (
          // eslint-disable-next-line react-hooks/static-components
          <IconoVar1
            size={iconSize}
            color={COLORES.light}
          />
        ) : (
          <span
            className={`${textSize} ${leading}`}
            style={{ color: color }}
          >
            {var1}
          </span>
        )}
        {IconoVar2 ? (
          // eslint-disable-next-line react-hooks/static-components
          <IconoVar2
            size={iconSize}
            color={COLORES.light}
          />
        ) : (
          <span
            className={`${textSize} ${leading}`}
            style={{ color: color }}
          >
            {var2}
            {unidad2}
          </span>
        )}
      </div>
    </div>
  );
}
