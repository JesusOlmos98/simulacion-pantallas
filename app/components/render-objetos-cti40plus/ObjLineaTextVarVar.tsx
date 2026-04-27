'use client';

import type { JSX } from 'react';
import { LuChevronRight } from 'react-icons/lu';
import { resolverTextoPantalla, resolverUnidad, decodificarVariable } from './pantalla-utils';
import { COLORES, resolverColor } from './colors';
import { resolverIconoCTI40Plus } from './iconos-cti40plus';
import type { DescriptorPantalla } from '../pantalla-types';

// Umbral para distinguir punteros de pantalla (>65535) de índices idUnicoEdicion (<=65535)
const SCREEN_PTR_MIN = 65536;

interface ObjLineaTextVarVarProps {
  obj: Record<string, unknown>;
  onNavegar: (descriptor: DescriptorPantalla) => void;
  idPantallaActual: number;
  indicePantallaActual: number;
  textoConcatenados?: Map<number, string>;
  responsive?: boolean;
}

const TIPOS_TEXTO = new Set([30, 31, 43]);

export default function ObjLineaTextVarVar({ obj, onNavegar, idPantallaActual, indicePantallaActual, textoConcatenados, responsive }: ObjLineaTextVarVarProps): JSX.Element {
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

  const tipoVarCentral = (obj.tipoVarCentral as number | undefined) ?? 0;
  const variableCentral = (obj.variableCentral as number | undefined) ?? 0;
  const IconoCentral = tipoVarCentral === 40 ? resolverIconoCTI40Plus(variableCentral & 0xff) : null;
  const valorCentral = TIPOS_TEXTO.has(tipoVarCentral) ? resolverTextoPantalla(variableCentral & 0xffff, textoConcatenados) : decodificarVariable(variableCentral, tipoVarCentral);
  const unidadCentral = resolverUnidad((obj.unidadCentral as number | undefined) ?? 0);

  const tipoVar = (obj.tipoVar as number | undefined) ?? 0;
  const variable = (obj.variable as number | undefined) ?? 0;
  const IconoValor = tipoVar === 40 ? resolverIconoCTI40Plus(variable & 0xff) : null;
  const valor = TIPOS_TEXTO.has(tipoVar) ? resolverTextoPantalla(variable & 0xffff, textoConcatenados) : decodificarVariable(variable, tipoVar);
  const unidad = resolverUnidad((obj.unidad as number | undefined) ?? 0);

  const colorTexto = resolverColor((obj.coloresLinea as number | undefined) ?? 0);
  const inhabilitada = (obj.coloresLinea as number | undefined) === 15;

  const textSize = responsive ? 'text-lg' : 'text-5xl';

  return (
    <div
      className={`flex items-center gap-2 cursor-pointer hover:bg-white/5 transition-colors ${responsive ? 'px-4 py-3' : 'px-3 py-7'}`}
      onClick={handleClick}
    >
      {/* Texto etiqueta — crece y cede espacio si hace falta */}
      <span
        className={`${textSize} font-light flex-1 min-w-0`}
        style={{ color: colorTexto }}
      >
        {texto}
      </span>

      {/* Primera variable — tamaño natural, no encoge */}
      {IconoCentral ? (
        // eslint-disable-next-line react-hooks/static-components
        <IconoCentral
          size={responsive ? 24 : 56}
          color={COLORES.light}
        />
      ) : (
        <span
          className={`${textSize} shrink-0 text-right`}
          style={{ color: inhabilitada ? COLORES.disabled : COLORES.light }}
        >
          {valorCentral}
          {unidadCentral ?? ''}
        </span>
      )}

      {/* Segunda variable + chevron — tamaño natural, no encoge */}
      <div className="shrink-0 flex items-center gap-1">
        {IconoValor ? (
          // eslint-disable-next-line react-hooks/static-components
          <IconoValor
            size={responsive ? 24 : 56}
            color={COLORES.light}
          />
        ) : (
          <span
            className={`${textSize} text-right`}
            style={{ color: inhabilitada ? COLORES.disabled : COLORES.success }}
          >
            {valor}
            {unidad ?? ''}
          </span>
        )}

        {nav > 0 && (
          <LuChevronRight
            size={responsive ? 20 : 50}
            color={COLORES.light}
          />
        )}
      </div>
    </div>
  );
}
