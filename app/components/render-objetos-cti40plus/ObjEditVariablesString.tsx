'use client';

import { useEffect, useRef, type JSX } from 'react';
import { COLORES } from './colors';

const MAX_CHARS = 15;

interface Props {
  value: string;
  onChange: (v: string) => void;
  onEnter?: () => void;
  responsive?: boolean;
}

/** Input de edición de variable tipo string (tipoObjeto: 33 — objEditVariablesString).
 *  Muestra un campo de texto centrado con máximo de 15 caracteres. */
export default function ObjEditVariablesString({ value, onChange, onEnter, responsive }: Props): JSX.Element {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const input = inputRef.current;
    if (!input) return;

    input.focus();
    input.select();
  }, []);

  return (
    <div className={`flex flex-col items-center ${responsive === true ? 'gap-4' : 'gap-8'}`}>
      <div
        className={`flex items-center rounded-2xl ${responsive === true ? 'px-4 py-3' : 'px-8 py-5'}`}
        style={{ backgroundColor: COLORES.tertiary }}
      >
        <input
          ref={inputRef}
          type="text"
          maxLength={MAX_CHARS}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && onEnter) {
              onEnter();
            }
          }}
          onFocus={(e) => e.target.select()}
          onClick={(e) => e.currentTarget.select()}
          className={`bg-transparent text-center outline-none ${responsive === true ? 'text-2xl w-48' : 'text-6xl w-120'}`}
          style={{ color: COLORES.success }}
          autoFocus
        />
      </div>
      <span className={`${responsive === true ? 'text-sm' : 'text-2xl'} text-white/60`}>
        {value.length} / {MAX_CHARS}
      </span>
    </div>
  );
}
