'use client';

import type { JSX } from 'react';
import type { ObjBase, DescriptorPantalla } from '../pantalla-types';
import ObjTablaDinamicaFila, { type FilaObj } from './ObjTablaDinamicaFila';

interface ObjTablaDinamicaProps {
  init: ObjBase;
  filas: ObjBase[];
  onNavegar: (d: DescriptorPantalla) => void;
  responsive?: boolean;
  smallFontSize?: boolean;
  lang?: string;
}

const RESPONSIVE_FIRST_COLUMN_WIDTH = 100;
const RESPONSIVE_OTHER_COLUMN_WIDTH = 100;

export default function ObjTablaDinamica({ init, filas, onNavegar, responsive, smallFontSize, lang }: ObjTablaDinamicaProps): JSX.Element {
  const isResponsive = responsive === true;
  const numColumnas = Math.max(Number(init.numColumnas ?? 0), ...filas.map((fila) => (fila as FilaObj).celdas?.length ?? 0));
  const columnasSecundarias = Array.from({ length: Math.max(0, numColumnas - 1) }, () => `${RESPONSIVE_OTHER_COLUMN_WIDTH}px`).join(' ');
  const gridTemplateColumns = columnasSecundarias.length > 0 ? `${RESPONSIVE_FIRST_COLUMN_WIDTH}px ${columnasSecundarias}` : `${RESPONSIVE_FIRST_COLUMN_WIDTH}px`;
  const minWidth = RESPONSIVE_FIRST_COLUMN_WIDTH + Math.max(0, numColumnas - 1) * RESPONSIVE_OTHER_COLUMN_WIDTH;

  return (
    <div className={isResponsive ? 'w-full overflow-x-auto' : 'w-full'}>
      {filas.map((filaBase, rowIdx) => (
        <ObjTablaDinamicaFila
          key={rowIdx}
          fila={filaBase as FilaObj}
          rowIdx={rowIdx}
          onNavegar={onNavegar}
          responsive={isResponsive}
          smallFontSize={smallFontSize}
          gridTemplateColumns={isResponsive ? gridTemplateColumns : undefined}
          minWidth={isResponsive ? minWidth : undefined}
          lang={lang}
        />
      ))}
    </div>
  );
}
