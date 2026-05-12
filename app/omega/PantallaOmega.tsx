'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import type { JSX } from 'react';
import { useRouter } from 'next/navigation';
import { resolveText } from '../components/render-objetos-cti40plus/textos/resolverTexto';
import { COLORES, RenderObjeto, Divider } from '../components/render-objetos-omega';
import type { DescriptorPantalla, ObjBase } from '../components/pantalla-types';

const MAC_OMEGA = '14000208';
let idEnvioCounter = 1;

// ─── Descriptor de pantalla ───────────────────────────────────────────────────

const PRINCIPAL: DescriptorPantalla = { idPantalla: 0, indicePantalla: 0, esPrincipal: true };

// ─── Fetch ────────────────────────────────────────────────────────────────────

async function fetchPantalla(d: DescriptorPantalla, signal: AbortSignal): Promise<ObjBase[]> {
  const params = new URLSearchParams({ mac: MAC_OMEGA, eventId: '1', idEnvio: String(idEnvioCounter++), readWrite: '0', esPantallaPrincipal: d.esPrincipal ? '1' : '0' });
  if (!d.esPrincipal) {
    params.set('idNav', String(d.idPantalla));
    params.set('indicePantalla', String(d.indicePantalla));
    if (d.idUnicoEdicion !== undefined) {
      params.set('idUnicoEdicion', String(d.idUnicoEdicion));
    }
  }
  const res = await fetch(`/api/pantalla?${params}`, { method: 'POST', signal });
  if (!res.ok) throw new Error(`Error ${res.status}`);
  return res.json();
}

// ─── Componente principal ─────────────────────────────────────────────────────

