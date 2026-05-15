'use client';

import type { JSX } from 'react';
import { LuChevronRight } from 'react-icons/lu';
import { COLORES } from './colors';
import { resolverIconoCTI40Plus } from './iconos-cti40plus';
import type { ObjBase, DescriptorPantalla } from '../pantalla-types';

const SCREEN_PTR_MIN = 65536;
const IconoVentiladorApagado = resolverIconoCTI40Plus(2);
const IconoVentiladorEstatico = resolverIconoCTI40Plus(340);
const IconoVentiladorTemporizado = resolverIconoCTI40Plus(341);
const IconoVentiladorRotatorio = resolverIconoCTI40Plus(342);

interface DatoVentilador {
  km3: number;
  tamanoVentilador: number;
  estadoVentilador: number;
}

interface Props {
  obj: ObjBase;
  onNavegar: (descriptor: DescriptorPantalla) => void;
  idPantallaActual: number;
  indicePantallaActual: number;
  estadosOverride?: number[];
  onClickVentilador?: (idx: number) => void;
  responsive?: boolean;
}

export default function ObjVentilacionGrupoGrafico({ obj, onNavegar, idPantallaActual, indicePantallaActual, estadosOverride, onClickVentilador, responsive }: Props): JSX.Element {
  const navegacionPtr = (obj.navegacionPtr as number | undefined) ?? 0;
  const indiceNavegacion = (obj.indiceNavegacion as number | undefined) ?? 0;
  const numFijos = (obj.numFijos as number | undefined) ?? 0;
  const numTemporizados = (obj.numTemporizados as number | undefined) ?? 0;
  const datos = (obj.datos as DatoVentilador[] | undefined) ?? [];

  const modoEdicion = onClickVentilador !== undefined;

  const handleClick = (): void => {
    if (modoEdicion) return;
    if (navegacionPtr <= 0) return;
    if (navegacionPtr >= SCREEN_PTR_MIN) {
      onNavegar({ idPantalla: navegacionPtr, indicePantalla: indiceNavegacion, esPrincipal: false });
    } else {
      onNavegar({ idPantalla: idPantallaActual, indicePantalla: indicePantallaActual, esPrincipal: false, idUnicoEdicion: navegacionPtr });
    }
  };

  // Pre-calcular rango de cada estadoVentilador activo (ordenado por valor numérico ascendente)
  const estadosActivos = datos
    .slice(0, 5)
    .map((dato, idx) => (estadosOverride ? (estadosOverride[idx] ?? 0) : dato.estadoVentilador))
    .filter((e) => e !== 0 && e !== 255)
    .sort((a, b) => a - b);
  const rangoMap = new Map<number, number>();
  estadosActivos.forEach((e, i) => rangoMap.set(e, i + 1));

  const fanSize = responsive === true ? 28 : 75;

  return (
    <div
      className={`flex items-center justify-between ${responsive === true ? 'px-4 py-3' : 'px-3 py-6'} ${!modoEdicion ? 'cursor-pointer hover:bg-white/5 transition-colors' : ''}`}
      onClick={handleClick}
    >
      <div className={`flex ${responsive === true ? 'gap-4' : 'gap-10'} items-center flex-1`}>
        {datos.slice(0, 5).map((dato, idx) => {
          const km3 = dato.km3;
          const estadoVentilador = estadosOverride ? (estadosOverride[idx] ?? 0) : dato.estadoVentilador;
          const esFijo = estadoVentilador === 255;
          const esApagado = estadoVentilador === 0;

          const rango = !esFijo && !esApagado ? (rangoMap.get(estadoVentilador) ?? 0) : 0;

          const colorKm3 = esApagado ? COLORES.disabled : COLORES.light;
          const textoEstado = esFijo || esApagado ? '-' : String(estadoVentilador);

          const esMitad = rango > numFijos && rango <= numFijos + numTemporizados;
          const esRotatorio = rango > 0 && rango <= numFijos;
          const IconoVentilador = esApagado
            ? IconoVentiladorApagado
            : esFijo
              ? IconoVentiladorEstatico
              : esRotatorio
                ? IconoVentiladorRotatorio
                : esMitad
                  ? IconoVentiladorTemporizado
                  : IconoVentiladorApagado;

          const esClickable = modoEdicion;

          return (
            <div
              key={idx}
              className={`flex flex-col items-center gap-2 ${responsive === true ? 'mx-1' : 'mx-2'} ${esClickable ? 'cursor-pointer' : ''}`}
              onClick={
                esClickable
                  ? (e): void => {
                      e.stopPropagation();
                      onClickVentilador!(idx);
                    }
                  : undefined
              }
            >
              {/* Número de ventilador (1-based) */}
              <span
                className={`${responsive === true ? 'text-lg' : 'text-4xl'} font-light`}
                style={{ color: COLORES.light }}
              >
                {idx + 1}
              </span>
              {/* Icono ventilador */}
              {IconoVentilador && (
                <IconoVentilador
                  size={fanSize}
                  style={esApagado ? { opacity: 0.35 } : undefined}
                />
              )}
              {/* km3 */}
              <span
                className={`${responsive === true ? 'text-lg' : 'text-5xl'} font-light`}
                style={{ color: colorKm3 }}
              >
                {km3.toFixed(1)}
              </span>
              {/* Estado (rojo siempre) */}
              <span
                className={`${responsive === true ? 'text-lg' : 'text-5xl'} font-light`}
                style={{ color: COLORES.error }}
              >
                {textoEstado}
              </span>
            </div>
          );
        })}
      </div>

      {navegacionPtr > 0 && (
        <LuChevronRight
          size={responsive === true ? 20 : 50}
          color={COLORES.light}
        />
      )}
    </div>
  );
}
