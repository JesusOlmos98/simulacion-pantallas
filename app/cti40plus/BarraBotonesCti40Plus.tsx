'use client';

import type { JSX } from 'react';
import { LuCircle } from 'react-icons/lu';
import { ObjBase } from '../components/render-objetos/RenderObjeto';
import { DescriptorPantalla } from '../components/render-objetos/RenderObjeto';
import { resolverIconoCTI40Plus } from './iconos-cti40plus';

interface Props {
  botones: ObjBase[];
  onNavegar: (descriptor: DescriptorPantalla) => void;
}

export default function BarraBotonesCti40Plus({ botones, onNavegar }: Props): JSX.Element | null {
  if (botones.length === 0) return null;

  return (
    <div className="flex items-center justify-center gap-4 py-3 px-4">
      {botones.map((obj, index) => {
        const icono = obj.icono as number | undefined;
        const navPtr = obj.navegacionPtr as number | undefined;
        const Icono = icono !== undefined ? resolverIconoCTI40Plus(icono) : null;

        return (
          <button
            key={index}
            onClick={() => (navPtr !== undefined && navPtr > 0 ? onNavegar({ idPantalla: navPtr, indicePantalla: 0, esPrincipal: false }) : undefined)}
            className="w-16 h-16 rounded-full bg-[#bddc28] flex items-center justify-center hover:bg-[#a8c023] active:scale-95 transition-all shadow-md"
            title={`Acceso directo ${index + 1}`}
          >
            {Icono ? (
              <Icono
                size={32}
                color="#1a1a1a"
              />
            ) : (
              <LuCircle
                size={32}
                color="#1a1a1a"
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
