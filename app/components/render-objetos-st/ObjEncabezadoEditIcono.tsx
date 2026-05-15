'use client';

import { useMemo } from 'react';
import type { JSX } from 'react';
import type { ObjBase, DescriptorPantalla } from '../pantalla-types';
import { resolverIconoCTI40Plus } from './iconos-cti40plus';

const SCREEN_PTR_MIN = 65536;

interface Props {
  obj: ObjBase;
  idPantallaActual: number;
  indicePantallaActual: number;
  onNavegar: (descriptor: DescriptorPantalla) => void;
  responsive?: boolean;
}

/** Botón de acción del encabezado (tipoObjeto: 31 – objEncabezadoEditIcono).
 *  Pinta el icono indicado en iconoBarraTareas a la derecha del header y navega
 *  usando valorEditableONav con la misma convención que el resto de objetos. */
export default function ObjEncabezadoEditIcono({ obj, idPantallaActual, indicePantallaActual, onNavegar, responsive }: Props): JSX.Element | null {
  const iconoId = obj.iconoBarraTareas as number | undefined;
  const nav = (obj.valorEditableONav as number | undefined) ?? 0;
  const Icono = useMemo(() => (iconoId === null || iconoId === undefined ? null : resolverIconoCTI40Plus(iconoId)), [iconoId]);
  if (iconoId === null || iconoId === undefined) return null;
  if (!Icono) return null;

  const handleClick = (): void => {
    if (nav <= 0) return;
    if (nav >= SCREEN_PTR_MIN) {
      onNavegar({ idPantalla: nav, indicePantalla: indicePantallaActual, esPrincipal: false });
      return;
    }

    onNavegar({ idPantalla: idPantallaActual, indicePantalla: indicePantallaActual, esPrincipal: false, idUnicoEdicion: nav });
  };

  return (
    <button
      onClick={handleClick}
      className="p-1 text-white hover:text-gray-200 transition-colors"
      aria-label="Acción de edición"
    >
      {/* eslint-disable-next-line react-hooks/static-components */}
      <Icono size={responsive === true ? 28 : 60} />
    </button>
  );
}
