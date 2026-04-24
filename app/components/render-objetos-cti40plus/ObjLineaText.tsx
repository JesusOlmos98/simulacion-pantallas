'use client';

import { useMemo } from 'react';
import type { JSX } from 'react';
import type { IconType } from 'react-icons/lib';
import { LuChevronRight } from 'react-icons/lu';
import { resolveText } from './textos/resolverTexto';
import { resolverIconoCTI40Plus } from './iconos-cti40plus';
import { COLORES, resolverColor } from './colors';
import type { DescriptorPantalla } from '../pantalla-types';

interface ObjLineaProps {
  obj: Record<string, unknown>;
  onNavegar: (descriptor: DescriptorPantalla) => void;
  esLista?: boolean;
  textoConcatenados?: Map<number, string>;
  idPantallaActual?: number;
  responsive?: boolean;
}

export default function ObjLineaText({ obj, onNavegar, textoConcatenados, idPantallaActual, responsive }: ObjLineaProps): JSX.Element {
  const nav = (obj.valorEditableONav as number | undefined) ?? 0;

  const handleClick = (): void => {
    if (nav > 0) {
      const indicePantalla = (obj.indicePantalla as number | undefined) ?? 0;
      if (nav > 1000) {
        onNavegar({ idPantalla: nav, indicePantalla, esPrincipal: false });
      } else {
        onNavegar({ idPantalla: idPantallaActual ?? 0, indicePantalla, esPrincipal: false, idUnicoEdicion: nav });
      }
    }
  };

  const textoId = (obj.texto as number | undefined) ?? 0;
  const texto = textoConcatenados?.get(textoId) ?? resolveText(textoId);
  const coloresLineaEdit = (obj.coloresLineaEdit as number | undefined) ?? 0;
  const colorTexto = coloresLineaEdit === 4 ? COLORES.influences : resolverColor(coloresLineaEdit);
  const IconoLinea = useMemo<IconType | null>(() => (obj.iconoLinea != null ? resolverIconoCTI40Plus(obj.iconoLinea as number) : null), [obj.iconoLinea]);

  return (
    <div
      className={`flex items-center justify-between cursor-pointer hover:bg-white/5 transition-colors ${responsive ? 'px-4 py-3' : 'px-3 py-7'}`}
      onClick={handleClick}
    >
      <div className={`flex items-center ${responsive ? 'gap-2' : 'gap-3'}`}>
        {/* Icono de la línea */}
        {IconoLinea && (
          <div className={`flex items-center justify-center ${responsive ? 'w-8 h-8' : 'w-14 h-14'}`}>
            {/* eslint-disable-next-line react-hooks/static-components */}
            <IconoLinea
              size={responsive ? 24 : 56}
              color="white"
            />
          </div>
        )}

        {/* Texto */}
        <span
          className={`font-light ${responsive ? 'text-lg' : 'text-5xl'}`}
          style={{ color: colorTexto ?? COLORES.light }}
        >
          {texto}
        </span>
      </div>

      {/* Chevron de navegación */}
      {nav > 0 && (
        <LuChevronRight
          size={responsive ? 20 : 50}
          color={COLORES.light}
        />
      )}
    </div>
  );
}
