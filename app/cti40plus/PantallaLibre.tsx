'use client';

import type { JSX } from 'react';
import type { ObjBase, DescriptorPantalla } from '../components/pantalla-types';
import ObjPosXyLibreIcon from '../components/render-objetos-cti40plus/ObjPosXyLibreIcon';
import ObjPosXyLibreVariable from '../components/render-objetos-cti40plus/ObjPosXyLibreVariable';
import ObjPosXyLibreLineas from '../components/render-objetos-cti40plus/ObjPosXyLibreLineas';
import { COLORES } from '../components/render-objetos-cti40plus';

interface Props {
  objetos: ObjBase[];
  onNavegar: (descriptor: DescriptorPantalla) => void;
  /** Ancho del contenedor en px. Si se omite, usa la escala fija 3x (960px). */
  containerWidth?: number;
}

export default function PantallaLibre({ objetos, onNavegar: _onNavegar, containerWidth }: Props): JSX.Element {
  const resObj = objetos.find((o) => o.tipoObjeto === 72);
  const sizeX = (resObj?.sizeX as number) ?? 320;
  const sizeY = (resObj?.sizeY as number) ?? 240;

  // Escala dinámica: si se pasa containerWidth, ajustamos al contenedor; si no, 3x fijo (desktop).
  const ESCALA = containerWidth !== undefined ? containerWidth / sizeX : 3;

  const objetosLibres = objetos.filter((o) => o.tipoObjeto === 73 || o.tipoObjeto === 75 || o.tipoObjeto === 76);

  return (
    // Contenedor externo con las dimensiones ya escaladas
    <div style={{ width: sizeX * ESCALA, height: sizeY * ESCALA, position: 'relative', overflow: 'hidden', backgroundColor: COLORES.lastBackground }}>
      {/* Canvas nativo escalado desde la esquina superior izquierda */}
      <div style={{ position: 'absolute', top: 0, left: 0, width: sizeX, height: sizeY, transform: `scale(${ESCALA})`, transformOrigin: 'top left' }}>
        {objetosLibres.map((obj, i) => {
          switch (obj.tipoObjeto) {
            case 73:
              return (
                <ObjPosXyLibreIcon
                  key={i}
                  obj={obj}
                />
              );
            case 75:
              return (
                <ObjPosXyLibreVariable
                  key={i}
                  obj={obj}
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
