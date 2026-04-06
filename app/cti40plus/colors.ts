// Paleta de colores global para CTI40 PLUS
export const COLORES = {
  primary: '#60D619', // Verde (índice 1)
  secondary: '#196BD6', // Azul (índice 2)
  tertiary: '#929292', // Gris (índice 3)
  error: '#F30703', // Rojo (índice 4)
  warning: '#f59e0b', // Ámbar (índice 5)
  info: '#3b82f6', // Azul (índice 6)
  success: '#10b981', // Esmeralda (índice 7)
  light: '#f5f5f5', // Gris muy claro (fallback para 0 u otros)
  menuWords: '#FFA505' // Naranja para textos del menú
} as const;

/** Resuelve un índice de color a su valor hex (1-indexed) */
export function resolverColor(id: number): string {
  const colorMap: Record<number, string> = { 1: COLORES.primary, 2: COLORES.secondary, 3: COLORES.tertiary, 4: COLORES.error, 5: COLORES.warning, 6: COLORES.info, 7: COLORES.success };
  return colorMap[id] ?? COLORES.light;
}

/** Obtiene la clase Tailwind correspondiente para un color (1-indexed) */
export function getColorClass(colorId: number): { bg: string; text: string; border: string } {
  const colorMap: Record<number, { bg: string; text: string; border: string }> = {
    1: { bg: 'bg-green-500', text: 'text-green-500', border: 'border-green-500' }, // primary
    2: { bg: 'bg-blue-900', text: 'text-blue-900', border: 'border-blue-900' }, // secondary
    3: { bg: 'bg-zinc-900', text: 'text-zinc-900', border: 'border-zinc-900' }, // tertiary
    4: { bg: 'bg-red-600', text: 'text-red-600', border: 'border-red-600' }, // error
    5: { bg: 'bg-amber-500', text: 'text-amber-500', border: 'border-amber-500' }, // warning
    6: { bg: 'bg-blue-500', text: 'text-blue-500', border: 'border-blue-500' }, // info
    7: { bg: 'bg-emerald-500', text: 'text-emerald-500', border: 'border-emerald-500' } // success
  };
  return colorMap[colorId] ?? { bg: 'bg-gray-100', text: 'text-gray-100', border: 'border-gray-100' };
}
