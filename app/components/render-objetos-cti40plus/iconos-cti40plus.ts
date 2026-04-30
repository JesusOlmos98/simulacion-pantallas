import type { IconType } from 'react-icons/lib';
import React from 'react';
import {
  LuHouse, // 3   – Menú principal (casita) / 69 – Clima recinto
  LuFan, // 2   – Ventilación
  LuFlame, // 38  – Calefacción (llama)
  LuSnowflake, // 37  – Refrigeración (copo de nieve)
  LuThermometer, // 23  – Contacto térmico
  LuAirVent, // 22  – Entradas de aire
  LuDroplets, // 21  – Gotas de agua
  LuBell, // 71  – Alarmas
  LuBellRing, // 270 – Alarmas
  LuBaby, // 30  – Crianza
  LuHash, // 10  – Contadores
  LuLightbulb, // 59  – Iluminación
  LuClock, // 41  – Relojes
  LuInfo, // 17  – Información
  LuSettings, // 13  – Configuración
  LuPlus, // 35  – Modo/estado de operación
  LuDroplet, // 72  – Gota de agua
  LuTrash, // 57  - Papelera
  LuWind, // 1   - Termómetro de mercurio (Sondas)
  LuSlidersHorizontal, // 55  - Barritas horizontales con sliders (Ajustes)
  LuWrench, // 123 - Llave inglesa (Mantenimiento)
  LuCheck, // 63 - Check
  LuUnplug,
  LuChevronsRightLeft, // 146 - tally-2 (icono extraño de rayo tachado)
  LuCloud, // 145 - WiFi mínimo (sin cobertura)
  LuCloudSun, // Icono de sol con nube
  LuWifi, // 146 - WiFi con 1 raya de cobertura
  LuWifiLow, // 147 - WiFi con 2 rayas de cobertura
  LuWifiHigh, // 148 - WiFi máximo (full cobertura)
  LuWifiZero,
  LuEllipsisVertical,
  LuSignal,
  LuUsb,
  LuX,
  LuRectangleVertical,
  LuPower,
  LuSquare,
  LuCirclePlus,
  LuFeather,
  LuPhoneIncoming,
  LuSquareArrowRight,
  LuPlugZap,
  LuRefreshCcw,
  LuBatteryFull,
  LuBattery,
  LuZap
} from 'react-icons/lu';
import { COLORES } from './colors';

