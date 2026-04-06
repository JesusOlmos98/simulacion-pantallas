import type { IconType } from 'react-icons/lib';
import {
  LuCloudSun, // 3   – Clima Recinto
  LuFan, // 4   – Ventilación
  LuFlame, // 5   – Calefacción
  LuSnowflake, // 6   – Refrigeración
  LuAirVent, // 7   – Entrada de aire
  LuThermometer, // 8   – Contacto térmico
  LuClock, // 9   – Relojes
  LuHash, // 10  – Contadores
  LuChartPie, // 11  – Estadísticas
  LuDroplet, // 12  – Humidificación
  LuCog, // 13  – Configuración
  LuBellRing, // 14  – Alarmas
  LuEgg, // 15  – Crianza
  LuChartSpline, // 16  – Curvas
  LuInfo, // 17  – Información
  LuScale, // 19  – Pesaje
  LuZap, // 31  – Activaciones
  LuDroplets, // 73  – Agua
  LuWheat, // 75  – Alimentación
  LuGauge, // 115 – Depresiómetro
  LuArrowUpDown // 329 – Elevación apertura
} from 'react-icons/lu';

const ICONO_MAP: Record<number, IconType> = {
  3: LuCloudSun, // Clima Recinto
  4: LuFan, // Ventilación
  5: LuFlame, // Calefacción
  6: LuSnowflake, // Refrigeración
  7: LuAirVent, // Entrada de aire
  8: LuThermometer, // Contacto térmico
  9: LuClock, // Relojes
  10: LuHash, // Contadores
  11: LuChartPie, // Estadísticas
  12: LuDroplet, // Humidificación (menú principal)
  13: LuCog, // Configuración
  14: LuBellRing, // Alarmas
  15: LuEgg, // Crianza
  16: LuChartSpline, // Curvas
  17: LuInfo, // Información
  19: LuScale, // Pesaje
  21: LuDroplet, // Humidificación (submenús)
  31: LuZap, // Activaciones
  73: LuDroplets, // Agua
  75: LuWheat, // Alimentación
  115: LuGauge, // Depresiómetro
  329: LuArrowUpDown // Elevación apertura
};

/** Devuelve el componente de icono Lucide para un iconoLinea dado, o null si no existe. */
export function resolverIcono(id: number): IconType | null {
  return ICONO_MAP[id] ?? null;
}
