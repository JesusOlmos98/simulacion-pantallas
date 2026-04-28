'use client';

import type { JSX } from 'react';
import type { ObjBase } from '../pantalla-types';
import type { ConfigTabla } from './ObjTablaConfig';
import { decodificarVariable } from './pantalla-utils';
import { COLORES, getColorHex } from './colors';

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface Item {
  tipoDato: number;
  variable: number;
}

export interface ObjTablaDatosSinEdicionProps {
  config: ConfigTabla;
  datos: ObjBase;
  responsive?: boolean;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function bgFila(rowIdx: number): string {
  if (rowIdx === 0) return 'transparent';
  return rowIdx % 2 === 1 ? COLORES.tertiary : COLORES.disabled;
}

function getCellColor(rowIdx: number, colIdx: number, config: ConfigTabla): string {
  if (rowIdx === 0) return config.colorFila1 === 1 ? COLORES.light : getColorHex(config.colorFila1);
  if (colIdx === 0) return config.colorColumna1 === 1 ? COLORES.light : getColorHex(config.colorColumna1);
  return config.colorRestoTabla === 1 ? COLORES.light : getColorHex(config.colorRestoTabla);
}

// ─── Componente ───────────────────────────────────────────────────────────────

export default function ObjTablaDatosSinEdicion({ config, datos, responsive }: ObjTablaDatosSinEdicionProps): JSX.Element {
  const { numColumnas, numFilas } = config;
  const items = (datos.items as Item[] | undefined) ?? [];

  const filas: Item[][] = [];
  for (let r = 0; r < numFilas; r++) {
    filas.push(items.slice(r * numColumnas, (r + 1) * numColumnas));
  }

  return (
    <div className="w-full">
      {filas.map((fila, rowIdx) => (
        <div
          key={rowIdx}
          className={`flex ${responsive === true ? 'h-10' : 'h-20'} border-b border-black/15`}
          style={{ backgroundColor: bgFila(rowIdx) }}
        >
          {fila.map((celda, colIdx) => {
            const valor = decodificarVariable(celda.variable, celda.tipoDato);
            const esLargo = typeof valor === 'string' && valor.length > 20;
            const textSize = responsive === true ? (esLargo ? 'text-[10px]' : 'text-sm') : esLargo ? 'text-2xl' : 'text-3xl';
            return (
              <div
                key={colIdx}
                className={`flex-1 flex items-center justify-center text-center px-2 ${textSize}`}
                style={{ color: getCellColor(rowIdx, colIdx, config) }}
              >
                {valor}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
