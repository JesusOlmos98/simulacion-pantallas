'use client';

import type { JSX } from 'react';
import type { ObjBase, DescriptorPantalla } from '../pantalla-types';
import { resolveText } from './textos/resolverTexto';
import { decodificarRangoFloat, decodificarVariable, resolverUnidad } from './pantalla-utils';
import { COLORES, getColorHex } from './colors';
import { EnTipoVariable } from '../../../src/utils/common-lib-commac-generador/NXP_BE/globals/enumOld';

export interface Celda {
  tipoVar: number;
  valor: number | { type: 'Buffer'; data: number[] };
  unidad?: number;
}

export interface FilaObj extends ObjBase {
  celdas: Celda[];
  colorColumna1: number;
  colorFila: number;
  navPtr: number;
  navIndice: number;
}

export interface ObjTablaDinamicaFilaProps {
  fila: FilaObj;
  rowIdx: number;
  onNavegar: (d: DescriptorPantalla) => void;
  responsive?: boolean;
  smallFontSize?: boolean;
  gridTemplateColumns?: string;
  minWidth?: number;
}

const TIPO_VAR_TEXTO = 31;

function renderCelda(celda: Celda): string {
  if (celda.tipoVar === TIPO_VAR_TEXTO) {
    if (typeof celda.valor !== 'number') return '—';
    return resolveText((celda.valor & 0xffff) >>> 0);
  }
  if (celda.tipoVar === EnTipoVariable.rangoFloat) return decodificarRangoFloat(celda.valor);
  if (typeof celda.valor !== 'number') return '—';

  const valor = decodificarVariable(celda.valor, celda.tipoVar);
  if (celda.unidad !== undefined && celda.unidad !== 0) {
    const unidadStr = resolverUnidad(celda.unidad);
    return unidadStr ? `${valor}${unidadStr}` : valor;
  }
  return valor;
}

function bgFila(rowIdx: number): string {
  if (rowIdx === 0) return COLORES.lastBackground;
  return rowIdx % 2 === 1 ? COLORES.tertiary : COLORES.grey_table;
}

export default function ObjTablaDinamicaFila({ fila, rowIdx, onNavegar, responsive, smallFontSize, gridTemplateColumns, minWidth }: ObjTablaDinamicaFilaProps): JSX.Element {
  const isResponsive = responsive === true;
  const useSmallFont = smallFontSize === true;
  const esNavegable = fila.navPtr > 0;
  const bg = bgFila(rowIdx);
  const handleClick = esNavegable ? (): void => onNavegar({ idPantalla: fila.navPtr, indicePantalla: fila.navIndice, esPrincipal: false }) : undefined;

  const getTextSizeClass = (celda: Celda): string => {
    const texto = renderCelda(celda);
    if (isResponsive) {
      if (useSmallFont || texto.length > 24) return 'text-xs';
      return 'text-sm';
    }
    if (rowIdx !== 0) return 'text-3xl';
    if (texto.length > 24) return 'text-xl';
    return 'text-3xl';
  };

  const getCellTextColor = (colIdx: number): string =>
    colIdx === 0 ? (fila.colorColumna1 === 1 ? COLORES.light : getColorHex(fila.colorColumna1)) : fila.colorFila === 1 ? COLORES.light : getColorHex(fila.colorFila);

  return (
    <div
      className={`${isResponsive ? 'grid min-h-10' : 'flex h-20'} ${esNavegable ? 'cursor-pointer hover:brightness-80 active:brightness-75' : ''}`}
      onClick={handleClick}
      style={isResponsive ? { gridTemplateColumns, minWidth } : undefined}
    >
      {fila.celdas.map((celda, colIdx) => (
        <div
          key={colIdx}
          className={`${isResponsive ? 'flex min-w-0 items-center justify-center px-1 py-2 text-center whitespace-normal break-words leading-tight' : 'flex-1 flex items-center justify-center px-1 text-center'} ${
            isResponsive && colIdx === 0 ? 'sticky left-0 z-10 border-r border-white/10 shadow-[6px_0_10px_rgba(0,0,0,0.2)]' : ''
          } ${getTextSizeClass(celda)}`}
          style={{ backgroundColor: bg, color: getCellTextColor(colIdx) }}
        >
          {renderCelda(celda)}
        </div>
      ))}
    </div>
  );
}
