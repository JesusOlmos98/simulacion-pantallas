import type { CSSProperties, Dispatch, JSX, SetStateAction } from 'react';
import type { ObjBase } from '../pantalla-types';
import ObjCamposMultiseleccion from '../render-objetos-cti40plus/ObjCamposMultiseleccion';

interface PantallaSeleccionProps {
  visible: boolean;
  camposMultiseleccion: ObjBase[];
  esRadioButton: boolean;
  esCheckbox: boolean;
  selectedIdSeleccion: number | null;
  selectedIdSelecciones: Set<number>;
  setSelectedIdSeleccion: Dispatch<SetStateAction<number | null>>;
  setSelectedIdSelecciones: Dispatch<SetStateAction<Set<number>>>;
  className: string;
  style: CSSProperties;
  responsive?: boolean;
  lang?: string;
}

export default function PantallaSeleccion({
  visible,
  camposMultiseleccion,
  esRadioButton,
  esCheckbox,
  selectedIdSeleccion,
  selectedIdSelecciones,
  setSelectedIdSeleccion,
  setSelectedIdSelecciones,
  className,
  style,
  responsive,
  lang
}: PantallaSeleccionProps): JSX.Element | null {
  if (!visible) return null;

  return (
    <div
      className={className}
      style={style}
    >
      <div>
        {camposMultiseleccion.map((obj, i) => {
          const idSeleccion = obj.idSeleccion as number;
          const opcionSeleccionada = obj.opcionSeleccionada as number;
          const isDisabled = opcionSeleccionada === 0;
          const isSelectedRadio = esRadioButton && selectedIdSeleccion === idSeleccion;
          const isSelectedCheckbox = esCheckbox && selectedIdSelecciones.has(idSeleccion);
          const isSelected = (isSelectedRadio || isSelectedCheckbox) && !isDisabled;

          const handleSelect = (): void => {
            if (isDisabled) return;

            if (esRadioButton) {
              setSelectedIdSeleccion(idSeleccion);
            } else if (esCheckbox) {
              setSelectedIdSelecciones((prev) => {
                const newSet = new Set(prev);
                if (newSet.has(idSeleccion)) {
                  newSet.delete(idSeleccion);
                } else {
                  newSet.add(idSeleccion);
                }
                return newSet;
              });
            }
          };

          return (
            <ObjCamposMultiseleccion
              key={i}
              obj={obj}
              isSelected={isSelected}
              onSelect={handleSelect}
              isDisabled={isDisabled}
              responsive={responsive === true}
              lang={lang}
            />
          );
        })}
      </div>
    </div>
  );
}
