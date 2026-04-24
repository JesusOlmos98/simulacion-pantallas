'use client';

import type { JSX } from 'react';
import { resolveText } from './textos/resolverTexto';
import { COLORES, resolverColor } from './colors';

interface ObjLineaInfoTextTextProps {
  obj: Record<string, unknown>;
  responsive?: boolean;
}

const TEXTO_VACIO_ID = 151;

export default function ObjLineaInfoTextText({ obj, responsive }: ObjLineaInfoTextTextProps): JSX.Element {
  const textoVarId = (obj.textoVar as number | undefined) ?? 0;
  const esVacio = textoVarId === TEXTO_VACIO_ID;

  const texto = resolveText((obj.texto as number | undefined) ?? 0);
  const textoVar = esVacio ? '--' : resolveText(textoVarId);

  const coloresLineaEdit = (obj.coloresLineaEdit as number | undefined) ?? 0;
  const color = coloresLineaEdit === 1 ? COLORES.light : esVacio ? COLORES.light_gray : resolverColor(coloresLineaEdit);

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
      <span
        className={`${textSize} ${leading}`}
        style={{ color }}
      >
        {textoVar}
      </span>
    </div>
  );
}
