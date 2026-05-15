import type { CSSProperties, JSX } from 'react';
import { LuX } from 'react-icons/lu';
import type { ObjBase } from '../pantalla-types';
import { COLORES, ObjLineaInfoTextTextVarVar, ObjLineaInfoTextVar } from '../render-objetos-st';
import ObjLineaInfoTextText from '../render-objetos-st/ObjLineaInfoTextText';

interface DialogInfoPantallaProps {
  abierto: boolean;
  titulo: string;
  infoObjetos: ObjBase[];
  textoConcatenadoMap: Map<number, string>;
  onClose: () => void;
  className: string;
  scrollClassName: string;
  scrollStyle: CSSProperties;
  responsive?: boolean;
  lang?: string;
}

export default function DialogInfoPantalla({
  abierto,
  titulo,
  infoObjetos,
  textoConcatenadoMap,
  onClose,
  className,
  scrollClassName,
  scrollStyle,
  responsive,
  lang
}: DialogInfoPantallaProps): JSX.Element | null {
  if (!abierto || infoObjetos.length === 0) return null;

  const isResponsive = responsive === true;
  const iconSize = isResponsive ? 28 : 60;
  const titleClassName = isResponsive
    ? 'min-w-0 flex-1 text-center text-lg font-normal leading-tight text-white line-clamp-2 px-2'
    : 'flex-1 text-center text-5xl font-normal text-white line-clamp-2 px-2';
  const spacerWidth = isResponsive ? 36 : 56;

  return (
    <div
      className={className}
      style={{ backgroundColor: COLORES.lastBackground }}
    >
      <div
        className="flex items-center px-3 py-3 shrink-0"
        style={{ backgroundColor: COLORES.info }}
      >
        <button
          className="p-1 text-white hover:text-gray-200 transition-colors"
          aria-label="Cerrar"
          onClick={onClose}
        >
          <LuX size={iconSize} />
        </button>
        <span className={titleClassName}>{titulo}</span>
        <div style={{ width: spacerWidth }} />
      </div>

      <div
        className={scrollClassName}
        style={scrollStyle}
      >
        <div
          className="rounded-2xl"
          style={{ backgroundColor: COLORES.tertiary }}
        >
          {infoObjetos.map((obj, i) => {
            switch (obj.tipoObjeto) {
              case 6:
                return (
                  <ObjLineaInfoTextVar
                    key={i}
                    obj={obj}
                    textoConcatenados={textoConcatenadoMap}
                    responsive={isResponsive}
                    lang={lang}
                  />
                );
              case 19:
                return (
                  <ObjLineaInfoTextTextVarVar
                    key={i}
                    obj={obj}
                    textoConcatenados={textoConcatenadoMap}
                    responsive={isResponsive}
                    lang={lang}
                  />
                );
              case 7:
              default:
                return (
                  <ObjLineaInfoTextText
                    key={i}
                    obj={obj}
                    textoConcatenados={textoConcatenadoMap}
                    responsive={isResponsive}
                    lang={lang}
                  />
                );
            }
          })}
        </div>
      </div>
    </div>
  );
}
