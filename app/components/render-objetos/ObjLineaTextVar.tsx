'use client'

import { COLORES } from "@/app/omega/colors"
import { resolverIcono } from "@/app/omega/iconos-menu"
import { decodificarVariable, resolverTexto, resolverUnidad } from "@/app/omega/pantalla-utils"
import { navegarSimple, ChevronRight } from "./RenderHelpers"

interface ObjLineaTextVarProps {
  obj: any
  onNavegar: (d: any) => void
}

export default function ObjLineaTextVar({ obj, onNavegar }: ObjLineaTextVarProps) {
  const nav = obj.valorEditableONav as number
  const texto = resolverTexto(obj.texto as number)
  const valor = decodificarVariable(obj.variable as number, obj.tipoVar as number)
  const unidad = resolverUnidad(obj.unidad as number)
  const Icono = resolverIcono(obj.iconoLinea as number)

  return (
    <div className="col-span-7 px-4">
      <div
        className="flex items-center gap-5 px-8 py-5 cursor-pointer hover:bg-white/5 active:bg-white/10 transition-colors border-b border-zinc-700"
        onClick={() => navegarSimple(nav, obj.indicePantalla as number, onNavegar)}
      >
        {Icono && <Icono className="text-white shrink-0" size={36} />}
        <span className="flex-1 text-2xl font-normal text-white">{texto}</span>
        <span className="text-xl font-medium shrink-0" style={{ color: COLORES.menuWords }}>
          {valor}{unidad && <span className="text-lg ml-1">{unidad}</span>}
        </span>
        <ChevronRight />
      </div>
    </div>
  )
}
