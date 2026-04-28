'use client';

import type { JSX } from 'react';
import { useMemo } from 'react';
import type { IconType } from 'react-icons/lib';
import { LuChevronRight } from 'react-icons/lu';
import { resolverTextoPantalla } from './pantalla-utils';
import { resolverIconoCTI40Plus } from './iconos-cti40plus';
import { COLORES, resolverColor } from './colors';
import type { DescriptorPantalla } from '../pantalla-types';

// Umbral para distinguir punteros de pantalla (>65535) de índices idUnicoEdicion (<=65535)
const SCREEN_PTR_MIN = 65536;

interface ObjLineaTextTextProps {
  obj: Record<string, unknown>;
  onNavegar: (descriptor: DescriptorPantalla) => void;
  idPantallaActual: number;
  indicePantallaActual: number;
  textoConcatenados?: Map<number, string>;
  responsive?: boolean;
}

export default function ObjLineaTextText({ obj, onNavegar, idPantallaActual, indicePantallaActual, textoConcatenados, responsive }: ObjLineaTextTextProps): JSX.Element {
  const nav = (obj.valorEditableONav as number | undefined) ?? 0;

  const handleClick = (): void => {
    if (nav <= 0) return;
    if (nav >= SCREEN_PTR_MIN) {
      onNavegar({ idPantalla: nav, indicePantalla: (obj.indicePantalla as number | undefined) ?? 0, esPrincipal: false });
    } else {
      onNavegar({ idPantalla: idPantallaActual, indicePantalla: indicePantallaActual, esPrincipal: false, idUnicoEdicion: nav });
    }
  };

  const texto = resolverTextoPantalla((obj.texto as number | undefined) ?? 0, textoConcatenados);
  const textoVar = resolverTextoPantalla((obj.textoVar as number | undefined) ?? 0, textoConcatenados);

  const coloresLineaEdit = (obj.coloresLineaEdit as number | undefined) ?? 0;
  const colorTexto = resolverColor(coloresLineaEdit);
  const inhabilitada = coloresLineaEdit === 15;

  const IconoLinea = useMemo<IconType | null>(() => (obj.iconoLinea != null ? resolverIconoCTI40Plus(obj.iconoLinea as number) : null), [obj.iconoLinea]);

  const textSize = responsive === true ? 'text-lg' : 'text-5xl';

  return (
    <div
      className={`flex items-center justify-between cursor-pointer hover:bg-white/5 transition-colors ${responsive === true ? 'px-4 py-3' : 'px-3 py-7'}`}
      onClick={handleClick}
    >
      <div className={`flex items-center min-w-0 max-w-[55%] ${responsive === true ? 'gap-2' : 'gap-3'}`}>
        {IconoLinea && (
          <div className={`flex-shrink-0 flex items-center justify-center ${responsive === true ? 'w-8 h-8' : 'w-14 h-14'}`}>
            {/* eslint-disable-next-line react-hooks/static-components */}
            <IconoLinea
              size={responsive === true ? 24 : 56}
              color="white"
            />
          </div>
        )}
        <span
          className={`${textSize} font-light`}
          style={{ color: colorTexto }}
        >
          {texto}
        </span>
      </div>

      <div className={`flex items-center gap-2 min-w-[30%] justify-end ${nav === 0 ? 'pr-4' : ''}`}>
        <span
          className={`${textSize} text-right`}
          style={{ color: inhabilitada ? COLORES.disabled : coloresLineaEdit === 1 ? COLORES.success : colorTexto }}
        >
          {textoVar}
        </span>
        {nav > 0 && (
          <LuChevronRight
            size={responsive === true ? 20 : 50}
            color={COLORES.light}
            className="flex-shrink-0"
          />
        )}
      </div>
    </div>
  );
}
