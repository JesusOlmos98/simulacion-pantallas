'use client';

import type { JSX } from 'react';
import { COLORES } from './colors';

const MAX_CHARS = 15;

interface Props {
  value: string;
  onChange: (v: string) => void;
  onEnter?: () => void;
}

/** Input de edición de variable tipo string (tipoObjeto: 33 — objEditVariablesString).
 *  Muestra un campo de texto centrado con máximo de 15 caracteres. */
export default function ObjEditVariablesString({ value, onChange, onEnter }: Props): JSX.Element {
  return (
    <div className="flex flex-col items-center gap-8">
      <div
        className="flex items-center px-8 py-5 rounded-2xl"
        style={{ backgroundColor: COLORES.tertiary }}
      >
        <input
          type="text"
          maxLength={MAX_CHARS}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && onEnter) {
              onEnter();
            }
          }}
          className="bg-transparent text-6xl text-center outline-none w-120"
          style={{ color: COLORES.primary }}
          autoFocus
        />
      </div>
      <span className="text-2xl text-white/60">
        {value.length} / {MAX_CHARS}
      </span>
    </div>
  );
}
