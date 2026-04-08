'use client';

import type { JSX } from 'react';
import type { ObjBase, DescriptorPantalla } from '../pantalla-types';
import { resolverTexto, decodificarVariable } from './pantalla-utils';
import { COLORES } from './colors';

// ─── Tipos ────────────────────────────────────────────────────────────────────

export interface Celda {
  tipoVar: number;
  valor: number;
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
}

// ─── Helper ───────────────────────────────────────────────────────────────────

// tipoVar 31 = EnTipoVariable.texto
// El valor viene codificado como uint32; los 16 bits bajos contienen el ID de texto.
const TIPO_VAR_TEXTO = 31;

/** El valor suele venir en uint32, en ese caso se suele tener que coger los 2 bytes menos significativos y de ahí se obtiene el texto (miembro del EnTextos) correcto. */
function renderCelda(celda: Celda): string {
  if (celda.tipoVar === TIPO_VAR_TEXTO) return resolverTexto((celda.valor & 0xffff) >>> 0);
  return decodificarVariable(celda.valor, celda.tipoVar);
}

// ─── Componente ───────────────────────────────────────────────────────────────

function bgFila(rowIdx: number): string {
  if (rowIdx === 0) return 'transparent';
  return rowIdx % 2 === 1 ? COLORES.tertiary : COLORES.quaternary;
}

export default function ObjTablaDinamicaFila({ fila, rowIdx, onNavegar }: ObjTablaDinamicaFilaProps): JSX.Element {
  const esNavegable = fila.navPtr > 0;
  const bg = bgFila(rowIdx);
  const handleClick = esNavegable ? (): void => onNavegar({ idPantalla: fila.navPtr, indicePantalla: fila.navIndice, esPrincipal: false }) : undefined;

  return (
    <div
      className={`flex h-28 border-b border-black/15 ${esNavegable ? 'cursor-pointer hover:brightness-90 active:brightness-75' : ''}`}
      onClick={handleClick}
    >
      {fila.celdas.map((celda, colIdx) => (
        <div
          key={colIdx}
          className="flex-1 flex items-center justify-center text-center text-4xl px-2"
          style={{ backgroundColor: bg, color: COLORES.light }}
        >
          {renderCelda(celda)}
        </div>
      ))}
    </div>
  );
}
