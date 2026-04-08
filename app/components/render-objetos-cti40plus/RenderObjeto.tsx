'use client';

import type { JSX } from 'react';
import ObjLineaGrafica from './ObjLineaGrafica';
import ObjTablaDinamicaInit from './ObjTablaDinamicaInit';
import ObjLineaText from './ObjLineaText';
import ObjLineaTextText from './ObjLineaTextText';
import ObjLineaTextVar from './ObjLineaTextVar';
import type { ObjBase, DescriptorPantalla } from '../pantalla-types';

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

    // objLineaTextText — fila con texto principal + texto secundario (en primary) + flecha
    case 16:
      return (
        <ObjLineaTextText
          obj={obj}
          onNavegar={onNavegar}
        />
      );

    // objLineaTextVar — fila con texto principal + variable decodificada + flecha
    case 4:
      return (
        <ObjLineaTextVar
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

    // objBotonAccesoDirecto — botones de acceso directo (tipoObjeto: 66)
    case 66:
      return null; // Se manejan en BarraBotonesCti40Plus

    // objTablaDinamicaInit — metadatos de tabla, se maneja agrupado en PantallaCti40Plus
    case 70:
      return <ObjTablaDinamicaInit />;

    // objTablaDinamicaFila — filas de tabla, se manejan agrupadas en PantallaCti40Plus
    case 71:
      return null;

    // objLineaGrafica — separador lógico entre bloques, no pinta nada
    case 20:
      return <ObjLineaGrafica />;

    // objVarIndividual — variable sin navegación
    case 36:
      return <div className="col-span-7 px-4 py-2 text-4xl text-white">{JSON.stringify(obj)}</div>;

    // objVarIndividualNavegacionOEdit — variable con navegación
    case 37:
      const nav = (obj.valorEditableONav as number | undefined) ?? 0;
      if (nav > 0) {
        return (
          <div
            className="col-span-7 px-4 py-2 text-4xl text-white cursor-pointer hover:bg-white/5 transition-colors"
            onClick={() => onNavegar({ idPantalla: nav, indicePantalla: (obj.indicePantalla as number | undefined) ?? 0, esPrincipal: false })}
          >
            {JSON.stringify(obj)}
          </div>
        );
      }
      return <div className="col-span-7 px-4 py-2 text-4xl text-white">{JSON.stringify(obj)}</div>;

    default:
      return <div className="col-span-7 px-4 py-2 text-2xl text-zinc-400 italic">[Tipo {obj.tipoObjeto} sin renderizador]</div>;
  }
}
