'use client';

import type { JSX } from 'react';
import { LuCircle } from 'react-icons/lu';
import type { ObjBase, DescriptorPantalla } from '../pantalla-types';
import { resolverIconoCTI40Plus } from './iconos-cti40plus';

const PRINCIPAL: DescriptorPantalla = { idPantalla: 0, indicePantalla: 0, esPrincipal: true };

interface Props {
  botones: ObjBase[];
  idPantallaActual: number;
  onNavegar: (descriptor: DescriptorPantalla) => void;
}

export default function BarraBotonesCti40Plus({ botones, idPantallaActual, onNavegar }: Props): JSX.Element | null {
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
            onClick={() => {
              if (navPtr === undefined || navPtr <= 0) return;
              if (navPtr === idPantallaActual) {
                onNavegar(PRINCIPAL);
              } else {
                onNavegar({ idPantalla: navPtr, indicePantalla: 0, esPrincipal: false });
              }
            }}
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
