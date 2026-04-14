import { resolveText } from './textos/resolverTexto';
import { EnUnidades, EnTipoVariable } from '../../../src/utils/common-lib-commac-generador/NXP_BE/globals/enumOld';

// Re-exportar para acceso fácil
export { resolverColor, getColorHex } from './colors';

// ─── Texto ────────────────────────────────────────────────────────────────────

// /** Devuelve el nombre legible de un ID de texto (EnTextos). */
// const EnTextosReverse = EnTextos as unknown as Record<number, string | undefined>;

// export function resolverTexto(id: number | EnTextos): string {
//   // Caso especial: textVacio (ID 151) debe mostrar "--"
//   if (id === 151) return '--';

//   // Excepción para G0-G31 (IDs 254-285) deben mostrar "S1", "S2", etc.
//   if (id >= 254 && id <= 285) {
//     return `S${id - 254}`; // G0 (254) -> S1, G1 (255) -> S2, ..., G31 (285) -> S32
//   }

//   const nombre = EnTextosReverse[id];
//   if (nombre === undefined) return `[txt:${id}]`;

//   // Convierte camelCase a "palabras separadas" y quita el prefijo "text"
//   let resultado = nombre.replace(/^text/, '').replace(/([A-Z])/g, ' $1');

//   // Separar letras-números pero preservando fórmulas químicas conocidas
//   // Usamos negative lookahead para evitar separar CO2, NH3, H2O, etc.
//   resultado = resultado.replace(/([a-zA-Z])(\d)(?!(?:2|3|H|O|N))/g, '$1 $2');

//   // Casos especiales: manejar CO2, NH3, H2O que sí deben mantenerse juntos
//   resultado = resultado.replace(/\bCo\s2\b/gi, 'CO2');
//   resultado = resultado.replace(/\bNh\s3\b/gi, 'NH3');
//   resultado = resultado.replace(/\bH\s2\sO\b/gi, 'H2O');
//   resultado = resultado.replace(/\bO\s2\b/gi, 'O2');
//   resultado = resultado.replace(/\bN\s2\b/gi, 'N2');

//   return resultado.trim().replace(/\s([A-Z])(?![A-Z]*\d)/g, (_, c: string) => ' ' + c.toLowerCase());
// }

// ─── Textos concatenados (objTextoConcatenadoPlantilla, tipo 67) ──────────────

interface BufferLike {
  type: string;
  data: number[];
}

/**
 * Parsea una `cadenaConcatenadaRaw` según el protocolo NXP de textos concatenados.
 * Soporta marcadores 0xFFFD (texto fijo), 0xFFFC (fin de sección) y 0xFFFB (fin total).
 * Los textos personalizados se decodifican como UTF-16LE.
 * Devuelve el texto completo resultante de concatenar todas las secciones.
 */
export function parseConcatenado(raw: BufferLike | number[]): string {
  const bytes: number[] = Array.isArray(raw) ? raw : raw.data;
  const u16s: number[] = [];
  for (let i = 0; i + 1 < bytes.length; i += 2) {
    u16s.push((bytes[i]! | (bytes[i + 1]! << 8)) >>> 0);
  }

  const partes: string[] = [];
  let j = 0;
  while (j < u16s.length) {
    const w = u16s[j++]!;
    if (w === 0xfffb) break;
    if (w === 0xfffc) continue;
    if (w === 0xfffd) {
      if (j >= u16s.length) break;
      const id = u16s[j++]!;
      partes.push(resolveText(id));
      continue;
    }
    // Texto personalizado UTF-16LE
    const chars: number[] = [w];
    while (j < u16s.length) {
      const w2 = u16s[j]!;
      if (w2 === 0xfffc || w2 === 0xfffb || w2 === 0xfffd) break;
      chars.push(w2);
      j++;
    }
    partes.push(String.fromCharCode(...chars));
  }

  return partes.join('');
}

// ─── Unidad ───────────────────────────────────────────────────────────────────

const UNIDAD_SIMBOLO: Record<number, string> = {
  [EnUnidades.noUnidad]: '',
  [EnUnidades.gradoCentigrado]: '°C',
  [EnUnidades.gradoFahrenheit]: '°F',
  [EnUnidades.porcentaje]: '%',
  [EnUnidades.kg]: 'kg',
  [EnUnidades.metros]: 'm',
  [EnUnidades.cm]: 'cm',
  [EnUnidades.mm]: 'mm',
  [EnUnidades.seg]: 'seg',
  [EnUnidades.minutos]: 'min',
  [EnUnidades.horas]: 'h',
  [EnUnidades.miliSeg]: 'ms',
  [EnUnidades.decSeg]: 'ds',
  [EnUnidades.litros]: 'L',
  [EnUnidades.m3]: 'm³',
  [EnUnidades.m3Hora]: 'm³/h',
  [EnUnidades.mSeg]: 'm/s',
  [EnUnidades.km]: 'km',
  [EnUnidades.kmH]: 'km/h',
  [EnUnidades.ppm]: 'ppm',
  [EnUnidades.voltios]: 'V',
  [EnUnidades.mA]: 'mA',
  [EnUnidades.hercios]: 'Hz',
  [EnUnidades.vatio]: 'W',
  [EnUnidades.kvatio]: 'kW',
  [EnUnidades.lux]: 'lux',
  [EnUnidades.gramos]: 'g',
  [EnUnidades.kgM3]: 'kg/m³',
  [EnUnidades.grados]: '°',
  [EnUnidades.mVV]: 'mV/V',
  [EnUnidades.pa]: 'PA',
  [EnUnidades.libra]: 'lb',
  [EnUnidades.km3]: 'm³h K'
};

