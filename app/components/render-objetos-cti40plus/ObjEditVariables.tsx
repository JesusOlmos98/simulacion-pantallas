'use client';

import type { JSX } from 'react';
import type { ObjBase } from '../pantalla-types';
import { resolverUnidad, decodificarVariable } from './pantalla-utils';
import { COLORES } from './colors';

interface Props {
  obj: ObjBase;
  value: string;
  onChange: (v: string) => void;
  isValid: boolean;
  onEnter?: () => void;
  responsive?: boolean;
}

/** Input de edición de variable (tipoObjeto: 8 — objEditVariables).
 *  Muestra el campo numérico con hint de rango. El valor y la validación se gestionan desde el padre. */
export default function ObjEditVariables({ obj, value, onChange, isValid, onEnter, responsive }: Props): JSX.Element {
  const tipoVar = obj.tipoVar as number;
  const maximo = obj.maximo as number;
  const minimo = obj.minimo as number;
  const unidad = obj.unidad as number;

  const unidadStr = resolverUnidad(unidad);
  const maxStr = decodificarVariable(maximo, tipoVar);
  const minStr = decodificarVariable(minimo, tipoVar);
  const step = getStepForTipoVar(tipoVar);

  return (
    <div className={`flex flex-col items-center ${responsive === true ? 'gap-4' : 'gap-8'}`}>
      {/* Input numérico */}
      <div
        className={`flex items-center gap-3 rounded-2xl ${responsive === true ? 'px-4 py-3' : 'px-8 py-5'}`}
        style={{ backgroundColor: COLORES.tertiary }}
      >
        <input
          type="number"
          step={step}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && onEnter) {
              onEnter();
            }
          }}
          className={`bg-transparent text-center outline-none [-moz-appearance:textfield] [&::-webkit-inner-spin-button]:hidden [&::-webkit-outer-spin-button]:hidden ${responsive === true ? 'text-2xl w-32' : 'text-6xl w-48'}`}
          style={{ color: COLORES.success }}
          autoFocus
        />
        {unidadStr && <span className={`text-white ${responsive === true ? 'text-lg' : 'text-5xl'}`}>{unidadStr}</span>}
      </div>
      {/* Rango permitido */}
      <span className={`${responsive === true ? 'text-sm' : 'text-2xl'} ${isValid ? 'text-white/60' : 'text-red-500'}`}>
        {minStr} - {maxStr}
        {unidadStr ? ` ${unidadStr}` : ''}
      </span>
    </div>
  );
}

/** Devuelve el step HTML adecuado según el tipo de variable numérica. */
function getStepForTipoVar(tipoVar: number): string {
  switch (tipoVar) {
    case 7: // float
    case 15: // pFloat
    case 17: // float1
    case 20: // pFloat1
    case 39: // float1ConSigno
      return '0.1';
    case 18: // float2
    case 21: // pFloat2
      return '0.01';
    case 19: // float3
    case 22: // pFloat3
      return '0.001';
    case 41: // float0
    case 42: // pFloat0
      return '1';
    default:
      return '1';
  }
}