// Icono compuesto: flechas horizontales con badge de info en esquina inferior derecha
const IconoInfluencias: IconType = ({ size = 24, color, className }) => {
  const s = size;
  const badge = typeof s === 'number' ? Math.round(s * 1) : s;
  return React.createElement(
    'span',
    { className, style: { position: 'relative', display: 'inline-flex', width: s, height: s, flexShrink: 0 } },
    React.createElement(LuChevronsRightLeft, { size: badge, color, style: { position: 'absolute', bottom: 0, right: 0 } }),
    React.createElement(LuInfo, { size: badge, color, style: { position: 'absolute', bottom: 0, right: 0 } })
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

// Iconos WiFi con fondo LuWifi en color quaternary para mostrar las barras apagadas
const iconStyle = { position: 'absolute' as const, top: 0, left: 0 };

const IconoWifiZero: IconType = ({ size = 24, color, className }) =>
  React.createElement(
    'span',
    { className, style: { position: 'relative', display: 'inline-flex', width: size, height: size, flexShrink: 0 } },
    React.createElement(LuWifi, { size, color: COLORES.wifi, style: iconStyle }),
    React.createElement(LuWifiZero, { size, color, style: iconStyle })
  );

const IconoWifiLow: IconType = ({ size = 24, color, className }) =>
  React.createElement(
    'span',
    { className, style: { position: 'relative', display: 'inline-flex', width: size, height: size, flexShrink: 0 } },
    React.createElement(LuWifi, { size, color: COLORES.wifi, style: iconStyle }),
    React.createElement(LuWifiLow, { size, color, style: iconStyle })
  );

const IconoWifiHigh: IconType = ({ size = 24, color, className }) =>
  React.createElement(
    'span',
    { className, style: { position: 'relative', display: 'inline-flex', width: size, height: size, flexShrink: 0 } },
    React.createElement(LuWifi, { size, color: COLORES.wifi, style: iconStyle }),
    React.createElement(LuWifiHigh, { size, color, style: iconStyle })
  );

// Icono de ventilador fijo (rotatorio al 100%) — color success — ID 86
const IconoVentiladorFijo: IconType = ({ size = 24, className }) => React.createElement(LuFan, { size, color: COLORES.success, className });

// Icono de ventilador temporizado — mitad izquierda success, mitad derecha light — ID 85
const IconoVentiladorTemporizado: IconType = ({ size = 24, className }) => {
  const s = typeof size === 'number' ? size : 24;
  return React.createElement(
    'span',
    { className, style: { position: 'relative', display: 'inline-flex', width: s, height: s, flexShrink: 0 } },
    React.createElement(LuFan, { size: s, color: COLORES.success, style: { position: 'absolute', clipPath: 'inset(0 50% 0 0)' } }),
    React.createElement(LuFan, { size: s, color: COLORES.light, style: { position: 'absolute', clipPath: 'inset(0 0 0 50%)' } })
  );
};

// Icono de ventilador estático — color menuWords — ID 84
const IconoVentiladorEstatico: IconType = ({ size = 24, className }) => React.createElement(LuFan, { size, color: COLORES.menuWords, className });

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

// Icono de batería llena rotada 90º - ID 412
const IconoBatteryFullRotated: IconType = ({ size = 24, color, className }) => {
  return React.createElement(
    'span',
    { className, style: { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: size, height: size, transform: 'rotate(270deg)' } },
    React.createElement(LuBatteryFull, {
      size: size,
      color: color ?? 'currentColor'
    })
  );
};

// Icono de 3 puntitos verticales con tamaño reducido al 80%
const IconoEllipsisVertical: IconType = ({ size = 24, color, className }) => {
  const actualSize = typeof size === 'number' ? Math.round(size * 0.95) : size;
  return React.createElement(
    'span',
    { className, style: { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: size, height: size } },
    React.createElement(LuEllipsisVertical, { size: actualSize, color })
  );
};

// Icono compuesto: círculo influences con LuChevronsRightLeft y LuInfo en color primary (ID 322)
const IconoInfluenciasActivas: IconType = ({ size = 24, className }) => {
  const s = typeof size === 'number' ? size : 24;
  const iconSize = Math.round(s * 1.2);
  const iconStyle = { position: 'absolute' as const, top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };
  return React.createElement(
    'span',
    { className, style: { position: 'relative', display: 'inline-flex', width: s, height: s, flexShrink: 0 } },
    // Círculo de fondo con color influences
    React.createElement('div', { style: { position: 'absolute', width: s, height: s, borderRadius: '50%', backgroundColor: COLORES.influences, top: 0, left: 0 } }),
    // LuChevronsRightLeft en color primary
    React.createElement(LuChevronsRightLeft, { size: iconSize, color: COLORES.primary, style: iconStyle }),
    // LuInfo en color primary superpuesto
    React.createElement(LuInfo, { size: iconSize, color: COLORES.primary, style: iconStyle })
  );
};

// Icono compuesto: cloud-sun en esquina superior izquierda y house en esquina inferior derecha
const IconoClimaRecinto: IconType = ({ size = 24, color, className }) => {
  const s = typeof size === 'number' ? size : 24;
  const cloudSunSize = Math.round(s * 0.4); // cloud-sun más pequeño
  const houseSize = Math.round(s * 0.85); // house más pequeño
  return React.createElement(
    'span',
    { className, style: { position: 'relative', display: 'inline-flex', width: s, height: s, flexShrink: 0 } },
    React.createElement(LuCloudSun, { size: cloudSunSize, color, style: { position: 'absolute', top: 0, left: 0 } }),
    React.createElement(LuHouse, { size: houseSize, color, style: { position: 'absolute', bottom: 0, right: 0 } })
  );
};

// Icono Plus más grande (20% más grande que el tamaño normal)
const IconoPlusGrande: IconType = ({ size = 24, color, className }) => {
  const actualSize = typeof size === 'number' ? Math.round(size * 1) : size;
  return React.createElement(LuPlus, { size: actualSize, color, className });
};

// Icono compuesto: LuUsb girado 45 grados dentro de LuRectangleVertical
const IconoBatteryCargandoODesconectadaRotado: IconType = ({ size = 5, color, className }) => {
  const s = typeof size === 'number' ? size : 24;
  const zapSize = Math.round(s * 0.45); // USB más pequeño para que quepa dentro
  return React.createElement(
    'span',
    { className, style: { position: 'relative', display: 'inline-flex', width: s, height: s, flexShrink: 0, alignItems: 'center', justifyContent: 'center' } },
    // Rectángulo vertical como contenedor
    React.createElement(LuBattery, { size: s, color, style: { transform: 'rotate(270deg)' } }),
    // USB girado 45 grados centrado
    React.createElement(LuZap, {
      size: zapSize,
      color: 'white', // Contraste con el rectángulo
      style: { position: 'absolute', top: '35%', left: '50%', transform: 'translateX(-50%)' }
    })
  );
};

// Icono compuesto: LuSignal en color wifi con LuX pequeño en esquina superior izquierda
const IconoSignalConX: IconType = ({ size = 24, color: _color, className }) => {
  const s = typeof size === 'number' ? size : 24;
  const xSize = Math.round(s * 0.5); // X más pequeña
  return React.createElement(
    'span',
    { className, style: { position: 'relative', display: 'inline-flex', width: s, height: s, flexShrink: 0 } },
    // Signal de fondo en color wifi
    React.createElement(LuSignal, { size: s, color: COLORES.wifi }),
    // X pequeña en esquina superior izquierda en color light
    React.createElement(LuX, { size: xSize, color: COLORES.light, style: { position: 'absolute', top: 0, left: 0 } })
  );
};

// Icono compuesto: bell-ring con LuInfo superpuesto (ID 422)
const IconoBellRingInfo: IconType = ({ size = 24, color, className }) => {
  const s = typeof size === 'number' ? size : 24;
  const infoSize = Math.round(s * 0.5); // Info más pequeño
  const iconColor = color ?? COLORES.botonesFisicos;
  return React.createElement(
    'span',
    { className, style: { position: 'relative', display: 'inline-flex', width: s, height: s, flexShrink: 0 } },
    // Bell-ring de fondo
    React.createElement(LuBellRing, { size: s, color: iconColor }),
    // Círculo de fondo para LuInfo en esquina superior izquierda
    React.createElement('div', { style: { position: 'absolute', top: 0, left: 0, width: infoSize, height: infoSize, borderRadius: '50%', backgroundColor: color ?? iconColor, zIndex: 1 } }),
    // LuInfo superpuesto en esquina superior izquierda (más visible)
    React.createElement(LuInfo, { size: infoSize, color: COLORES.botonesFisicos, style: { position: 'absolute', top: 0, left: 0, zIndex: 2 } })
  );
};

// Icono compuesto: square con circle-plus en esquina superior izquierda y "EX" abajo (ID 420)
const IconoSquareConPlusYEx: IconType = ({ size = 24, color, className }) => {
  const s = typeof size === 'number' ? size : 24;
  const plusSize = Math.round(s * 0.5); // Circle-plus más pequeño
  const fontSize = Math.round(s * 0.3); // Texto "EX" más pequeño
  const iconColor = color ?? COLORES.botonesFisicos;
  return React.createElement(
    'span',
    { className, style: { position: 'relative', display: 'inline-flex', width: s, height: s, flexShrink: 0, alignItems: 'center', justifyContent: 'center' } },
    // Square de fondo
    React.createElement(LuSquare, { size: s, color: iconColor }),
    // Círculo de fondo para LuCirclePlus en esquina superior izquierda
    React.createElement('div', { style: { position: 'absolute', top: 0, left: 0, width: plusSize, height: plusSize, borderRadius: '50%', backgroundColor: color ?? iconColor, zIndex: 1 } }),
    // Circle-plus en esquina superior izquierda (más visible)
    React.createElement(LuCirclePlus, { size: plusSize, color: COLORES.botonesFisicos, style: { position: 'absolute', top: 0, left: 0, zIndex: 2 } }),
    // Texto "EX" en el centro inferior
    React.createElement('span', { style: { position: 'absolute', bottom: Math.round(s * 0.15), fontSize, fontWeight: 700, color: iconColor, userSelect: 'none' } }, 'EX')
  );
};

// Iconos de texto A1-A6 (IDs 414-419)
const IconoA1: IconType = ({ /*size = 24,*/ color, className }) => {
  // const fontSize = typeof size === 'number' ? Math.round(size * 0.6) : size;
  const size = 40;
  const fontSize = 40;
  return React.createElement(
    'span',
    {
      className,
      style: {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: size,
        height: size,
        fontSize,
        fontWeight: 700,
        color: color ?? COLORES.botonesFisicos,
        userSelect: 'none'
      }
    },
    'A1'
  );
};

const IconoA2: IconType = ({ /*size = 24,*/ color, className }) => {
  // const fontSize = typeof size === 'number' ? Math.round(size * 0.6) : size;
  const size = 40;
  const fontSize = 40;
  return React.createElement(
    'span',
    {
      className,
      style: {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: size,
        height: size,
        fontSize,
        fontWeight: 700,
        color: color ?? COLORES.botonesFisicos,
        userSelect: 'none'
      }
    },
    'A2'
  );
};

const IconoA3: IconType = ({ /*size = 24,*/ color, className }) => {
  // const fontSize = typeof size === 'number' ? Math.round(size * 0.6) : size;
  const size = 40;
  const fontSize = 40;
  return React.createElement(
    'span',
    {
      className,
      style: {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: size,
        height: size,
        fontSize,
        fontWeight: 700,
        color: color ?? COLORES.botonesFisicos,
        userSelect: 'none'
      }
    },
    'A3'
  );
};

const IconoA4: IconType = ({ /*size = 24,*/ color, className }) => {
  // const fontSize = typeof size === 'number' ? Math.round(size * 0.6) : size;
  const size = 40;
  const fontSize = 40;
  return React.createElement(
    'span',
    {
      className,
      style: {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: size,
        height: size,
        fontSize,
        fontWeight: 700,
        color: color ?? COLORES.botonesFisicos,
        userSelect: 'none'
      }
    },
    'A4'
  );
};

const IconoA5: IconType = ({ /*size = 24,*/ color, className }) => {
  // const fontSize = typeof size === 'number' ? Math.round(size * 0.6) : size;
  const size = 40;
  const fontSize = 40;
  return React.createElement(
    'span',
    {
      className,
      style: {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: size,
        height: size,
        fontSize,
        fontWeight: 700,
        color: color ?? COLORES.botonesFisicos,
        userSelect: 'none'
      }
    },
    'A5'
  );
};

const IconoA6: IconType = ({ /*size = 24,*/ color, className }) => {
  // const fontSize = typeof size === 'number' ? Math.round(size * 0.6) : size;
  const size = 40;
  const fontSize = 40;
  return React.createElement(
    'span',
    {
      className,
      style: {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: size,
        height: size,
        fontSize,
        fontWeight: 700,
        color: color ?? COLORES.botonesFisicos,
        userSelect: 'none'
      }
    },
    'A6'
  );
};

// Icono personalizado: square-arrow-right girado 180 grados (flecha hacia la izquierda) - ID 49
const IconoSquareArrowLeft: IconType = ({ size = 24, color, className }) => {
  return React.createElement(
    'span',
    { className, style: { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: size, height: size } },
    React.createElement(LuSquareArrowRight, { 
      size, 
      color, 
      style: { transform: 'rotate(180deg)' }
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
  21: LuDroplets, // Gotas de agua
  22: LuAirVent, // Entrada de aire
  23: LuUnplug, // Contacto térmico
  24: IconoPlusGrande, // Añadir / editar
  30: LuBaby, // Crianza
  31: LuPlugZap, // Reles
  35: IconoInfluencias, // Modo/estado de operación
  36: IconoInfluenciasActivas,
  37: LuSnowflake, // Refrigeración
  38: LuFlame, // Calefacción
  41: LuClock, // Relojes
  46: LuWind, // Viento (Depresiómetro)
  47: IconoNubeCO2, // Nube CO2
  48: IconoNubeNH3, // Nube NH3
  55: LuSlidersHorizontal, // Barritas horizontales con sliders (Ajustes)
  49: IconoSquareArrowLeft, // Entradas Digitales (flecha hacia izquierda)
  57: LuTrash, // Papelera
  59: LuLightbulb, // Iluminación
  63: LuCheck, // Check
  69: IconoClimaRecinto, //IconoClimaRecinto, // Clima recinto
  71: LuBell, // Alarmas
  72: LuDroplet, // Gota de agua
  84: IconoVentiladorEstatico, // 0x54 — ventilador estático (menuWords)
  85: IconoVentiladorTemporizado, // 0x55 — ventilador temporizado (mitad success/light)
  86: IconoVentiladorFijo, // 0x56 — ventilador rotatorio al 100% (success)
  123: LuWrench, // Llave inglesa (Mantenimiento)
  124: LuRefreshCcw, // Actualización
  145: IconoWifiZero,
  146: IconoWifiLow,
  147: IconoWifiHigh,
  148: LuWifi,
  153: IconoSignalConX, // Signal en color wifi con X pequeña en esquina superior izquierda
  270: LuBellRing, // Alarmas
  322: IconoEllipsisVertical, // Más opciones
  344: LuX, // USB girado 45° dentro de rectángulo vertical
  346: IconoVentiladorGirando, // Ventilador girando en color naranja
  405: LuPhoneIncoming, // Teléfonos
  408: IconoBatteryCargandoODesconectadaRotado, // X que tacha el USB IconoBatteryFullRotated
  412: IconoBatteryFullRotated, // Batería llena rotada 90º LuX
  414: IconoA1, // A1
  415: IconoA2, // A2
  416: IconoA3, // A3
  417: IconoA4, // A4
  418: IconoA5, // A5
  419: IconoA6, // A6
  420: IconoSquareConPlusYEx, // Square con circle-plus y "EX"
  421: LuUnplug, // Plug
  422: IconoBellRingInfo, // Bell-ring con Info superpuesto
  423: LuPower, // Botón de encender/apagar
  424: LuFeather // Feather
};

/** Devuelve el componente de icono para un id de icono de barra, o null si no existe mapeo. */
export function resolverIconoCTI40Plus(id: number): IconType | null {
  return ICONO_CTI40PLUS_MAP[id] ?? null;
}
