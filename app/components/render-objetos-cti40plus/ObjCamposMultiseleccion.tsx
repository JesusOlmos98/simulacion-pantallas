'use client';

import type { JSX } from 'react';
import type { ObjBase } from '../pantalla-types';
import { resolverTexto } from './pantalla-utils';
import { COLORES } from './colors';

interface Props {
  obj: ObjBase;
  isSelected: boolean;
  onSelect: () => void;
}

/** Fila de selección única (radio button) — tipoObjeto: 10 (objCamposMultiseleccion). */
export default function ObjCamposMultiseleccion({ obj, isSelected, onSelect }: Props): JSX.Element {
  const textoId = obj.textoVar as number;
  const texto = resolverTexto(textoId);

  return (
    <div
      className="flex items-center gap-6 px-6 py-7 cursor-pointer hover:bg-white/5 transition-colors"
      onClick={onSelect}
    >
      {/* Radio circle */}
      <div
        className="shrink-0 flex items-center justify-center rounded-full border-4"
        style={{
          width: 52,
          height: 52,
          borderColor: isSelected ? COLORES.primary : '#ffffff',
        }}
      >
        {isSelected && (
          <div
            className="rounded-full"
            style={{ width: 26, height: 26, backgroundColor: COLORES.primary }}
          />
        )}
      </div>

      {/* Texto */}
      <span className="text-5xl font-light text-white">{texto}</span>
    </div>
  );
}
