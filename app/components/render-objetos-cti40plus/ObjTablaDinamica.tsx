'use client';

import type { JSX } from 'react';
import type { ObjBase, DescriptorPantalla } from '../pantalla-types';
import ObjTablaDinamicaFila, { type FilaObj } from './ObjTablaDinamicaFila';

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface ObjTablaDinamicaProps {
  init: ObjBase;
  filas: ObjBase[];
  onNavegar: (d: DescriptorPantalla) => void;
  responsive?: boolean;
}

// ─── Componente ───────────────────────────────────────────────────────────────

export default function ObjTablaDinamica({ init: _init, filas, onNavegar, responsive }: ObjTablaDinamicaProps): JSX.Element {
  return (
    <div className="w-full">
      {filas.map((filaBase, rowIdx) => (
        <ObjTablaDinamicaFila
          key={rowIdx}
          fila={filaBase as FilaObj}
          rowIdx={rowIdx}
          onNavegar={onNavegar}
          responsive={responsive}
        />
      ))}
    </div>
  );
}
