'use client'

import { decodificarVariable, resolverUnidad } from "@/app/omega/pantalla-utils"

interface ObjVarIndividualProps {
  obj: any
}

export default function ObjVarIndividual({ obj }: ObjVarIndividualProps) {
  const tipoDato = obj.tipoDato as number
  if (tipoDato === 0) return null // noVariable, nada que mostrar
  
  const valor = decodificarVariable(obj.valorVariable as number, tipoDato)
  const unidad = resolverUnidad(obj.unidad as number)
  
  return (
    <div className="col-span-6 flex justify-end items-center px-4 py-2 text-sm border-b border-zinc-100">
      <span className="font-mono text-white">
        {valor}
        {unidad && <span className="text-gray-300 text-xs ml-0.5">{unidad}</span>}
      </span>
    </div>
  )
}
