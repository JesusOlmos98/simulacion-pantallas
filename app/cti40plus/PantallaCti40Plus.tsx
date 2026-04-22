'use client';

import { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import type { JSX } from 'react';
import { useRouter } from 'next/navigation';
import { LuCheck, LuChevronLeft, LuFan, LuInfo, LuMenu, LuX } from 'react-icons/lu';
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
import { parseConcatenado, COLORES, BarraBotonesCti40Plus, decodificarVariable, decodificarStringVariable } from '../components/render-objetos-cti40plus';
import type { DescriptorPantalla, ObjBase } from '../components/pantalla-types';
import { getColorHex } from '../components/render-objetos-cti40plus/colors';
import PantallaLibre from './PantallaLibre';
import { esTipoVarTiempoFecha, parseTiempoFechaString, maskMinMaxTiempoFecha } from '@/src/utils/common-lib-commac-generador/fnTiempo';
import { apiFetch } from '../api/apiFetch';

const MAC_CTI40PLUS = '202000029'; // MAC address para CTI40 PLUS
let idEnvioCounter = 1;
// const URL = process.env.COMMAC_BASE_URL || 'http://localhost:8020/api'; // Centralizado en apiFetch

// ─── Descriptor de pantalla ───────────────────────────────────────────────────

const PRINCIPAL: DescriptorPantalla = { idPantalla: 0, indicePantalla: 0, esPrincipal: true };

interface DestinoTrasEdicion {
  destino: DescriptorPantalla;
  nuevaPila: DescriptorPantalla[];
}

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
  // const res = await fetch(`${URL}/pruebas/peticionPantallaConEspera?${params}`, { method: 'POST', signal });
  const res = await apiFetch(params, signal);
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
  const [editValue, setEditValue] = useState('');
  const [selectedIdSeleccion, setSelectedIdSeleccion] = useState<number | null>(null);
  const [selectedIdSelecciones, setSelectedIdSelecciones] = useState<Set<number>>(new Set());
  const [estadosVentiladores, setEstadosVentiladores] = useState<number[]>([]);
  const [pestanaActivaVentilacion, setPestanaActivaVentilacion] = useState<0 | 1>(0);

  // Ref para poder cancelar el fetch en vuelo al desmontar o al lanzar uno nuevo
  const controllerRef = useRef<AbortController | null>(null);
  const escribirSeleccionRef = useRef<() => Promise<void>>(async () => {});

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
        // Inicializar editValue en el mismo batch que setObjetos para evitar el flash de valor incorrecto
        const editObjString = data.find((o) => o.tipoObjeto === 33);
        if (editObjString) {
          setEditValue(decodificarStringVariable(editObjString.valorVariable));
        } else {
          const editObj = data.find((o) => o.tipoObjeto === 8);
          if (editObj) {
            const tipoVarEdicion = (editObj.tipoVarEdicion ?? editObj.tipoVar) as number;
            setEditValue(decodificarVariable(editObj.valorVariable as number, tipoVarEdicion));
          } else {
            setEditValue('');
          }
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

  // Inicializa los estados de ventiladores cuando carga una pantalla de edición de ventiladores (tipoPlantilla: 10)
  useEffect(() => {
    if (!objetos) return;
    const plantilla = objetos.find((o) => o.tipoObjeto === 1);
    if ((plantilla?.tipoPlantilla as number | undefined) !== 10) return;
    const grafico = objetos.find((o) => o.tipoObjeto === 21);
    const datos = (grafico?.datos as { estadoVentilador: number }[] | undefined) ?? [];
    setEstadosVentiladores(datos.map((d) => d.estadoVentilador));
    setPestanaActivaVentilacion(0);
  }, [objetos]);

  // Inicializa las opciones seleccionadas cuando carga una pantalla de selección (tipoObjeto: 10)
  useEffect(() => {
    if (!objetos) return;
    const objEditVars = objetos.filter((o) => o.tipoObjeto === 8);
    const esRadio = objEditVars.length === 1;

    if (esRadio) {
      // RADIO BUTTON: buscar la opción preseleccionada (opcionSeleccionada=2)
      const seleccionActual = objetos.find((o) => o.tipoObjeto === 10 && (o.opcionSeleccionada as number) === 2);
      if (seleccionActual) {
        setSelectedIdSeleccion(seleccionActual.idSeleccion as number);
      }
    } else if (objEditVars.length > 1) {
      // CHECKBOX: agregar todas las opciones preseleccionadas (opcionSeleccionada=2) al Set
      const selecciones = objetos.filter((o) => o.tipoObjeto === 10 && (o.opcionSeleccionada as number) === 2).map((o) => o.idSeleccion as number);
      setSelectedIdSelecciones(new Set(selecciones));
    }
  }, [objetos]);

  async function guardarVentiladores(): Promise<void> {
    if (!objVentilacionEdit || !objetos) return;
    const objIdUnicoEdicion = objetos.find((o) => o.tipoObjeto === 12);
    const objPlantilla = objetos.find((o) => o.tipoObjeto === 1);
    if (!objIdUnicoEdicion || !objPlantilla) return;

    const destinoTrasEdicion = resolverDestinoTrasEdicion();
    const idPantallaActual = objPlantilla.idPantalla as number;
    const indicePantallaActual = objPlantilla.indicePantalla as number;
    const numDatos = (objVentilacionGrafico?.numDatos as number | undefined) ?? estadosVentiladores.length;

    const params = new URLSearchParams({
      eventId: '255',
      idEnvio: String(idEnvioCounter++),
      mac: MAC_CTI40PLUS,
      readWrite: '1',
      esPantallaPrincipal: '0',
      idUnicoEdicion: String(objIdUnicoEdicion.idUnicoEdicion as number),
      indicePantalla: String(indicePantallaActual),
      navIdPantallaRespuestaTrama: String(idPantallaActual),
      navegacion: '0',
      tipoVariableEdicion: String(objVentilacionEdit.tipoVarEdicion as number),
      textoTituloVariable: String(objVentilacionEdit.textoCabecera as number),
      textoNombreVariable: String(objVentilacionEdit.textoCabecera as number),
      punteroVariableEdicion: String(objVentilacionEdit.ptrVarEditBase as number),
      punteroFuncionSaltoTrasEdit: String(objVentilacionEdit.ptrFuncionSaltoTrasEdit as number),
      numDatosEditar: String(numDatos)
    });

    for (const estado of estadosVentiladores.slice(0, numDatos)) {
      params.append('valores', String(estado));
    }

    setLoading(true);
    setError(null);

    try {
      const res = await apiFetch(params);
      if (!res.ok) throw new Error(`Error ${res.status}`);
      navegarTrasEscritura(destinoTrasEdicion);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al guardar ventiladores');
      setLoading(false);
    }
  }

  function handleClickVentilador(idx: number): void {
    setEstadosVentiladores((prev) => {
      const estado = prev[idx] ?? 0;
      const next = [...prev];

      if (pestanaActivaVentilacion === 0) {
        // Estáticos: toggle entre 0 y 255
        if (estado === 0) {
          next[idx] = 255;
        } else if (estado === 255) {
          next[idx] = 0;
        }
        // Si es temporizado (1,2,3...) no hacer nada
      } else {
        // Temporizados
        if (estado === 0) {
          // Asignar siguiente número de temporizado
          const numTemporizados = next.filter((e) => e !== 0 && e !== 255).length;
          next[idx] = numTemporizados + 1;
        } else if (estado !== 255) {
          // Solo deshacer si es el máximo valor temporizado
          const maxTemporizados = Math.max(...next.filter((e) => e !== 0 && e !== 255));
          if (estado === maxTemporizados) {
            next[idx] = 0;
          }
        }
        // Si es estático (255) no hacer nada
      }
      return next;
    });
  }

  function handleTrashVentiladores(): void {
    setEstadosVentiladores((prev) => prev.map(() => 0));
  }

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

  function resolverDestinoTrasEdicion(): DestinoTrasEdicion {
    const objTrasEditPantallaAtras = objetos?.find((o) => typeof o.numeroPantallasRetroceso === 'number');
    const numeroPantallasRetroceso = Math.max(0, (objTrasEditPantallaAtras?.numeroPantallasRetroceso as number | undefined) ?? 0);
    const nivelesARetroceder = Math.min(pila.length, numeroPantallasRetroceso + 1);

    if (nivelesARetroceder <= 0) {
      return { destino: PRINCIPAL, nuevaPila: [] };
    }

    const indiceDestino = pila.length - nivelesARetroceder;
    const destino = pila[indiceDestino] ?? PRINCIPAL;
    return { destino, nuevaPila: pila.slice(0, indiceDestino) };
  }

  function navegarTrasEscritura(destinoTrasEdicion: DestinoTrasEdicion): void {
    setPila(destinoTrasEdicion.nuevaPila);
    cargarPantalla(destinoTrasEdicion.destino);
  }

  async function escribirVariable(valor: string): Promise<void> {
    if (!objEditVariables || !objetos) return;
    const objIdUnicoEdicion = objetos.find((o) => o.tipoObjeto === 12);
    if (!objIdUnicoEdicion) return;

    const destinoTrasEdicion = resolverDestinoTrasEdicion();
    const idPantallaRespuesta = destinoTrasEdicion.destino.idPantalla;
    const indicePantallaRespuesta = destinoTrasEdicion.destino.indicePantalla;
    const ptrSalto = objEditVariables.ptrFuncionSaltoTrasEdit as number;

    const tipoVarEdicion = objEditVariables.tipoVarEdicion as number;
    const esTF = esTipoVarTiempoFecha(tipoVarEdicion);

    const params = new URLSearchParams({
      eventId: '255',
      idEnvio: String(idEnvioCounter++),
      mac: MAC_CTI40PLUS,
      readWrite: '1',
      esPantallaPrincipal: destinoTrasEdicion.destino.esPrincipal ? '1' : '0',
      idNav: String(idPantallaRespuesta),
      idUnicoEdicion: String(objIdUnicoEdicion.idUnicoEdicion as number),
      indicePantalla: String(indicePantallaRespuesta),
      navIdPantallaRespuestaTrama: String(idPantallaRespuesta),
      tipoVariableEdicion: String(tipoVarEdicion),
      punteroVariableEdicion: String(objEditVariables.ptrVariableEdicion as number),
      // Si ptrFuncionSaltoTrasEdit es 0 el servidor espera la pantalla de respuesta como destino de salto
      punteroFuncionSaltoTrasEdit: String(ptrSalto !== 0 ? ptrSalto : idPantallaRespuesta),
      textoTituloVariable: String(objEditVariables.textoVar as number),
      textoNombreVariable: String(objEditVariables.textoVar as number)
    });

    if (esTF) {
      const u32 = parseTiempoFechaString(valor, tipoVarEdicion);
      if (u32 === null) return;
      params.set('valorVariableHex', u32.toString(16).padStart(8, '0'));
    } else {
      params.set('valorVariable', valor);
    }

    setLoading(true);
    setError(null);

    try {
      // const res = await fetch(`${URL}/pruebas/peticionPantallaConEspera?${params}`, { method: 'POST' });
      const res = await apiFetch(params);
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
    const ptrSalto = objEditVariablesString.ptrFuncionSaltoTrasEdit as number;

    const params = new URLSearchParams({
      eventId: '1',
      idEnvio: String(idEnvioCounter++),
      mac: MAC_CTI40PLUS,
      readWrite: '1',
      esPantallaPrincipal: destinoTrasEdicion.destino.esPrincipal ? '1' : '0',
      idNav: String(idPantallaRespuesta),
      indicePantalla: String(indicePantallaRespuesta),
      idUnicoEdicion: String(objIdUnicoEdicion.idUnicoEdicion as number),
      navIdPantallaRespuestaTrama: String(idPantallaRespuesta),
      navegacion: '0',
      tipoVariableEdicion: String(objEditVariablesString.tipoVarEdicion as number),
      valorVariableTexto: valor,
      punteroVariableEdicion: String(objEditVariablesString.ptrVariableEdicion as number),
      punteroFuncionSaltoTrasEdit: String(ptrSalto !== 0 ? ptrSalto : idPantallaRespuesta),
      textoTituloVariable: String(objEditVariablesString.textoVar as number),
      textoNombreVariable: String(objEditVariablesString.textoVar as number),
      textoOpcionCambioParametro: '0'
    });

    setLoading(true);
    setError(null);

    try {
      // const res = await fetch(`${URL}/pruebas/peticionPantallaConEspera?${params}`, { method: 'POST' });
      const res = await apiFetch(params);
      if (!res.ok) throw new Error(`Error ${res.status}`);
      navegarTrasEscritura(destinoTrasEdicion);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al escribir variable');
      setLoading(false);
    }
  }

  async function escribirSeleccion(): Promise<void> {
    if (!objetos) return;
    const objPlantilla = objetos.find((o) => o.tipoObjeto === 1);
    const objIdUnicoEdicion = objetos.find((o) => o.tipoObjeto === 12);
    if (!objPlantilla || !objIdUnicoEdicion) return;

    const destinoTrasEdicion = resolverDestinoTrasEdicion();
    const idPantallaRespuesta = destinoTrasEdicion.destino.idPantalla;
    const indicePantallaRespuesta = destinoTrasEdicion.destino.indicePantalla;
    const encabezadoObj = objetos.find((o) => o.tipoObjeto === 2);

    // tipoVarEdicion=9, selección única (1 objEditVariables — ej. relés): valorVariable singular
    const objEditVarsV9 = objetos.filter((o) => o.tipoObjeto === 8 && (o.tipoVarEdicion as number) === 9);
    if (objEditVarsV9.length === 1) {
      const objEditVar = objEditVarsV9[0]!;
      if (selectedIdSeleccion === null) return;

      const params = new URLSearchParams({
        eventId: '1',
        idEnvio: String(idEnvioCounter++),
        mac: MAC_CTI40PLUS,
        readWrite: '1',
        esPantallaPrincipal: destinoTrasEdicion.destino.esPrincipal ? '1' : '0',
        idNav: String(idPantallaRespuesta),
        idUnicoEdicion: String(objIdUnicoEdicion.idUnicoEdicion as number),
        indicePantalla: String(indicePantallaRespuesta),
        navIdPantallaRespuestaTrama: String(idPantallaRespuesta),
        navegacion: '0',
        tipoVariableEdicion: String(objEditVar.tipoVarEdicion as number),
        punteroVariableEdicion: String(objEditVar.ptrVariableEdicion as number),
        valorVariable: String(selectedIdSeleccion),
        punteroFuncionSaltoTrasEdit: String(objEditVar.ptrFuncionSaltoTrasEdit as number),
        textoTituloVariable: String((encabezadoObj?.tituloText as number | undefined) ?? 0),
        textoNombreVariable: String((objEditVar.textoVar as number | undefined) ?? 0),
        textoOpcionCambioParametro: '0'
      });

      setLoading(true);
      setError(null);

      try {
        // const res = await fetch(`${URL}/pruebas/peticionPantallaConEspera?${params}`, { method: 'POST' });
        const res = await apiFetch(params);
        if (!res.ok) throw new Error(`Error ${res.status}`);
        navegarTrasEscritura(destinoTrasEdicion);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Error al escribir selección');
        setLoading(false);
      }
      return;
    }

    // tipoVarEdicion=9, multiselección (N objEditVariables — ej. sondas): arrays valores/punteros/textos
    if (objEditVarsV9.length > 1) {
      const primeraV9 = objEditVarsV9[0]!;

      const valores = camposMultiseleccion.map((opt) => {
        const idSel = opt.idSeleccion as number;
        return selectedIdSelecciones.has(idSel) ? idSel : 0;
      });

      const params = new URLSearchParams({
        eventId: '1',
        idEnvio: String(idEnvioCounter++),
        mac: MAC_CTI40PLUS,
        readWrite: '1',
        esPantallaPrincipal: destinoTrasEdicion.destino.esPrincipal ? '1' : '0',
        idNav: String(idPantallaRespuesta),
        idUnicoEdicion: String(objIdUnicoEdicion.idUnicoEdicion as number),
        indicePantalla: String(indicePantallaRespuesta),
        navIdPantallaRespuestaTrama: String(idPantallaRespuesta),
        navegacion: '0',
        tipoVariableEdicion: String(primeraV9.tipoVarEdicion as number),
        punteroVariableEdicion: String(primeraV9.ptrVariableEdicion as number),
        punteroFuncionSaltoTrasEdit: String(primeraV9.ptrFuncionSaltoTrasEdit as number),
        textoTituloVariable: String((encabezadoObj?.tituloText as number | undefined) ?? 0)
      });
      for (const v of valores) params.append('valores', String(v));
      for (const obj of objEditVarsV9) params.append('punterosVariablesEdicion', String(obj.ptrVariableEdicion as number));
      for (const opt of camposMultiseleccion) params.append('textosNombreVariable', String(opt.textoVar as number));

      setLoading(true);
      setError(null);

      try {
        // const res = await fetch(`${URL}/pruebas/peticionPantallaConEspera?${params}`, { method: 'POST' });
        const res = await apiFetch(params);
        if (!res.ok) throw new Error(`Error ${res.status}`);
        navegarTrasEscritura(destinoTrasEdicion);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Error al escribir selección');
        setLoading(false);
      }
      return;
    }

    // tipoVarEdicion=1 con una única opción (ej. confirmar eliminar punto de curva): valorVariable = indicePantalla actual
    const objEditVarV1 = objetos.find((o) => o.tipoObjeto === 8 && (o.tipoVarEdicion as number) === 1);
    if (objEditVarV1 && camposMultiseleccion.length <= 1) {
      const indicePantallaActual = objPlantilla.indicePantalla as number;
      const idPantallaActual = objPlantilla.idPantalla as number;

      const params = new URLSearchParams({
        esPantallaPrincipal: '0',
        readWrite: '1',
        eventId: '255',
        idEnvio: String(idEnvioCounter++),
        mac: MAC_CTI40PLUS,
        idUnicoEdicion: String(objIdUnicoEdicion.idUnicoEdicion as number),
        navIdPantallaRespuestaTrama: String(idPantallaActual),
        indicePantalla: String(indicePantallaActual),
        navegacion: '0',
        tipoVariableEdicion: String(objEditVarV1.tipoVarEdicion as number),
        valorVariable: String(indicePantallaActual),
        punteroVariableEdicion: String(objEditVarV1.ptrVariableEdicion as number),
        punteroFuncionSaltoTrasEdit: String(objEditVarV1.ptrFuncionSaltoTrasEdit as number),
        textoTituloVariable: String((encabezadoObj?.tituloText as number | undefined) ?? 0),
        textoNombreVariable: String((objEditVarV1.textoVar as number | undefined) ?? 0)
      });

      setLoading(true);
      setError(null);

      try {
        // const res = await fetch(`${URL}/pruebas/peticionPantallaConEspera?${params}`, { method: 'POST' });
        const res = await apiFetch(params);
        if (!res.ok) throw new Error(`Error ${res.status}`);
        navegarTrasEscritura(destinoTrasEdicion);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Error al eliminar punto');
        setLoading(false);
      }
      return;
    }

    // RADIO BUTTON: una selección (tipoVarEdicion !== 9)
    if (esRadioButton) {
      const objEditVar = objetos.find((o) => o.tipoObjeto === 8);
      const objSeleccionado = objetos.find((o) => o.tipoObjeto === 10 && (o.idSeleccion as number) === selectedIdSeleccion);
      const esConfirmacionEdicion = ((objPlantilla.tipoPlantilla as number | undefined) ?? 0) === 5;
      if (!objEditVar) return;
      if (!esConfirmacionEdicion && (selectedIdSeleccion === null || !objSeleccionado)) return;

      const valorVariableSeleccion = selectedIdSeleccion !== null ? String(selectedIdSeleccion) : String((objetos.find((o) => o.tipoObjeto === 10)?.opcionSeleccionada as number | undefined) ?? 0);
      const textoNombreVariable = objSeleccionado ? String(objSeleccionado.textoVar as number) : String((objEditVar.textoVar as number | undefined) ?? 0);

      const params = new URLSearchParams({
        eventId: '255',
        idEnvio: String(idEnvioCounter++),
        mac: MAC_CTI40PLUS,
        readWrite: '1',
        esPantallaPrincipal: destinoTrasEdicion.destino.esPrincipal ? '1' : '0',
        idNav: String(idPantallaRespuesta),
        idUnicoEdicion: String(objIdUnicoEdicion.idUnicoEdicion as number),
        indicePantalla: String(indicePantallaRespuesta),
        navIdPantallaRespuestaTrama: String(idPantallaRespuesta),
        tipoVariableEdicion: String(objEditVar.tipoVarEdicion as number),
        valorVariable: valorVariableSeleccion,
        punteroVariableEdicion: String(objEditVar.ptrVariableEdicion as number),
        punteroFuncionSaltoTrasEdit: String(objEditVar.ptrFuncionSaltoTrasEdit as number),
        textoTituloVariable: String((encabezadoObj?.tituloText as number | undefined) ?? 0),
        textoNombreVariable
      });

      setLoading(true);
      setError(null);

      try {
        // const res = await fetch(`${URL}/pruebas/peticionPantallaConEspera?${params}`, { method: 'POST' });
        const res = await apiFetch(params);
        if (!res.ok) throw new Error(`Error ${res.status}`);
        navegarTrasEscritura(destinoTrasEdicion);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Error al escribir selección');
        setLoading(false);
      }
    }
    // CHECKBOX: múltiples selecciones (tipoVarEdicion !== 9)
    else if (esCheckbox) {
      const objEditVars = objetos.filter((o) => o.tipoObjeto === 8);
      setLoading(true);
      setError(null);

      try {
        // Si no hay selecciones, simplemente volver
        if (selectedIdSelecciones.size === 0) {
          navegarTrasEscritura(destinoTrasEdicion);
          return;
        }

        // Hacer una petición por cada objEditVariables con su correspondiente selección
        for (let idx = 0; idx < objEditVars.length; idx++) {
          const objEditVar = objEditVars[idx]!;
          const idSeleccionParaEsteVar = Array.from(selectedIdSelecciones)[idx];

          // Si no hay selección para este índice, saltar
          if (idSeleccionParaEsteVar === undefined) continue;

          const objSeleccionado = objetos.find((o) => o.tipoObjeto === 10 && (o.idSeleccion as number) === idSeleccionParaEsteVar);
          if (!objSeleccionado) continue;

          const params = new URLSearchParams({
            eventId: '255',
            idEnvio: String(idEnvioCounter++),
            mac: MAC_CTI40PLUS,
            readWrite: '1',
            esPantallaPrincipal: destinoTrasEdicion.destino.esPrincipal ? '1' : '0',
            idNav: String(idPantallaRespuesta),
            idUnicoEdicion: String(objIdUnicoEdicion.idUnicoEdicion as number),
            indicePantalla: String(indicePantallaRespuesta),
            navIdPantallaRespuestaTrama: String(idPantallaRespuesta),
            tipoVariableEdicion: String(objEditVar.tipoVarEdicion as number),
            valorVariable: String(idSeleccionParaEsteVar),
            punteroVariableEdicion: String(objEditVar.ptrVariableEdicion as number),
            textoTituloVariable: String((encabezadoObj?.tituloText as number | undefined) ?? 0),
            textoNombreVariable: String(objSeleccionado.textoVar as number)
          });

          // const res = await fetch(`${URL}/pruebas/peticionPantallaConEspera?${params}`, { method: 'POST' });
          const res = await apiFetch(params);
          if (!res.ok) throw new Error(`Error ${res.status} en petición ${idx + 1}`);
        }
        navegarTrasEscritura(destinoTrasEdicion);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Error al escribir selecciones');
        setLoading(false);
      }
    }
  }

  escribirSeleccionRef.current = escribirSeleccion;

  // ── Derivados ─────────────────────────────────────────────────────────────

  // Objetos de barra de acceso directo (tipoObjeto: 66) — se usan los persistentes (capturados en pantallaId=0)
  const barraAccesoDirecto = barraAccesoDirectoPersistente.current;

  // Separar objetos: header (tipoObjeto: 2), líneas (tipoObjeto: 4, 5, 16), info (tipoObjeto: 7) y otros
  const TIPOS_LINEA = new Set([3, 4, 5, 16, 21, 35]);
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
  // Agrupar tabla estática: objTablaConfig (14) + objTablaDatosSinEdicion (28) consecutivos
  const tablasEstaticas: { config: ObjBase; datos: ObjBase }[] = [];
  if (objetos) {
    for (let i = 0; i < objetos.length - 1; i++) {
      if (objetos[i]!.tipoObjeto === 14 && objetos[i + 1]!.tipoObjeto === 28) {
        tablasEstaticas.push({ config: objetos[i]!, datos: objetos[i + 1]! });
      }
    }
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
  const infoObjetos = objetos?.filter((o) => o.tipoObjeto === 7 || o.tipoObjeto === 6 || o.tipoObjeto === 19) ?? [];
  const otrosObjetos =
    objetos?.filter(
      (o) =>
        o.tipoObjeto !== 2 &&
        o.tipoObjeto !== 7 &&
        o.tipoObjeto !== 6 &&
        o.tipoObjeto !== 10 &&
        o.tipoObjeto !== 19 &&
        o.tipoObjeto !== 20 &&
        o.tipoObjeto !== 67 &&
        o.tipoObjeto !== 14 &&
        o.tipoObjeto !== 28 &&
        o.tipoObjeto !== 70 &&
        o.tipoObjeto !== 71 &&
        !TIPOS_LINEA.has(o.tipoObjeto)
    ) ?? [];

  // Mapa de textos concatenados: idTextoConcatenado → texto resuelto (tipo 67)
  const textoConcatenadoMap = useMemo<Map<number, string>>(() => {
    const map = new Map<number, string>();
    if (!objetos) return map;
    for (const obj of objetos) {
      if (obj.tipoObjeto === 67) {
        const id = obj.idTextoConcatenado as number | undefined;
        const raw = obj.cadenaConcatenadaRaw as { type: string; data: number[] } | number[] | undefined;
        if (id !== undefined && raw !== undefined) {
          map.set(id, parseConcatenado(raw));
        }
      }
    }
    return map;
  }, [objetos]);

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
  const tituloTextId = encabezado?.tituloText ?? 0;
  const titulo = encabezado ? (textoConcatenadoMap.get(tituloTextId) ?? resolveText(tituloTextId)) : '';
  const colorHeader = getColorHex(encabezado?.colorTitulo ?? 0);

  // objEncabezadoEditIcono (tipoObjeto: 31) — botón de acción a la derecha del header
  const encabezadoEditIcono = objetos?.find((o) => o.tipoObjeto === 31);

  // Tareas de navegación del encabezado (botones a la derecha del header)
  const tareas = [
    { icono: encabezado?.iconoTarea3 ?? 0, pantalla: encabezado?.pantallaSaltoTarea3 ?? 0, indice: encabezado?.indicePantallaTarea3 ?? 0 },
    { icono: encabezado?.iconoTarea2 ?? 0, pantalla: encabezado?.pantallaSaltoTarea2 ?? 0, indice: encabezado?.indicePantallaTarea2 ?? 0 }
  ].filter((t) => t.pantalla > 0);

  // tipoPlantilla: 2 = teclado (edición), 4 = lista de filas, 21 = canvas libre (objPosXyLibre*), otros = grid de iconos
  const tipoPlantilla = (objetos?.find((o) => o.tipoObjeto === 1)?.tipoPlantilla as number) ?? 0;
  const esLista = tipoPlantilla === 4;
  const esVentilacionGrupoEdit = tipoPlantilla === 10;
  const esLibre = tipoPlantilla === 21;
  const objVentilacionGrafico = esVentilacionGrupoEdit ? (objetos?.find((o) => o.tipoObjeto === 21) ?? null) : null;
  const objVentilacionEdit = esVentilacionGrupoEdit ? (objetos?.find((o) => o.tipoObjeto === 22) ?? null) : null;
  const tituloVentilacionEdit = objVentilacionEdit ? resolveText(objVentilacionEdit.textoCabecera as number) : null;
  const esTeclado = tipoPlantilla === 2;

  // Campos de selección única (tipoObjeto: 10 — objCamposMultiseleccion)
  const camposMultiseleccion = objetos?.filter((o) => o.tipoObjeto === 10) ?? [];
  const esSeleccion = camposMultiseleccion.length > 0;

  // Objeto de edición de variable numérica (tipoObjeto: 8 — objEditVariables), presente solo en pantallas de edición
  const objEditVariables = esTeclado ? (objetos?.find((o) => o.tipoObjeto === 8) ?? null) : null;
  // Objeto de edición de variable string (tipoObjeto: 33 — objEditVariablesString), presente solo en pantallas de edición de texto
  const objEditVariablesString = esTeclado ? (objetos?.find((o) => o.tipoObjeto === 33) ?? null) : null;

  // Detectar si es RADIO BUTTON (1 objEditVariables) o CHECKBOX (múltiples objEditVariables)
  const objEditVariablesMultiples = objetos?.filter((o) => o.tipoObjeto === 8) ?? [];
  const esRadioButton = esSeleccion && objEditVariablesMultiples.length === 1;
  const esCheckbox = esSeleccion && objEditVariablesMultiples.length > 1;

  // Detectar si la pantalla de edición es de Tiempo o Fecha
  const esTiempoFecha = objEditVariables ? esTipoVarTiempoFecha(objEditVariables.tipoVarEdicion as number) : false;

  // Validez del valor introducido: siempre válido para strings, rango numérico para el resto
  const editValido = useMemo<boolean>(() => {
    if (objEditVariablesString) return true;
    if (!objEditVariables) return false;
    const tipoVarEdicion = objEditVariables.tipoVarEdicion as number;
    if (esTiempoFecha) {
      const encoded = parseTiempoFechaString(editValue, tipoVarEdicion);
      if (encoded === null) return false;
      const maskedMin = maskMinMaxTiempoFecha(objEditVariables.minimo as number, tipoVarEdicion);
      const maskedMax = maskMinMaxTiempoFecha(objEditVariables.maximo as number, tipoVarEdicion);
      return encoded >= maskedMin && encoded <= maskedMax;
    }
    const tipoVar = objEditVariables.tipoVar as number;
    const val = parseFloat(editValue);
    if (!isFinite(val)) return false;
    const minVal = parseFloat(decodificarVariable(objEditVariables.minimo as number, tipoVar));
    const maxVal = parseFloat(decodificarVariable(objEditVariables.maximo as number, tipoVar));
    return val >= minVal && val <= maxVal;
  }, [editValue, esTiempoFecha, objEditVariables, objEditVariablesString]);

  const seleccionConfirmable = useMemo<boolean>(() => {
    if (!esSeleccion) return false;
    if (esRadioButton) {
      const esConfirmacionEdicion = tipoPlantilla === 5;
      return esConfirmacionEdicion || selectedIdSeleccion !== null;
    }
    if (esCheckbox) return true;
    return false;
  }, [esCheckbox, esRadioButton, esSeleccion, selectedIdSeleccion, tipoPlantilla]);

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
              {/* Barra superior — pantallas de edición (tipoPlantilla 2): X + título + Check */}
              {!esPantallaPrincipal && esTeclado && (
                <div
                  className="flex items-center justify-between px-3 py-6 shrink-0"
                  style={{ backgroundColor: COLORES.tertiary }}
                >
                  <button
                    onClick={volver}
                    className="p-1 text-white hover:text-gray-200 transition-colors"
                    aria-label="Cancelar"
                  >
                    <LuX size={60} />
                  </button>
                  <span className="text-5xl font-normal text-white truncate px-2">
                    {objEditVariablesString ? resolveText(objEditVariablesString.textoVar as number) : objEditVariables ? resolveText(objEditVariables.textoVar as number) : ''}
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
                  className="flex items-center justify-between px-3 py-6 shrink-0"
                  style={{ backgroundColor: COLORES.tertiary }}
                >
                  <button
                    onClick={volver}
                    className="p-1 text-white hover:text-gray-200 transition-colors"
                    aria-label="Cancelar"
                  >
                    <LuX size={60} />
                  </button>
                  <span className="text-5xl font-normal text-white truncate px-2">{titulo}</span>
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
                  className="flex items-center justify-between px-3 py-6 shrink-0"
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
                  <span className="text-5xl font-normal text-white truncate px-2">{tituloVentilacionEdit ?? titulo}</span>

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
                              onClick={() => navegarA({ idPantalla: tarea.pantalla, indicePantalla: tarea.indice, esPrincipal: false })}
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
                  className="flex-1 overflow-y-auto p-4 my-2 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-track]:bg-[#1E1E1E] [&::-webkit-scrollbar-thumb]:rounded-none [&::-webkit-scrollbar-thumb]:bg-[var(--scrollbar-thumb)] [&::-webkit-scrollbar-thumb:hover]:bg-[var(--scrollbar-thumb-hover)]"
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
                        />
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Pantalla de edición de ventiladores (tipoPlantilla 10) */}
              {esVentilacionGrupoEdit && objVentilacionEdit && (
                <div
                  className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-[#1E1E1E] [&::-webkit-scrollbar-thumb]:rounded-none [&::-webkit-scrollbar-thumb]:bg-[var(--scrollbar-thumb)] [&::-webkit-scrollbar-thumb:hover]:bg-[var(--scrollbar-thumb-hover)]"
                  style={{ '--scrollbar-thumb': COLORES.primary, '--scrollbar-thumb-hover': '#4fa316' } as React.CSSProperties}
                >
                  {/* Pestañas */}
                  <ObjVentilacionGrupoGraficoEdit
                    obj={objVentilacionEdit}
                    pestanaActiva={pestanaActivaVentilacion}
                    onPestanaChange={setPestanaActivaVentilacion}
                    onTrash={handleTrashVentiladores}
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
                      <LuFan
                        size={75}
                        color={COLORES.success}
                      />
                      <span
                        className="text-5xl"
                        style={{ color: COLORES.light }}
                      >
                        {resolveText(objVentilacionEdit.textoPestana2 as number)}
                      </span>
                    </div>
                    <div className="flex items-center gap-6">
                      <span style={{ position: 'relative', display: 'inline-flex', width: 75, height: 75 }}>
                        <LuFan
                          size={75}
                          color={COLORES.success}
                          style={{ position: 'absolute', clipPath: 'inset(0 50% 0 0)' }}
                        />
                        <LuFan
                          size={75}
                          color={COLORES.light}
                          style={{ position: 'absolute', clipPath: 'inset(0 0 0 50%)' }}
                        />
                      </span>
                      <span
                        className="text-5xl"
                        style={{ color: COLORES.light }}
                      >
                        {resolveText(objVentilacionEdit.textoPestana2 as number)}
                      </span>
                    </div>
                    <div className="flex items-center gap-6">
                      <LuFan
                        size={75}
                        color={COLORES.menuWords}
                      />
                      <span
                        className="text-5xl"
                        style={{ color: COLORES.light }}
                      >
                        {resolveText(objVentilacionEdit.textoPestana1 as number)}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Objetos — scrollable si hay muchos */}
              {!esLibre && !esTeclado && !esSeleccion && !esVentilacionGrupoEdit && (
                <div
                  className="flex-1 overflow-y-auto p-4 my-2 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-track]:bg-[#1E1E1E] [&::-webkit-scrollbar-thumb]:rounded-none [&::-webkit-scrollbar-thumb]:bg-[var(--scrollbar-thumb)] [&::-webkit-scrollbar-thumb:hover]:bg-[var(--scrollbar-thumb-hover)]"
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
                                  idPantallaActual={actual.idPantalla}
                                  indicePantallaActual={actual.indicePantalla}
                                  textoConcatenados={textoConcatenadoMap}
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
                                  idPantallaActual={actual.idPantalla}
                                  indicePantallaActual={actual.indicePantalla}
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
                                  indicePantallaActual={actual.indicePantalla}
                                  textoConcatenados={textoConcatenadoMap}
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
                  style={{ backgroundColor: '#1E1E1E' }}
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
              <div
                className="flex-1 overflow-y-auto p-4 my-2 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-track]:bg-[#1E1E1E] [&::-webkit-scrollbar-thumb]:rounded-none [&::-webkit-scrollbar-thumb]:bg-[var(--scrollbar-thumb)] [&::-webkit-scrollbar-thumb:hover]:bg-[var(--scrollbar-thumb-hover)]"
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
                          />
                        );
                      case 19:
                        return (
                          <ObjLineaInfoTextTextVarVar
                            key={i}
                            obj={obj}
                          />
                        );
                      case 7:
                      default:
                        return (
                          <ObjLineaInfoTextText
                            key={i}
                            obj={obj}
                          />
                        );
                    }
                  })}
                </div>
              </div>
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
