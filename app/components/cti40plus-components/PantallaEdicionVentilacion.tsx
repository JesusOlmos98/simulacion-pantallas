import type { CSSProperties, JSX } from 'react';
import type { IconType } from 'react-icons/lib';
import type { ObjBase, DescriptorPantalla } from '../pantalla-types';
import { COLORES } from '../render-objetos-cti40plus';
import ObjVentilacionGrupoGrafico from '../render-objetos-cti40plus/ObjVentilacionGrupoGrafico';
import ObjVentilacionGrupoGraficoEdit from '../render-objetos-cti40plus/ObjVentilacionGrupoGraficoEdit';
import { resolveText } from '../render-objetos-cti40plus/textos/resolverTexto';

interface PantallaEdicionVentilacionProps {
  visible: boolean;
  objVentilacionEdit: ObjBase | null;
  objVentilacionGrafico: ObjBase | null;
  pestanaActivaVentilacion: 0 | 1;
  estadosVentiladores: number[];
  actual: DescriptorPantalla;
  onPestanaChange: (pestana: 0 | 1) => void;
  onTrash: () => void;
  onNavegar: (descriptor: DescriptorPantalla) => void;
  onClickVentilador: (idx: number) => void;
  className: string;
  style: CSSProperties;
  iconoVentiladorRotatorio: IconType | null;
  iconoVentiladorTemporizado: IconType | null;
  iconoVentiladorEstatico: IconType | null;
  responsive?: boolean;
  lang?: string;
}

export default function PantallaEdicionVentilacion({
  visible,
  objVentilacionEdit,
  objVentilacionGrafico,
  pestanaActivaVentilacion,
  estadosVentiladores,
  actual,
  onPestanaChange,
  onTrash,
  onNavegar,
  onClickVentilador,
  className,
  style,
  iconoVentiladorRotatorio: IconoVentiladorRotatorio,
  iconoVentiladorTemporizado: IconoVentiladorTemporizado,
  iconoVentiladorEstatico: IconoVentiladorEstatico,
  responsive,
  lang
}: PantallaEdicionVentilacionProps): JSX.Element | null {
  if (!visible || !objVentilacionEdit) return null;

  const isResponsive = responsive === true;
  const legendClassName = isResponsive ? 'flex flex-col gap-4 px-4 py-4' : 'flex flex-col gap-8 px-8 py-8';
  const legendItemClassName = isResponsive ? 'flex items-center gap-3' : 'flex items-center gap-6';
  const iconSize = isResponsive ? 28 : 75;
  const textClassName = isResponsive ? 'text-lg' : 'text-5xl';

  return (
    <div
      className={className}
      style={style}
    >
      <ObjVentilacionGrupoGraficoEdit
        obj={objVentilacionEdit}
        pestanaActiva={pestanaActivaVentilacion}
        onPestanaChange={onPestanaChange}
        onTrash={onTrash}
        responsive={isResponsive}
        lang={lang}
      />

      {objVentilacionGrafico && (
        <ObjVentilacionGrupoGrafico
          obj={objVentilacionGrafico}
          onNavegar={onNavegar}
          idPantallaActual={actual.idPantalla}
          indicePantallaActual={actual.indicePantalla}
          estadosOverride={estadosVentiladores}
          onClickVentilador={onClickVentilador}
          responsive={isResponsive}
        />
      )}

      <div className={legendClassName}>
        <div className={legendItemClassName}>
          {IconoVentiladorRotatorio && <IconoVentiladorRotatorio size={iconSize} />}
          <span
            className={textClassName}
            style={{ color: COLORES.light }}
          >
            {resolveText(objVentilacionEdit.textoPestana2 as number, lang)}
          </span>
        </div>
        <div className={legendItemClassName}>
          {IconoVentiladorTemporizado && <IconoVentiladorTemporizado size={iconSize} />}
          <span
            className={textClassName}
            style={{ color: COLORES.light }}
          >
            {resolveText(objVentilacionEdit.textoPestana2 as number, lang)}
          </span>
        </div>
        <div className={legendItemClassName}>
          {IconoVentiladorEstatico && <IconoVentiladorEstatico size={iconSize} />}
          <span
            className={textClassName}
            style={{ color: COLORES.light }}
          >
            {resolveText(objVentilacionEdit.textoPestana1 as number, lang)}
          </span>
        </div>
      </div>
    </div>
  );
}
