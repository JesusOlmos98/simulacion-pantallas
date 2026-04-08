'use client';

import { useMemo } from 'react';
import type { JSX } from 'react';
import type { IconType } from 'react-icons/lib';
import { LuChevronRight } from 'react-icons/lu';
import { resolverTexto } from './pantalla-utils';
import { resolverIconoCTI40Plus } from './iconos-cti40plus';
import { resolverColor } from './colors';
import type { DescriptorPantalla } from '../pantalla-types';

interface ObjLineaProps {
  obj: Record<string, unknown>;
  onNavegar: (descriptor: DescriptorPantalla) => void;
  esLista?: boolean;
}

export default function ObjLineaText({ obj, onNavegar }: ObjLineaProps): JSX.Element {
  const nav = (obj.valorEditableONav as number | undefined) ?? 0;

  const handleClick = (): void => {
    if (nav > 0) {
      onNavegar({ idPantalla: nav, indicePantalla: (obj.indicePantalla as number | undefined) ?? 0, esPrincipal: false });
    }
  };

  const texto = resolverTexto((obj.texto as number | undefined) ?? 0);
  const coloresLineaEdit = (obj.coloresLineaEdit as number | undefined) ?? 0;
  const colorTexto = resolverColor(coloresLineaEdit);
  const IconoLinea = useMemo<IconType | null>(() => (obj.iconoLinea != null ? resolverIconoCTI40Plus(obj.iconoLinea as number) : null), [obj.iconoLinea]);

  return (
    <div
      className="flex items-center justify-between px-3 py-7 cursor-pointer hover:bg-white/5 transition-colors"
      onClick={handleClick}
    >
      <div className="flex items-center gap-3">
        {/* Icono de la línea */}
        {IconoLinea && (
          <div className="w-14 h-14 flex items-center justify-center">
            {/* eslint-disable-next-line react-hooks/static-components */}
            <IconoLinea
              size={56}
              color="white"
            />
          </div>
        )}

        {/* Texto */}
        <span
          className="text-5xl font-light"
          style={{ color: colorTexto }}
        >
          {texto}
        </span>
      </div>

      {/* Chevron de navegación */}
      {nav > 0 && (
        <LuChevronRight
          size={50}
          color="#ffffff"
        />
      )}
    </div>
  );
}
