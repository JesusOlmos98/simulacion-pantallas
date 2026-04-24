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
  compact?: boolean;
}

export default function BarraBotonesCti40Plus({ botones, idPantallaActual, onNavegar, compact }: Props): JSX.Element | null {
  if (botones.length === 0) return null;

  const btnClass = compact
    ? 'w-14 h-14 rounded-full bg-[#bddc28] flex items-center justify-center hover:bg-[#a8c023] active:scale-95 transition-all shadow-md'
    : 'w-25 h-25 rounded-full bg-[#bddc28] flex items-center justify-center hover:bg-[#a8c023] active:scale-95 transition-all shadow-md';
  const iconSize = compact ? 32 : 65;

  return (
    <div className={compact ? 'grid grid-cols-4 gap-3 px-12 py-2 place-items-center' : 'flex items-center justify-center gap-4 px-4 py-3'}>
      {botones.map((obj, index) => {
        const icono = obj.icono as number | undefined;
        const navPtr = obj.navegacionPtr as number | undefined;
        const Icono = icono !== undefined ? resolverIconoCTI40Plus(icono) : null;

        return (
          <button
            key={index}
            onClick={() => {
              if (navPtr === undefined || navPtr <= 0) return;
              if (icono === 3) {
                onNavegar(idPantallaActual !== 0 ? PRINCIPAL : { idPantalla: navPtr, indicePantalla: 0, esPrincipal: false });
              } else {
                onNavegar({ idPantalla: navPtr, indicePantalla: 0, esPrincipal: false });
              }
            }}
            className={btnClass}
            title={`Acceso directo ${index + 1}`}
          >
            {Icono ? (
              <Icono
                size={iconSize}
                color="#1a1a1a"
              />
            ) : (
              <LuCircle
                size={iconSize}
                color="#1a1a1a"
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
