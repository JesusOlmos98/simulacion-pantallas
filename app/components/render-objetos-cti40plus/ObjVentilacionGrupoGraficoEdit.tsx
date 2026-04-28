'use client';

import type { JSX } from 'react';
import { LuTrash } from 'react-icons/lu';
import type { ObjBase } from '../pantalla-types';
import { resolveText } from './textos/resolverTexto';
import { COLORES } from './colors';

interface Props {
  obj: ObjBase;
  pestanaActiva?: 0 | 1;
  onPestanaChange?: (p: 0 | 1) => void;
  onTrash?: () => void;
  responsive?: boolean;
}

export default function ObjVentilacionGrupoGraficoEdit({ obj, pestanaActiva, onPestanaChange, onTrash, responsive }: Props): JSX.Element {
  const textoPestana1 = resolveText(obj.textoPestana1 as number);
  const textoPestana2 = resolveText(obj.textoPestana2 as number);

  return (
    <div className="flex flex-col mt-2">
      {/* Pestañas */}
      <div
        className="flex items-center"
        style={{ backgroundColor: COLORES.tertiary }}
      >
        <button
          className={`flex-1 ${responsive === true ? 'py-[15.5px] text-lg' : 'py-5 text-5xl'} font-normal transition-colors border-b-4 ${pestanaActiva === 0 ? 'text-white border-white' : 'text-white/50 border-transparent'}`}
          onClick={() => onPestanaChange!(0)}
        >
          {textoPestana1}
        </button>
        <div
          className={`flex items-center justify-center ${responsive === true ? 'px-4 py-[15.5px]' : 'px-6 py-5'} cursor-pointer`}
          onClick={onTrash}
        >
          <LuTrash
            size={responsive === true ? 28 : 75}
            color={COLORES.light}
          />
        </div>
        <button
          className={`flex-1 ${responsive === true ? 'py-[15.5px] text-lg' : 'py-5 text-5xl'} font-normal transition-colors border-b-4 ${pestanaActiva === 1 ? 'text-white border-white' : 'text-white/50 border-transparent'}`}
          onClick={() => onPestanaChange!(1)}
        >
          {textoPestana2}
        </button>
      </div>
    </div>
  );
}
