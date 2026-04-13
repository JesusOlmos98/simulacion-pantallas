'use client';

import type { JSX } from 'react';
import { useMemo } from 'react';
import type { IconType } from 'react-icons/lib';
import { LuChevronRight } from 'react-icons/lu';
import { resolverTexto } from './pantalla-utils';
import { resolverIconoCTI40Plus } from './iconos-cti40plus';
import { COLORES, resolverColor } from './colors';
import type { DescriptorPantalla } from '../pantalla-types';

// Umbral para distinguir punteros de pantalla (>65535) de índices idUnicoEdicion (<=65535)
const SCREEN_PTR_MIN = 65536;

interface ObjLineaTextTextProps {
  obj: Record<string, unknown>;
  onNavegar: (descriptor: DescriptorPantalla) => void;
  idPantallaActual: number;
}

export default function ObjLineaTextText({ obj, onNavegar, idPantallaActual }: ObjLineaTextTextProps): JSX.Element {
  const nav = (obj.valorEditableONav as number | undefined) ?? 0;

  const handleClick = (): void => {
    if (nav <= 0) return;
    if (nav >= SCREEN_PTR_MIN) {
      onNavegar({ idPantalla: nav, indicePantalla: (obj.indicePantalla as number | undefined) ?? 0, esPrincipal: false });
    } else {
      onNavegar({ idPantalla: idPantallaActual, indicePantalla: (obj.indicePantalla as number | undefined) ?? 0, esPrincipal: false, idUnicoEdicion: nav });
    }
  };

  const texto = resolverTexto((obj.texto as number | undefined) ?? 0);
  const textoVar = resolverTexto((obj.textoVar as number | undefined) ?? 0);

  const coloresLineaEdit = (obj.coloresLineaEdit as number | undefined) ?? 0;
  const colorTexto = resolverColor(coloresLineaEdit);
  const inhabilitada = coloresLineaEdit === 15;

  const IconoLinea = useMemo<IconType | null>(() => (obj.iconoLinea != null ? resolverIconoCTI40Plus(obj.iconoLinea as number) : null), [obj.iconoLinea]);

  return (
    <div
      className="flex items-center justify-between px-3 py-7 cursor-pointer hover:bg-white/5 transition-colors"
      onClick={handleClick}
    >
      <div className="flex items-center gap-3 min-w-0 max-w-[70%]">
        {IconoLinea && (
          <div className="w-14 h-14 flex-shrink-0 flex items-center justify-center">
            {/* eslint-disable-next-line react-hooks/static-components */}
            <IconoLinea
              size={56}
              color="white"
            />
          </div>
        )}
        <span
          className="text-5xl font-light"
          style={{ color: colorTexto }}
        >
          {texto}
        </span>
      </div>

      <div className={`flex items-center gap-2 min-w-[30%] justify-end ${nav === 0 ? 'pr-4' : ''}`}>
        <span
          className="text-5xl"
          style={{ color: inhabilitada ? COLORES.light_gray : COLORES.primary }}
        >
          {textoVar}
        </span>
        {nav > 0 && (
          <LuChevronRight
            size={50}
            color="#ffffff"
          />
        )}
      </div>
    </div>
  );
}
