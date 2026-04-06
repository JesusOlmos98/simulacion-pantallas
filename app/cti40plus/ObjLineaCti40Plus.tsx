'use client'

import { LuChevronRight } from 'react-icons/lu'
import { resolverTexto, resolverColor } from './pantalla-utils'
import { resolverIconoCTI40Plus } from './iconos-cti40plus'
import { DescriptorPantalla, ObjBase } from '../components/render-objetos/RenderObjeto'

interface ObjLineaProps {
  obj: any
  onNavegar: (descriptor: DescriptorPantalla) => void
  esLista?: boolean
}

export default function ObjLineaCti40Plus({ obj, onNavegar }: ObjLineaProps) {
  const handleClick = () => {
    if (obj.valorEditableONav && obj.valorEditableONav > 0) {
      onNavegar({
        idPantalla: obj.valorEditableONav,
        indicePantalla: obj.indicePantalla ?? 0,
        esPrincipal: false
      })
    }
  }

  const texto = resolverTexto(obj.texto ?? 0)
  const colorLinea = resolverColor(obj.coloresLineaEdit ?? 1)
  const IconoLinea = obj.iconoLinea ? resolverIconoCTI40Plus(obj.iconoLinea) : null

  return (
    <div
      className="flex items-center justify-between px-3 py-5 cursor-pointer hover:bg-white/5 transition-colors"
      onClick={handleClick}
    >
      <div className="flex items-center gap-3">
        {/* Icono de la línea */}
        {IconoLinea && (
          <div className="w-14 h-14 flex items-center justify-center">
            <IconoLinea size={44} color="white" />
          </div>
        )}
        
        {/* Texto */}
        <span className="text-white text-4xl font-light">{texto}</span>
      </div>

      {/* Chevron de navegación */}
      {obj.valorEditableONav && obj.valorEditableONav > 0 && (
        <LuChevronRight 
          size={36} 
          className="text-white"
        />
      )}
    </div>
  )
}
