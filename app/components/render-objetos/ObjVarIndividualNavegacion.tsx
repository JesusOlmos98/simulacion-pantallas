'use client'

import { decodificarVariable, resolverUnidad } from '@/app/omega/pantalla-utils'
import { ChevronRight, navegarConEdicion } from './RenderHelpers'

interface ObjVarIndividualNavegacionProps {
  obj: any
  onNavegar: (d: any) => void
}

export default function ObjVarIndividualNavegacion({ obj, onNavegar }: ObjVarIndividualNavegacionProps) {
  const nav = obj.valorEditableONav as number
  const tipoDato = obj.tipoDato as number
  
  // Sin valor y sin nav: no pintar (p.ej. slots vacíos de la pantalla principal)
  if (tipoDato === 0 && nav === 0) return null
  
  // Solo nav (tipoDato=0): mostrar como recuadro en menú
  if (tipoDato === 0) {
    return (
      <div
        className="aspect-square border border-zinc-200 rounded-lg flex items-center justify-center cursor-pointer hover:bg-zinc-600 active:bg-zinc-500 transition-colors"
        onClick={() => navegarConEdicion(nav, obj.indicePantalla as number, onNavegar)}
      >
        <span className="text-zinc-400 text-xs italic">[nav]</span>
      </div>
    )
  }
  
  const valor = decodificarVariable(obj.valorVariable as number, tipoDato)
  const unidad = resolverUnidad(obj.unidad as number)
  
  return (
    <div className="col-span-6 flex justify-between items-center px-4 py-2 border-b border-zinc-100 cursor-pointer hover:bg-zinc-50 active:bg-zinc-100 transition-colors" onClick={() => navegarConEdicion(nav, obj.indicePantalla as number, onNavegar)}>
      <span className="font-mono text-white">
        {valor}
        {unidad && <span className="text-gray-300 text-xs ml-0.5">{unidad}</span>}
      </span>
      {nav > 0 && <ChevronRight />}
    </div>
  )
}
