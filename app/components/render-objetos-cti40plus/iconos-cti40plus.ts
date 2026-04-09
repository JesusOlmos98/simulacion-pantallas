import type { IconType } from 'react-icons/lib';
import React from 'react';
import {
  LuHouse, // 3   – Menú principal (casita)
  LuCloudSun, // 69  – Clima recinto (casita + termómetro)
  LuFan, // 2   – Ventilación
  LuFlame, // 38  – Calefacción (llama)
  LuSnowflake, // 37  – Refrigeración (copo de nieve)
  LuThermometer, // 23  – Contacto térmico
  LuAirVent, // 22  – Entrada de aire
  LuBell, // 71  – Alarmas
  LuBellRing, // 270 – Alarmas
  LuBaby, // 30  – Crianza
  LuHash, // 10  – Contadores
  LuLightbulb, // 59  – Iluminación
  LuClock, // 41  – Relojes
  LuInfo, // 17  – Información
  LuSettings, // 13  – Configuración
  LuEllipsisVertical, // 322 – Más opciones (tres puntos verticales)
  LuPlus, // 35  – Modo/estado de operación
  LuDroplet, // 72  – Gota de agua
  LuWind, // 1   - Termómetro de mercurio (Sondas)
  LuSlidersHorizontal, // 55  - Barritas horizontales con sliders (Ajustes)
  LuWrench, // 123 - Llave inglesa (Mantenimiento)
  LuUnplug,
  LuChevronsLeftRightEllipsis,
  LuChevronsRightLeft
} from 'react-icons/lu';

// Icono compuesto: flechas horizontales con badge de info en esquina inferior derecha
const IconoInfluencias: IconType = ({ size = 24, color, className }) => {
  const s = size;
  const badge = typeof s === 'number' ? Math.round(s * 1) : s;
  return React.createElement(
    'span',
    { className, style: { position: 'relative', display: 'inline-flex', width: s, height: s, flexShrink: 0 } },
    React.createElement(LuChevronsRightLeft, { size: s, color }),
    React.createElement(LuInfo, { size: badge, color, style: { position: 'absolute', bottom: 0, right: 0 } })
  );
};

const ICONO_CTI40PLUS_MAP: Record<number, IconType> = {
  3: LuHouse, // Menú principal
  69: LuCloudSun, // Clima recinto
  2: LuFan, // Ventilación
  38: LuFlame, // Calefacción
  37: LuSnowflake, // Refrigeración
  23: LuUnplug, // Contacto térmico
  22: LuAirVent, // Entrada de aire
  71: LuBell, // Alarmas
  30: LuBaby, // Crianza
  10: LuHash, // Contadores
  59: LuLightbulb, // Iluminación
  41: LuClock, // Relojes
  17: LuInfo, // Información
  13: LuSettings, // Configuración
  270: LuBellRing, // Alarmas
  322: LuEllipsisVertical, // Más opciones
  24: LuPlus, // Añadir / editar
  35: IconoInfluencias, // Modo/estado de operación
  72: LuDroplet, // Gota de agua
  46: LuWind, // Viento (Depresiómetro)
  1: LuThermometer, // Termómetro de mercurio (Sondas)
  55: LuSlidersHorizontal, // Barritas horizontales con sliders (Ajustes)
  123: LuWrench // Llave inglesa (Mantenimiento)
};

/** Devuelve el componente de icono para un id de icono de barra, o null si no existe mapeo. */
export function resolverIconoCTI40Plus(id: number): IconType | null {
  return ICONO_CTI40PLUS_MAP[id] ?? null;
}
