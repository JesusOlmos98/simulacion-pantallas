'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import type { JSX } from 'react';
import { useRouter } from 'next/navigation';
import { LuChevronLeft, LuInfo, LuMenu, LuX } from 'react-icons/lu';
import { RenderObjeto, resolverIconoCTI40Plus, ObjTablaDinamica } from '../components/render-objetos-cti40plus';
import ObjLineaInfoTextText from '../components/render-objetos-cti40plus/ObjLineaInfoTextText';
import ObjEncabezadoEditIcono from '../components/render-objetos-cti40plus/ObjEncabezadoEditIcono';
import { resolverTexto, COLORES, BarraBotonesCti40Plus } from '../components/render-objetos-cti40plus';
import type { DescriptorPantalla, ObjBase } from '../components/pantalla-types';
import { getColorHex } from '../components/render-objetos-cti40plus/colors';

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
  const [infoDialogAbierto, setInfoDialogAbierto] = useState(false);

  // Ref para poder cancelar el fetch en vuelo al desmontar o al lanzar uno nuevo
  const controllerRef = useRef<AbortController | null>(null);

  // Botones de barra de acceso directo (tipoObjeto: 66) — solo llegan en pantallaId=0,
  // se guardan aquí la primera vez y persisten durante toda la sesión CTI40 Plus.
  const barraAccesoDirectoPersistente = useRef<ObjBase[]>([]);

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
        if (descriptor.esPrincipal) {
          const botones = data.filter((o) => o.tipoObjeto === 66);
          if (botones.length > 0) barraAccesoDirectoPersistente.current = botones;
        }
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

  // Objetos de barra de acceso directo (tipoObjeto: 66) — se usan los persistentes (capturados en pantallaId=0)
  const barraAccesoDirecto = barraAccesoDirectoPersistente.current;

  // Separar objetos: header (tipoObjeto: 2), líneas (tipoObjeto: 4, 5, 16), info (tipoObjeto: 7) y otros
  const TIPOS_LINEA = new Set([4, 5, 16]);
  // Agrupar líneas en bloques separados por objLineaGrafica (tipoObjeto: 20)
  const gruposLineas: ObjBase[][] = [];
  if (objetos) {
    let grupoActual: ObjBase[] = [];
    for (const obj of objetos) {
      if (TIPOS_LINEA.has(obj.tipoObjeto)) {
        grupoActual.push(obj);
      } else if (obj.tipoObjeto === 20 && grupoActual.length > 0) {
        gruposLineas.push(grupoActual);
        grupoActual = [];
      }
    }
    if (grupoActual.length > 0) gruposLineas.push(grupoActual);
  }
  // Agrupar bloques de tabla: objTablaDinamicaInit (70) + filas objTablaDinamicaFila (71) consecutivas
  const tablasGrupos: { init: ObjBase; filas: ObjBase[] }[] = [];
  if (objetos) {
    let i = 0;
    while (i < objetos.length) {
      const obj = objetos[i]!;
      if (obj.tipoObjeto === 70) {
        const filas: ObjBase[] = [];
        let j = i + 1;
        while (j < objetos.length && objetos[j]!.tipoObjeto === 71) {
          filas.push(objetos[j]!);
          j++;
        }
        tablasGrupos.push({ init: obj, filas });
        i = j;
      } else {
        i++;
      }
    }
  }
  const infoObjetos = objetos?.filter((o) => o.tipoObjeto === 7) ?? [];
  const otrosObjetos = objetos?.filter((o) => o.tipoObjeto !== 2 && o.tipoObjeto !== 7 && o.tipoObjeto !== 20 && o.tipoObjeto !== 70 && o.tipoObjeto !== 71 && !TIPOS_LINEA.has(o.tipoObjeto)) ?? [];

  // Verificar si estamos en pantalla principal (idPantalla: 0)
  const esPantallaPrincipal = (objetos?.find((o) => o.tipoObjeto === 1)?.idPantalla ?? 0) === 0;

  // Puntero al menú: primer obj37 con tipoDato=0 (noVariable) y nav>0
  // Solo disponible cuando estamos en la pantalla principal
  const menuNavPtr: number | undefined = actual.esPrincipal
    ? (objetos?.find((o) => o.tipoObjeto === 37 && (o.tipoDato as number) === 0 && (o.valorEditableONav as number) > 0)?.valorEditableONav as number | undefined)
    : undefined;

  // Título: viene en objEncabezado (tipoObjeto=2) si la pantalla lo tiene
  const encabezado = objetos?.find((o) => o.tipoObjeto === 2) as
    | {
        tituloText?: number;
        colorTitulo?: number;
        iconoTarea2?: number;
        pantallaSaltoTarea2?: number;
        indicePantallaTarea2?: number;
        iconoTarea3?: number;
        pantallaSaltoTarea3?: number;
        indicePantallaTarea3?: number;
      }
    | undefined;
  const titulo = encabezado ? resolverTexto(encabezado.tituloText ?? 0) : '';
  const colorHeader = getColorHex(encabezado?.colorTitulo ?? 0);

  // objEncabezadoEditIcono (tipoObjeto: 31) — botón de acción a la derecha del header
  const encabezadoEditIcono = objetos?.find((o) => o.tipoObjeto === 31);

  // Tareas de navegación del encabezado (botones a la derecha del header)
  const tareas = [
    { icono: encabezado?.iconoTarea3 ?? 0, pantalla: encabezado?.pantallaSaltoTarea3 ?? 0, indice: encabezado?.indicePantallaTarea3 ?? 0 },
    { icono: encabezado?.iconoTarea2 ?? 0, pantalla: encabezado?.pantallaSaltoTarea2 ?? 0, indice: encabezado?.indicePantallaTarea2 ?? 0 }
  ].filter((t) => t.pantalla > 0);

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
              {/* Barra superior — solo en pantallas que no son la principal */}
              {!esPantallaPrincipal && (
                <div
                  className="flex items-center justify-between px-3 py-6 shrink-0"
                  style={{ backgroundColor: colorHeader }}
                >
                  {/* Izquierda: flecha + hamburguesa */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={volver}
                      className="p-1 text-white hover:text-gray-200 transition-colors"
                      aria-label={pila.length === 0 ? 'Inicio' : 'Atrás'}
                    >
                      <LuChevronLeft size={60} />
                    </button>

                    {menuNavPtr !== undefined && (
                      <button
                        onClick={() => navegarA({ idPantalla: menuNavPtr, indicePantalla: 0, esPrincipal: false })}
                        className="p-1 text-white hover:text-gray-200 transition-colors"
                        aria-label="Menú"
                      >
                        <LuMenu size={60} />
                      </button>
                    )}
                  </div>

                  {/* Título */}
                  <span className="text-5xl font-normal text-white truncate px-2">{titulo}</span>

                  {/* Derecha: botones de tarea (iconoTarea2/3 con pantallaSalto > 0) + objEncabezadoEditIcono */}
                  <div className="flex items-center gap-1">
                    {tareas.map((tarea, i) => {
                      const IconoTarea = resolverIconoCTI40Plus(tarea.icono);
                      return (
                        <button
                          key={i}
                          onClick={() => navegarA({ idPantalla: tarea.pantalla, indicePantalla: tarea.indice, esPrincipal: false })}
                          className="p-1 text-white hover:text-gray-200 transition-colors"
                        >
                          {IconoTarea ? <IconoTarea size={60} /> : null}
                        </button>
                      );
                    })}
                    {encabezadoEditIcono && <ObjEncabezadoEditIcono obj={encabezadoEditIcono} />}
                    {tareas.length === 0 && !encabezadoEditIcono && <div className="w-12" />}
                  </div>
                </div>
              )}

              {/* Objetos — scrollable si hay muchos */}
              <div
                className="flex-1 overflow-y-auto p-4 my-2 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-[#1E1E1E] [&::-webkit-scrollbar-thumb]:rounded-none [&::-webkit-scrollbar-thumb]:bg-[var(--scrollbar-thumb)] [&::-webkit-scrollbar-thumb:hover]:bg-[var(--scrollbar-thumb-hover)]"
                style={{ '--scrollbar-thumb': COLORES.primary, '--scrollbar-thumb-hover': '#4fa316' } as React.CSSProperties}
              >
                {esPantallaPrincipal ? (
                  <div className="flex-1 flex items-center justify-center">
                    <p className="text-white text-5xl">Pantalla principal</p>
                  </div>
                ) : (
                  <>
                    {/* Bloques de líneas — cada grupo separado por objLineaGrafica (tipo 20) va en su propio contenedor */}
                    {gruposLineas.length > 0 && (
                      <>
                        {gruposLineas.map((grupo, gi) => (
                          <div
                            key={gi}
                            className="rounded-lg mb-4"
                            style={{ backgroundColor: COLORES.tertiary }}
                          >
                            {grupo.map((obj, i) => (
                              <RenderObjeto
                                key={i}
                                obj={obj}
                                onNavegar={navegarA}
                                idPantallaActual={actual.idPantalla}
                              />
                            ))}
                          </div>
                        ))}
                      </>
                    )}

                    {/* Tablas dinámicas — edge-to-edge, sin esquinas ni margen lateral */}
                    {tablasGrupos.length > 0 && (
                      <div className="-mx-4 -mt-4">
                        {tablasGrupos.map((tabla, ti) => (
                          <ObjTablaDinamica
                            key={ti}
                            init={tabla.init}
                            filas={tabla.filas}
                            onNavegar={navegarA}
                          />
                        ))}
                      </div>
                    )}

                    {/* Botón de información — aparece si hay objLineaInfoTextText (tipo 7) */}
                    {infoObjetos.length > 0 && (
                      <div className="flex justify-center mt-10 mb-4">
                        <button
                          className="flex items-center gap-2 px-8 py-1 rounded-xl font-medium"
                          style={{ backgroundColor: COLORES.primary }}
                          onClick={() => setInfoDialogAbierto(true)}
                        >
                          <LuInfo
                            size={50}
                            color={COLORES.light}
                          />
                        </button>
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

          {/* ── Dialog de información (objLineaInfoTextText) ── */}
          {infoDialogAbierto && infoObjetos.length > 0 && (
            <div
              className="absolute inset-0 flex flex-col"
              style={{ backgroundColor: '#1E1E1E' }}
            >
              {/* Header del dialog */}
              <div
                className="flex items-center px-3 py-6 shrink-0"
                style={{ backgroundColor: COLORES.info }}
              >
                <button
                  className="p-1 text-white hover:text-gray-200 transition-colors"
                  aria-label="Cerrar"
                  onClick={() => setInfoDialogAbierto(false)}
                >
                  <LuX size={60} />
                </button>
                <span className="flex-1 text-center text-5xl font-normal text-white truncate px-2">{titulo}</span>
                {/* Espaciador simétrico para centrar el título */}
                <div style={{ width: 56 }} />
              </div>

              {/* Filas info */}
              <div className="flex-1 overflow-y-auto p-4 my-2">
                <div
                  className="rounded-lg"
                  style={{ backgroundColor: COLORES.tertiary }}
                >
                  {infoObjetos.map((obj, i) => (
                    <ObjLineaInfoTextText
                      key={i}
                      obj={obj}
                    />
                  ))}
                </div>
              </div>
            </div>
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
