'use client';

import type { JSX } from 'react';
import { LuChevronRight } from 'react-icons/lu';
import { resolveText } from './textos/resolverTexto';
import { resolverUnidad, decodificarVariable } from './pantalla-utils';
import { COLORES, resolverColor } from './colors';
import type { DescriptorPantalla } from '../pantalla-types';

// Umbral para distinguir punteros de pantalla (>65535) de índices idUnicoEdicion (<=65535)
const SCREEN_PTR_MIN = 65536;

interface ObjLineaTextVarVarProps {
  obj: Record<string, unknown>;
  onNavegar: (descriptor: DescriptorPantalla) => void;
  idPantallaActual: number;
}

export default function ObjLineaTextVarVar({ obj, onNavegar, idPantallaActual }: ObjLineaTextVarVarProps): JSX.Element {
  const nav = (obj.valorEditableONav as number | undefined) ?? 0;

  const handleClick = (): void => {
    if (nav <= 0) return;
    if (nav >= SCREEN_PTR_MIN) {
      onNavegar({ idPantalla: nav, indicePantalla: (obj.indicePantalla as number | undefined) ?? 0, esPrincipal: false });
    } else {
      onNavegar({ idPantalla: idPantallaActual, indicePantalla: (obj.indicePantalla as number | undefined) ?? 0, esPrincipal: false, idUnicoEdicion: nav });
    }
  };

  const texto = resolveText((obj.texto as number | undefined) ?? 0);

  const valorCentral = decodificarVariable((obj.variableCentral as number | undefined) ?? 0, (obj.tipoVarCentral as number | undefined) ?? 0);
  const unidadCentral = resolverUnidad((obj.unidadCentral as number | undefined) ?? 0);

  const valor = decodificarVariable((obj.variable as number | undefined) ?? 0, (obj.tipoVar as number | undefined) ?? 0);
  const unidad = resolverUnidad((obj.unidad as number | undefined) ?? 0);

  const colorTexto = resolverColor((obj.coloresLinea as number | undefined) ?? 0);
  const inhabilitada = (obj.coloresLinea as number | undefined) === 15;

  return (
    <div
      className="flex items-center justify-between px-3 py-7 cursor-pointer hover:bg-white/5 transition-colors"
      onClick={handleClick}
    >
      {/* Texto etiqueta */}
      <span
        className="text-5xl font-light"
        style={{ color: colorTexto }}
      >
        {texto}
      </span>

      {/* Variables + chevron */}
      <div className="flex items-center gap-2">
        {/* Columna central — ancho fijo, alineada a la derecha */}
        <div
          className="flex justify-end"
          style={{ minWidth: '160px' }}
        >
          <span
            className="text-5xl"
            style={{ color: inhabilitada ? COLORES.light_gray : COLORES.light }}
          >
            {valorCentral}
            {unidadCentral ?? ''}
          </span>
        </div>

        {/* Separador visual */}
        <div style={{ minWidth: '48px' }} />

        <span
          className="text-5xl"
          style={{ color: inhabilitada ? COLORES.light_gray : COLORES.success }}
        >
          {valor}
          {unidad ?? ''}
        </span>

        {nav > 0 && (
          <LuChevronRight
            size={50}
            color={COLORES.light}
          />
        )}
      </div>
    </div>
  );
}
