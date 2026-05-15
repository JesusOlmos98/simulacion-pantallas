import type { JSX } from 'react';
import { LuCheck, LuChevronLeft, LuMenu, LuX } from 'react-icons/lu';
import { EnTextos } from '@/src/utils/common-lib-commac-generador/enumTextos';
import type { DerivadosCti40Plus } from '../../cti40plus/fnCti40Plus';
import type { DescriptorPantalla, ObjBase } from '../pantalla-types';
import { COLORES, resolverIconoCTI40Plus } from '../render-objetos-cti40plus';
import ObjEncabezadoEditIcono from '../render-objetos-cti40plus/ObjEncabezadoEditIcono';
import { resolveText } from '../render-objetos-cti40plus/textos/resolverTexto';

interface PantallaHeaderProps {
  actual: DescriptorPantalla;
  pilaLength: number;
  objetos: ObjBase[] | null;
  barraAccesoDirecto: ObjBase[];
  esPantallaPrincipal: boolean;
  esTeclado: boolean;
  esSeleccion: boolean;
  esVentilacionGrupoEdit: boolean;
  menuNavPtr: number | undefined;
  titulo: string;
  tituloVentilacionEdit: string | null;
  colorHeader: string;
  tareas: DerivadosCti40Plus['tareas'];
  encabezadoEditIcono: ObjBase | undefined;
  objEditVariables: ObjBase | null;
  objEditVariablesString: ObjBase | null;
  editValue: string;
  editValido: boolean;
  seleccionConfirmable: boolean;
  onToggleBarra: () => void;
  onVolver: () => void;
  onNavegar: (descriptor: DescriptorPantalla) => void;
  onGuardarVentiladores: () => void;
  onEscribirVariable: (valor: string) => void;
  onEscribirVariableString: (valor: string) => void;
  onEscribirSeleccion: () => void;
  responsive?: boolean;
  lang?: string;
}

