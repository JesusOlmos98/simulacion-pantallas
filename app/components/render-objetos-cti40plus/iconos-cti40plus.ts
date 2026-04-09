import type { IconType } from 'react-icons/lib';
import React from 'react';
import {
  LuHouse, // 3   – Menú principal (casita) / 69 – Clima recinto
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
  LuChevronsRightLeft,
  LuZap, // 346 - tally-1 (icono extraño de rayo)
  LuZapOff, // 146 - tally-2 (icono extraño de rayo tachado)
  LuCloud, // 47 - tally-3 (nube CO₂)  48 - tally-4 (nube NH₃)
  LuWifiOff, // 145 - WiFi mínimo (sin cobertura)
  LuWifi, // 146 - WiFi con 1 raya de cobertura
  LuWifiLow, // 147 - WiFi con 2 rayas de cobertura
  LuWifiHigh, // 148 - WiFi máximo (full cobertura)
  LuWifiZero,
  LuSquare,
  LuDiamond,
  LuSmartphone
} from 'react-icons/lu';
import { COLORES } from './colors';

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

// Icono compuesto: casita y termómetro superpuestos y centrados (id 69 – Clima recinto)
const IconoClimaRecinto: IconType = ({ size = 24, color, className }) => {
  const s = typeof size === 'number' ? size : 24;
  const iconStyle = { position: 'absolute' as const, top: 0, left: 0 };
  return React.createElement(
    'span',
    { className, style: { position: 'relative', display: 'inline-flex', width: s, height: s, flexShrink: 0 } },
    React.createElement(LuSmartphone, { size: s, color, style: iconStyle }),
    React.createElement(LuThermometer, { size: s, color, style: iconStyle })
  );
};

// Icono compuesto: nube con texto CO₂ superpuesto (id 47)
const IconoNubeCO2: IconType = ({ size = 24, color, className }) => {
  const s = typeof size === 'number' ? size : 24;
  const fontSize = Math.round(s * 0.32);
  return React.createElement(
    'span',
    { className, style: { position: 'relative', display: 'inline-flex', width: s, height: s, flexShrink: 0, alignItems: 'center', justifyContent: 'center' } },
    React.createElement(LuCloud, { size: s, color }),
    React.createElement(
      'span',
      { style: { position: 'absolute', fontSize, fontWeight: 700, lineHeight: 1, color: color ?? 'currentColor', userSelect: 'none', letterSpacing: '-0.5px', marginTop: Math.round(s * 0.05) } },
      'CO\u2082'
    )
  );
};

// Icono compuesto: nube con texto NH₃ superpuesto (id 48)
const IconoNubeNH3: IconType = ({ size = 24, color, className }) => {
  const s = typeof size === 'number' ? size : 24;
  const fontSize = Math.round(s * 0.32);
  return React.createElement(
    'span',
    { className, style: { position: 'relative', display: 'inline-flex', width: s, height: s, flexShrink: 0, alignItems: 'center', justifyContent: 'center' } },
    React.createElement(LuCloud, { size: s, color }),
    React.createElement(
      'span',
      { style: { position: 'absolute', fontSize, fontWeight: 700, lineHeight: 1, color: color ?? 'currentColor', userSelect: 'none', letterSpacing: '-0.5px', marginTop: Math.round(s * 0.05) } },
      'NH\u2083'
    )
  );
};

// Icono de ventilador girando en color naranja para el ID 346
const IconoVentiladorGirando: IconType = ({ size = 24, className }) => {
  return React.createElement(
    'span',
    { className: `${className} animate-spin`, style: { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: size, height: size } },
    React.createElement(LuFan, {
      size: size,
      color: COLORES.menuWords // Color naranja para textos del menú de Omega
    })
  );
};

const ICONO_CTI40PLUS_MAP: Record<number, IconType> = {
  1: LuThermometer, // Termómetro de mercurio (Sondas)
  2: LuFan, // Ventilación
  3: LuHouse, // Menú principal
  10: LuHash, // Contadores
  13: LuSettings, // Configuración
  17: LuInfo, // Información
  22: LuAirVent, // Entrada de aire
  23: LuUnplug, // Contacto térmico
  24: LuPlus, // Añadir / editar
  30: LuBaby, // Crianza
  35: IconoInfluencias, // Modo/estado de operación
  37: LuSnowflake, // Refrigeración
  38: LuFlame, // Calefacción
  41: LuClock, // Relojes
  46: LuWind, // Viento (Depresiómetro)
  55: LuSlidersHorizontal, // Barritas horizontales con sliders (Ajustes)
  59: LuLightbulb, // Iluminación
  69: IconoClimaRecinto, // Clima recinto
  71: LuBell, // Alarmas
  72: LuDroplet, // Gota de agua
  123: LuWrench, // Llave inglesa (Mantenimiento)
  270: LuBellRing, // Alarmas
  322: LuEllipsisVertical, // Más opciones
  // Iconos tally (extraños/distintivos)
  346: IconoVentiladorGirando, // tally-1 (ventilador girando en color naranja)
  47: IconoNubeCO2, // tally-3 (nube CO₂)
  48: IconoNubeNH3, // tally-4 (nube NH₃)
  // Iconos WiFi por nivel de cobertura
  145: LuWifiZero, //!probar
  146: LuWifiLow, //done
  147: LuWifiHigh, //done
  148: LuWifi //!probar
};

/** Devuelve el componente de icono para un id de icono de barra, o null si no existe mapeo. */
export function resolverIconoCTI40Plus(id: number): IconType | null {
  return ICONO_CTI40PLUS_MAP[id] ?? null;
}
