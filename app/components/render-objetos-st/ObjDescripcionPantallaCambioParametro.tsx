'use client';

import type { JSX } from 'react';
import type { ObjBase } from '../pantalla-types';

export interface ObjDescripcionPantallaCambioParametroProps {
  obj: ObjBase;
}

export default function ObjDescripcionPantallaCambioParametro({ obj: _obj }: ObjDescripcionPantallaCambioParametroProps): JSX.Element | null {
  // ObjDescripcionPantallaCambioParametro (tipoObjeto: 56) - no se renderiza visualmente.
  // Su propósito: cuando existe en la pantalla, al enviar el comando cambiaParametro
  // se usa su descripcionText como textoTituloVariable en lugar del título de la pantalla.
  // Ejemplo: en vez de enviar "Entrada Aire A1", se envía "Entrada Aire A1 Influencia Refrigeración".
  return null;
}
