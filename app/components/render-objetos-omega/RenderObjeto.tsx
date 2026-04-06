'use client';

import type { JSX } from 'react';
import { ObjLineaText, ObjLineaTextText, ObjLineaTextVar, ObjVarIndividual, ObjVarIndividualNavegacion } from '.';

// tipoObjeto llega como NUMBER en el JSON, no como string
export type ObjBase = Record<string, unknown> & { tipoObjeto: number };

export interface DescriptorPantalla {
  idPantalla: number; // 0 para la principal
  indicePantalla: number;
  esPrincipal: boolean;
  idUnicoEdicion?: number; // presente al navegar desde una línea (valorEditableONav)
}

export interface RenderObjetoProps {
  obj: ObjBase;
  onNavegar: (d: DescriptorPantalla) => void;
  idPantallaActual: number;
  esLista?: boolean;
}

export default function RenderObjeto({ obj, onNavegar, idPantallaActual: _idPantallaActual, esLista }: RenderObjetoProps): JSX.Element | null {
  switch (obj.tipoObjeto) {
    // objPlantilla — metadatos, no se pinta
    case 1:
      return null;

    // objEncabezado — se muestra en la barra superior, no aquí
    case 2:
      return null;

    // objLineaTextVar — fila con texto principal + variable decodificada en naranja + flecha
    case 4:
      return (
        <ObjLineaTextVar
          obj={obj}
          onNavegar={onNavegar}
        />
      );

    // objLineaTextText — fila con texto principal + textoVar en naranja + flecha
    case 16:
      return (
        <ObjLineaTextText
          obj={obj}
          onNavegar={onNavegar}
        />
      );

    // objLineaText — lista de filas (tipoPlantilla 4) o grid de iconos (menú)
    case 5:
      return (
        <ObjLineaText
          obj={obj}
          onNavegar={onNavegar}
          esLista={esLista}
        />
      );

    // objVarIndividual — variable sin navegación (fila completa)
    case 36:
      return <ObjVarIndividual obj={obj} />;

    // objVarIndividualNavegacionOEdit — variable con navegación opcional
    case 37:
      return (
        <ObjVarIndividualNavegacion
          obj={obj}
          onNavegar={onNavegar}
        />
      );

    // objLineaGrafica — separador (fila completa)
    case 20:
      return <hr className="col-span-6 border-zinc-200 my-1" />;

    // objEtapasVentiladoresVisualSize — sin renderizador por ahora
    case 47:
      return null;

    // objClaveParaEntrar — sin renderizador por ahora
    case 53:
      return null;

    default:
      return <div className="col-span-6 px-4 py-0.5 text-xs text-zinc-300 italic">[{obj.tipoObjeto}]</div>;
  }
}
