'use client';
/* eslint-disable react-hooks/static-components */

import { useMemo } from 'react';
import type { JSX } from 'react';
import type { IconType } from 'react-icons/lib';
import { COLORES } from './colors';
import { resolverIcono } from './iconos-omega';
import { resolveText } from '../render-objetos-st/textos/resolverTexto';
import { navegarSimple, ChevronRight } from './RenderHelpers';

type OnNavegar = (d: { idPantalla: number; indicePantalla: number; esPrincipal: boolean; idUnicoEdicion?: number }) => void;

interface ObjLineaTextTextProps {
  obj: Record<string, unknown>;
  onNavegar: OnNavegar;
}

export default function ObjLineaTextText({ obj, onNavegar }: ObjLineaTextTextProps): JSX.Element {
  const nav = obj.valorEditableONav as number;
  const texto = resolveText(obj.texto as number);
  const textoVar = resolveText(obj.textoVar as number);
  const Icono = useMemo<IconType | null>(() => resolverIcono(obj.iconoLinea as number), [obj.iconoLinea]);

  return (
    <div className="col-span-7 px-4">
      <div
        className="flex items-center gap-5 px-8 py-5 cursor-pointer hover:bg-white/5 active:bg-white/10 transition-colors border-b border-zinc-700"
        onClick={() => navegarSimple(nav, obj.indicePantalla as number, onNavegar)}
      >
        {Icono && (
          <Icono
            className="text-white shrink-0"
            size={36}
          />
        )}
        <span className="flex-1 text-2xl font-normal text-white">{texto}</span>
        <span
          className="text-xl font-medium shrink-0"
          style={{ color: COLORES.menuWords }}
        >
          {textoVar}
        </span>
        <ChevronRight />
      </div>
    </div>
  );
}
