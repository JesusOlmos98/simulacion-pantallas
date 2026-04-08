'use client';

import type { JSX } from 'react';
import { useMemo } from 'react';
import type { IconType } from 'react-icons/lib';
import { LuChevronRight } from 'react-icons/lu';
import { resolverTexto } from './pantalla-utils';
import { resolverIconoCTI40Plus } from './iconos-cti40plus';
import { COLORES, resolverColor } from './colors';
import type { DescriptorPantalla } from '../pantalla-types';

interface ObjLineaTextTextProps {
  obj: Record<string, unknown>;
  onNavegar: (descriptor: DescriptorPantalla) => void;
}

export default function ObjLineaTextText({ obj, onNavegar }: ObjLineaTextTextProps): JSX.Element {
  const nav = (obj.valorEditableONav as number | undefined) ?? 0;

  const handleClick = (): void => {
    if (nav > 0) {
      onNavegar({ idPantalla: nav, indicePantalla: (obj.indicePantalla as number | undefined) ?? 0, esPrincipal: false });
    }
  };

  const texto = resolverTexto((obj.texto as number | undefined) ?? 0);
  const textoVar = resolverTexto((obj.textoVar as number | undefined) ?? 0);

  const coloresLineaEdit = (obj.coloresLineaEdit as number | undefined) ?? 0;
  const colorTexto = resolverColor(coloresLineaEdit);

  const IconoLinea = useMemo<IconType | null>(() => (obj.iconoLinea != null ? resolverIconoCTI40Plus(obj.iconoLinea as number) : null), [obj.iconoLinea]);

  return (
    <div
      className={`flex items-center justify-between px-3 ${IconoLinea ? 'py-5' : 'py-7'} cursor-pointer hover:bg-white/5 transition-colors`}
      onClick={handleClick}
    >
      <div className="flex items-center gap-3">
        {IconoLinea && (
          <div className="w-14 h-14 flex items-center justify-center">
            {/* eslint-disable-next-line react-hooks/static-components */}
            <IconoLinea
              size={44}
              color="white"
            />
          </div>
        )}
        <span
          className="text-4xl font-light"
          style={{ color: colorTexto }}
        >
          {texto}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <span
          className="text-4xl"
          style={{ color: COLORES.primary }}
        >
          {textoVar}
        </span>
        {nav > 0 && (
          <LuChevronRight
            size={36}
            color="#ffffff"
          />
        )}
      </div>
    </div>
  );
}
