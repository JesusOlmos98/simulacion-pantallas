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
  indicePantallaActual: number;
  responsive?: boolean;
}

export default function ObjLineaTextVarVar({ obj, onNavegar, idPantallaActual, indicePantallaActual, responsive }: ObjLineaTextVarVarProps): JSX.Element {
  const nav = (obj.valorEditableONav as number | undefined) ?? 0;

  const handleClick = (): void => {
    if (nav <= 0) return;
    if (nav >= SCREEN_PTR_MIN) {
      onNavegar({ idPantalla: nav, indicePantalla: (obj.indicePantalla as number | undefined) ?? 0, esPrincipal: false });
    } else {
      onNavegar({ idPantalla: idPantallaActual, indicePantalla: indicePantallaActual, esPrincipal: false, idUnicoEdicion: nav });
    }
  };

  const texto = resolveText((obj.texto as number | undefined) ?? 0);

  const valorCentral = decodificarVariable((obj.variableCentral as number | undefined) ?? 0, (obj.tipoVarCentral as number | undefined) ?? 0);
  const unidadCentral = resolverUnidad((obj.unidadCentral as number | undefined) ?? 0);

  const valor = decodificarVariable((obj.variable as number | undefined) ?? 0, (obj.tipoVar as number | undefined) ?? 0);
  const unidad = resolverUnidad((obj.unidad as number | undefined) ?? 0);

  const colorTexto = resolverColor((obj.coloresLinea as number | undefined) ?? 0);
  const inhabilitada = (obj.coloresLinea as number | undefined) === 15;

  const textSize = responsive ? 'text-lg' : 'text-5xl';

  return (
    <div
      className={`flex items-center justify-between cursor-pointer hover:bg-white/5 transition-colors ${responsive ? 'px-4 py-3' : 'px-3 py-7'}`}
      onClick={handleClick}
    >
      {/* Texto etiqueta - 60% */}
      <span
        className={`${textSize} font-light`}
        style={{ color: colorTexto, width: '60%' }}
      >
        {texto}
      </span>

      {/* Primera variable - 10% columna central */}
      <div
        className="flex justify-end"
        style={{ width: '10%' }}
      >
        <span
          className={textSize}
          style={{ color: inhabilitada ? COLORES.light_gray : COLORES.light }}
        >
          {valorCentral}
          {unidadCentral ?? ''}
        </span>
      </div>

      {/* Segunda variable + chevron - 20% pegada a la derecha */}
      <div
        className="flex items-center gap-2 justify-end"
        style={{ width: '20%' }}
      >
        <span
          className={textSize}
          style={{ color: inhabilitada ? COLORES.light_gray : COLORES.success }}
        >
          {valor}
          {unidad ?? ''}
        </span>

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
