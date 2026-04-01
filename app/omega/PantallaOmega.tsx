'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { resolverTexto, resolverUnidad, decodificarVariable } from './pantalla-utils'
import { COLORES } from './colors'
import { resolverIcono } from './iconos-menu'
import { Divider } from '../components'

// tipoObjeto llega como NUMBER en el JSON, no como string
type ObjBase = Record<string, unknown> & { tipoObjeto: number }

const MAC_OMEGA = '14000208'
let idEnvioCounter = 1

// ─── Descriptor de pantalla ───────────────────────────────────────────────────

interface DescriptorPantalla {
  idPantalla: number      // 0 para la principal
  indicePantalla: number
  esPrincipal: boolean
  idUnicoEdicion?: number // presente al navegar desde una línea (valorEditableONav)
}

const PRINCIPAL: DescriptorPantalla = { idPantalla: 0, indicePantalla: 0, esPrincipal: true }

// ─── Fetch ────────────────────────────────────────────────────────────────────

async function fetchPantalla(d: DescriptorPantalla, signal: AbortSignal): Promise<ObjBase[]> {
  const params = new URLSearchParams({
    mac: MAC_OMEGA,
    eventId: '1',
    idEnvio: String(idEnvioCounter++),
    readWrite: '0',
    esPantallaPrincipal: d.esPrincipal ? '1' : '0',
  })
  if (!d.esPrincipal) {
    params.set('idNav', String(d.idPantalla))
    params.set('indicePantalla', String(d.indicePantalla))
    if (d.idUnicoEdicion !== undefined) {
      params.set('idUnicoEdicion', String(d.idUnicoEdicion))
    }
  }
  const res = await fetch(`/api/pantalla?${params}`, { method: 'POST', signal })
  if (!res.ok) throw new Error(`Error ${res.status}`)
  return res.json()
}

// ─── Componente principal ─────────────────────────────────────────────────────

