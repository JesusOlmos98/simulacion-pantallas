'use client'

import { COLORES } from "@/app/omega/colors"
import { resolverIcono } from "@/app/omega/iconos-menu"
import { resolverTexto } from "@/app/omega/pantalla-utils"
import { navegarSimple, ChevronRight } from "./RenderHelpers"

interface ObjLineaTextTextProps {
  obj: any
  onNavegar: (d: any) => void
}

export default function ObjLineaTextText({ obj, onNavegar }: ObjLineaTextTextProps) {
  const nav = obj.valorEditableONav as number
  const texto = resolverTexto(obj.texto as number)
  const textoVar = resolverTexto(obj.textoVar as number)
  const Icono = resolverIcono(obj.iconoLinea as number)

  return (
    <div className="col-span-7 px-4">
      <div
        className="flex items-center gap-5 px-8 py-5 cursor-pointer hover:bg-white/5 active:bg-white/10 transition-colors border-b border-zinc-700"
        onClick={() => navegarSimple(nav, obj.indicePantalla as number, onNavegar)}
      >
        {Icono && <Icono className="text-white shrink-0" size={36} />}
        <span className="flex-1 text-2xl font-normal text-white">{texto}</span>
        <span className="text-xl font-medium shrink-0" style={{ color: COLORES.menuWords }}>{textoVar}</span>
        <ChevronRight />
      </div>
    </div>
  )
}
