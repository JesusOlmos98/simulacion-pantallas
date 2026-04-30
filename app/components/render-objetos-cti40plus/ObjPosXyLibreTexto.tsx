'use client';

import type { JSX } from 'react';
import type { ObjBase, DescriptorPantalla } from '../pantalla-types';
import { resolverTextoPantalla, resolverColor } from './pantalla-utils';
import { COLORES } from './colors';
import { EnTextos } from '@/src/utils/common-lib-commac-generador/enumTextos';

const SCREEN_PTR_MIN = 65536;
const TRANSFORM_JUSTIFY: Record<number, string> = { 0: 'none', 1: 'translateX(-100%)', 2: 'translateX(-50%)' };

interface Props {
  obj: ObjBase;
  onNavegar?: (descriptor: DescriptorPantalla) => void;
  idPantallaActual?: number;
  indicePantallaActual?: number;
  textoConcatenados?: Map<number, string>;
  lang?: string;
}

export default function ObjPosXyLibreTexto({ obj, onNavegar, idPantallaActual = 0, indicePantallaActual = 0, textoConcatenados, lang }: Props): JSX.Element {
  const posX = (obj.posX as number) ?? 0;
  const color = (obj.color as number) ?? 0;
  const justificacion = (obj.justificacion as number) ?? 0;
  const accion = (obj.accion as number) ?? 0;
  const nav = (obj.valorEditableONav as number | undefined) ?? 0;
  let posY = (obj.posY as number) ?? 0;
  let altoPx = (obj.altoPx as number) ?? 16;
  let colorTexto = resolverColor(color);
  if (obj.texto === EnTextos.textDesarmado) colorTexto = COLORES.lastBackground;

  const texto = resolverTextoPantalla((obj.texto as number) ?? 0, textoConcatenados, lang);
  const transform = TRANSFORM_JUSTIFY[justificacion] ?? 'none';

  // Caso especial para el símbolo al lado del icono de wifi y usb
  const esTextoConcatenado = (obj.texto as number) >= 65000;
  if (esTextoConcatenado && textoConcatenados !== undefined && textoConcatenados.has((obj.texto as number) ?? 0)) {
    colorTexto = COLORES.primary;
    altoPx = 10;
    posY += 8;
  }
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
      aria-label={texto}
      onClick={handleClick}
      style={{
        position: 'absolute',
        left: posX,
        top: posY,
        height: altoPx,
        transform,
        display: 'flex',
        alignItems: 'center',
        whiteSpace: 'nowrap',
        color: colorTexto,
        fontSize: `${altoPx}px`,
        lineHeight: 1,
        cursor: esAccionable ? 'pointer' : 'default',
        background: 'transparent',
        border: 'none',
        padding: 0
      }}
    >
      {texto}
    </button>
  );
}