export default function PantallaOmega(): JSX.Element {
  const router = useRouter();

  const [pila, setPila] = useState<DescriptorPantalla[]>([]);
  const [actual, setActual] = useState<DescriptorPantalla>(PRINCIPAL);
  const [objetos, setObjetos] = useState<ObjBase[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Ref para poder cancelar el fetch en vuelo al desmontar o al lanzar uno nuevo
  const controllerRef = useRef<AbortController | null>(null);

  const cargarPantalla = useCallback((descriptor: DescriptorPantalla) => {
    // Cancela silenciosamente cualquier petición en vuelo
    controllerRef.current?.abort();

    setLoading(true);
    setError(null);
    setObjetos(null);
    setActual(descriptor);

    const controller = new AbortController();
    controllerRef.current = controller;

    // El timeout de 35 s marca el abort como "por timeout" con una flag
    let timedOut = false;
    const timeout = setTimeout(() => {
      timedOut = true;
      controller.abort();
    }, 35_000);

    fetchPantalla(descriptor, controller.signal)
      .then((data) => {
        setObjetos(data);
        setLoading(false);
      })
      .catch((err: Error) => {
        if (err.name === 'AbortError' && !timedOut) return; // abort limpio (cleanup/navegación), ignorar
        setError(timedOut ? 'Timeout: el dispositivo no respondió' : err.message);
        setLoading(false);
      })
      .finally(() => clearTimeout(timeout));
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    cargarPantalla(PRINCIPAL);
    return (): void => {
      controllerRef.current?.abort();
    };
  }, [cargarPantalla]);

  function navegarA(descriptor: DescriptorPantalla): void {
    setPila((prev) => [...prev, actual]);
    cargarPantalla(descriptor);
  }

  function volver(): void {
    if (pila.length === 0) {
      router.push('/');
      return;
    }
    const anterior = pila[pila.length - 1]!;
    setPila((prev) => prev.slice(0, -1));
    cargarPantalla(anterior);
  }

  // ── Derivados ─────────────────────────────────────────────────────────────

  // Puntero al menú: primer obj37 con tipoDato=0 (noVariable) y nav>0
  // Solo disponible cuando estamos en la pantalla principal
  const menuNavPtr: number | undefined = actual.esPrincipal
    ? (objetos?.find((o) => o.tipoObjeto === 37 && (o.tipoDato as number) === 0 && (o.valorEditableONav as number) > 0)?.valorEditableONav as number | undefined)
    : undefined;

  // Título: viene en objEncabezado (tipoObjeto=2) si la pantalla lo tiene
  const encabezado = objetos?.find((o) => o.tipoObjeto === 2) as { tituloText?: number } | undefined;
  const titulo = encabezado ? resolveText(encabezado.tituloText ?? 0) : '';

  // tipoPlantilla: 4 = lista de filas, otros = grid de iconos
  const tipoPlantilla = (objetos?.find((o) => o.tipoObjeto === 1)?.tipoPlantilla as number) ?? 0;
  const esLista = tipoPlantilla === 4;

  // ── Loading / Error ───────────────────────────────────────────────────────

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-6">
      <div
        className="relative flex flex-col w-[80vw] aspect-[16/9] bg-black overflow-hidden rounded-lg border border-zinc-800 shadow-2xl"
        style={{
          width: '1280px',
          height: '720px',
          minWidth: '1280px',
          maxWidth: '1280px',
          minHeight: '720px',
          maxHeight: '720px',
          backgroundImage: 'url(/FONDO_OMEGA.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        {/* ── Loading ── */}
        {loading && (
          <div className="flex-1 flex flex-col items-center justify-center gap-4">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            {/* <p className="text-zinc-500 text-sm">Esperando respuesta del dispositivo…</p> */}
          </div>
        )}

        {/* ── Error ── */}
        {!loading && error !== null && (
          <div className="flex-1 flex flex-col items-center justify-center gap-4">
            <p className="text-red-500 text-sm">{error}</p>
            <button
              onClick={volver}
              className="px-4 py-2 bg-zinc-800 rounded text-sm text-white hover:bg-zinc-700"
            >
              Volver
            </button>
          </div>
        )}

        {/* ── Contenido ── */}
        {!loading && error === null && objetos !== null && objetos.length > 0 && (
          <>
            {/* Barra superior sin fondo */}
            <div className="flex items-center justify-between px-3 py-3 shrink-0">
              {/* Izquierda: flecha + hamburguesa */}
              <div className="flex items-center gap-1">
                <button
                  onClick={volver}
                  className="p-1 text-white hover:text-gray-200 transition-colors"
                  aria-label={pila.length === 0 ? 'Inicio' : 'Atrás'}
                >
                  <svg
                    width="48"
                    height="48"
                    viewBox="0 0 20 20"
                    fill="none"
                  >
                    <path
                      d="M12.5 15L7.5 10L12.5 5"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>

                {menuNavPtr !== undefined && (
                  <button
                    onClick={() => navegarA({ idPantalla: menuNavPtr, indicePantalla: 0, esPrincipal: false })}
                    className="p-1 text-white hover:text-gray-200 transition-colors"
                    aria-label="Menú"
                  >
                    <svg
                      width="48"
                      height="48"
                      viewBox="0 0 20 20"
                      fill="none"
                    >
                      <path
                        d="M3 5H17M3 10H17M3 15H17"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                      />
                    </svg>
                  </button>
                )}
              </div>

              {/* Título */}
              <span className="text-6xl font-normal text-white truncate px-2">{titulo}</span>

              {/* Placeholder derecho para centrar el título */}
              <div className="w-12" />
            </div>

            {/* Línea divisoria */}
            <Divider
              color={COLORES.primary}
              thickness="4px"
              marginY="8px"
            />
            {/* </div> */}

            {/* Objetos — scrollable si hay muchos */}
            <div className="flex-1 overflow-y-auto">
              {esLista ? (
                <div className="flex flex-col">
                  {objetos.map((obj, i) => (
                    <RenderObjeto
                      key={i}
                      obj={obj}
                      onNavegar={navegarA}
                      idPantallaActual={actual.idPantalla}
                      esLista
                    />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-7 gap-2 p-2">
                  {objetos.map((obj, i) => (
                    <RenderObjeto
                      key={i}
                      obj={obj}
                      onNavegar={navegarA}
                      idPantallaActual={actual.idPantalla}
                    />
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
