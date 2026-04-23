'use client';

import type { JSX } from 'react';
import { resolveText } from './textos/resolverTexto';
import { COLORES, resolverColor } from './colors';

interface ObjLineaInfoTextTextProps {
  obj: Record<string, unknown>;
}

const TEXTO_VACIO_ID = 151;

export default function ObjLineaInfoTextText({ obj }: ObjLineaInfoTextTextProps): JSX.Element {
  const textoVarId = (obj.textoVar as number | undefined) ?? 0;
  const esVacio = textoVarId === TEXTO_VACIO_ID;

  const texto = resolveText((obj.texto as number | undefined) ?? 0);
  const textoVar = esVacio ? '--' : resolveText(textoVarId);

  const coloresLineaEdit = (obj.coloresLineaEdit as number | undefined) ?? 0;
  const color = coloresLineaEdit === 1 ? COLORES.light : esVacio ? COLORES.light_gray : resolverColor(coloresLineaEdit);

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
        style={{ color }}
      >
        {textoVar}
      </span>
    </div>
  );
}
