'use client';

import type { JSX } from 'react';
import { resolverTextoPantalla } from './pantalla-utils';
import { COLORES, resolverColor } from './colors';

interface ObjLineaInfoTextTextProps {
  obj: Record<string, unknown>;
  textoConcatenados?: Map<number, string>;
  responsive?: boolean;
}

const TEXTO_VACIO_ID = 151;

export default function ObjLineaInfoTextText({ obj, textoConcatenados, responsive }: ObjLineaInfoTextTextProps): JSX.Element {
  const textoVarId = (obj.textoVar as number | undefined) ?? 0;
  const esVacio = textoVarId === TEXTO_VACIO_ID;

  const texto = resolverTextoPantalla((obj.texto as number | undefined) ?? 0, textoConcatenados);
  const textoVar = esVacio ? '--' : resolverTextoPantalla(textoVarId, textoConcatenados);

  const coloresLineaEdit = (obj.coloresLineaEdit as number | undefined) ?? 0;
  const color = coloresLineaEdit === 1 ? COLORES.light : esVacio ? COLORES.disabled : resolverColor(coloresLineaEdit);

  const textSize = responsive === true ? 'text-lg' : 'text-5xl';
  const leading = responsive === true ? '' : 'leading-[50px]';

  return (
    <div className={`flex items-center justify-between pl-3 pr-6 rounded-2xl ${responsive === true ? 'py-3' : 'py-7'}`}>
      <span
        className={`${textSize} font-light ${leading}`}
        style={{ color }}
      >
        {texto}
      </span>
      <span
        className={`${textSize} ${leading}`}
        style={{ color }}
      >
        {textoVar}
      </span>
    </div>
  );
}
