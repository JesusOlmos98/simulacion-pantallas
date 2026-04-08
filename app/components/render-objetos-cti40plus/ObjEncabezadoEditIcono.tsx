'use client';

import type { JSX } from 'react';
import type { ObjBase } from '../pantalla-types';
import { resolverIconoCTI40Plus } from './iconos-cti40plus';

interface Props {
  obj: ObjBase;
}

/** Botón de acción del encabezado (tipoObjeto: 31 – objEncabezadoEditIcono).
 *  Pinta el icono indicado en iconoBarraTareas a la derecha del header. */
export default function ObjEncabezadoEditIcono({ obj }: Props): JSX.Element | null {
  const iconoId = obj.iconoBarraTareas as number | undefined;
  if (!iconoId) return null;

  const Icono = resolverIconoCTI40Plus(iconoId);
  if (!Icono) return null;

  return (
    <button
      className="p-1 text-white hover:text-gray-200 transition-colors"
      aria-label="Acción de edición"
    >
      <Icono size={60} />
    </button>
  );
}
