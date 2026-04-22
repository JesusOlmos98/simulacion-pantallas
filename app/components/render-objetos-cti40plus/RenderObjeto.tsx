'use client';

import type { JSX } from 'react';
import { EnObjPintaPantallasOmega } from '../../../src/utils/common-lib-commac-generador/NXP_BE/globals/enumOld';
import ObjLineaGrafica from './ObjLineaGrafica';
import ObjTablaDinamicaInit from './ObjTablaDinamicaInit';
import ObjLineaText from './ObjLineaText';
import ObjLineaTextText from './ObjLineaTextText';
import ObjLineaTextVar from './ObjLineaTextVar';
import ObjLineaTextString from './ObjLineaTextString';
import ObjLineaTextVarVar from './ObjLineaTextVarVar';
import ObjLineaInfoTextText from './ObjLineaInfoTextText';
import ObjLineaInfoTextVar from './ObjLineaInfoTextVar';
import ObjLineaInfoTextTextVarVar from './ObjLineaInfoTextTextVarVar';
import ObjPosXyLibreIcon from './ObjPosXyLibreIcon';
import ObjPosXyLibreVariable from './ObjPosXyLibreVariable';
import ObjPosXyLibreLineas from './ObjPosXyLibreLineas';
import ObjPopup from './ObjPopup';
import ObjVineta from './ObjVineta';
import ObjVarIndividual from './ObjVarIndividual';
import ObjDescripcionPantallaCambioParametro from './ObjDescripcionPantallaCambioParametro';
import ObjVentilacionGrupoGrafico from './ObjVentilacionGrupoGrafico';
import ObjVentilacionGrupoGraficoEdit from './ObjVentilacionGrupoGraficoEdit';
import type { ObjBase, DescriptorPantalla } from '../pantalla-types';

export interface RenderObjetoProps {
  obj: ObjBase;
  onNavegar: (d: DescriptorPantalla) => void;
  idPantallaActual: number;
  indicePantallaActual: number;
  esLista?: boolean;
  textoConcatenados?: Map<number, string>;
}

