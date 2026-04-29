'use client';

import React, { type JSX } from 'react';
import { LuCircle } from 'react-icons/lu';
import type { ObjBase, DescriptorPantalla } from '../pantalla-types';
import { resolverIconoCTI40Plus } from './iconos-cti40plus';
import { COLORES } from './colors';

const SCREEN_PTR_MIN = 65536;

interface Props {
  obj: ObjBase;
  onNavegar?: (descriptor: DescriptorPantalla) => void;
  idPantallaActual?: number;
  indicePantallaActual?: number;
}

export default function ObjPosXyLibreIcon({ obj, onNavegar, idPantallaActual = 0, indicePantallaActual = 0 }: Props): JSX.Element {
  const posX = (obj.posX as number) ?? 0;
  const posY = (obj.posY as number) ?? 0;
  const anchoPx = (obj.anchoPx as number) ?? 32;
  const altoPx = (obj.altoPx as number) ?? 32;
  const icono = (obj.icono as number) ?? 0;
  const accion = (obj.accion as number) ?? 0;
  const nav = (obj.valorEditableONav as number | undefined) ?? 0;

  const Icono = resolverIconoCTI40Plus(icono);
  const iconSize = Math.min(anchoPx, altoPx);
  const shouldBlink = icono === 270;
  const esAccionable = accion > 0 && nav > 0 && onNavegar !== undefined;

  const handleClick = (): void => {
    if (!esAccionable || onNavegar === undefined) return;

    if (nav >= SCREEN_PTR_MIN) {
      onNavegar({ idPantalla: nav, indicePantalla: (obj.indice as number | undefined) ?? (obj.indicePantalla as number | undefined) ?? 0, esPrincipal: false });
      return;
    }

    onNavegar({ idPantalla: idPantallaActual, indicePantalla: indicePantallaActual, esPrincipal: false, idUnicoEdicion: nav });
  };

  return (
    <button
      type="button"
      aria-label={`Icono ${icono}`}
      onClick={handleClick}
      style={{
        position: 'absolute',
        left: posX,
        top: posY,
        width: anchoPx,
        height: altoPx,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: esAccionable ? 'pointer' : 'default',
        background: 'transparent',
        border: 'none',
        padding: 0
      }}
    >
      {Icono ? (
        React.createElement(Icono, { size: iconSize, color: COLORES.light, style: shouldBlink ? { animation: 'blink 1s infinite' } : {} })
      ) : (
        <LuCircle
          size={iconSize}
          color="#555"
        />
      )}
      {shouldBlink && (
        <style>{`
          @keyframes blink {
            0%, 50% { opacity: 1; }
            51%, 100% { opacity: 0; }
          }
        `}</style>
      )}
    </button>
  );
}
