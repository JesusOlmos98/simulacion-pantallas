'use client';

import type { JSX } from 'react';
import type { ObjBase } from '../pantalla-types';

export interface ObjVarIndividualProps {
  obj: ObjBase;
}

export default function ObjVarIndividual({ obj: _obj }: ObjVarIndividualProps): JSX.Element | null {
  // ObjVarIndividual (tipoObjeto: 36) - no se renderiza en CTI40 PLUS
  return null;
}
