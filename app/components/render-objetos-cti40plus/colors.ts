// Paleta de colores global para CTI40 PLUS
export const COLORES = {
  primary: '#91DE5D', //'#60D619', // Verde (índice 1)
  secondary: '#196BD6', // Azul (índice 2)
  tertiary: '#929292', // Gris (índice 3)
  error: '#F30703', // Rojo (índice 4)
  warning: '#f59e0b', // Ámbar (índice 5)
  info: '#3b82f6', // Azul (índice 6)
  success: '#10b981', // Esmeralda (índice 7)
  light: '#f5f5f5', // Gris muy claro (fallback para 0 u otros)
  light_gray: '#c4c4c4ff', // Gris claro (índice 15)
  menuWords: '#FFA505' // Naranja para textos del menú
} as const;

/** Obtiene el color HEX correspondiente a un número (1-indexed) */
export function getColorHex(colorId: number): string {
  const colorMap: Record<number, string> = {
    1: COLORES.primary, // Verde
    2: COLORES.secondary, // Azul
    3: COLORES.tertiary, // Gris
    4: COLORES.error, // Rojo
    5: COLORES.warning, // Ámbar
    6: COLORES.info, // Azul
    7: COLORES.success, // Esmeralda
    15: COLORES.light_gray // Gris claro
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
    return COLORES.light_gray;
  } else if (coloresLineaEdit === 1 || coloresLineaEdit === 0) {
    return COLORES.light;
  } else {
    return getColorHex(coloresLineaEdit);
  }
}