export default function PantallaHeader({
  actual,
  pilaLength,
  objetos,
  barraAccesoDirecto,
  esPantallaPrincipal,
  esTeclado,
  esSeleccion,
  esVentilacionGrupoEdit,
  menuNavPtr,
  titulo,
  tituloVentilacionEdit,
  colorHeader,
  tareas,
  encabezadoEditIcono,
  objEditVariables,
  objEditVariablesString,
  editValue,
  editValido,
  seleccionConfirmable,
  onToggleBarra,
  onVolver,
  onNavegar,
  onGuardarVentiladores,
  onEscribirVariable,
  onEscribirVariableString,
  onEscribirSeleccion,
  responsive,
  lang
}: PantallaHeaderProps): JSX.Element | null {
  const isResponsive = responsive === true;
  const iconSize = isResponsive ? 28 : 60;
  const normalTitleClassName = isResponsive
    ? 'min-w-0 flex-1 text-lg font-medium leading-tight text-white text-center px-2 line-clamp-2'
    : 'text-5xl font-normal text-white line-clamp-2 text-center px-2';
  const editTitleClassName = isResponsive ? 'min-w-0 text-lg font-normal leading-tight text-white line-clamp-2 text-center px-2' : 'text-5xl font-normal text-white line-clamp-2 text-center px-2';
  const idPantallaActual = (objetos?.find((o) => o.tipoObjeto === 1)?.idPantalla as number | undefined) ?? actual.idPantalla;
  const indicePantallaActual = (objetos?.find((o) => o.tipoObjeto === 1)?.indicePantalla as number | undefined) ?? actual.indicePantalla;

  if (isResponsive) {
    if (!esTeclado && !esSeleccion) {
      const navBg = objetos?.some((o) => o.tipoObjeto === 2) === true ? colorHeader || COLORES.tertiary : COLORES.primary;

      return (
        <div
          className="flex items-center justify-between px-3 py-3 shrink-0"
          style={{ backgroundColor: navBg }}
        >
          <div className="flex items-center gap-1">
            {barraAccesoDirecto.length > 0 && (
              <button
                onClick={onToggleBarra}
                className="p-1 text-white hover:text-gray-200 transition-colors"
                aria-label="Accesos directos"
              >
                <LuMenu size={iconSize} />
              </button>
            )}
            {!esPantallaPrincipal && (
              <button
                onClick={onVolver}
                className="p-1 text-white hover:text-gray-200 transition-colors"
                aria-label="Atras"
              >
                <LuChevronLeft size={iconSize} />
              </button>
            )}
            {esPantallaPrincipal && menuNavPtr !== undefined && (
              <button
                onClick={() => onNavegar({ idPantalla: menuNavPtr, indicePantalla: 0, esPrincipal: false })}
                className="p-1 text-white hover:text-gray-200 transition-colors"
                aria-label="Menu"
              >
                <LuMenu size={iconSize} />
              </button>
            )}
            {esPantallaPrincipal && menuNavPtr === undefined && barraAccesoDirecto.length === 0 && <div className="w-9" />}
          </div>

          <span className={normalTitleClassName}>{tituloVentilacionEdit ?? (esPantallaPrincipal ? resolveText(EnTextos.textPrincipal, lang) : titulo)}</span>

          <div className="flex items-center gap-1">
            {esVentilacionGrupoEdit ? (
              <button
                onClick={onGuardarVentiladores}
                className="p-1 text-white hover:text-gray-200 transition-colors"
                aria-label="Guardar"
              >
                <LuCheck size={iconSize} />
              </button>
            ) : (
              <>
                {tareas.map((tarea, i) => {
                  const IconoTarea = resolverIconoCTI40Plus(tarea.icono);
                  return (
                    <button
                      key={i}
                      onClick={() => onNavegar({ idPantalla: tarea.pantalla, indicePantalla: tarea.indice, esPrincipal: tarea.pantalla === 0 })}
                      className="p-1 text-white hover:text-gray-200 transition-colors"
                    >
                      {IconoTarea ? <IconoTarea size={iconSize} /> : null}
                    </button>
                  );
                })}
                {encabezadoEditIcono && (
                  <ObjEncabezadoEditIcono
                    obj={encabezadoEditIcono}
                    idPantallaActual={idPantallaActual}
                    indicePantallaActual={indicePantallaActual}
                    onNavegar={onNavegar}
                    responsive
                  />
                )}
              </>
            )}
            {tareas.length === 0 && !encabezadoEditIcono && !esVentilacionGrupoEdit && <div className="w-9" />}
          </div>
        </div>
      );
    }

    if (!esPantallaPrincipal && (esTeclado || esSeleccion)) {
      return renderEditHeader({
        editTitleClassName,
        iconSize,
        title: getEditTitle(esTeclado, objEditVariables, objEditVariablesString, titulo, lang),
        confirmEnabled: esTeclado ? editValido || objEditVariablesString !== null : seleccionConfirmable,
        onVolver,
        onConfirm: () => {
          if (esTeclado) {
            if (objEditVariablesString) {
              onEscribirVariableString(editValue);
              return;
            }
            if (editValido) onEscribirVariable(editValue);
          } else if (seleccionConfirmable) {
            onEscribirSeleccion();
          }
        }
      });
    }

    return null;
  }

  if (!esPantallaPrincipal && esTeclado) {
    return renderEditHeader({
      editTitleClassName,
      iconSize,
      title: getEditTitle(esTeclado, objEditVariables, objEditVariablesString, titulo, lang),
      confirmEnabled: editValido,
      onVolver,
      onConfirm: () => {
        if (objEditVariablesString) {
          onEscribirVariableString(editValue);
          return;
        }
        if (editValido) onEscribirVariable(editValue);
      }
    });
  }

  if (!esPantallaPrincipal && esSeleccion) {
    return renderEditHeader({
      editTitleClassName,
      iconSize,
      title: titulo,
      confirmEnabled: seleccionConfirmable,
      onVolver,
      onConfirm: () => {
        if (seleccionConfirmable) onEscribirSeleccion();
      }
    });
  }

  if (!esPantallaPrincipal && !esTeclado && !esSeleccion) {
    return (
      <div
        className="flex items-center justify-between px-3 py-3 shrink-0"
        style={{ backgroundColor: esVentilacionGrupoEdit ? COLORES.tertiary : colorHeader }}
      >
        <div className="flex items-center gap-1">
          <button
            onClick={onVolver}
            className="p-1 text-white hover:text-gray-200 transition-colors"
            aria-label={pilaLength === 0 ? 'Inicio' : 'Atras'}
          >
            <LuChevronLeft size={iconSize} />
          </button>

          {menuNavPtr !== undefined && (
            <button
              onClick={() => onNavegar({ idPantalla: menuNavPtr, indicePantalla: 0, esPrincipal: false })}
              className="p-1 text-white hover:text-gray-200 transition-colors"
              aria-label="Menu"
            >
              <LuMenu size={iconSize} />
            </button>
          )}
        </div>

        <span className={normalTitleClassName}>{tituloVentilacionEdit ?? titulo}</span>

        <div className="flex items-center gap-1">
          {esVentilacionGrupoEdit ? (
            <button
              onClick={onGuardarVentiladores}
              className="p-1 text-white hover:text-gray-200 transition-colors"
              aria-label="Guardar"
            >
              <LuCheck size={iconSize} />
            </button>
          ) : (
            <>
              {tareas.map((tarea, i) => {
                const IconoTarea = resolverIconoCTI40Plus(tarea.icono);
                return (
                  <button
                    key={i}
                    onClick={() => onNavegar({ idPantalla: tarea.pantalla, indicePantalla: tarea.indice, esPrincipal: tarea.pantalla === 0 })}
                    className="p-1 text-white hover:text-gray-200 transition-colors"
                  >
                    {IconoTarea ? <IconoTarea size={iconSize} /> : null}
                  </button>
                );
              })}
              {encabezadoEditIcono && (
                <ObjEncabezadoEditIcono
                  obj={encabezadoEditIcono}
                  idPantallaActual={idPantallaActual}
                  indicePantallaActual={indicePantallaActual}
                  onNavegar={onNavegar}
                />
              )}
              {tareas.length === 0 && !encabezadoEditIcono && <div className="w-12" />}
            </>
          )}
        </div>
      </div>
    );
  }

  return null;
}

