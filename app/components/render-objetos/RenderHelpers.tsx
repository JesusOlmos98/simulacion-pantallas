'use client'

/** Navegación simple: solo idNav (para objLineaText, menús, etc.) */
function navegarSimple(nav: number, indicePantalla: number, onNavegar: any) {
  if (nav <= 0) return
  onNavegar({ idPantalla: nav, indicePantalla, esPrincipal: false })
}

/** Navegación con edición: idNav + idUnicoEdicion (para obj37 editables) */
function navegarConEdicion(nav: number, indicePantalla: number, onNavegar: any) {
  if (nav <= 0) return
  onNavegar({ idPantalla: nav, indicePantalla, esPrincipal: false, idUnicoEdicion: nav })
}

/** Componente ChevronRight configurable */
function ChevronRight({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" className="shrink-0 text-zinc-400">
      <path d="M6 12L10 8L6 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export { ChevronRight, navegarSimple, navegarConEdicion }
