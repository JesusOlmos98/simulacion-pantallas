'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import type { JSX } from 'react';
import { useRouter } from 'next/navigation';
import { LuChevronLeft, LuMenu } from 'react-icons/lu';
import { resolverTexto, resolverColor } from './pantalla-utils';
import { COLORES } from './colors';
import { RenderObjeto } from '../components';
import { DescriptorPantalla, ObjBase } from '../components/render-objetos/RenderObjeto';
import BarraBotonesCti40Plus from './BarraBotonesCti40Plus';
import ObjLineaCti40Plus from './ObjLineaCti40Plus';

const MAC_CTI40PLUS = '202000029'; // MAC address para CTI40 PLUS
let idEnvioCounter = 1;

// ─── Descriptor de pantalla ───────────────────────────────────────────────────

const PRINCIPAL: DescriptorPantalla = { idPantalla: 0, indicePantalla: 0, esPrincipal: true };

// ─── Fetch ────────────────────────────────────────────────────────────────────

async function fetchPantalla(d: DescriptorPantalla, signal: AbortSignal): Promise<ObjBase[]> {
  const params = new URLSearchParams({ mac: MAC_CTI40PLUS, eventId: '1', idEnvio: String(idEnvioCounter++), readWrite: '0', esPantallaPrincipal: d.esPrincipal ? '1' : '0' });
  if (!d.esPrincipal) {
    params.set('idNav', String(d.idPantalla));
    params.set('indicePantalla', String(d.indicePantalla));
    if (d.idUnicoEdicion !== undefined) {
      params.set('idUnicoEdicion', String(d.idUnicoEdicion));
    }
  }
  const res = await fetch(`http://localhost:8020/api/pruebas/peticionPantallaConEspera?${params}`, { method: 'POST', signal });
  if (!res.ok) throw new Error(`Error ${res.status}`);
  return res.json();
}

// ─── Componente principal ─────────────────────────────────────────────────────

export default function PantallaCti40Plus(): JSX.Element {
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

  // Objetos de barra de acceso directo (tipoObjeto: 66)
  const barraAccesoDirecto = objetos?.filter((o) => o.tipoObjeto === 66) ?? [];

  // Separar objetos: header (tipoObjeto: 2), líneas (tipoObjeto: 5) y otros
  const lineasObjetos = objetos?.filter((o) => o.tipoObjeto === 5) ?? [];
  const otrosObjetos = objetos?.filter((o) => o.tipoObjeto !== 2 && o.tipoObjeto !== 5) ?? [];

  // Verificar si estamos en pantalla principal (idPantalla: 0)
  const esPantallaPrincipal = (objetos?.find((o) => o.tipoObjeto === 1)?.idPantalla ?? 0) === 0;

  // Puntero al menú: primer obj37 con tipoDato=0 (noVariable) y nav>0
  // Solo disponible cuando estamos en la pantalla principal
  const menuNavPtr: number | undefined = actual.esPrincipal
    ? (objetos?.find((o) => o.tipoObjeto === 37 && (o.tipoDato as number) === 0 && (o.valorEditableONav as number) > 0)?.valorEditableONav as number | undefined)
    : undefined;

  // Título: viene en objEncabezado (tipoObjeto=2) si la pantalla lo tiene
  const encabezado = objetos?.find((o) => o.tipoObjeto === 2) as { tituloText?: number; colorTitulo?: number } | undefined;
  const titulo = encabezado ? resolverTexto(encabezado.tituloText ?? 0) : '';
  const colorHeader = resolverColor(encabezado?.colorTitulo ?? 0);

  // tipoPlantilla: 4 = lista de filas, otros = grid de iconos
  const tipoPlantilla = (objetos?.find((o) => o.tipoObjeto === 1)?.tipoPlantilla as number) ?? 0;
  const esLista = tipoPlantilla === 4;

  // ── Loading / Error ───────────────────────────────────────────────────────

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-6">
      <div className="flex flex-col items-center">
        {/* ── Pantalla 4:3 ── */}
        <div
          className="relative flex flex-col bg-black overflow-hidden rounded-lg border border-zinc-800 shadow-2xl"
          style={{ width: '960px', height: '720px', minWidth: '960px', maxWidth: '960px', minHeight: '720px', maxHeight: '720px', backgroundColor: '#1E1E1E' }}
        >
          {/* ── Loading ── */}
          {loading && (
            <div className="flex-1 flex flex-col items-center justify-center gap-4">
              <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
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
              {/* Barra superior */}
              <div
                className="flex items-center justify-between px-3 py-5 shrink-0"
                style={{ backgroundColor: colorHeader }}
              >
                {/* Izquierda: flecha + hamburguesa */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={volver}
                    className="p-1 text-white hover:text-gray-200 transition-colors"
                    aria-label={pila.length === 0 ? 'Inicio' : 'Atrás'}
                  >
                    <LuChevronLeft size={48} />
                  </button>

                  {menuNavPtr !== undefined && (
                    <button
                      onClick={() => navegarA({ idPantalla: menuNavPtr, indicePantalla: 0, esPrincipal: false })}
                      className="p-1 text-white hover:text-gray-200 transition-colors"
                      aria-label="Menú"
                    >
                      <LuMenu size={48} />
                    </button>
                  )}
                </div>

                {/* Título */}
                <span className="text-4xl font-normal text-white truncate px-2">{esPantallaPrincipal ? 'Pantalla principal' : titulo}</span>

                {/* Placeholder derecho para centrar el título */}
                <div className="w-12" />
              </div>

              {/* Objetos — scrollable si hay muchos */}
              <div className="flex-1 overflow-y-auto p-4">
                {esPantallaPrincipal ? (
                  <div className="flex-1 flex items-center justify-center">
                    <p className="text-white text-2xl">Pantalla principal</p>
                  </div>
                ) : (
                  <>
                    {/* Contenedor para líneas con esquinas redondeadas y fondo tertiary */}
                    {lineasObjetos.length > 0 && (
                      <div
                        className="rounded-lg mb-4"
                        style={{ backgroundColor: COLORES.tertiary }}
                      >
                        {lineasObjetos.map((obj, i) => (
                          <ObjLineaCti40Plus
                            key={i}
                            obj={obj}
                            onNavegar={navegarA}
                          />
                        ))}
                      </div>
                    )}

                    {/* Otros objetos (grid o lista) */}
                    {otrosObjetos.length > 0 && (
                      <>
                        {esLista ? (
                          <div className="flex flex-col">
                            {otrosObjetos.map((obj, i) => (
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
                            {otrosObjetos.map((obj, i) => (
                              <RenderObjeto
                                key={i}
                                obj={obj}
                                onNavegar={navegarA}
                                idPantallaActual={actual.idPantalla}
                              />
                            ))}
                          </div>
                        )}
                      </>
                    )}
                  </>
                )}
              </div>
            </>
          )}
        </div>

        {/* ── Barra de botones de acceso directo (fuera de la pantalla) ── */}
        <BarraBotonesCti40Plus
          botones={barraAccesoDirecto}
          onNavegar={navegarA}
        />
      </div>
    </div>
  );
}
