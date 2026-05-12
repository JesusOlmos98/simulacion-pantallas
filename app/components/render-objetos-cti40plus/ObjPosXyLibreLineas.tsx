'use client';

import type { JSX } from 'react';
import type { ObjBase } from '../pantalla-types';
import { resolverColor } from './colors';
import { COLORES } from './colors';

interface Props {
  obj: ObjBase;
}

export default function ObjPosXyLibreLineas({ obj }: Props): JSX.Element {
  const posXInicio = (obj.posXInicio as number) ?? 0;
  const posYInicio = (obj.posYInicio as number) ?? 0;
  const posXFin = (obj.posXFin as number) ?? 0;
  const posYFin = (obj.posYFin as number) ?? 0;
  const color = (obj.color as number) ?? 1;

  const width = posXFin - posXInicio;
  const height = posYFin - posYInicio;
  // const borderColor = getColorHex(color); // Ya no se usa

  // Lógica condicional para colores específicos
  let borderColor: string;
  if (color === 17) {
    borderColor = COLORES.primary;
  } else if (color === 6) {
    borderColor = COLORES.tertiary;
  } else if (color === 13) {
    borderColor = COLORES.error;
  } else if (color === 5) {
    borderColor = COLORES.desarmadoTc5;
  } else {
    borderColor = resolverColor(color);
  }

  return <div style={{ position: 'absolute', left: posXInicio, top: posYInicio, width, height, backgroundColor: borderColor, borderRadius: 4, boxSizing: 'border-box', pointerEvents: 'none' }} />;
}
