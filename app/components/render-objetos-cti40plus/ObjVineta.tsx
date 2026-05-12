'use client';

import type { JSX } from 'react';
import type { ObjBase } from '../pantalla-types';

export interface ObjVinetaProps {
  obj: ObjBase;
}

export default function ObjVineta({ obj: _obj }: ObjVinetaProps): JSX.Element | null {
  // ObjVineta (tipoObjeto: 41) - objeto inútil que no se renderiza en CTI40 PLUS
  return null;
}
