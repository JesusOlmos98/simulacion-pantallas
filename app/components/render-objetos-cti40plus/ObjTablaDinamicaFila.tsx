'use client';

import type { JSX } from 'react';
import type { ObjBase, DescriptorPantalla } from '../pantalla-types';
import { resolveText } from './textos/resolverTexto';
import { decodificarRangoFloat, decodificarVariable, resolverUnidad } from './pantalla-utils';
import { COLORES, getColorHex } from './colors';
import { EnTipoVariable } from '../../../src/utils/common-lib-commac-generador/NXP_BE/globals/enumOld';

// ─── Tipos ────────────────────────────────────────────────────────────────────

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
}

// ─── Helper ───────────────────────────────────────────────────────────────────

// tipoVar 31 = EnTipoVariable.texto
// El valor viene codificado como uint32; los 16 bits bajos contienen el ID de texto.
const TIPO_VAR_TEXTO = 31;

/** El valor suele venir en uint32, en ese caso se suele tener que coger los 2 bytes menos significativos y de ahí se obtiene el texto (miembro del EnTextos) correcto. */
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

// ─── Componente ───────────────────────────────────────────────────────────────

function bgFila(rowIdx: number): string {
  if (rowIdx === 0) return 'transparent';
  return rowIdx % 2 === 1 ? COLORES.tertiary : COLORES.quaternary;
}

export default function ObjTablaDinamicaFila({ fila, rowIdx, onNavegar, responsive }: ObjTablaDinamicaFilaProps): JSX.Element {
  const esNavegable = fila.navPtr > 0;
  const bg = bgFila(rowIdx);
  const handleClick = esNavegable ? (): void => onNavegar({ idPantalla: fila.navPtr, indicePantalla: fila.navIndice, esPrincipal: false }) : undefined;

  // Determina tamaño de fuente: si encabezado con texto largo, reduce font-size
  const getTextSizeClass = (celda: Celda): string => {
    if (responsive) return 'text-sm';
    if (rowIdx !== 0) return 'text-3xl';
    const texto = renderCelda(celda);
    if (texto.length > 24) return 'text-xl';
    if (texto.length > 18) return 'text-2xl';
    return 'text-3xl';
  };

  return (
    <div
      className={`flex ${responsive ? 'h-10' : 'h-20'} border-b border-black/15 ${esNavegable ? 'cursor-pointer hover:brightness-90 active:brightness-75' : ''}`}
      onClick={handleClick}
    >
      {fila.celdas.map((celda, colIdx) => (
        <div
          key={colIdx}
          className={`flex-1 flex items-center justify-center text-center px-2 ${getTextSizeClass(celda)}`}
          style={{
            backgroundColor: bg,
            color: colIdx === 0 ? (fila.colorColumna1 === 1 ? COLORES.light : getColorHex(fila.colorColumna1)) : fila.colorFila === 1 ? COLORES.light : getColorHex(fila.colorFila)
          }}
        >
          {renderCelda(celda)}
        </div>
      ))}
    </div>
  );
}
