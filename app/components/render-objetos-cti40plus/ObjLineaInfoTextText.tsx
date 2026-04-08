'use client';

import type { JSX } from 'react';
import { resolverTexto } from './pantalla-utils';
import { COLORES, resolverColor } from './colors';

interface ObjLineaInfoTextTextProps {
  obj: Record<string, unknown>;
}

const TEXTO_VACIO_ID = 151;

export default function ObjLineaInfoTextText({ obj }: ObjLineaInfoTextTextProps): JSX.Element {
  const textoVarId = (obj.textoVar as number | undefined) ?? 0;
  const esVacio = textoVarId === TEXTO_VACIO_ID;

  const texto = resolverTexto((obj.texto as number | undefined) ?? 0);
  const textoVar = esVacio ? '--' : resolverTexto(textoVarId);

  const coloresLineaEdit = (obj.coloresLineaEdit as number | undefined) ?? 0;
  const color = esVacio ? COLORES.light_gray : resolverColor(coloresLineaEdit);

  return (
    <div className="flex items-center justify-between pl-3 pr-6 py-7">
      <span
        className="text-4xl font-light"
        style={{ color }}
      >
        {texto}
      </span>
      <span
        className="text-4xl"
        style={{ color }}
      >
        {textoVar}
      </span>
    </div>
  );
}
