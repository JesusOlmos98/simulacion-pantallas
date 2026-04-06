import type { IconType } from 'react-icons/lib';
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
  LuEllipsisVertical // 322 – Más opciones (tres puntos verticales)
} from 'react-icons/lu';

const ICONO_CTI40PLUS_MAP: Record<number, IconType> = {
  3: LuHouse, // Menú principal
  69: LuCloudSun, // Clima recinto
  2: LuFan, // Ventilación
  38: LuFlame, // Calefacción
  37: LuSnowflake, // Refrigeración
  23: LuThermometer, // Contacto térmico
  22: LuAirVent, // Entrada de aire
  71: LuBell, // Alarmas
  30: LuBaby, // Crianza
  10: LuHash, // Contadores
  59: LuLightbulb, // Iluminación
  41: LuClock, // Relojes
  17: LuInfo, // Información
  13: LuSettings, // Configuración
  270: LuBellRing, // Alarmas
  322: LuEllipsisVertical // Más opciones
};

/** Devuelve el componente de icono para un id de icono de barra, o null si no existe mapeo. */
export function resolverIconoCTI40Plus(id: number): IconType | null {
  return ICONO_CTI40PLUS_MAP[id] ?? null;
}