export default function RenderObjeto({ obj, onNavegar, idPantallaActual, indicePantallaActual, esLista, textoConcatenados }: RenderObjetoProps): JSX.Element | null {
  // NOTA: Los objetos ObjDescripcionPantallaCambioParametro (56), ObjVineta (41) y ObjVarIndividual (36) NO renderizan nada
  switch (obj.tipoObjeto) {
    // objPlantilla — metadatos, no se pinta
    case EnObjPintaPantallasOmega.objPlantilla: // 1
      return null;

    // objEncabezado — se muestra en la barra superior, no aquí
    case EnObjPintaPantallasOmega.objEncabezado: // 2
      return null;

    // objEncabezadoEditIcono — se muestra en la barra superior, no aquí
    case EnObjPintaPantallasOmega.objEncabezadoEditIcono: // 31
      return null;

    // objIdUnicoEdicion — metadatos de edición, se gestiona a nivel de pantalla
    case EnObjPintaPantallasOmega.objIdUnicoEdicion: // 12
      return null;

    // objEditVariables — se renderiza como pantalla completa de edición, no aquí
    case EnObjPintaPantallasOmega.objEditVariables: // 8
      return null;

    // objEditVariablesString — se renderiza como pantalla completa de edición, no aquí
    case EnObjPintaPantallasOmega.objEditVariablesString: // 33
      return null;

    // objLineaTextText — fila con texto principal + texto secundario (en primary) + flecha
    case EnObjPintaPantallasOmega.objLineaTextText: // 16
      return (
        <ObjLineaTextText
          obj={obj}
          onNavegar={onNavegar}
          idPantallaActual={idPantallaActual}
          indicePantallaActual={indicePantallaActual}
        />
      );

    // objLineaTextVarVar — fila con texto principal + variable central + variable secundaria + flecha
    case EnObjPintaPantallasOmega.objLineaTextVarVar: // 3
      return (
        <ObjLineaTextVarVar
          obj={obj}
          onNavegar={onNavegar}
          idPantallaActual={idPantallaActual}
          indicePantallaActual={indicePantallaActual}
        />
      );

    // objLineaTextVar — fila con texto principal + variable decodificada + flecha
    case EnObjPintaPantallasOmega.objLineaTextVar: // 4
      return (
        <ObjLineaTextVar
          obj={obj}
          onNavegar={onNavegar}
          idPantallaActual={idPantallaActual}
          indicePantallaActual={indicePantallaActual}
        />
      );

    // objLineaText — lista de filas (tipoPlantilla 4) o grid de iconos (menú)
    case EnObjPintaPantallasOmega.objLineaText: // 5
      return (
        <ObjLineaText
          obj={obj}
          onNavegar={onNavegar}
          esLista={esLista}
          textoConcatenados={textoConcatenados}
          idPantallaActual={idPantallaActual}
        />
      );

    // objLineaTextString — fila con texto principal + variable string editable + flecha
    case EnObjPintaPantallasOmega.objLineaTextString: // 35
      return (
        <ObjLineaTextString
          obj={obj}
          onNavegar={onNavegar}
          idPantallaActual={idPantallaActual}
          indicePantallaActual={indicePantallaActual}
        />
      );

    // objTextoConcatenadoPlantilla — define el texto de un objLineaText, no pinta nada por sí solo
    case EnObjPintaPantallasOmega.objTextoConcatenadoPlantilla: // 67
      return null;

    // objBotonAccesoDirecto — botones de acceso directo (tipoObjeto: 66)
    case EnObjPintaPantallasOmega.objBarraAccesoDirectoIcon: // 66
      return null; // Se manejan en BarraBotonesCti40Plus

    // objTablaConfig — metadatos de tabla estática, se maneja agrupado en PantallaCti40Plus
    case EnObjPintaPantallasOmega.objTablaConfig: // 14
      return null;

    // objTablaDatosSinEdicion — datos de tabla estática, se manejan agrupados en PantallaCti40Plus
    case EnObjPintaPantallasOmega.objTablaDatosSinEdicion: // 28
      return null;

    // objTablaDinamicaInit — metadatos de tabla, se maneja agrupado en PantallaCti40Plus
    case EnObjPintaPantallasOmega.objTablaDinamicaInit: // 70
      return <ObjTablaDinamicaInit />;

    // objTablaDinamicaFila — filas de tabla, se manejan agrupadas en PantallaCti40Plus
    case EnObjPintaPantallasOmega.objTablaDinamicaFila: // 71
      return null;

    // objPosXyLibreResolucion — metadatos del canvas libre, no pinta nada
    case EnObjPintaPantallasOmega.objPosXyLibreResolucion: // 72
      return null;

    // objPosXyLibreIcon — icono posicionado en coordenadas absolutas
    case EnObjPintaPantallasOmega.objPosXyLibreIcon: // 73
      return <ObjPosXyLibreIcon obj={obj} />;

    // objPosXyLibreVariable — variable posicionada en coordenadas absolutas
    case EnObjPintaPantallasOmega.objPosXyLibreVariable: // 75
      return <ObjPosXyLibreVariable obj={obj} />;

    // objPosXyLibreLineas — rectángulo posicionado en coordenadas absolutas
    case EnObjPintaPantallasOmega.objPosXyLibreLineas: // 76
      return <ObjPosXyLibreLineas obj={obj} />;

    // objVentilacionGrupoGraficoEdit — cabecera + pestañas de edición de ventiladores
    case EnObjPintaPantallasOmega.objVentilacionGrupoGraficoEdit: // 22
      return <ObjVentilacionGrupoGraficoEdit obj={obj} />;

    // objVentilacionGrupoGrafico — fila con iconos de ventiladores (estado, km3, orden)
    case EnObjPintaPantallasOmega.objVentilacionGrupoGrafico: // 21
      return (
        <ObjVentilacionGrupoGrafico
          obj={obj}
          onNavegar={onNavegar}
          idPantallaActual={idPantallaActual}
          indicePantallaActual={indicePantallaActual}
        />
      );

    // objLineaGrafica — separador lógico entre bloques, no pinta nada
    case EnObjPintaPantallasOmega.objLineaGrafica: // 20
      return <ObjLineaGrafica />;

    // objLineaInfoTextText — fila info con texto principal + texto secundario
    case EnObjPintaPantallasOmega.objLineaInfoTextText: // 15
      return <ObjLineaInfoTextText obj={obj} />;

    // objLineaInfoTextVar — fila info con texto principal + variable numérica
    case EnObjPintaPantallasOmega.objLineaInfoTextVar: // 6
      return <ObjLineaInfoTextVar obj={obj} />;

    // objLineaInfoTextTextVarVar — fila info con texto principal + dos variables
    case EnObjPintaPantallasOmega.objLineaInfoTextTextVarVar: // 19
      return <ObjLineaInfoTextTextVarVar obj={obj} />;

    // objVarIndividual — no se renderiza en CTI40 PLUS
    case EnObjPintaPantallasOmega.objVarIndividual: // 36
      return <ObjVarIndividual obj={obj} />;

    // objVarIndividualNavegacionOEdit — variable con navegación
    case EnObjPintaPantallasOmega.objVarIndividualNavegacionOEdit: // 37
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

    // objPopup - diálogo modal que se muestra automáticamente
    case EnObjPintaPantallasOmega.objPopup: // 40
      return <ObjPopup obj={obj} />;

    // objDescripcionPantallaCambioParametro — no se renderiza; su descripcionText se usa como
    // textoTituloVariable al enviar cambiaParametro en lugar del título de la pantalla
    case EnObjPintaPantallasOmega.objDescripcionPantallaCambioParametro: // 56
      return <ObjDescripcionPantallaCambioParametro obj={obj} />;

    // objVineta - objeto inútil que no se renderiza
    case EnObjPintaPantallasOmega.objVineta: // 41
      return <ObjVineta obj={obj} />;

    default:
      return <div className="col-span-7 px-4 py-2 text-2xl text-zinc-400 italic">[Tipo {obj.tipoObjeto} sin renderizador]</div>;
  }
}