export default function PantallaOmega() {
  const router = useRouter()

  const [pila, setPila] = useState<DescriptorPantalla[]>([])
  const [actual, setActual] = useState<DescriptorPantalla>(PRINCIPAL)
  const [objetos, setObjetos] = useState<ObjBase[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Ref para poder cancelar el fetch en vuelo al desmontar o al lanzar uno nuevo
  const controllerRef = useRef<AbortController | null>(null)

  const cargarPantalla = useCallback((descriptor: DescriptorPantalla) => {
    // Cancela silenciosamente cualquier petición en vuelo
    controllerRef.current?.abort()

    setLoading(true)
    setError(null)
    setObjetos(null)
    setActual(descriptor)

    const controller = new AbortController()
    controllerRef.current = controller

    // El timeout de 35 s marca el abort como "por timeout" con una flag
    let timedOut = false
    const timeout = setTimeout(() => { timedOut = true; controller.abort() }, 35_000)

    fetchPantalla(descriptor, controller.signal)
      .then((data) => { setObjetos(data); setLoading(false) })
      .catch((err: Error) => {
        if (err.name === 'AbortError' && !timedOut) return // abort limpio (cleanup/navegación), ignorar
        setError(timedOut ? 'Timeout: el dispositivo no respondió' : err.message)
        setLoading(false)
      })
      .finally(() => clearTimeout(timeout))
  }, [])

  useEffect(() => {
    cargarPantalla(PRINCIPAL)
    return () => controllerRef.current?.abort()
  }, [cargarPantalla])

  function navegarA(descriptor: DescriptorPantalla) {
    setPila((prev) => [...prev, actual])
    cargarPantalla(descriptor)
  }

  function volver() {
    if (pila.length === 0) { router.push('/'); return }
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const anterior = pila[pila.length - 1]!
    setPila((prev) => prev.slice(0, -1))
    cargarPantalla(anterior)
  }

  // ── Derivados ─────────────────────────────────────────────────────────────

  // Puntero al menú: primer obj37 con tipoDato=0 (noVariable) y nav>0
  // Solo disponible cuando estamos en la pantalla principal
  const menuNavPtr: number | undefined = actual.esPrincipal
    ? (objetos
        ?.find(
          (o) =>
            o.tipoObjeto === 37 &&
            (o.tipoDato as number) === 0 &&
            (o.valorEditableONav as number) > 0,
        )
        ?.valorEditableONav as number | undefined)
    : undefined

  // Título: viene en objEncabezado (tipoObjeto=2) si la pantalla lo tiene
  const encabezado = objetos?.find((o) => o.tipoObjeto === 2) as
    | { tituloText?: number }
    | undefined
  const titulo = encabezado ? resolverTexto(encabezado.tituloText ?? 0) : ''

  // ── Loading / Error ───────────────────────────────────────────────────────

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-6">
      <div className="relative flex flex-col w-[80vw] aspect-[16/9] bg-black overflow-hidden rounded-lg border border-zinc-800 shadow-2xl" style={{
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
      }}>

        {/* ── Loading ── */}
        {loading && (
          <div className="flex-1 flex flex-col items-center justify-center gap-4">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-zinc-500 text-sm">Esperando respuesta del dispositivo…</p>
          </div>
        )}

        {/* ── Error ── */}
        {!loading && error && (
          <div className="flex-1 flex flex-col items-center justify-center gap-4">
            <p className="text-red-500 text-sm">{error}</p>
            <button onClick={volver} className="px-4 py-2 bg-zinc-800 rounded text-sm text-white hover:bg-zinc-700">
              Volver
            </button>
          </div>
        )}

        {/* ── Contenido ── */}
        {!loading && !error && !!objetos?.length && (
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
                  <svg width="48" height="48" viewBox="0 0 20 20" fill="none">
                    <path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>

                {menuNavPtr !== undefined && (
                  <button
                    onClick={() => navegarA({ idPantalla: menuNavPtr, indicePantalla: 0, esPrincipal: false })}
                    className="p-1 text-white hover:text-gray-200 transition-colors"
                    aria-label="Menú"
                  >
                    <svg width="48" height="48" viewBox="0 0 20 20" fill="none">
                      <path d="M3 5H17M3 10H17M3 15H17" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
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
            <div className="px-4">
              <Divider color={COLORES.primary} thickness="4px" marginY="8px" />
            </div>

            {/* Objetos — scrollable si hay muchos */}
            <div className="flex-1 overflow-y-auto">
              <div className="grid grid-cols-7 gap-2 p-2">
                {objetos.map((obj, i) => (
                  <RenderObjeto key={i} obj={obj} onNavegar={navegarA} idPantallaActual={actual.idPantalla} />
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

// ─── Renderizador por tipo ────────────────────────────────────────────────────

interface RenderObjetoProps {
  obj: ObjBase
  onNavegar: (d: DescriptorPantalla) => void
  idPantallaActual: number
}

function RenderObjeto({ obj, onNavegar, idPantallaActual }: RenderObjetoProps) {
  function navSiProcede(nav: number, indicePantalla: number) {
    if (nav <= 0) return
    onNavegar({ idPantalla: nav, indicePantalla, esPrincipal: false, idUnicoEdicion: nav })
  }

  switch (obj.tipoObjeto) {

    // objPlantilla — metadatos, no se pinta
    case 1:
      return null

    // objEncabezado — se muestra en la barra superior, no aquí
    case 2:
      return null

    // objLineaText — menú con recuadro en grid 6 columnas
    case 5: {
      const nav = obj.valorEditableONav as number
      const texto = resolverTexto(obj.texto as number)
      const Icono = resolverIcono(obj.iconoLinea as number)
      return (
        <div
          className="aspect-square rounded-lg flex flex-col items-center justify-center text-center gap-2 p-4 cursor-pointer transition-all duration-200 hover:scale-110"
          onClick={() => navSiProcede(nav, obj.indicePantalla as number)}
        >
          {Icono && <Icono className="text-white" size={72} />}
          <span className="text-base font-medium break-words leading-tight" style={{ color: COLORES.menuWords }}>{texto}</span>
        </div>
      )
    }

    // objVarIndividual — variable sin navegación (fila completa)
    case 36: {
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

    // objVarIndividualNavegacionOEdit — variable con navegación opcional
    case 37: {
      const nav = obj.valorEditableONav as number
      const tipoDato = obj.tipoDato as number
      // Sin valor y sin nav: no pintar (p.ej. slots vacíos de la pantalla principal)
      if (tipoDato === 0 && nav === 0) return null
      // Solo nav (tipoDato=0): mostrar como recuadro en menú
      if (tipoDato === 0) {
        return (
          <div
            className="aspect-square border border-zinc-200 rounded-lg flex items-center justify-center cursor-pointer hover:bg-zinc-600 active:bg-zinc-500 transition-colors"
            onClick={() => navSiProcede(nav, obj.indicePantalla as number)}
          >
            <span className="text-zinc-400 text-xs italic">[nav]</span>
          </div>
        )
      }
      const valor = decodificarVariable(obj.valorVariable as number, tipoDato)
      const unidad = resolverUnidad(obj.unidad as number)
      return (
        <div className="col-span-6 flex justify-between items-center px-4 py-2 border-b border-zinc-100 cursor-pointer hover:bg-zinc-50 active:bg-zinc-100 transition-colors" onClick={() => navSiProcede(nav, obj.indicePantalla as number)}>
          <span className="font-mono text-white">
            {valor}
            {unidad && <span className="text-gray-300 text-xs ml-0.5">{unidad}</span>}
          </span>
          {nav > 0 && <ChevronRight />}
        </div>
      )
    }

    // objLineaGrafica — separador (fila completa)
    case 20:
      return <hr className="col-span-6 border-zinc-200 my-1" />

    // objEtapasVentiladoresVisualSize — sin renderizador por ahora
    case 47:
      return null

    // objClaveParaEntrar — sin renderizador por ahora
    case 53:
      return null

    default:
      return (
        <div className="col-span-6 px-4 py-0.5 text-xs text-zinc-300 italic">
          [{obj.tipoObjeto}]
        </div>
      )
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function ChevronRight() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0 text-zinc-400">
      <path d="M6 12L10 8L6 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
