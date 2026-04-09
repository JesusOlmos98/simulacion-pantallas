'use client';

import type { JSX } from 'react';
import type { ObjBase } from '../pantalla-types';
import { getColorHex } from './colors';

interface Props {
  obj: ObjBase;
}

export default function ObjPosXyLibreLineas({ obj }: Props): JSX.Element {
  const posXInicio = (obj.posXInicio as number) ?? 0;
  const posYInicio = (obj.posYInicio as number) ?? 0;
  const posXFin = (obj.posXFin as number) ?? 0;
  const posYFin = (obj.posYFin as number) ?? 0;
  const color = (obj.color as number) ?? 1;
  const grosor = (obj.grosor as number) ?? 1;

  const width = posXFin - posXInicio;
  const height = posYFin - posYInicio;
  const borderColor = getColorHex(color);

  return (
    <div
      style={{ position: 'absolute', left: posXInicio, top: posYInicio, width, height, border: `${grosor}px solid ${borderColor}`, borderRadius: 4, boxSizing: 'border-box', pointerEvents: 'none' }}
    />
  );
}
