'use client';

import { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import type { JSX } from 'react';
import { useRouter } from 'next/navigation';
import { LuCheck, LuChevronLeft, LuInfo, LuMenu, LuX } from 'react-icons/lu';
import { useIsSmallScreen } from '../hooks/useIsSmallScreen';
import ObjVentilacionGrupoGrafico from '../components/render-objetos-cti40plus/ObjVentilacionGrupoGrafico';
import ObjVentilacionGrupoGraficoEdit from '../components/render-objetos-cti40plus/ObjVentilacionGrupoGraficoEdit';
import { RenderObjeto, resolverIconoCTI40Plus, ObjTablaDinamica, ObjLineaInfoTextVar, ObjLineaInfoTextTextVarVar } from '../components/render-objetos-cti40plus';
import ObjLineaInfoTextText from '../components/render-objetos-cti40plus/ObjLineaInfoTextText';
import ObjEncabezadoEditIcono from '../components/render-objetos-cti40plus/ObjEncabezadoEditIcono';
import ObjTablaDatosSinEdicion from '../components/render-objetos-cti40plus/ObjTablaDatosSinEdicion';
import { parseConfigTabla } from '../components/render-objetos-cti40plus/ObjTablaConfig';
import ObjEditVariables from '../components/render-objetos-cti40plus/ObjEditVariables';
import ObjEditVariablesString from '../components/render-objetos-cti40plus/ObjEditVariablesString';
import ObjEditVariablesTiempoFecha from '../components/render-objetos-cti40plus/ObjEditVariablesTiempoFecha';
import ObjCamposMultiseleccion from '../components/render-objetos-cti40plus/ObjCamposMultiseleccion';
import { resolveText } from '../components/render-objetos-cti40plus/textos/resolverTexto';
import { EnTextos } from '@/src/utils/common-lib-commac-generador/enumTextos';
import { COLORES, BarraBotonesCti40Plus } from '../components/render-objetos-cti40plus';
import type { DescriptorPantalla, ObjBase } from '../components/pantalla-types';
import PantallaLibre from './PantallaLibre';
import { apiFetch } from '../api/apiFetch';
import {
  buildDerivadosCti40Plus,
  buildEscribirVariableParams,
  buildEscribirVariableStringParams,
  buildGuardarVentiladoresParams,
  buildParametrosSeleccionCti40Plus,
  buildTextoConcatenadoMap,
  calcularVolver,
  DEFAULT_MAC_CTI40PLUS,
  fetchPantalla,
  getBotonesAccesoDirecto,
  getDescriptorRefresco,
  getEditValueInicial,
  getEstadosVentiladoresIniciales,
  getSegundosRefresco,
  getSeleccionInicial,
  getVersionEquipo,
  isEditValueValido,
  isSeleccionConfirmable,
  PRINCIPAL,
  resolverDestinoTrasEdicion as resolverDestinoTrasEdicionCti40Plus,
  toggleEstadoVentilador,
  type CargarPantallaOptions,
  type DestinoTrasEdicion
} from './fnCti40Plus';

// const URL = process.env.NEXT_PUBLIC_COMMAC_BASE_URL || 'http://localhost:8020/api'; // Centralizado en apiFetch

// ─── Descriptor de pantalla ───────────────────────────────────────────────────

const IconoVentiladorEstatico = resolverIconoCTI40Plus(340);
const IconoVentiladorTemporizado = resolverIconoCTI40Plus(341);
const IconoVentiladorRotatorio = resolverIconoCTI40Plus(342);

// ─── Componente principal ─────────────────────────────────────────────────────

interface PantallaCti40PlusProps {
  lang?: string;
  mac?: string;
  token?: string;
}

export default function PantallaCti40Plus({ lang, mac = DEFAULT_MAC_CTI40PLUS, token = '' }: PantallaCti40PlusProps): JSX.Element {
  const router = useRouter();

  const [pila, setPila] = useState<DescriptorPantalla[]>([]);
  const [actual, setActual] = useState<DescriptorPantalla>(PRINCIPAL);
  const [objetos, setObjetos] = useState<ObjBase[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [infoDialogAbierto, setInfoDialogAbierto] = useState(false);
  const [editValue, setEditValue] = useState('');
  const [selectedIdSeleccion, setSelectedIdSeleccion] = useState<number | null>(null);
  const [selectedIdSelecciones, setSelectedIdSelecciones] = useState<Set<number>>(new Set());
  const [estadosVentiladores, setEstadosVentiladores] = useState<number[]>([]);
  const [pestanaActivaVentilacion, setPestanaActivaVentilacion] = useState<0 | 1>(0);
  const [barraAbierta, setBarraAbierta] = useState(true);

  const isSmallScreen = useIsSmallScreen();

  // Ref para poder cancelar el fetch en vuelo al desmontar o al lanzar uno nuevo
  const controllerRef = useRef<AbortController | null>(null);
  const escribirSeleccionRef = useRef<() => Promise<void>>(async () => {});
  const versionEquipoRef = useRef(304);

  // Botones de barra de acceso directo (tipoObjeto: 66) — solo llegan en pantallaId=0,
  // se guardan aquí la primera vez y persisten durante toda la sesión CTI40 Plus.
  const barraAccesoDirectoPersistente = useRef<ObjBase[]>([]);

  const requestPantalla = useCallback(
    (params: URLSearchParams, signal?: AbortSignal): Promise<Response> => {
      params.set('mac', mac);
      params.set('versionEquipo', String(versionEquipoRef.current));
      if (token !== '') {
        params.set('token', token);
      }
      return apiFetch(params, signal);
    },
    [mac, token]
  );

  const cargarPantalla = useCallback(
    (descriptor: DescriptorPantalla, options: CargarPantallaOptions = {}) => {
      const { onSuccess, mostrarLoading = true } = options;
      // Cancela silenciosamente cualquier petición en vuelo
      controllerRef.current?.abort();

      if (mostrarLoading) {
        setLoading(true);
      }
      setError(null);

      const controller = new AbortController();
      controllerRef.current = controller;

      // El timeout de 35 s marca el abort como "por timeout" con una flag
      let timedOut = false;
      const timeout = setTimeout(() => {
        timedOut = true;
        controller.abort();
      }, 35_000);

      fetchPantalla(descriptor, controller.signal, versionEquipoRef.current, mac, token)
        .then((data) => {
          const versionEquipo = getVersionEquipo(data);
          if (versionEquipo !== null) {
            versionEquipoRef.current = versionEquipo;
          }

          if (descriptor.esPrincipal) {
            const botones = getBotonesAccesoDirecto(data);
            if (botones.length > 0) barraAccesoDirectoPersistente.current = botones;
          }
          // Inicializar editValue en el mismo batch que setObjetos para evitar el flash de valor incorrecto
          setEditValue(getEditValueInicial(data));
          onSuccess?.();
          setActual(descriptor);
          setBarraAbierta(descriptor.esPrincipal);
          setObjetos(data);
          setLoading(false);
        })
        .catch((err: Error) => {
          if (err.name === 'AbortError' && !timedOut) return; // abort limpio (cleanup/navegación), ignorar
          setError(timedOut ? 'Timeout: el dispositivo no respondió' : err.message);
          setLoading(false);
        })
        .finally(() => clearTimeout(timeout));
    },
    [mac, token]
  );

  useEffect(() => {
    cargarPantalla(PRINCIPAL);
    return (): void => {
      controllerRef.current?.abort();
    };
  }, [cargarPantalla]);

  const segundosRefresco = useMemo(() => getSegundosRefresco(objetos), [objetos]);
  const descriptorRefresco = useMemo(() => getDescriptorRefresco(actual, objetos), [actual, objetos]);

  useEffect(() => {
    if (!objetos || loading || error !== null || descriptorRefresco === null) return undefined;

    const timeoutId = window.setTimeout(() => {
      cargarPantalla(descriptorRefresco, { mostrarLoading: false });
    }, segundosRefresco * 1000);

    return (): void => window.clearTimeout(timeoutId);
  }, [cargarPantalla, descriptorRefresco, error, loading, objetos, segundosRefresco]);

  // Inicializa los estados de ventiladores cuando carga una pantalla de edicion de ventiladores (tipoPlantilla: 10)
  useEffect(() => {
    const estados = getEstadosVentiladoresIniciales(objetos);
    if (estados === null) return;
    setEstadosVentiladores(estados);
    setPestanaActivaVentilacion(0);
  }, [objetos]);

  // Inicializa las opciones seleccionadas cuando carga una pantalla de seleccion (tipoObjeto: 10)
  useEffect(() => {
    const seleccion = getSeleccionInicial(objetos);
    if (seleccion === null) return;
    setSelectedIdSeleccion(seleccion.selectedIdSeleccion);
    setSelectedIdSelecciones(seleccion.selectedIdSelecciones);
  }, [objetos]);
  async function guardarVentiladores(): Promise<void> {
    if (!objVentilacionEdit || !objetos) return;
    const destinoTrasEdicion = resolverDestinoTrasEdicion();
    const params = buildGuardarVentiladoresParams({ mac, objetos, objVentilacionEdit, objVentilacionGrafico, estadosVentiladores });
    if (params === null) return;

    setLoading(true);
    setError(null);

    try {
      const res = await requestPantalla(params);
      if (!res.ok) throw new Error(`Error ${res.status}`);
      navegarTrasEscritura(destinoTrasEdicion);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al guardar ventiladores');
      setLoading(false);
    }
  }

  function handleClickVentilador(idx: number): void {
    setEstadosVentiladores((prev) => toggleEstadoVentilador(prev, idx, pestanaActivaVentilacion));
  }
  function handleTrashVentiladores(): void {
    setEstadosVentiladores((prev) => prev.map(() => 0));
  }

  function navegarA(descriptor: DescriptorPantalla): void {
    cargarPantalla(descriptor, { onSuccess: () => setPila((prev) => [...prev, actual]) });
  }

  function volver(): void {
    const retorno = calcularVolver(pila, actual);
    if (retorno === null) {
      setPila([]);
      router.push('/');
      return;
    }

    cargarPantalla(retorno.anterior, { onSuccess: () => setPila(retorno.nuevaPila) });
  }
  function resolverDestinoTrasEdicion(): DestinoTrasEdicion {
    return resolverDestinoTrasEdicionCti40Plus(objetos, pila);
  }

  function navegarTrasEscritura(destinoTrasEdicion: DestinoTrasEdicion): void {
    cargarPantalla(destinoTrasEdicion.destino, { onSuccess: () => setPila(destinoTrasEdicion.nuevaPila) });
  }

  const refrescarPantallaActual = useCallback((): void => {
    cargarPantalla(actual, { mostrarLoading: false });
  }, [actual, cargarPantalla]);

  async function escribirVariable(valor: string): Promise<void> {
    if (!objEditVariables || !objetos) return;
    const objIdUnicoEdicion = objetos.find((o) => o.tipoObjeto === 12);
    if (!objIdUnicoEdicion) return;

    const destinoTrasEdicion = resolverDestinoTrasEdicion();
    const idPantallaRespuesta = destinoTrasEdicion.destino.idPantalla;
    const indicePantallaRespuesta = destinoTrasEdicion.destino.indicePantalla;
    const params = buildEscribirVariableParams({ mac, destinoTrasEdicion, objIdUnicoEdicion, idPantallaRespuesta, indicePantallaRespuesta, objEditVariables, valor });
    if (params === null) return;

    setLoading(true);
    setError(null);

    try {
      const res = await requestPantalla(params);
      if (!res.ok) throw new Error(`Error ${res.status}`);
      navegarTrasEscritura(destinoTrasEdicion);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al escribir variable');
      setLoading(false);
    }
  }
  async function escribirVariableString(valor: string): Promise<void> {
    if (!objEditVariablesString || !objetos) return;
    const objIdUnicoEdicion = objetos.find((o) => o.tipoObjeto === 12);
    if (!objIdUnicoEdicion) return;

    const destinoTrasEdicion = resolverDestinoTrasEdicion();
    const idPantallaRespuesta = destinoTrasEdicion.destino.idPantalla;
    const indicePantallaRespuesta = destinoTrasEdicion.destino.indicePantalla;
    const params = buildEscribirVariableStringParams({ mac, destinoTrasEdicion, objIdUnicoEdicion, idPantallaRespuesta, indicePantallaRespuesta, objEditVariablesString, valor });

    setLoading(true);
    setError(null);

    try {
      const res = await requestPantalla(params);
      if (!res.ok) throw new Error(`Error ${res.status}`);
      navegarTrasEscritura(destinoTrasEdicion);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al escribir variable');
      setLoading(false);
    }
  }
  async function escribirSeleccion(): Promise<void> {
    if (!objetos) return;

    const destinoTrasEdicion = resolverDestinoTrasEdicion();
    const parametrosSeleccion = buildParametrosSeleccionCti40Plus({ objetos, camposMultiseleccion, esRadioButton, esCheckbox, selectedIdSeleccion, selectedIdSelecciones, mac, destinoTrasEdicion });
    if (parametrosSeleccion === null) return;

    setLoading(true);
    setError(null);

    try {
      if (parametrosSeleccion.navegarSinPeticiones) {
        navegarTrasEscritura(destinoTrasEdicion);
        return;
      }

      for (let idx = 0; idx < parametrosSeleccion.params.length; idx++) {
        const params = parametrosSeleccion.params[idx]!;
        const res = await requestPantalla(params);
        if (!res.ok) throw new Error(`Error ${res.status}${parametrosSeleccion.params.length > 1 ? ` en peticion ${idx + 1}` : ''}`);
      }
      navegarTrasEscritura(destinoTrasEdicion);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : parametrosSeleccion.errorMessage);
      setLoading(false);
    }
  }
  escribirSeleccionRef.current = escribirSeleccion;

  // Derivados

  // Objetos de barra de acceso directo (tipoObjeto: 66) - se usan los persistentes (capturados en pantallaId=0)
  const barraAccesoDirecto = barraAccesoDirectoPersistente.current;
  const textoConcatenadoMap = useMemo<Map<number, string>>(() => buildTextoConcatenadoMap(objetos, lang), [lang, objetos]);
  const {
    gruposLineas,
    tablasEstaticas,
    tablasGrupos,
    infoObjetos,
    otrosObjetos,
    esPantallaPrincipal,
    menuNavPtr,
    encabezado,
    titulo,
    colorHeader,
    esTablaCompleja,
    encabezadoEditIcono,
    tareas,
    tipoPlantilla,
    esLista,
    esVentilacionGrupoEdit,
    esLibre,
    objVentilacionGrafico,
    objVentilacionEdit,
    tituloVentilacionEdit,
    esTeclado,
    camposMultiseleccion,
    esSeleccion,
    objEditVariables,
    objEditVariablesString,
    esRadioButton,
    esCheckbox,
    esTiempoFecha
  } = useMemo(() => buildDerivadosCti40Plus(objetos, actual, textoConcatenadoMap, lang), [actual, lang, objetos, textoConcatenadoMap]);

  const editValido = useMemo<boolean>(
    () => isEditValueValido(editValue, objEditVariables, objEditVariablesString, esTiempoFecha),
    [editValue, esTiempoFecha, objEditVariables, objEditVariablesString]
  );
  const seleccionConfirmable = useMemo<boolean>(
    () => isSeleccionConfirmable(esSeleccion, esRadioButton, esCheckbox, selectedIdSeleccion, tipoPlantilla),
    [esCheckbox, esRadioButton, esSeleccion, selectedIdSeleccion, tipoPlantilla]
  );
  useEffect(() => {
    if (esSeleccion && seleccionConfirmable && !loading && error === null) {
      const handleKeyDown = (event: KeyboardEvent): void => {
        if (event.key !== 'Enter' || event.repeat) return;

        const target = event.target;
        if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target instanceof HTMLSelectElement) {
          return;
        }

        event.preventDefault();
        void escribirSeleccionRef.current();
      };

      window.addEventListener('keydown', handleKeyDown);
      return (): void => window.removeEventListener('keydown', handleKeyDown);
    }
    return undefined;
  }, [error, esSeleccion, loading, seleccionConfirmable]);

  // ── Loading / Error ───────────────────────────────────────────────────────

  // ── Render responsive (viewport < 960×720) ───────────────────────────────

  const hayObjetos = objetos !== null && objetos.length > 0;

  if (isSmallScreen) {
    const navBg = encabezado !== undefined ? colorHeader || COLORES.tertiary : COLORES.primary;
    const scrollbarStyle = { '--scrollbar-thumb': COLORES.primary, '--scrollbar-thumb-hover': '#4fa316' } as React.CSSProperties;
    const scrollbarClass = `flex-1 overflow-y-auto p-4 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-[${COLORES.lastBackground}] [&::-webkit-scrollbar-thumb]:rounded-none [&::-webkit-scrollbar-thumb]:bg-[var(--scrollbar-thumb)]`;
    const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 320;
    return (
      <div
        className="relative min-h-dvh bg-zinc-950 flex flex-col"
        style={{ backgroundColor: COLORES.lastBackground }}
      >
        {/* ── Navbar ── */}
        {!esTeclado && !esSeleccion && (
          <div
            className="flex items-center justify-between px-3 py-3 shrink-0"
            style={{ backgroundColor: navBg }}
          >
            {/* Izquierda: hamburguesa + back/menú */}
            <div className="flex items-center gap-1">
              {barraAccesoDirecto.length > 0 && (
                <button
                  onClick={() => setBarraAbierta((v) => !v)}
                  className="p-1 text-white hover:text-gray-200 transition-colors"
                  aria-label="Accesos directos"
                >
                  <LuMenu size={28} />
                </button>
              )}
              {!esPantallaPrincipal && (
                <button
                  onClick={volver}
                  className="p-1 text-white hover:text-gray-200 transition-colors"
                  aria-label="Atrás"
                >
                  <LuChevronLeft size={28} />
                </button>
              )}
              {esPantallaPrincipal && menuNavPtr !== undefined && (
                <button
                  onClick={() => navegarA({ idPantalla: menuNavPtr, indicePantalla: 0, esPrincipal: false })}
                  className="p-1 text-white hover:text-gray-200 transition-colors"
                  aria-label="Menú"
                >
                  <LuMenu size={28} />
                </button>
              )}
              {esPantallaPrincipal && menuNavPtr === undefined && barraAccesoDirecto.length === 0 && <div className="w-9" />}
            </div>

            {/* Título */}
            <span className="min-w-0 flex-1 text-lg font-medium leading-tight text-white text-center px-2 line-clamp-2">
              {tituloVentilacionEdit ?? (esPantallaPrincipal ? resolveText(EnTextos.textPrincipal, lang) : titulo)}
            </span>

            {/* Derecha: tareas + botones toggle */}
            <div className="flex items-center gap-1">
              {esVentilacionGrupoEdit ? (
                <button
                  onClick={() => void guardarVentiladores()}
                  className="p-1 text-white hover:text-gray-200 transition-colors"
                  aria-label="Guardar"
                >
                  <LuCheck size={28} />
                </button>
              ) : (
                <>
                  {tareas.map((tarea, i) => {
                    const IconoTarea = resolverIconoCTI40Plus(tarea.icono);
                    return (
                      <button
                        key={i}
                        onClick={() => navegarA({ idPantalla: tarea.pantalla, indicePantalla: tarea.indice, esPrincipal: tarea.pantalla === 0 })}
                        className="p-1 text-white hover:text-gray-200 transition-colors"
                      >
                        {IconoTarea ? <IconoTarea size={28} /> : null}
                      </button>
                    );
                  })}
                  {encabezadoEditIcono && (
                    <ObjEncabezadoEditIcono
                      obj={encabezadoEditIcono}
                      idPantallaActual={(objetos?.find((o) => o.tipoObjeto === 1)?.idPantalla as number | undefined) ?? actual.idPantalla}
                      indicePantallaActual={(objetos?.find((o) => o.tipoObjeto === 1)?.indicePantalla as number | undefined) ?? actual.indicePantalla}
                      onNavegar={navegarA}
                      responsive
                    />
                  )}
                </>
              )}
              {tareas.length === 0 && !encabezadoEditIcono && !esVentilacionGrupoEdit && <div className="w-9" />}
            </div>
          </div>
        )}

        {/* Header edición/selección */}
        {!esPantallaPrincipal && (esTeclado || esSeleccion) && (
          <div
            className="flex items-center justify-between px-3 py-3 shrink-0"
            style={{ backgroundColor: COLORES.tertiary }}
          >
            <button
              onClick={volver}
              className="p-1 text-white hover:text-gray-200 transition-colors"
              aria-label="Cancelar"
            >
              <LuX size={28} />
            </button>
            <span className="min-w-0 text-lg font-normal leading-tight text-white line-clamp-2 text-center px-2">
              {esTeclado
                ? objEditVariablesString
                  ? resolveText(objEditVariablesString.textoVar as number, lang)
                  : objEditVariables
                    ? resolveText(objEditVariables.textoVar as number, lang)
                    : ''
                : titulo}
            </span>
            <button
              onClick={() => {
                if (esTeclado) {
                  if (objEditVariablesString) {
                    void escribirVariableString(editValue);
                    return;
                  }
                  if (editValido) void escribirVariable(editValue);
                } else {
                  if (seleccionConfirmable) void escribirSeleccion();
                }
              }}
              className={`p-1 transition-colors ${(esTeclado ? editValido || !!objEditVariablesString : seleccionConfirmable) ? 'text-white hover:text-gray-200' : 'text-white/30 cursor-not-allowed'}`}
              aria-label="Confirmar"
            >
              <LuCheck size={28} />
            </button>
          </div>
        )}

        {/* Barra acceso directo desplegable */}
        {barraAbierta && (
          <div style={{ backgroundColor: '#2a2a2a' }}>
            <BarraBotonesCti40Plus
              botones={barraAccesoDirecto}
              idPantallaActual={actual.idPantalla}
              onNavegar={navegarA}
              compact
            />
          </div>
        )}

        {/* Loading */}
        {loading && !hayObjetos && (
          <div className="flex-1 flex items-center justify-center">
            <div className="w-10 h-10 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* Error */}
        {!loading && error !== null && !hayObjetos && (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 p-4">
            <div className="text-center">
              <p className="text-red-500 text-lg font-semibold">Error</p>
              <p className="mt-2 text-red-400 text-sm">{error}</p>
            </div>
            <button
              onClick={volver}
              className="px-4 py-2 bg-zinc-800 rounded text-sm text-white hover:bg-zinc-700"
            >
              Volver
            </button>
          </div>
        )}

        {/* Contenido */}
        {hayObjetos && (
          <>
            {/* Canvas libre */}
            {esLibre && (
              <PantallaLibre
                objetos={objetos}
                onNavegar={navegarA}
                idPantallaActual={actual.idPantalla}
                indicePantallaActual={actual.indicePantalla}
                containerWidth={viewportWidth}
              />
            )}

            {/* Edición tiempo/fecha */}
            {esTeclado && objEditVariables && esTiempoFecha && (
              <div className="flex-1 flex items-center justify-center p-4">
                <ObjEditVariablesTiempoFecha
                  obj={objEditVariables}
                  value={editValue}
                  onChange={setEditValue}
                  isValid={editValido}
                  onEnter={() => {
                    if (editValido) void escribirVariable(editValue);
                  }}
                  responsive
                />
              </div>
            )}

            {/* Edición numérica */}
            {esTeclado && objEditVariables && !esTiempoFecha && (
              <div className="flex-1 flex items-center justify-center p-4">
                <ObjEditVariables
                  obj={objEditVariables}
                  value={editValue}
                  onChange={setEditValue}
                  isValid={editValido}
                  onEnter={() => {
                    if (editValido) void escribirVariable(editValue);
                  }}
                  responsive
                />
              </div>
            )}

            {/* Edición string */}
            {esTeclado && objEditVariablesString && (
              <div className="flex-1 flex items-center justify-center p-4">
                <ObjEditVariablesString
                  value={editValue}
                  onChange={setEditValue}
                  onEnter={() => void escribirVariableString(editValue)}
                  responsive
                />
              </div>
            )}

            {/* Selección */}
            {esSeleccion && (
              <div
                className={scrollbarClass}
                style={scrollbarStyle}
              >
                {camposMultiseleccion.map((obj, i) => {
                  const idSeleccion = obj.idSeleccion as number;
                  const opcionSeleccionada = obj.opcionSeleccionada as number;
                  const isDisabled = opcionSeleccionada === 0;
                  const isSelectedRadio = esRadioButton && selectedIdSeleccion === idSeleccion;
                  const isSelectedCheckbox = esCheckbox && selectedIdSelecciones.has(idSeleccion);
                  const isSelected = (isSelectedRadio || isSelectedCheckbox) && !isDisabled;
                  const handleSelect = (): void => {
                    if (isDisabled) return;
                    if (esRadioButton) {
                      setSelectedIdSeleccion(idSeleccion);
                    } else if (esCheckbox) {
                      const newSet = new Set(selectedIdSelecciones);
                      if (newSet.has(idSeleccion)) {
                        newSet.delete(idSeleccion);
                      } else {
                        newSet.add(idSeleccion);
                      }
                      setSelectedIdSelecciones(newSet);
                    }
                  };
                  return (
                    <ObjCamposMultiseleccion
                      key={i}
                      obj={obj}
                      isSelected={isSelected}
                      onSelect={handleSelect}
                      isDisabled={isDisabled}
                      responsive
                      lang={lang}
                    />
                  );
                })}
              </div>
            )}

            {/* Ventilación */}
            {esVentilacionGrupoEdit && objVentilacionEdit && (
              <div
                className={scrollbarClass}
                style={scrollbarStyle}
              >
                <ObjVentilacionGrupoGraficoEdit
                  obj={objVentilacionEdit}
                  pestanaActiva={pestanaActivaVentilacion}
                  onPestanaChange={setPestanaActivaVentilacion}
                  onTrash={handleTrashVentiladores}
                  responsive
                  lang={lang}
                />
                {objVentilacionGrafico && (
                  <ObjVentilacionGrupoGrafico
                    obj={objVentilacionGrafico}
                    onNavegar={navegarA}
                    idPantallaActual={actual.idPantalla}
                    indicePantallaActual={actual.indicePantalla}
                    estadosOverride={estadosVentiladores}
                    onClickVentilador={handleClickVentilador}
                    responsive
                  />
                )}
                <div className="flex flex-col gap-4 px-4 py-4">
                  <div className="flex items-center gap-3">
                    {IconoVentiladorRotatorio && <IconoVentiladorRotatorio size={28} />}
                    <span
                      className="text-lg"
                      style={{ color: COLORES.light }}
                    >
                      {resolveText(objVentilacionEdit.textoPestana2 as number, lang)}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    {IconoVentiladorTemporizado && <IconoVentiladorTemporizado size={28} />}
                    <span
                      className="text-lg"
                      style={{ color: COLORES.light }}
                    >
                      {resolveText(objVentilacionEdit.textoPestana2 as number, lang)}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    {IconoVentiladorEstatico && <IconoVentiladorEstatico size={28} />}
                    <span
                      className="text-lg"
                      style={{ color: COLORES.light }}
                    >
                      {resolveText(objVentilacionEdit.textoPestana1 as number, lang)}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Objetos principales */}
            {!esLibre && !esTeclado && !esSeleccion && !esVentilacionGrupoEdit && (
              <div
                className={scrollbarClass}
                style={scrollbarStyle}
              >
                {esPantallaPrincipal ? (
                  <div className="flex-1 flex items-center justify-center py-8">
                    <p className="text-white text-lg">Pantalla principal</p>
                  </div>
                ) : (
                  <>
                    {gruposLineas.length > 0 &&
                      gruposLineas.map((grupo, gi) => (
                        <div
                          key={gi}
                          className="rounded-2xl mb-3"
                          style={{ backgroundColor: COLORES.tertiary }}
                        >
                          {grupo.map((obj, i) => (
                            <RenderObjeto
                              key={i}
                              obj={obj}
                              onNavegar={navegarA}
                              onRefrescarPantalla={refrescarPantallaActual}
                              idPantallaActual={actual.idPantalla}
                              indicePantallaActual={actual.indicePantalla}
                              textoConcatenados={textoConcatenadoMap}
                              responsive
                              lang={lang}
                            />
                          ))}
                        </div>
                      ))}

                    {tablasEstaticas.length > 0 && (
                      <div className="overflow-x-auto mb-3">
                        {tablasEstaticas.map((tabla, ti) => (
                          <ObjTablaDatosSinEdicion
                            key={ti}
                            config={parseConfigTabla(tabla.config)}
                            datos={tabla.datos}
                            responsive
                          />
                        ))}
                      </div>
                    )}

                    {tablasGrupos.length > 0 && (
                      <div className="overflow-x-auto mb-3">
                        {tablasGrupos.map((tabla, ti) => (
                          <ObjTablaDinamica
                            key={ti}
                            init={tabla.init}
                            filas={tabla.filas}
                            onNavegar={navegarA}
                            responsive
                            smallFontSize={esTablaCompleja}
                            lang={lang}
                          />
                        ))}
                      </div>
                    )}

                    {otrosObjetos.length > 0 &&
                      (esLista ? (
                        <div className="flex flex-col">
                          {otrosObjetos.map((obj, i) => (
                            <RenderObjeto
                              key={i}
                              obj={obj}
                              onNavegar={navegarA}
                              onRefrescarPantalla={refrescarPantallaActual}
                              idPantallaActual={actual.idPantalla}
                              indicePantallaActual={actual.indicePantalla}
                              esLista
                              responsive
                              lang={lang}
                            />
                          ))}
                        </div>
                      ) : (
                        <div className="grid grid-cols-4 gap-2 p-2">
                          {otrosObjetos.map((obj, i) => (
                            <RenderObjeto
                              key={i}
                              obj={obj}
                              onNavegar={navegarA}
                              onRefrescarPantalla={refrescarPantallaActual}
                              idPantallaActual={actual.idPantalla}
                              indicePantallaActual={actual.indicePantalla}
                              textoConcatenados={textoConcatenadoMap}
                              responsive
                              lang={lang}
                            />
                          ))}
                        </div>
                      ))}
                  </>
                )}
              </div>
            )}

            {/* Footer info */}
            {infoObjetos.length > 0 && (
              <div
                className="flex justify-center shrink-0 py-2"
                style={{ backgroundColor: COLORES.lastBackground }}
              >
                <button
                  className="flex items-center gap-2 px-6 rounded-xl"
                  style={{ backgroundColor: COLORES.primary }}
                  onClick={() => setInfoDialogAbierto(true)}
                >
                  <LuInfo
                    size={32}
                    color={COLORES.light}
                  />
                </button>
              </div>
            )}
          </>
        )}

        {/* Dialog info (responsive) */}
        {infoDialogAbierto && infoObjetos.length > 0 && (
          <div
            className="fixed inset-0 z-50 flex flex-col"
            style={{ backgroundColor: COLORES.lastBackground }}
          >
            <div
              className="flex items-center px-3 py-3 shrink-0"
              style={{ backgroundColor: COLORES.info }}
            >
              <button
                className="p-1 text-white hover:text-gray-200 transition-colors"
                aria-label="Cerrar"
                onClick={() => setInfoDialogAbierto(false)}
              >
                <LuX size={28} />
              </button>
              <span className="min-w-0 flex-1 text-center text-lg font-normal leading-tight text-white line-clamp-2 px-2">{titulo}</span>
              <div style={{ width: 36 }} />
            </div>
            <div
              className={scrollbarClass}
              style={scrollbarStyle}
            >
              <div
                className="rounded-2xl"
                style={{ backgroundColor: COLORES.tertiary }}
              >
                {infoObjetos.map((obj, i) => {
                  switch (obj.tipoObjeto) {
                    case 6:
                      return (
                        <ObjLineaInfoTextVar
                          key={i}
                          obj={obj}
                          textoConcatenados={textoConcatenadoMap}
                          responsive
                        />
                      );
                    case 19:
                      return (
                        <ObjLineaInfoTextTextVarVar
                          key={i}
                          obj={obj}
                          textoConcatenados={textoConcatenadoMap}
                          responsive
                        />
                      );
                    default:
                      return (
                        <ObjLineaInfoTextText
                          key={i}
                          obj={obj}
                          textoConcatenados={textoConcatenadoMap}
                          responsive
                        />
                      );
                  }
                })}
              </div>
            </div>
          </div>
        )}
        {loading && hayObjetos && (
          <div className="absolute inset-0 z-[60] flex items-center justify-center bg-black/30">
            <div className="w-10 h-10 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        {!loading && error !== null && hayObjetos && (
          <div className="absolute inset-0 z-[60] flex flex-col items-center justify-center gap-4 bg-black/70 p-4">
            <div className="text-center">
              <p className="text-red-500 text-lg font-semibold">Error</p>
              <p className="mt-2 text-red-400 text-sm">{error}</p>
            </div>
            <button
              onClick={volver}
              className="px-4 py-2 bg-zinc-800 rounded text-sm text-white hover:bg-zinc-700"
            >
              Volver
            </button>
          </div>
        )}
      </div>
    );
  }

  // ── Render desktop (960×720 fijo) ─────────────────────────────────────────

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-6">
      <div className="flex flex-col items-center">
        {/* ── Pantalla 4:3 ── */}
        <div
          className="relative flex flex-col bg-black overflow-hidden rounded-lg border border-zinc-800 shadow-2xl"
          style={{ width: '960px', height: '720px', minWidth: '960px', maxWidth: '960px', minHeight: '720px', maxHeight: '720px', backgroundColor: COLORES.lastBackground }}
        >
          {/* ── Loading ── */}
          {loading && !hayObjetos && (
            <div className="flex-1 flex flex-col items-center justify-center gap-4">
              <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {/* ── Error ── */}
          {!loading && error !== null && !hayObjetos && (
            <div className="flex-1 flex flex-col items-center justify-center gap-4">
              <div className="text-center">
                <p className="text-red-500 text-2xl font-semibold">Error</p>
                <p className="mt-2 text-red-400 text-sm">{error}</p>
              </div>
              <button
                onClick={volver}
                className="px-4 py-2 bg-zinc-800 rounded text-sm text-white hover:bg-zinc-700"
              >
                Volver
              </button>
            </div>
          )}

          {/* ── Contenido ── */}
          {hayObjetos && (
            <>
              {/* Barra superior — pantallas de edición (tipoPlantilla 2): X + título + Check */}
              {!esPantallaPrincipal && esTeclado && (
                <div
                  className="flex items-center justify-between px-3 py-3 shrink-0"
                  style={{ backgroundColor: COLORES.tertiary }}
                >
                  <button
                    onClick={volver}
                    className="p-1 text-white hover:text-gray-200 transition-colors"
                    aria-label="Cancelar"
                  >
                    <LuX size={60} />
                  </button>
                  <span className="text-5xl font-normal text-white line-clamp-2 text-center px-2">
                    {objEditVariablesString ? resolveText(objEditVariablesString.textoVar as number, lang) : objEditVariables ? resolveText(objEditVariables.textoVar as number, lang) : ''}
                  </span>
                  <button
                    onClick={() => {
                      if (objEditVariablesString) {
                        void escribirVariableString(editValue);
                        return;
                      }
                      if (editValido) void escribirVariable(editValue);
                    }}
                    className={`p-1 transition-colors ${editValido ? 'text-white hover:text-gray-200' : 'text-white/30 cursor-not-allowed'}`}
                    aria-label="Confirmar"
                  >
                    <LuCheck size={60} />
                  </button>
                </div>
              )}

              {/* Barra superior — pantallas de selección (radio o checkbox): X + título + Check */}
              {!esPantallaPrincipal && esSeleccion && (
                <div
                  className="flex items-center justify-between px-3 py-3 shrink-0"
                  style={{ backgroundColor: COLORES.tertiary }}
                >
                  <button
                    onClick={volver}
                    className="p-1 text-white hover:text-gray-200 transition-colors"
                    aria-label="Cancelar"
                  >
                    <LuX size={60} />
                  </button>
                  <span className="text-5xl font-normal text-white line-clamp-2 text-center px-2">{titulo}</span>
                  <button
                    onClick={() => {
                      if (seleccionConfirmable) void escribirSeleccion();
                    }}
                    className={`p-1 transition-colors ${seleccionConfirmable ? 'text-white hover:text-gray-200' : 'text-white/30 cursor-not-allowed'}`}
                    aria-label="Confirmar"
                  >
                    <LuCheck size={60} />
                  </button>
                </div>
              )}

              {/* Barra superior — pantallas normales (no principal, no edición, no selección) */}
              {!esPantallaPrincipal && !esTeclado && !esSeleccion && (
                <div
                  className="flex items-center justify-between px-3 py-3 shrink-0"
                  style={{ backgroundColor: esVentilacionGrupoEdit ? COLORES.tertiary : colorHeader }}
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
                  <span className="text-5xl font-normal text-white line-clamp-2 text-center px-2">{tituloVentilacionEdit ?? titulo}</span>

                  {/* Derecha: check (ventilación) / botones de tarea / espaciador */}
                  <div className="flex items-center gap-1">
                    {esVentilacionGrupoEdit ? (
                      <button
                        onClick={() => void guardarVentiladores()}
                        className="p-1 text-white hover:text-gray-200 transition-colors"
                        aria-label="Guardar"
                      >
                        <LuCheck size={60} />
                      </button>
                    ) : (
                      <>
                        {tareas.map((tarea, i) => {
                          const IconoTarea = resolverIconoCTI40Plus(tarea.icono);
                          return (
                            <button
                              key={i}
                              onClick={() => navegarA({ idPantalla: tarea.pantalla, indicePantalla: tarea.indice, esPrincipal: tarea.pantalla === 0 })}
                              className="p-1 text-white hover:text-gray-200 transition-colors"
                            >
                              {IconoTarea ? <IconoTarea size={60} /> : null}
                            </button>
                          );
                        })}
                        {encabezadoEditIcono && (
                          <ObjEncabezadoEditIcono
                            obj={encabezadoEditIcono}
                            idPantallaActual={(objetos?.find((o) => o.tipoObjeto === 1)?.idPantalla as number | undefined) ?? actual.idPantalla}
                            indicePantallaActual={(objetos?.find((o) => o.tipoObjeto === 1)?.indicePantalla as number | undefined) ?? actual.indicePantalla}
                            onNavegar={navegarA}
                          />
                        )}
                        {tareas.length === 0 && !encabezadoEditIcono && <div className="w-12" />}
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Canvas libre (tipoPlantilla 21) — ocupa todo el espacio sin padding */}
              {esLibre && (
                <PantallaLibre
                  objetos={objetos}
                  onNavegar={navegarA}
                  idPantallaActual={actual.idPantalla}
                  indicePantallaActual={actual.indicePantalla}
                />
              )}

              {/* Pantalla de edición de Tiempo/Fecha (tipoPlantilla 2 + tipoVarEdicion tiempo/fecha) */}
              {esTeclado && objEditVariables && esTiempoFecha && (
                <div className="flex-1 flex items-center justify-center">
                  <ObjEditVariablesTiempoFecha
                    obj={objEditVariables}
                    value={editValue}
                    onChange={setEditValue}
                    isValid={editValido}
                    onEnter={() => {
                      if (editValido) void escribirVariable(editValue);
                    }}
                  />
                </div>
              )}

              {/* Pantalla de edición numérica (tipoPlantilla 2) — input centrado */}
              {esTeclado && objEditVariables && !esTiempoFecha && (
                <div className="flex-1 flex items-center justify-center">
                  <ObjEditVariables
                    obj={objEditVariables}
                    value={editValue}
                    onChange={setEditValue}
                    isValid={editValido}
                    onEnter={() => {
                      if (editValido) void escribirVariable(editValue);
                    }}
                  />
                </div>
              )}

              {/* Pantalla de edición de texto (tipoPlantilla 2 + tipoObjeto 33) — input de texto centrado */}
              {esTeclado && objEditVariablesString && (
                <div className="flex-1 flex items-center justify-center">
                  <ObjEditVariablesString
                    value={editValue}
                    onChange={setEditValue}
                    onEnter={() => void escribirVariableString(editValue)}
                  />
                </div>
              )}

              {/* Pantalla de selección — lista de radio buttons o checkboxes */}
              {esSeleccion && (
                <div
                  className={`flex-1 overflow-y-auto p-4 my-2 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-track]:bg-[${COLORES.lastBackground}] [&::-webkit-scrollbar-thumb]:rounded-none [&::-webkit-scrollbar-thumb]:bg-[var(--scrollbar-thumb)] [&::-webkit-scrollbar-thumb:hover]:bg-[var(--scrollbar-thumb-hover)]`}
                  style={{ '--scrollbar-thumb': COLORES.primary, '--scrollbar-thumb-hover': '#4fa316' } as React.CSSProperties}
                >
                  <div>
                    {camposMultiseleccion.map((obj, i) => {
                      const idSeleccion = obj.idSeleccion as number;
                      const opcionSeleccionada = obj.opcionSeleccionada as number;
                      const isDisabled = opcionSeleccionada === 0;

                      const isSelectedRadio = esRadioButton && selectedIdSeleccion === idSeleccion;
                      const isSelectedCheckbox = esCheckbox && selectedIdSelecciones.has(idSeleccion);
                      const isSelected = (isSelectedRadio || isSelectedCheckbox) && !isDisabled;

                      const handleSelect = (): void => {
                        if (isDisabled) return;

                        if (esRadioButton) {
                          // RADIO: reemplazar la selección
                          setSelectedIdSeleccion(idSeleccion);
                        } else if (esCheckbox) {
                          // CHECKBOX: toggle (agregar o remover)
                          const newSet = new Set(selectedIdSelecciones);
                          if (newSet.has(idSeleccion)) {
                            newSet.delete(idSeleccion);
                          } else {
                            newSet.add(idSeleccion);
                          }
                          setSelectedIdSelecciones(newSet);
                        }
                      };

                      return (
                        <ObjCamposMultiseleccion
                          key={i}
                          obj={obj}
                          isSelected={isSelected}
                          onSelect={handleSelect}
                          isDisabled={isDisabled}
                          lang={lang}
                        />
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Pantalla de edición de ventiladores (tipoPlantilla 10) */}
              {esVentilacionGrupoEdit && objVentilacionEdit && (
                <div
                  className={`flex-1 overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-[${COLORES.lastBackground}] [&::-webkit-scrollbar-thumb]:rounded-none [&::-webkit-scrollbar-thumb]:bg-[var(--scrollbar-thumb)] [&::-webkit-scrollbar-thumb:hover]:bg-[var(--scrollbar-thumb-hover)]`}
                  style={{ '--scrollbar-thumb': COLORES.primary, '--scrollbar-thumb-hover': '#4fa316' } as React.CSSProperties}
                >
                  {/* Pestañas */}
                  <ObjVentilacionGrupoGraficoEdit
                    obj={objVentilacionEdit}
                    pestanaActiva={pestanaActivaVentilacion}
                    onPestanaChange={setPestanaActivaVentilacion}
                    onTrash={handleTrashVentiladores}
                    lang={lang}
                  />

                  {/* Gráfico de ventiladores */}
                  {objVentilacionGrafico && (
                    <ObjVentilacionGrupoGrafico
                      obj={objVentilacionGrafico}
                      onNavegar={navegarA}
                      idPantallaActual={actual.idPantalla}
                      indicePantallaActual={actual.indicePantalla}
                      estadosOverride={estadosVentiladores}
                      onClickVentilador={handleClickVentilador}
                    />
                  )}

                  {/* Leyenda */}
                  <div className="flex flex-col gap-8 px-8 py-8">
                    <div className="flex items-center gap-6">
                      {IconoVentiladorRotatorio && <IconoVentiladorRotatorio size={75} />}
                      <span
                        className="text-5xl"
                        style={{ color: COLORES.light }}
                      >
                        {resolveText(objVentilacionEdit.textoPestana2 as number, lang)}
                      </span>
                    </div>
                    <div className="flex items-center gap-6">
                      {IconoVentiladorTemporizado && <IconoVentiladorTemporizado size={75} />}
                      <span
                        className="text-5xl"
                        style={{ color: COLORES.light }}
                      >
                        {resolveText(objVentilacionEdit.textoPestana2 as number, lang)}
                      </span>
                    </div>
                    <div className="flex items-center gap-6">
                      {IconoVentiladorEstatico && <IconoVentiladorEstatico size={75} />}
                      <span
                        className="text-5xl"
                        style={{ color: COLORES.light }}
                      >
                        {resolveText(objVentilacionEdit.textoPestana1 as number, lang)}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Objetos — scrollable si hay muchos */}
              {!esLibre && !esTeclado && !esSeleccion && !esVentilacionGrupoEdit && (
                <div
                  className={`flex-1 overflow-y-auto p-4 my-2 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-track]:bg-[${COLORES.lastBackground}] [&::-webkit-scrollbar-thumb]:rounded-none [&::-webkit-scrollbar-thumb]:bg-[var(--scrollbar-thumb)] [&::-webkit-scrollbar-thumb:hover]:bg-[var(--scrollbar-thumb-hover)]`}
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
                              className="rounded-2xl mb-4"
                              style={{ backgroundColor: COLORES.tertiary }}
                            >
                              {grupo.map((obj, i) => (
                                <RenderObjeto
                                  key={i}
                                  obj={obj}
                                  onNavegar={navegarA}
                                  onRefrescarPantalla={refrescarPantallaActual}
                                  idPantallaActual={actual.idPantalla}
                                  indicePantallaActual={actual.indicePantalla}
                                  textoConcatenados={textoConcatenadoMap}
                                  lang={lang}
                                />
                              ))}
                            </div>
                          ))}
                        </>
                      )}

                      {/* Tablas estáticas (objTablaConfig+objTablaDatosSinEdicion) — edge-to-edge */}
                      {tablasEstaticas.length > 0 && (
                        <div className="-mx-4 -mt-4">
                          {tablasEstaticas.map((tabla, ti) => (
                            <ObjTablaDatosSinEdicion
                              key={ti}
                              config={parseConfigTabla(tabla.config)}
                              datos={tabla.datos}
                            />
                          ))}
                        </div>
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
                              smallFontSize={esTablaCompleja}
                              lang={lang}
                            />
                          ))}
                        </div>
                      )}

                      {/* Otros objetos (grid o lista) */}
                      {otrosObjetos.length > 0 && (
                        <>
                          {esLista || esVentilacionGrupoEdit ? (
                            <div className="flex flex-col">
                              {otrosObjetos.map((obj, i) => (
                                <RenderObjeto
                                  key={i}
                                  obj={obj}
                                  onNavegar={navegarA}
                                  onRefrescarPantalla={refrescarPantallaActual}
                                  idPantallaActual={actual.idPantalla}
                                  indicePantallaActual={actual.indicePantalla}
                                  esLista
                                  lang={lang}
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
                                  onRefrescarPantalla={refrescarPantallaActual}
                                  idPantallaActual={actual.idPantalla}
                                  indicePantallaActual={actual.indicePantalla}
                                  textoConcatenados={textoConcatenadoMap}
                                  lang={lang}
                                />
                              ))}
                            </div>
                          )}
                        </>
                      )}
                    </>
                  )}
                </div>
              )}

              {/* Footer: botón de información — aparece si hay objLineaInfoTextText (tipo 7) */}
              {infoObjetos.length > 0 && (
                <div
                  className="flex justify-center shrink-0 py-2"
                  style={{ backgroundColor: COLORES.lastBackground }}
                >
                  <button
                    className="flex items-center gap-2 px-8 rounded-xl font-medium"
                    style={{ backgroundColor: COLORES.primary }}
                    onClick={() => setInfoDialogAbierto(true)}
                  >
                    <LuInfo
                      size={62}
                      color={COLORES.light}
                    />
                  </button>
                </div>
              )}
            </>
          )}

          {/* ── Dialog de información (objLineaInfoTextText) ── */}
          {infoDialogAbierto && infoObjetos.length > 0 && (
            <div
              className="absolute inset-0 flex flex-col"
              style={{ backgroundColor: COLORES.lastBackground }}
            >
              {/* Header del dialog */}
              <div
                className="flex items-center px-3 py-3 shrink-0"
                style={{ backgroundColor: COLORES.info }}
              >
                <button
                  className="p-1 text-white hover:text-gray-200 transition-colors"
                  aria-label="Cerrar"
                  onClick={() => setInfoDialogAbierto(false)}
                >
                  <LuX size={60} />
                </button>
                <span className="flex-1 text-center text-5xl font-normal text-white line-clamp-2 px-2">{titulo}</span>
                {/* Espaciador simétrico para centrar el título */}
                <div style={{ width: 56 }} />
              </div>

              {/* Filas info */}
              <div
                className={`flex-1 overflow-y-auto p-4 my-2 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-track]:bg-[${COLORES.lastBackground}] [&::-webkit-scrollbar-thumb]:rounded-none [&::-webkit-scrollbar-thumb]:bg-[var(--scrollbar-thumb)] [&::-webkit-scrollbar-thumb:hover]:bg-[var(--scrollbar-thumb-hover)]`}
                style={{ '--scrollbar-thumb': COLORES.primary, '--scrollbar-thumb-hover': '#4fa316' } as React.CSSProperties}
              >
                <div
                  className="rounded-2xl"
                  style={{ backgroundColor: COLORES.tertiary }}
                >
                  {infoObjetos.map((obj, i) => {
                    switch (obj.tipoObjeto) {
                      case 6:
                        return (
                          <ObjLineaInfoTextVar
                            key={i}
                            obj={obj}
                            textoConcatenados={textoConcatenadoMap}
                            lang={lang}
                          />
                        );
                      case 19:
                        return (
                          <ObjLineaInfoTextTextVarVar
                            key={i}
                            obj={obj}
                            textoConcatenados={textoConcatenadoMap}
                            lang={lang}
                          />
                        );
                      case 7:
                      default:
                        return (
                          <ObjLineaInfoTextText
                            key={i}
                            obj={obj}
                            textoConcatenados={textoConcatenadoMap}
                            lang={lang}
                          />
                        );
                    }
                  })}
                </div>
              </div>
            </div>
          )}
          {loading && hayObjetos && (
            <div className="absolute inset-0 z-[60] flex items-center justify-center bg-black/30">
              <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
            </div>
          )}
          {!loading && error !== null && hayObjetos && (
            <div className="absolute inset-0 z-[60] flex flex-col items-center justify-center gap-4 bg-black/70">
              <div className="text-center">
                <p className="text-red-500 text-2xl font-semibold">Error</p>
                <p className="mt-2 text-red-400 text-sm">{error}</p>
              </div>
              <button
                onClick={volver}
                className="px-4 py-2 bg-zinc-800 rounded text-sm text-white hover:bg-zinc-700"
              >
                Volver
              </button>
            </div>
          )}
        </div>

        {/* ── Barra de botones de acceso directo (fuera de la pantalla) ── */}
        <BarraBotonesCti40Plus
          botones={barraAccesoDirecto}
          idPantallaActual={actual.idPantalla}
          onNavegar={navegarA}
        />
      </div>
    </div>
  );
}
