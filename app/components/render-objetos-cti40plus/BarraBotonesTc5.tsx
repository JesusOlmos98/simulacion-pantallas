'use client';

import type { JSX } from 'react';
import { LuCircle } from 'react-icons/lu';
import type { ObjBase, DescriptorPantalla } from '../pantalla-types';
import { resolverIconoCTI40Plus } from './iconos-cti40plus';
import { COLORES } from './colors';

// const PRINCIPAL: DescriptorPantalla = { idPantalla: 0, indicePantalla: 0, esPrincipal: true };

interface Props {
  botones: ObjBase[];
  idPantallaActual: number;
  onNavegar: (descriptor: DescriptorPantalla) => void;
  compact?: boolean;
}

// Obtener color y estado de parpadeo del LED según ledEstado
function getLedState(ledEstado: number): { color: string; shouldBlink: boolean } {
  switch (ledEstado) {
    case 5: // led apagado
      return { color: COLORES.tertiary, shouldBlink: false };
    case 4: // primary parpadeante
      return { color: COLORES.primary, shouldBlink: true };
    case 3: // primary fijo
      return { color: COLORES.primary, shouldBlink: false };
    case 2: // error parpadeante
      return { color: COLORES.error, shouldBlink: true };
    case 1: // error fijo
      return { color: COLORES.error, shouldBlink: false };
    default: // por defecto apagado
      return { color: COLORES.tertiary, shouldBlink: false };
  }
}

export default function BarraBotonesTc5({ botones, /*idPantallaActual,*/ onNavegar, compact }: Props): JSX.Element | null {
  if (botones.length === 0) return null;

  const btnClass =
    compact === true
      ? 'mt-8 w-14 h-14 rounded-full bg-[#bddc28] flex items-center justify-center hover:bg-[#a8c023] active:scale-95 transition-all shadow-md relative'
      : 'mt-8 w-20 h-20 rounded-full bg-[#bddc28] flex items-center justify-center hover:bg-[#a8c023] active:scale-95 transition-all shadow-md relative';
  const iconSize = compact === true ? 32 : 48;
  const ledSize = compact === true ? 20 : 28;

  return (
    <div
      className={compact === true ? 'grid grid-cols-5 gap-3 px-8 py-2 place-items-center' : 'flex items-center justify-center gap-3 px-4 py-3'}
      style={compact === true ? { backgroundColor: COLORES.lastBackground } : {}}
    >
      {botones.map((obj, index) => {
        // objBarraAccesoDirectoIconV2 tiene las siguientes propiedades:
        // - icono: número del icono
        // - accion: tipo de acción (0=no navega, 1=navega)
        // - navegacion: puntero de navegación
        // - ledEstado: estado del LED (1-5)
        // - indice: índice del botón
        const icono = obj.icono as number | undefined;
        const accion = obj.accion as number | undefined;
        const navegacion = obj.navegacion as number | undefined;
        const ledEstado = (obj.ledEstado as number | undefined) ?? 5;
        const indice = (obj.indice as number | undefined) ?? index;

        const Icono = icono !== undefined ? resolverIconoCTI40Plus(icono) : null;
        const { color: ledColor, shouldBlink } = getLedState(ledEstado);
        const esBotonNavegacion = accion === 1 && navegacion !== undefined && navegacion > 0;

        return (
          <button
            key={index}
            onClick={() => {
              if (esBotonNavegacion) {
                // accion=1: navegar a la pantalla correspondiente
                onNavegar({ idPantalla: navegacion!, indicePantalla: (obj.indice as number | undefined) ?? 0, esPrincipal: false });
              } else {
                // accion=0: ejecutar acción sin navegar (aquí podríamos añadir lógica futura)
                console.log(`Botón TC5 ${indice + 1}: acción ejecutada (sin navegación)`);
              }
            }}
            className={btnClass}
            title={`Botón TC5 ${indice + 1}${esBotonNavegacion ? ' - Navegar a pantalla ' + navegacion : ' - Acción directa'}`}
            style={{ backgroundColor: COLORES.botonesFisicos, opacity: 1, cursor: 'pointer' }}
          >
            {Icono ? (
              <Icono
                size={iconSize}
                color={COLORES.lastBackground}
              />
            ) : (
              <LuCircle
                size={iconSize}
                color={COLORES.lastBackground}
              />
            )}

            {/* LED circular centrado encima del botón */}
            <div
              style={{
                position: 'absolute',
                top: compact === true ? -10 : -30,
                left: '50%',
                transform: 'translateX(-50%)',
                width: ledSize,
                height: ledSize,
                borderRadius: '50%',
                backgroundColor: ledColor,
                // border: '2px solid rgba(255,255,255,0.5)',
                animation: shouldBlink ? 'blink 1s infinite' : 'none',
                zIndex: 10
              }}
            />

            {shouldBlink && (
              <style>{`
                @keyframes blink {
                  0%, 50% { opacity: 1; }
                  51%, 100% { opacity: 0; }
                }
              `}</style>
            )}
          </button>
        );
      })}
    </div>
  );
}
