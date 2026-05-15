'use client';

import { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import type { JSX } from 'react';
import { useRouter } from 'next/navigation';
import { useIsSmallScreen } from '../hooks/useIsSmallScreen';
import { resolverIconoCTI40Plus } from '../components/render-objetos-st';
import ObjEditVariables from '../components/render-objetos-st/ObjEditVariables';
import ObjEditVariablesString from '../components/render-objetos-st/ObjEditVariablesString';
import ObjEditVariablesTiempoFecha from '../components/render-objetos-st/ObjEditVariablesTiempoFecha';
import { COLORES, BarraBotonesCti40Plus } from '../components/render-objetos-st';
import { ContenidoObjetosPantalla, DialogInfoPantalla, FooterInfoButton, PantallaEdicionVentilacion, PantallaHeader, PantallaSeleccion } from '../components/st-components';
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
    const scrollbarStyle = { '--scrollbar-thumb': COLORES.primary, '--scrollbar-thumb-hover': '#4fa316' } as React.CSSProperties;
    const scrollbarClass = `flex-1 overflow-y-auto p-4 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-[${COLORES.lastBackground}] [&::-webkit-scrollbar-thumb]:rounded-none [&::-webkit-scrollbar-thumb]:bg-[var(--scrollbar-thumb)]`;
    const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 320;
    return (
      <div
        className="relative min-h-dvh bg-zinc-950 flex flex-col"
        style={{ backgroundColor: COLORES.lastBackground }}
      >
        <PantallaHeader
          actual={actual}
          pilaLength={pila.length}
          objetos={objetos}
          barraAccesoDirecto={barraAccesoDirecto}
          esPantallaPrincipal={esPantallaPrincipal}
          esTeclado={esTeclado}
          esSeleccion={esSeleccion}
          esVentilacionGrupoEdit={esVentilacionGrupoEdit}
          menuNavPtr={menuNavPtr}
          titulo={titulo}
          tituloVentilacionEdit={tituloVentilacionEdit}
          colorHeader={colorHeader}
          tareas={tareas}
          encabezadoEditIcono={encabezadoEditIcono}
          objEditVariables={objEditVariables}
          objEditVariablesString={objEditVariablesString}
          editValue={editValue}
          editValido={editValido}
          seleccionConfirmable={seleccionConfirmable}
          onToggleBarra={() => setBarraAbierta((v) => !v)}
          onVolver={volver}
          onNavegar={navegarA}
          onGuardarVentiladores={() => void guardarVentiladores()}
          onEscribirVariable={(valor) => void escribirVariable(valor)}
          onEscribirVariableString={(valor) => void escribirVariableString(valor)}
          onEscribirSeleccion={() => void escribirSeleccion()}
          responsive
          lang={lang}
        />

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

            <PantallaSeleccion
              visible={esSeleccion}
              camposMultiseleccion={camposMultiseleccion}
              esRadioButton={esRadioButton}
              esCheckbox={esCheckbox}
              selectedIdSeleccion={selectedIdSeleccion}
              selectedIdSelecciones={selectedIdSelecciones}
              setSelectedIdSeleccion={setSelectedIdSeleccion}
              setSelectedIdSelecciones={setSelectedIdSelecciones}
              className={scrollbarClass}
              style={scrollbarStyle}
              responsive
              lang={lang}
            />

            <PantallaEdicionVentilacion
              visible={esVentilacionGrupoEdit}
              objVentilacionEdit={objVentilacionEdit}
              objVentilacionGrafico={objVentilacionGrafico}
              pestanaActivaVentilacion={pestanaActivaVentilacion}
              estadosVentiladores={estadosVentiladores}
              actual={actual}
              onPestanaChange={setPestanaActivaVentilacion}
              onTrash={handleTrashVentiladores}
              onNavegar={navegarA}
              onClickVentilador={handleClickVentilador}
              className={scrollbarClass}
              style={scrollbarStyle}
              iconoVentiladorRotatorio={IconoVentiladorRotatorio}
              iconoVentiladorTemporizado={IconoVentiladorTemporizado}
              iconoVentiladorEstatico={IconoVentiladorEstatico}
              responsive
              lang={lang}
            />

            {!esLibre && !esTeclado && !esSeleccion && !esVentilacionGrupoEdit && (
              <ContenidoObjetosPantalla
                gruposLineas={gruposLineas}
                tablasEstaticas={tablasEstaticas}
                tablasGrupos={tablasGrupos}
                otrosObjetos={otrosObjetos}
                esPantallaPrincipal={esPantallaPrincipal}
                esLista={esLista}
                esVentilacionGrupoEdit={esVentilacionGrupoEdit}
                esTablaCompleja={esTablaCompleja}
                actual={actual}
                textoConcatenadoMap={textoConcatenadoMap}
                onNavegar={navegarA}
                onRefrescarPantalla={refrescarPantallaActual}
                className={scrollbarClass}
                style={scrollbarStyle}
                responsive
                lang={lang}
              />
            )}

            <FooterInfoButton
              visible={infoObjetos.length > 0}
              onClick={() => setInfoDialogAbierto(true)}
              responsive
            />
          </>
        )}

        <DialogInfoPantalla
          abierto={infoDialogAbierto}
          titulo={titulo}
          infoObjetos={infoObjetos}
          textoConcatenadoMap={textoConcatenadoMap}
          onClose={() => setInfoDialogAbierto(false)}
          className="fixed inset-0 z-50 flex flex-col"
          scrollClassName={scrollbarClass}
          scrollStyle={scrollbarStyle}
          responsive
          lang={lang}
        />
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
              <PantallaHeader
                actual={actual}
                pilaLength={pila.length}
                objetos={objetos}
                barraAccesoDirecto={barraAccesoDirecto}
                esPantallaPrincipal={esPantallaPrincipal}
                esTeclado={esTeclado}
                esSeleccion={esSeleccion}
                esVentilacionGrupoEdit={esVentilacionGrupoEdit}
                menuNavPtr={menuNavPtr}
                titulo={titulo}
                tituloVentilacionEdit={tituloVentilacionEdit}
                colorHeader={colorHeader}
                tareas={tareas}
                encabezadoEditIcono={encabezadoEditIcono}
                objEditVariables={objEditVariables}
                objEditVariablesString={objEditVariablesString}
                editValue={editValue}
                editValido={editValido}
                seleccionConfirmable={seleccionConfirmable}
                onToggleBarra={() => setBarraAbierta((v) => !v)}
                onVolver={volver}
                onNavegar={navegarA}
                onGuardarVentiladores={() => void guardarVentiladores()}
                onEscribirVariable={(valor) => void escribirVariable(valor)}
                onEscribirVariableString={(valor) => void escribirVariableString(valor)}
                onEscribirSeleccion={() => void escribirSeleccion()}
                lang={lang}
              />

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

              <PantallaSeleccion
                visible={esSeleccion}
                camposMultiseleccion={camposMultiseleccion}
                esRadioButton={esRadioButton}
                esCheckbox={esCheckbox}
                selectedIdSeleccion={selectedIdSeleccion}
                selectedIdSelecciones={selectedIdSelecciones}
                setSelectedIdSeleccion={setSelectedIdSeleccion}
                setSelectedIdSelecciones={setSelectedIdSelecciones}
                className={`flex-1 overflow-y-auto p-4 my-2 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-track]:bg-[${COLORES.lastBackground}] [&::-webkit-scrollbar-thumb]:rounded-none [&::-webkit-scrollbar-thumb]:bg-[var(--scrollbar-thumb)] [&::-webkit-scrollbar-thumb:hover]:bg-[var(--scrollbar-thumb-hover)]`}
                style={{ '--scrollbar-thumb': COLORES.primary, '--scrollbar-thumb-hover': '#4fa316' } as React.CSSProperties}
                lang={lang}
              />

              <PantallaEdicionVentilacion
                visible={esVentilacionGrupoEdit}
                objVentilacionEdit={objVentilacionEdit}
                objVentilacionGrafico={objVentilacionGrafico}
                pestanaActivaVentilacion={pestanaActivaVentilacion}
                estadosVentiladores={estadosVentiladores}
                actual={actual}
                onPestanaChange={setPestanaActivaVentilacion}
                onTrash={handleTrashVentiladores}
                onNavegar={navegarA}
                onClickVentilador={handleClickVentilador}
                className={`flex-1 overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-[${COLORES.lastBackground}] [&::-webkit-scrollbar-thumb]:rounded-none [&::-webkit-scrollbar-thumb]:bg-[var(--scrollbar-thumb)] [&::-webkit-scrollbar-thumb:hover]:bg-[var(--scrollbar-thumb-hover)]`}
                style={{ '--scrollbar-thumb': COLORES.primary, '--scrollbar-thumb-hover': '#4fa316' } as React.CSSProperties}
                iconoVentiladorRotatorio={IconoVentiladorRotatorio}
                iconoVentiladorTemporizado={IconoVentiladorTemporizado}
                iconoVentiladorEstatico={IconoVentiladorEstatico}
                lang={lang}
              />

              {!esLibre && !esTeclado && !esSeleccion && !esVentilacionGrupoEdit && (
                <ContenidoObjetosPantalla
                  gruposLineas={gruposLineas}
                  tablasEstaticas={tablasEstaticas}
                  tablasGrupos={tablasGrupos}
                  otrosObjetos={otrosObjetos}
                  esPantallaPrincipal={esPantallaPrincipal}
                  esLista={esLista}
                  esVentilacionGrupoEdit={esVentilacionGrupoEdit}
                  esTablaCompleja={esTablaCompleja}
                  actual={actual}
                  textoConcatenadoMap={textoConcatenadoMap}
                  onNavegar={navegarA}
                  onRefrescarPantalla={refrescarPantallaActual}
                  className={`flex-1 overflow-y-auto p-4 my-2 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-track]:bg-[${COLORES.lastBackground}] [&::-webkit-scrollbar-thumb]:rounded-none [&::-webkit-scrollbar-thumb]:bg-[var(--scrollbar-thumb)] [&::-webkit-scrollbar-thumb:hover]:bg-[var(--scrollbar-thumb-hover)]`}
                  style={{ '--scrollbar-thumb': COLORES.primary, '--scrollbar-thumb-hover': '#4fa316' } as React.CSSProperties}
                  lang={lang}
                />
              )}

              <FooterInfoButton
                visible={infoObjetos.length > 0}
                onClick={() => setInfoDialogAbierto(true)}
              />
            </>
          )}

          <DialogInfoPantalla
            abierto={infoDialogAbierto}
            titulo={titulo}
            infoObjetos={infoObjetos}
            textoConcatenadoMap={textoConcatenadoMap}
            onClose={() => setInfoDialogAbierto(false)}
            className="absolute inset-0 flex flex-col"
            scrollClassName={`flex-1 overflow-y-auto p-4 my-2 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-track]:bg-[${COLORES.lastBackground}] [&::-webkit-scrollbar-thumb]:rounded-none [&::-webkit-scrollbar-thumb]:bg-[var(--scrollbar-thumb)] [&::-webkit-scrollbar-thumb:hover]:bg-[var(--scrollbar-thumb-hover)]`}
            scrollStyle={{ '--scrollbar-thumb': COLORES.primary, '--scrollbar-thumb-hover': '#4fa316' } as React.CSSProperties}
            lang={lang}
          />
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
