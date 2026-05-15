'use client';

import type { JSX } from 'react';
import type { ObjBase, DescriptorPantalla } from '../components/pantalla-types';
import ObjPosXyLibreIcon from '../components/render-objetos-st/ObjPosXyLibreIcon';
import ObjPosXyLibreTexto from '../components/render-objetos-st/ObjPosXyLibreTexto';
import ObjPosXyLibreVariable from '../components/render-objetos-st/ObjPosXyLibreVariable';
import ObjPosXyLibreLineas from '../components/render-objetos-st/ObjPosXyLibreLineas';
import { COLORES, parseConcatenado } from '../components/render-objetos-st';
import { EnObjPintaPantallasOmega } from '@/src/utils/common-lib-commac-generador/NXP_BE/globals/enumOld';

interface Props {
  objetos: ObjBase[];
  onNavegar: (descriptor: DescriptorPantalla) => void;
  idPantallaActual: number;
  indicePantallaActual: number;
  /** Ancho del contenedor en px. Si se omite, usa la escala fija 3x (960px). */
  containerWidth?: number;
}

export default function PantallaLibre({ objetos, onNavegar, idPantallaActual, indicePantallaActual, containerWidth }: Props): JSX.Element {
  const resObj = objetos.find((o) => o.tipoObjeto === 72);
  const sizeX = (resObj?.sizeX as number) ?? 320;
  const sizeY = (resObj?.sizeY as number) ?? 240;
  const tieneEncabezado = objetos.some((o) => o.tipoObjeto === 2);
  const areasNavegacionVisibles = objetos.filter(
    (o) => o.tipoObjeto === EnObjPintaPantallasOmega.objPosXyAreaNavegacion && ((o.ancho as number | undefined) ?? 0) > 0 && ((o.alto as number | undefined) ?? 0) > 0
  );
  const rectangulosListado = objetos.filter(
    (o) =>
      o.tipoObjeto === EnObjPintaPantallasOmega.objPosXyLibreLineas &&
      ((o.color as number | undefined) ?? 0) === 13 &&
      ((o.posXFin as number | undefined) ?? 0) > ((o.posXInicio as number | undefined) ?? 0) &&
      ((o.posYFin as number | undefined) ?? 0) > ((o.posYInicio as number | undefined) ?? 0)
  );
  const elementosCentrado = areasNavegacionVisibles.length > 0 ? areasNavegacionVisibles : rectangulosListado;
  const esListadoLibreConEncabezado = tieneEncabezado && elementosCentrado.length > 0;

  // Escala dinámica: si se pasa containerWidth, ajustamos al contenedor; si no, 3x fijo (desktop).
  const ESCALA = containerWidth !== undefined ? containerWidth / sizeX : 3;
  const contentOffsetTop = esListadoLibreConEncabezado ? 6 : 0;
  const contentOffsetBottom = esListadoLibreConEncabezado ? 10 : 0;
  const contentOffsetLeft =
    esListadoLibreConEncabezado && elementosCentrado.length > 0
      ? Math.max(
          0,
          (sizeX -
            (Math.max(...elementosCentrado.map((o) => (o.posXFin as number | undefined) ?? ((o.posXInicio as number | undefined) ?? 0) + ((o.ancho as number | undefined) ?? 0))) -
              Math.min(...elementosCentrado.map((o) => (o.posXInicio as number | undefined) ?? 0)))) /
            2 -
            Math.min(...elementosCentrado.map((o) => (o.posXInicio as number | undefined) ?? 0))
        )
      : 0;

  const textoConcatenadoMap = new Map(
    objetos
      .filter((o) => o.tipoObjeto === EnObjPintaPantallasOmega.objTextoConcatenadoPlantilla) //67
      .map((o) => [(o.idTextoConcatenado as number) ?? 0, parseConcatenado(o.cadenaConcatenadaRaw as { type: string; data: number[] })] as const)
  );

  const objetosLibres = objetos.filter((o) => o.tipoObjeto === 73 || o.tipoObjeto === 74 || o.tipoObjeto === 75 || o.tipoObjeto === 76);
  const contentHeight = Math.max(
    sizeY,
    ...objetosLibres.map((o) => {
      if (o.tipoObjeto === EnObjPintaPantallasOmega.objPosXyLibreLineas) return (o.posYFin as number | undefined) ?? sizeY;
      return ((o.posY as number | undefined) ?? 0) + ((o.altoPx as number | undefined) ?? 0);
    })
  );

  return (
    // Contenedor externo con las dimensiones ya escaladas
    <div
      style={{ width: sizeX * ESCALA, height: (contentHeight + contentOffsetTop + contentOffsetBottom) * ESCALA, position: 'relative', overflow: 'hidden', backgroundColor: COLORES.lastBackground }}
    >
      {/* Canvas nativo escalado desde la esquina superior izquierda */}
      <div
        style={{
          position: 'absolute',
          top: contentOffsetTop * ESCALA,
          left: contentOffsetLeft * ESCALA,
          width: sizeX,
          height: contentHeight,
          transform: `scale(${ESCALA})`,
          transformOrigin: 'top left'
        }}
      >
        {objetosLibres.map((obj, i) => {
          switch (obj.tipoObjeto) {
            case 73:
              return (
                <ObjPosXyLibreIcon
                  key={i}
                  obj={obj}
                  onNavegar={onNavegar}
                  idPantallaActual={idPantallaActual}
                  indicePantallaActual={indicePantallaActual}
                />
              );
            case 75:
              return (
                <ObjPosXyLibreVariable
                  key={i}
                  obj={obj}
                />
              );
            case 74:
              return (
                <ObjPosXyLibreTexto
                  key={i}
                  obj={obj}
                  onNavegar={onNavegar}
                  idPantallaActual={idPantallaActual}
                  indicePantallaActual={indicePantallaActual}
                  textoConcatenados={textoConcatenadoMap}
                />
              );
            case 76:
              return (
                <ObjPosXyLibreLineas
                  key={i}
                  obj={obj}
                />
              );
            default:
              return null;
          }
        })}
      </div>
    </div>
  );
}
