// Paleta de colores global para CTI40 PLUS
export const COLORES = {
  primary: '#82be5aff', //'#60D619', // Verde (índice 1) ORIGINAL: 97dd69ff
  secondary: '#196BD6', // Azul (índice 2)
  tertiary: '#666666ff', // Gris (índice 3)
  quaternary: '#ffe600ff', //'#777777ff', // Opcion inhabiltiada (índice 4)
  error: '#dd3a38ff', // Rojo (índice 5) ORIGINAL: f84340ff
  warning: '#f59e0b', // Ámbar (índice 6)
  info: '#3b82f6', // Azul (índice 7)
  success: '#6be61fff', // Esmeralda (índice 8)
  light: '#f5f5f5', // Gris muy claro (fallback para 0 u otros)
  // light_gray: '#c4c4c4ff', // Gris claro (índice 15)
  menuWords: '#FFA505', // Naranja para textos del menú de Omega
  wifi: '#555555ff', // Lineas de wifi inactivas
  influences: '#ffe600ff', // Verde para influencias
  grey_table: '#5a5a5aff',
  disabled: '#8b8b8bff', // 777777ff Gris para elementos deshabilitados
  lastBackground: '#1E1E1E'
} as const;

/** Obtiene el color HEX correspondiente a un número (1-indexed) */
export function getColorHex(colorId: number): string {
  const colorMap: Record<number, string> = {
    1: COLORES.primary, // Verde
    2: COLORES.secondary, // Azul
    3: COLORES.tertiary, // Gris
    4: COLORES.quaternary, // warning (amarillo influencias)
    5: COLORES.error, // Rojo
    6: COLORES.warning, // Ámbar
    7: COLORES.info, // Azul
    8: COLORES.success, // Esmeralda
    13: COLORES.error, // Rojo
    15: COLORES.disabled, // Gris claro
    16: COLORES.success
  };
  return colorMap[colorId] ?? COLORES.light;
}

/** Resuelve color con lógica especial para CTI40 PLUS:
 * - Si es 15, usa light_gray
 * - Si es 1 o fallback (0), usa light
 * - Otros colores usan resolverColor() normalmente
 */
export function resolverColor(coloresLineaEdit: number): string {
  if (coloresLineaEdit === 15) {
    return COLORES.disabled;
  } else if (coloresLineaEdit === 1 || coloresLineaEdit === 0) {
    return COLORES.light;
  } else {
    return getColorHex(coloresLineaEdit);
  }
}
