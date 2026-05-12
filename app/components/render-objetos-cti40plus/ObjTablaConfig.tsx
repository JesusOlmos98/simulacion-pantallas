'use client';

import type { JSX } from 'react';
import type { ObjBase } from '../pantalla-types';

// ─── Tipos ────────────────────────────────────────────────────────────────────

export interface ConfigTabla {
  numColumnas: number;
  numFilas: number;
  colorFila1: number;
  colorColumna1: number;
  colorRestoTabla: number;
}

export interface ObjTablaConfigProps {
  obj: ObjBase;
}

// ─── Helper ───────────────────────────────────────────────────────────────────

export function parseConfigTabla(obj: ObjBase): ConfigTabla {
  return {
    numColumnas: (obj.numColumnas as number | undefined) ?? 1,
    numFilas: (obj.numFilas as number | undefined) ?? 1,
    colorFila1: (obj.colorFila1 as number | undefined) ?? 1,
    colorColumna1: (obj.colorColumna1 as number | undefined) ?? 1,
    colorRestoTabla: (obj.colorRestoTabla as number | undefined) ?? 1
  };
}

// ─── Componente ───────────────────────────────────────────────────────────────

// objTablaConfig — metadatos de la tabla estática, se gestiona agrupado en PantallaCti40Plus
export default function ObjTablaConfig(_props: ObjTablaConfigProps): JSX.Element | null {
  return null;
}
