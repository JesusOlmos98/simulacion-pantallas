'use client';

import type { JSX } from 'react';
import { LuFan, LuChevronRight } from 'react-icons/lu';
import { COLORES } from './colors';
import type { ObjBase, DescriptorPantalla } from '../pantalla-types';

const SCREEN_PTR_MIN = 65536;

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
}

export default function ObjVentilacionGrupoGrafico({ obj, onNavegar, idPantallaActual, indicePantallaActual, estadosOverride, onClickVentilador }: Props): JSX.Element {
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

  return (
    <div
      className={`flex items-center justify-between px-3 py-6 ${!modoEdicion ? 'cursor-pointer hover:bg-white/5 transition-colors' : ''}`}
      onClick={handleClick}
    >
      <div className="flex gap-10 items-center flex-1">
        {datos.slice(0, 5).map((dato, idx) => {
          const km3 = dato.km3;
          const estadoVentilador = estadosOverride ? (estadosOverride[idx] ?? 0) : dato.estadoVentilador;
          const esAlarma = estadoVentilador === 255;
          const esApagado = estadoVentilador === 0;

          const rango = !esAlarma && !esApagado ? (rangoMap.get(estadoVentilador) ?? 0) : 0;

          let colorIcono: string;
          if (esAlarma) {
            colorIcono = COLORES.menuWords;
          } else if (esApagado) {
            colorIcono = COLORES.light_gray;
          } else if (rango <= numFijos) {
            colorIcono = COLORES.success;
          } else if (rango <= numFijos + numTemporizados) {
            colorIcono = COLORES.success; // esMitad maneja el split rendering
          } else {
            colorIcono = COLORES.light;
          }

          const colorKm3 = esApagado ? COLORES.light_gray : COLORES.light;
          const textoEstado = esAlarma || esApagado ? '-' : String(estadoVentilador);

          const esMitad = rango > numFijos && rango <= numFijos + numTemporizados;

          const esClickable = modoEdicion;

          return (
            <div
              key={idx}
              className={`flex flex-col items-center gap-2 mx-2 ${esClickable ? 'cursor-pointer' : ''}`}
              onClick={
                esClickable
                  ? (e) => {
                      e.stopPropagation();
                      onClickVentilador!(idx);
                    }
                  : undefined
              }
            >
              {/* Número de ventilador (1-based) */}
              <span
                className="text-4xl font-light"
                style={{ color: COLORES.light }}
              >
                {idx + 1}
              </span>
              {/* Icono ventilador */}
              {esMitad ? (
                <span style={{ position: 'relative', display: 'inline-flex', width: 75, height: 75 }}>
                  <LuFan
                    size={75}
                    color={COLORES.success}
                    style={{ position: 'absolute', clipPath: 'inset(0 50% 0 0)' }}
                  />
                  <LuFan
                    size={75}
                    color={COLORES.light}
                    style={{ position: 'absolute', clipPath: 'inset(0 0 0 50%)' }}
                  />
                </span>
              ) : (
                <LuFan
                  size={75}
                  color={colorIcono}
                />
              )}
              {/* km3 */}
              <span
                className="text-5xl font-light"
                style={{ color: colorKm3 }}
              >
                {km3.toFixed(1)}
              </span>
              {/* Estado (rojo siempre) */}
              <span
                className="text-5xl font-light"
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
          size={50}
          color={COLORES.light}
        />
      )}
    </div>
  );
}
