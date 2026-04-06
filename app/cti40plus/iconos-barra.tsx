import type { IconType } from 'react-icons/lib'
import {
  LuHouse,          // 3   – Menú principal (casita)
  LuCloudSun,       // 69  – Clima recinto (casita + termómetro)
  LuFan,            // 2   – Ventilación
  LuFlame,          // 38  – Calefacción (llama)
  LuSnowflake,      // 37  – Refrigeración (copo de nieve)
  LuThermometer,    // 23  – Contacto térmico
  LuAirVent,        // 22  – Entrada de aire
  LuMegaphone,      // 71  – Alarmas (megáfono)
} from 'react-icons/lu'

const ICONO_BARRA_MAP: Record<number, IconType> = {
  3:  LuHouse,        // Menú principal
  69: LuCloudSun,     // Clima recinto
  2:  LuFan,          // Ventilación
  38: LuFlame,        // Calefacción
  37: LuSnowflake,    // Refrigeración
  23: LuThermometer,  // Contacto térmico
  22: LuAirVent,      // Entrada de aire
  71: LuMegaphone,    // Alarmas
}

/** Devuelve el componente de icono para un id de icono de barra, o null si no existe mapeo. */
export function resolverIconoBarra(id: number): IconType | null {
  return ICONO_BARRA_MAP[id] ?? null
}
