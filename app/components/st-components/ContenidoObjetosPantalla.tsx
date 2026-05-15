import type { CSSProperties, JSX } from 'react';
import { EnTextos } from '@/src/utils/common-lib-commac-generador/enumTextos';
import type { DerivadosCti40Plus } from '../../cti40plus/fnCti40Plus';
import type { DescriptorPantalla } from '../pantalla-types';
import { COLORES, ObjTablaDinamica, RenderObjeto } from '../render-objetos-st';
import ObjTablaDatosSinEdicion from '../render-objetos-st/ObjTablaDatosSinEdicion';
import { parseConfigTabla } from '../render-objetos-st/ObjTablaConfig';

interface ContenidoObjetosPantallaProps {
  gruposLineas: DerivadosCti40Plus['gruposLineas'];
  tablasEstaticas: DerivadosCti40Plus['tablasEstaticas'];
  tablasGrupos: DerivadosCti40Plus['tablasGrupos'];
  otrosObjetos: DerivadosCti40Plus['otrosObjetos'];
  esPantallaPrincipal: boolean;
  esLista: boolean;
  esVentilacionGrupoEdit: boolean;
  esTablaCompleja: boolean;
  actual: DescriptorPantalla;
  textoConcatenadoMap: Map<number, string>;
  onNavegar: (descriptor: DescriptorPantalla) => void;
  onRefrescarPantalla: () => void;
  className: string;
  style: CSSProperties;
  responsive?: boolean;
  lang?: string;
}

export default function ContenidoObjetosPantalla({
  gruposLineas,
  tablasEstaticas,
  tablasGrupos,
  otrosObjetos,
  esPantallaPrincipal,
  esLista,
  esVentilacionGrupoEdit,
  esTablaCompleja,
  actual,
  textoConcatenadoMap,
  onNavegar,
  onRefrescarPantalla,
  className,
  style,
  responsive,
  lang
}: ContenidoObjetosPantallaProps): JSX.Element {
  const isResponsive = responsive === true;
  const grupoClassName = isResponsive ? 'rounded-2xl mb-3' : 'rounded-2xl mb-4';
  const tablaClassName = isResponsive ? 'overflow-x-auto mb-3' : '-mx-4 -mt-4';
  const gridClassName = isResponsive ? 'grid grid-cols-4 gap-2 p-2' : 'grid grid-cols-7 gap-2 p-2';
  const principalClassName = isResponsive ? 'flex-1 flex items-center justify-center py-8' : 'flex-1 flex items-center justify-center';
  const principalTextClassName = isResponsive ? 'text-white text-lg' : 'text-white text-5xl';

  return (
    <div
      className={className}
      style={style}
    >
      {esPantallaPrincipal ? (
        <div className={principalClassName}>
          <p className={principalTextClassName}>Pantalla principal</p>
        </div>
      ) : (
        <>
          {gruposLineas.length > 0 &&
            gruposLineas.map((grupo, gi) => (
              <div
                key={gi}
                className={grupoClassName}
                style={{ backgroundColor: COLORES.tertiary }}
              >
                {grupo.map((obj, i) => (
                  <RenderObjeto
                    key={i}
                    obj={obj}
                    onNavegar={onNavegar}
                    onRefrescarPantalla={onRefrescarPantalla}
                    idPantallaActual={actual.idPantalla}
                    indicePantallaActual={actual.indicePantalla}
                    textoConcatenados={textoConcatenadoMap}
                    responsive={isResponsive}
                    lang={lang}
                  />
                ))}
              </div>
            ))}

          {tablasEstaticas.length > 0 && (
            <div className={tablaClassName}>
              {tablasEstaticas.map((tabla, ti) => (
                <ObjTablaDatosSinEdicion
                  key={ti}
                  config={parseConfigTabla(tabla.config)}
                  datos={tabla.datos}
                  responsive={isResponsive}
                />
              ))}
            </div>
          )}

          {tablasGrupos.length > 0 && (
            <div className={tablaClassName}>
              {tablasGrupos.map((tabla, ti) => (
                <ObjTablaDinamica
                  key={ti}
                  init={tabla.init}
                  filas={tabla.filas}
                  onNavegar={onNavegar}
                  responsive={isResponsive}
                  smallFontSize={esTablaCompleja}
                  lang={lang}
                />
              ))}
            </div>
          )}

          {otrosObjetos.length > 0 &&
            (esLista || esVentilacionGrupoEdit ? (
              <div className="flex flex-col">
                {otrosObjetos.map((obj, i) => (
                  <RenderObjeto
                    key={i}
                    obj={obj}
                    onNavegar={onNavegar}
                    onRefrescarPantalla={onRefrescarPantalla}
                    idPantallaActual={actual.idPantalla}
                    indicePantallaActual={actual.indicePantalla}
                    esLista
                    responsive={isResponsive}
                    lang={lang}
                  />
                ))}
              </div>
            ) : (
              <div className={gridClassName}>
                {otrosObjetos.map((obj, i) => (
                  <RenderObjeto
                    key={i}
                    obj={obj}
                    onNavegar={onNavegar}
                    onRefrescarPantalla={onRefrescarPantalla}
                    idPantallaActual={actual.idPantalla}
                    indicePantallaActual={actual.indicePantalla}
                    textoConcatenados={textoConcatenadoMap}
                    responsive={isResponsive}
                    lang={lang}
                  />
                ))}
              </div>
            ))}
        </>
      )}
    </div>
  );
}
