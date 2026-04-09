'use client';

import type { JSX } from 'react';
import type { ObjBase } from '../pantalla-types';
import { decodificarVariable, resolverUnidad } from './pantalla-utils';
import { COLORES } from './colors';

interface Props {
  obj: ObjBase;
}

// justificacion: 0=izquierda (posX=borde izq), 1=derecha (posX=borde der), 2=centro (posX=centro)
const TRANSFORM_JUSTIFY: Record<number, string> = { 0: 'none', 1: 'translateX(-100%)', 2: 'translateX(-50%)' };

export default function ObjPosXyLibreVariable({ obj }: Props): JSX.Element {
  const posX = (obj.posX as number) ?? 0;
  const posY = (obj.posY as number) ?? 0;
  const altoPx = (obj.altoPx as number) ?? 16;
  const tipoVariable = (obj.tipoVariable as number) ?? 0;
  const variable = (obj.variable as number) ?? 0;
  const unidad = (obj.unidad as number) ?? 0;
  const justificacion = (obj.justificacion as number) ?? 0;

  const valor = decodificarVariable(variable, tipoVariable);
  const unidadStr = resolverUnidad(unidad);
  const transform = TRANSFORM_JUSTIFY[justificacion] ?? 'none';

  return (
    <div
      style={{
        position: 'absolute',
        left: posX,
        top: posY,
        height: altoPx,
        transform,
        display: 'flex',
        alignItems: 'center',
        whiteSpace: 'nowrap',
        color: COLORES.light,
        fontSize: `${altoPx}px`,
        lineHeight: 1
      }}
    >
      {valor}
      {unidadStr}
    </div>
  );
}