/** Devuelve el símbolo de unidad (p.ej. "°C", "kg"). Vacío si no tiene unidad. */
export function resolverUnidad(id: number): string {
  if (id === EnUnidades.noUnidad) return '';
  const fallback = (EnUnidades as unknown as Record<number, string | undefined>)[id];
  return UNIDAD_SIMBOLO[id] ?? fallback ?? `[u:${id}]`;
}

// ─── Decodificación de variable ───────────────────────────────────────────────

/**
 * Interpreta el campo `variable` (u32 raw enviado como JSON number) según `tipoVar`.
 * Devuelve el valor formateado como string listo para mostrar.
 */
export function decodificarVariable(raw: number, tipoVar: number): string {
  switch (tipoVar) {
    case EnTipoVariable.noVariable:
      return '—';

    case EnTipoVariable.uint8:
    case EnTipoVariable.pUint8:
      return String(raw & 0xff);

    case EnTipoVariable.int8:
    case EnTipoVariable.pInt8: {
      const v = raw & 0xff;
      return String(v >= 0x80 ? v - 0x100 : v);
    }

    case EnTipoVariable.uint16:
    case EnTipoVariable.pUint16:
      return String(raw & 0xffff);

    case EnTipoVariable.int16:
    case EnTipoVariable.pInt16: {
      const v = raw & 0xffff;
      return String(v >= 0x8000 ? v - 0x10000 : v);
    }

    case EnTipoVariable.uint32:
    case EnTipoVariable.pUint32:
      return String(raw >>> 0);

    case EnTipoVariable.int32:
    case EnTipoVariable.pInt32:
      return String(raw | 0);

    case EnTipoVariable.float:
    case EnTipoVariable.pFloat:
      return formatFloat(rawToFloat(raw), 1);

    case EnTipoVariable.float0:
    case EnTipoVariable.pFloat0:
      return formatFloat(rawToFloat(raw), 0);

    case EnTipoVariable.float1:
    case EnTipoVariable.pFloat1:
    case EnTipoVariable.float1ConSigno:
      return formatFloat(rawToFloat(raw), 1);

    case EnTipoVariable.float2:
    case EnTipoVariable.pFloat2:
      return formatFloat(rawToFloat(raw), 2);

    case EnTipoVariable.float3:
    case EnTipoVariable.pFloat3:
      return formatFloat(rawToFloat(raw), 3);

    case EnTipoVariable.tiempo:
    case EnTipoVariable.pTiempo:
      return formatTiempoHms(raw);

    case EnTipoVariable.tiempoHm:
    case EnTipoVariable.pTiempoHm:
      return formatTiempoHm(raw);

    case EnTipoVariable.tiempoMs:
    case EnTipoVariable.pTiempoMs:
      return formatTiempoMs(raw);

    case EnTipoVariable.tiempoHms:
    case EnTipoVariable.pTiempoHms:
      return formatTiempoHms(raw);

    case EnTipoVariable.fecha:
      return formatFecha(raw);

    case EnTipoVariable.string4:
    case EnTipoVariable.texto:
    case EnTipoVariable.textoTexto:
      return resolveText(raw);

    default:
      return String(raw);
  }
}

/**
 * Decodifica un buffer UTF-16LE (enviado como {type:"Buffer",data:number[]}) a string.
 * Para en el primer carácter nulo (0x0000). Se usa en objLineaTextString (tipo 35).
 */
export function decodificarStringVariable(raw: unknown): string {
  if (!raw) return '';
  const bytes = Array.isArray(raw) ? (raw as number[]) : ((raw as { data?: number[] })?.data ?? []);
  if (bytes.length === 0) return '';

  const chars: number[] = [];
  for (let i = 0; i + 1 < bytes.length; i += 2) {
    const cp = (bytes[i]! | (bytes[i + 1]! << 8)) >>> 0;
    if (cp === 0) break; // terminador nulo
    chars.push(cp);
  }
  return String.fromCharCode(...chars);
}

// ─── Helpers internos ─────────────────────────────────────────────────────────

/** Reinterpreta un u32 (number) como float IEEE 754 de 32 bits. */
function rawToFloat(raw: number): number {
  const buf = new ArrayBuffer(4);
  new DataView(buf).setUint32(0, raw >>> 0, false);
  return new DataView(buf).getFloat32(0, false);
}

function formatFloat(v: number, decimales: number): string {
  if (!isFinite(v)) return '—';
  return v.toFixed(decimales);
}

function pad2(n: number): string {
  return String(n).padStart(2, '0');
}

function formatTiempoHms(seg: number): string {
  const h = Math.floor(seg / 3600);
  const m = Math.floor((seg % 3600) / 60);
  const s = seg % 60;
  return `${pad2(h)}:${pad2(m)}:${pad2(s)}`;
}

// tiempoHm viene empaquetado en bytes [seg, min, hora] del uint32 (protocolo ST)
function formatTiempoHm(raw: number): string {
  const hora = (raw >>> 16) & 0xff;
  const min = (raw >>> 8) & 0xff;
  return `${pad2(hora)}h${pad2(min)}m`;
}

function formatTiempoMs(seg: number): string {
  const m = Math.floor(seg / 60);
  const s = seg % 60;
  return `${pad2(m)}:${pad2(s)}`;
}

/** El campo `fecha` es un u32 = AAAAMMDD (BCD o entero plano, según firmware). */
function formatFecha(raw: number): string {
  const dia = raw & 0xff;
  const mes = (raw >> 8) & 0xff;
  const anio = (raw >> 16) & 0xffff;
  return `${pad2(dia)}/${pad2(mes)}/${anio}`;
}