interface RenderEditHeaderArgs {
  editTitleClassName: string;
  iconSize: number;
  title: string;
  confirmEnabled: boolean;
  onVolver: () => void;
  onConfirm: () => void;
}

function renderEditHeader({ editTitleClassName, iconSize, title, confirmEnabled, onVolver, onConfirm }: RenderEditHeaderArgs): JSX.Element {
  return (
    <div
      className="flex items-center justify-between px-3 py-3 shrink-0"
      style={{ backgroundColor: COLORES.tertiary }}
    >
      <button
        onClick={onVolver}
        className="p-1 text-white hover:text-gray-200 transition-colors"
        aria-label="Cancelar"
      >
        <LuX size={iconSize} />
      </button>
      <span className={editTitleClassName}>{title}</span>
      <button
        onClick={onConfirm}
        className={`p-1 transition-colors ${confirmEnabled ? 'text-white hover:text-gray-200' : 'text-white/30 cursor-not-allowed'}`}
        aria-label="Confirmar"
      >
        <LuCheck size={iconSize} />
      </button>
    </div>
  );
}

function getEditTitle(esTeclado: boolean, objEditVariables: ObjBase | null, objEditVariablesString: ObjBase | null, titulo: string, lang?: string): string {
  if (!esTeclado) return titulo;
  if (objEditVariablesString) return resolveText(objEditVariablesString.textoVar as number, lang);
  if (objEditVariables) return resolveText(objEditVariables.textoVar as number, lang);
  return '';
}
