'use client';

import type { JSX } from 'react';
import ObjLineaGrafica from './ObjLineaGrafica';
import ObjTablaDinamicaInit from './ObjTablaDinamicaInit';
import ObjLineaText from './ObjLineaText';
import ObjLineaTextText from './ObjLineaTextText';
import ObjLineaTextVar from './ObjLineaTextVar';
import ObjLineaTextVarVar from './ObjLineaTextVarVar';
import ObjLineaInfoTextText from './ObjLineaInfoTextText';
import ObjLineaInfoTextVar from './ObjLineaInfoTextVar';
import ObjLineaInfoTextTextVarVar from './ObjLineaInfoTextTextVarVar';
import ObjPosXyLibreIcon from './ObjPosXyLibreIcon';
import ObjPosXyLibreVariable from './ObjPosXyLibreVariable';
import ObjPosXyLibreLineas from './ObjPosXyLibreLineas';
import type { ObjBase, DescriptorPantalla } from '../pantalla-types';

export interface RenderObjetoProps {
  obj: ObjBase;
  onNavegar: (d: DescriptorPantalla) => void;
  idPantallaActual: number;
  esLista?: boolean;
  textoConcatenados?: Map<number, string>;
}

export default function RenderObjeto({ obj, onNavegar, idPantallaActual, esLista, textoConcatenados }: RenderObjetoProps): JSX.Element | null {
  switch (obj.tipoObjeto) {
    // objPlantilla — metadatos, no se pinta
    case 1:
      return null;

    // objEncabezado — se muestra en la barra superior, no aquí
    case 2:
      return null;

    // objEncabezadoEditIcono — se muestra en la barra superior, no aquí
    case 31:
      return null;

    // objIdUnicoEdicion — metadatos de edición, se gestiona a nivel de pantalla
    case 12:
      return null;

    // objEditVariables — se renderiza como pantalla completa de edición, no aquí
    case 8:
      return null;

    // objLineaTextText — fila con texto principal + texto secundario (en primary) + flecha
    case 16:
      return (
        <ObjLineaTextText
          obj={obj}
          onNavegar={onNavegar}
          idPantallaActual={idPantallaActual}
        />
      );

    // objLineaTextVarVar — fila con texto principal + variable central + variable secundaria + flecha
    case 3:
      return (
        <ObjLineaTextVarVar
          obj={obj}
          onNavegar={onNavegar}
          idPantallaActual={idPantallaActual}
        />
      );

    // objLineaTextVar — fila con texto principal + variable decodificada + flecha
    case 4:
      return (
        <ObjLineaTextVar
          obj={obj}
          onNavegar={onNavegar}
          idPantallaActual={idPantallaActual}
        />
      );

    // objLineaText — lista de filas (tipoPlantilla 4) o grid de iconos (menú)
    case 5:
      return (
        <ObjLineaText
          obj={obj}
          onNavegar={onNavegar}
          esLista={esLista}
          textoConcatenados={textoConcatenados}
        />
      );

    // objTextoConcatenadoPlantilla — define el texto de un objLineaText, no pinta nada por sí solo
    case 67:
      return null;

    // objBotonAccesoDirecto — botones de acceso directo (tipoObjeto: 66)
    case 66:
      return null; // Se manejan en BarraBotonesCti40Plus

    // objTablaDinamicaInit — metadatos de tabla, se maneja agrupado en PantallaCti40Plus
    case 70:
      return <ObjTablaDinamicaInit />;

    // objTablaDinamicaFila — filas de tabla, se manejan agrupadas en PantallaCti40Plus
    case 71:
      return null;

    // objPosXyLibreResolucion — metadatos del canvas libre, no pinta nada
    case 72:
      return null;

    // objPosXyLibreIcon — icono posicionado en coordenadas absolutas
    case 73:
      return <ObjPosXyLibreIcon obj={obj} />;

    // objPosXyLibreVariable — variable posicionada en coordenadas absolutas
    case 75:
      return <ObjPosXyLibreVariable obj={obj} />;

    // objPosXyLibreLineas — rectángulo posicionado en coordenadas absolutas
    case 76:
      return <ObjPosXyLibreLineas obj={obj} />;

    // objLineaGrafica — separador lógico entre bloques, no pinta nada
    case 20:
      return <ObjLineaGrafica />;

    // objLineaInfoTextText — fila info con texto principal + texto secundario
    case 15:
      return <ObjLineaInfoTextText obj={obj} />;

    // objLineaInfoTextVar — fila info con texto principal + variable numérica
    case 6:
      return <ObjLineaInfoTextVar obj={obj} />;

    // objLineaInfoTextTextVarVar — fila info con texto principal + dos variables
    case 19:
      return <ObjLineaInfoTextTextVarVar obj={obj} />;

    // objVarIndividual — variable sin navegación
    case 36:
      return <div className="col-span-7 px-4 py-2 text-5xl text-white">{JSON.stringify(obj)}</div>;

    // objVarIndividualNavegacionOEdit — variable con navegación
    case 37:
      const nav = (obj.valorEditableONav as number | undefined) ?? 0;
      if (nav > 0) {
        return (
          <div
            className="col-span-7 px-4 py-2 text-5xl text-white cursor-pointer hover:bg-white/5 transition-colors"
            onClick={() => onNavegar({ idPantalla: nav, indicePantalla: (obj.indicePantalla as number | undefined) ?? 0, esPrincipal: false })}
          >
            {JSON.stringify(obj)}
          </div>
        );
      }
      return <div className="col-span-7 px-4 py-2 text-5xl text-white">{JSON.stringify(obj)}</div>;

    default:
      return <div className="col-span-7 px-4 py-2 text-2xl text-zinc-400 italic">[Tipo {obj.tipoObjeto} sin renderizador]</div>;
  }
}
