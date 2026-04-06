'use client';

import type { JSX } from 'react';
import { LuChevronRight } from 'react-icons/lu';
import { resolverTexto, resolverUnidad, decodificarVariable } from './pantalla-utils';
import { COLORES } from './colors';
import { DescriptorPantalla } from '../components/render-objetos-omega/RenderObjeto';

interface ObjLineaTextVarProps {
  obj: Record<string, unknown>;
  onNavegar: (descriptor: DescriptorPantalla) => void;
}

export default function ObjLineaTextVarCti40Plus({ obj, onNavegar }: ObjLineaTextVarProps): JSX.Element {
  const nav = (obj.valorEditableONav as number | undefined) ?? 0;

  const handleClick = (): void => {
    if (nav > 0) {
      onNavegar({ idPantalla: nav, indicePantalla: (obj.indicePantalla as number | undefined) ?? 0, esPrincipal: false });
    }
  };

  const texto = resolverTexto((obj.texto as number | undefined) ?? 0);
  const valor = decodificarVariable((obj.variable as number | undefined) ?? 0, (obj.tipoVar as number | undefined) ?? 0);
  const unidad = resolverUnidad((obj.unidad as number | undefined) ?? 0);

  return (
    <div
      className={`flex items-center justify-between px-3 ${(obj.iconoLinea as number | undefined) ? 'py-5' : 'py-7'} cursor-pointer hover:bg-white/5 transition-colors`}
      onClick={handleClick}
    >
      {/* Texto etiqueta */}
      <span className="text-white text-4xl font-light">{texto}</span>

      {/* Valor + unidad + chevron */}
      <div className="flex items-center gap-2">
        <span className="text-4xl " style={{ color: COLORES.primary }}>
          {valor}{unidad ? ` ${unidad}` : ''}
        </span>

        {nav > 0 && (
          <LuChevronRight size={36} className="text-white" />
        )}
      </div>
    </div>
  );
}
