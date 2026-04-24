'use client';

import type { JSX } from 'react';
import type { ObjBase } from '../pantalla-types';
import { resolveText } from './textos/resolverTexto';
import { COLORES } from './colors';

interface Props {
  obj: ObjBase;
  isSelected: boolean;
  onSelect: () => void;
  isDisabled?: boolean;
  responsive?: boolean;
}

/** Fila de selección única (radio button) o múltiple (checkbox) — tipoObjeto: 10 (objCamposMultiseleccion). */
export default function ObjCamposMultiseleccion({ obj, isSelected, onSelect, isDisabled = false, responsive }: Props): JSX.Element {
  const textoId = obj.textoVar as number;
  const texto = resolveText(textoId);

  const circleSize = responsive ? 24 : 52;
  const dotSize = responsive ? 12 : 26;

  return (
    <div
      className={`flex items-center transition-colors ${responsive ? 'gap-3 px-4 py-3' : 'gap-6 px-6 py-7'} ${isDisabled ? 'cursor-not-allowed' : 'cursor-pointer hover:bg-white/5'}`}
      onClick={() => !isDisabled && onSelect()}
    >
      {/* Radio circle / Checkbox */}
      <div
        className={`shrink-0 flex items-center justify-center rounded-full ${responsive ? 'border-2' : 'border-4'}`}
        style={{ width: circleSize, height: circleSize, borderColor: isDisabled ? COLORES.quaternary : isSelected ? COLORES.primary : COLORES.light }}
      >
        {isSelected && !isDisabled && (
          <div
            className="rounded-full"
            style={{ width: dotSize, height: dotSize, backgroundColor: COLORES.primary }}
          />
        )}
      </div>

      {/* Texto */}
      <span
        className={`${responsive ? 'text-lg' : 'text-5xl'} font-light ${isDisabled ? '' : 'text-white'}`}
        style={{ color: isDisabled ? COLORES.quaternary : undefined }}
      >
        {texto}
      </span>
    </div>
  );
}
