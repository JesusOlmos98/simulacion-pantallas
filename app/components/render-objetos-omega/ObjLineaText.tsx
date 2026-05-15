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

interface ObjLineaTextProps {
  obj: Record<string, unknown>;
  onNavegar: OnNavegar;
  esLista?: boolean;
}

export default function ObjLineaText({ obj, onNavegar, esLista }: ObjLineaTextProps): JSX.Element {
  const nav = obj.valorEditableONav as number;
  const texto = resolveText(obj.texto as number);
  const Icono = useMemo<IconType | null>(() => resolverIcono(obj.iconoLinea as number), [obj.iconoLinea]);

  if (esLista === true) {
    return (
      <div className="px-4">
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
          <ChevronRight />
        </div>
      </div>
    );
  }

  return (
    <div
      className="aspect-square rounded-lg flex flex-col items-center justify-center text-center gap-2 p-4 cursor-pointer transition-all duration-200 hover:scale-110"
      onClick={() => navegarSimple(nav, obj.indicePantalla as number, onNavegar)}
    >
      {Icono && (
        <Icono
          className="text-white"
          size={72}
        />
      )}
      <span
        className="text-base font-medium break-words leading-tight"
        style={{ color: COLORES.menuWords }}
      >
        {texto}
      </span>
    </div>
  );
}
