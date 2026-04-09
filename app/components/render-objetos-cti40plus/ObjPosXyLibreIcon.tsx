'use client';

import type { JSX } from 'react';
import { LuCircle } from 'react-icons/lu';
import type { ObjBase } from '../pantalla-types';
import { resolverIconoCTI40Plus } from './iconos-cti40plus';

interface Props {
  obj: ObjBase;
}

export default function ObjPosXyLibreIcon({ obj }: Props): JSX.Element {
  const posX = (obj.posX as number) ?? 0;
  const posY = (obj.posY as number) ?? 0;
  const anchoPx = (obj.anchoPx as number) ?? 32;
  const altoPx = (obj.altoPx as number) ?? 32;
  const icono = (obj.icono as number) ?? 0;
  const accion = (obj.accion as number) ?? 0;

  const Icono = resolverIconoCTI40Plus(icono);
  const iconSize = Math.min(anchoPx, altoPx);

  return (
    <div
      style={{
        position: 'absolute',
        left: posX,
        top: posY,
        width: anchoPx,
        height: altoPx,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: accion > 0 ? 'pointer' : 'default'
      }}
    >
      {Icono ? (
        <Icono
          size={iconSize}
          color="#ffffff"
        />
      ) : (
        <LuCircle
          size={iconSize}
          color="#555"
        />
      )}
    </div>
  );
}
