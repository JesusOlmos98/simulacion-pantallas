import { EnTextos } from '@/src/utils/common-lib-commac-generador/enumTextos';
import { esTipoVarTiempoFecha, maskMinMaxTiempoFecha, parseTiempoFechaString } from '@/src/utils/common-lib-commac-generador/fnTiempo';
import { apiFetch } from '../api/apiFetch';
import { COLORES, decodificarStringVariable, decodificarVariable, parseConcatenado } from '../components/render-objetos-st';
import { getColorHex } from '../components/render-objetos-st/colors';
import { resolveText } from '../components/render-objetos-st/textos/resolverTexto';
import type { DescriptorPantalla, ObjBase } from '../components/pantalla-types';
import { nextIdEnvio } from './fnTc5Envio';
export { buildParametrosSeleccionTc5 } from './fnTc5Seleccion';
export type { ParametrosSeleccionTc5 } from './fnTc5Seleccion';

export const DEFAULT_MAC_TC5 = '206000003'; // MAC por defecto para entradas antiguas a /tc5
export const PRINCIPAL: DescriptorPantalla = { idPantalla: 0, indicePantalla: 0, esPrincipal: true };

const DEFAULT_REFRESH_SECONDS = 6;
const TIPOS_LINEA = new Set([3, 4, 5, 16, 21, 35]);

export interface DestinoTrasEdicion {
  destino: DescriptorPantalla;
  nuevaPila: DescriptorPantalla[];
}

export interface CargarPantallaOptions {
  onSuccess?: () => void;
  mostrarLoading?: boolean;
}

export interface EncabezadoTc5 {
  tituloText?: number;
  colorTitulo?: number;
  iconoTarea2?: number;
  pantallaSaltoTarea2?: number;
  indicePantallaTarea2?: number;
  iconoTarea3?: number;
  pantallaSaltoTarea3?: number;
  indicePantallaTarea3?: number;
}

interface TareaEncabezadoTc5 {
  icono: number;
  pantalla: number;
  indice: number;
}

interface TablaEstaticaTc5 {
  config: ObjBase;
  datos: ObjBase;
}

interface TablaGrupoTc5 {
  init: ObjBase;
  filas: ObjBase[];
}

export interface DerivadosTc5 {
  gruposLineas: ObjBase[][];
  tablasEstaticas: TablaEstaticaTc5[];
  tablasGrupos: TablaGrupoTc5[];
  infoObjetos: ObjBase[];
  otrosObjetos: ObjBase[];
  esPantallaPrincipal: boolean;
  menuNavPtr: number | undefined;
  encabezado: EncabezadoTc5 | undefined;
  tituloTextId: number;
  titulo: string;
  colorHeader: string;
  esTablaCompleja: boolean;
  encabezadoEditIcono: ObjBase | undefined;
  tareas: TareaEncabezadoTc5[];
  tipoPlantilla: number;
  esLista: boolean;
  esVentilacionGrupoEdit: boolean;
  esLibre: boolean;
  esLibreListadoConEncabezado: boolean;
  objVentilacionGrafico: ObjBase | null;
  objVentilacionEdit: ObjBase | null;
  tituloVentilacionEdit: string | null;
  esTeclado: boolean;
  camposMultiseleccion: ObjBase[];
  esSeleccion: boolean;
  objEditVariables: ObjBase | null;
  objEditVariablesString: ObjBase | null;
  objEditVariablesMultiples: ObjBase[];
  esRadioButton: boolean;
  esCheckbox: boolean;
  esTiempoFecha: boolean;
}

export interface SeleccionInicialTc5 {
  selectedIdSeleccion: number | null;
  selectedIdSelecciones: Set<number>;
}

interface BaseWriteParamsArgs {
  mac: string;
  destinoTrasEdicion: DestinoTrasEdicion;
  objIdUnicoEdicion: ObjBase;
  idPantallaRespuesta: number;
  indicePantallaRespuesta: number;
}

export function getSegundosRefresco(objetos: ObjBase[] | null): number {
  const segundos = Number(objetos?.find((o) => o.tipoObjeto === 51)?.tiempoRefrescoSegundo);
  return Number.isFinite(segundos) && segundos > 0 ? segundos : DEFAULT_REFRESH_SECONDS;
}

export function getDescriptorRefresco(actual: DescriptorPantalla, objetos: ObjBase[] | null): DescriptorPantalla | null {
  if (actual.idUnicoEdicion === undefined) return actual;

  const idPantallaRenderizada = objetos?.find((o) => o.tipoObjeto === 1)?.idPantalla;
  if (idPantallaRenderizada === 0) return PRINCIPAL;

  return null;
}

export async function fetchPantalla(d: DescriptorPantalla, signal: AbortSignal, versionEquipo: number, mac: string, token: string): Promise<ObjBase[]> {
  const params = new URLSearchParams({ mac, eventId: '1', idEnvio: nextIdEnvio(), readWrite: '0', esPantallaPrincipal: d.esPrincipal ? '1' : '0', versionEquipo: String(versionEquipo) });
  if (token !== '') {
    params.set('token', token);
  }
  if (!d.esPrincipal || d.idUnicoEdicion !== undefined) {
    params.set('idNav', String(d.idPantalla));
    params.set('indicePantalla', String(d.indicePantalla));
    if (d.idUnicoEdicion !== undefined) {
      params.set('idUnicoEdicion', String(d.idUnicoEdicion));
    }
  }

  const res = await apiFetch(params, signal);
  if (!res.ok) throw new Error(`Error ${res.status}`);
  return res.json();
}

export function getVersionEquipo(data: ObjBase[]): number | null {
  const versionEquipo = Number(data.find((o) => o.tipoObjeto === 1)?.versionEquipo);
  return Number.isFinite(versionEquipo) && Number.isInteger(versionEquipo) && versionEquipo > 0 ? versionEquipo : null;
}

export function getBotonesAccesoDirecto(data: ObjBase[]): ObjBase[] {
  return data.filter((o) => o.tipoObjeto === 82);
}

export function getEditValueInicial(data: ObjBase[]): string {
  const editObjString = data.find((o) => o.tipoObjeto === 33);
  if (editObjString) {
    return decodificarStringVariable(editObjString.valorVariable);
  }

  const editObj = data.find((o) => o.tipoObjeto === 8);
  if (!editObj) return '';

  const tipoVarEdicion = (editObj.tipoVarEdicion ?? editObj.tipoVar) as number;
  return decodificarVariable(editObj.valorVariable as number, tipoVarEdicion);
}

export function getEstadosVentiladoresIniciales(objetos: ObjBase[] | null): number[] | null {
  if (!objetos) return null;

  const plantilla = objetos.find((o) => o.tipoObjeto === 1);
  if ((plantilla?.tipoPlantilla as number | undefined) !== 10) return null;

  const grafico = objetos.find((o) => o.tipoObjeto === 21);
  const datos = (grafico?.datos as { estadoVentilador: number }[] | undefined) ?? [];
  return datos.map((d) => d.estadoVentilador);
}

export function getSeleccionInicial(objetos: ObjBase[] | null): SeleccionInicialTc5 | null {
  if (!objetos) return null;

  const objEditVars = objetos.filter((o) => o.tipoObjeto === 8);
  if (objEditVars.length === 1) {
    const seleccionActual = objetos.find((o) => o.tipoObjeto === 10 && (o.opcionSeleccionada as number) === 2);
    return { selectedIdSeleccion: seleccionActual ? (seleccionActual.idSeleccion as number) : null, selectedIdSelecciones: new Set() };
  }

  if (objEditVars.length > 1) {
    const selecciones = objetos.filter((o) => o.tipoObjeto === 10 && (o.opcionSeleccionada as number) === 2).map((o) => o.idSeleccion as number);
    return { selectedIdSeleccion: null, selectedIdSelecciones: new Set(selecciones) };
  }

  return null;
}

export function toggleEstadoVentilador(prev: number[], idx: number, pestanaActivaVentilacion: 0 | 1): number[] {
  const estado = prev[idx] ?? 0;
  const next = [...prev];

  if (pestanaActivaVentilacion === 0) {
    if (estado === 0) {
      next[idx] = 255;
    } else if (estado === 255) {
      next[idx] = 0;
    }
    return next;
  }

  if (estado === 0) {
    const numTemporizados = next.filter((e) => e !== 0 && e !== 255).length;
    next[idx] = numTemporizados + 1;
  } else if (estado !== 255) {
    const maxTemporizados = Math.max(...next.filter((e) => e !== 0 && e !== 255));
    if (estado === maxTemporizados) {
      next[idx] = 0;
    }
  }

  return next;
}

export function calcularVolver(pila: DescriptorPantalla[], actual: DescriptorPantalla): { anterior: DescriptorPantalla; nuevaPila: DescriptorPantalla[] } | null {
  if (pila.length === 0) return null;

  const mismaPantalla = (d: DescriptorPantalla): boolean =>
    d.idPantalla === actual.idPantalla && d.indicePantalla === actual.indicePantalla && !!d.esPrincipal === !!actual.esPrincipal && d.idUnicoEdicion === actual.idUnicoEdicion;

  let idx = pila.length - 1;
  while (idx > 0 && mismaPantalla(pila[idx]!)) {
    idx--;
  }

  const anterior = pila[idx]!;
  if (mismaPantalla(anterior)) return null;

  return { anterior, nuevaPila: pila.slice(0, idx) };
}

export function resolverDestinoTrasEdicion(objetos: ObjBase[] | null, pila: DescriptorPantalla[]): DestinoTrasEdicion {
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

export function buildTextoConcatenadoMap(objetos: ObjBase[] | null): Map<number, string> {
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
}

export function buildDerivadosTc5(objetos: ObjBase[] | null, actual: DescriptorPantalla, textoConcatenadoMap: Map<number, string>): DerivadosTc5 {
  const gruposLineas = buildGruposLineas(objetos);
  const tablasEstaticas = buildTablasEstaticas(objetos);
  const tablasGrupos = buildTablasGrupos(objetos);
  const infoObjetos = objetos?.filter((o) => o.tipoObjeto === 7 || o.tipoObjeto === 6 || o.tipoObjeto === 19) ?? [];
  const otrosObjetos = objetos?.filter((o) => esOtroObjeto(o)) ?? [];
  const esPantallaPrincipal = (objetos?.find((o) => o.tipoObjeto === 1)?.idPantalla ?? 0) === 0;
  const menuNavPtr = actual.esPrincipal
    ? (objetos?.find((o) => o.tipoObjeto === 37 && (o.tipoDato as number) === 0 && (o.valorEditableONav as number) > 0)?.valorEditableONav as number | undefined)
    : undefined;
  const encabezado = objetos?.find((o) => o.tipoObjeto === 2) as EncabezadoTc5 | undefined;
  const tituloTextId = encabezado?.tituloText ?? 0;
  const titulo = encabezado ? (textoConcatenadoMap.get(tituloTextId) ?? resolveText(tituloTextId)) : '';
  const colorHeader = encabezado ? getColorHex(encabezado.colorTitulo ?? 0) : COLORES.primary;
  const esTablaCompleja = tituloTextId === EnTextos.textCurvaVentilacion || tituloTextId === EnTextos.textIluminacion;
  const encabezadoEditIcono = objetos?.find((o) => o.tipoObjeto === 31);
  const tareas = [
    { icono: encabezado?.iconoTarea3 ?? 0, pantalla: encabezado?.pantallaSaltoTarea3 ?? 0, indice: encabezado?.indicePantallaTarea3 ?? 0 },
    { icono: encabezado?.iconoTarea2 ?? 0, pantalla: encabezado?.pantallaSaltoTarea2 ?? 0, indice: encabezado?.indicePantallaTarea2 ?? 0 }
  ].filter((t) => t.icono > 0);
  const tipoPlantilla = (objetos?.find((o) => o.tipoObjeto === 1)?.tipoPlantilla as number) ?? 0;
  const esLista = tipoPlantilla === 4;
  const esVentilacionGrupoEdit = tipoPlantilla === 10;
  const esLibre = tipoPlantilla === 21;
  const esLibreListadoConEncabezado = esLibre && encabezado !== undefined && esLibreListado(objetos);
  const objVentilacionGrafico = esVentilacionGrupoEdit ? (objetos?.find((o) => o.tipoObjeto === 21) ?? null) : null;
  const objVentilacionEdit = esVentilacionGrupoEdit ? (objetos?.find((o) => o.tipoObjeto === 22) ?? null) : null;
  const tituloVentilacionEdit = objVentilacionEdit ? resolveText(objVentilacionEdit.textoCabecera as number) : null;
  const esTeclado = tipoPlantilla === 2;
  const camposMultiseleccion = objetos?.filter((o) => o.tipoObjeto === 10) ?? [];
  const esSeleccion = camposMultiseleccion.length > 0;
  const objEditVariables = esTeclado ? (objetos?.find((o) => o.tipoObjeto === 8) ?? null) : null;
  const objEditVariablesString = esTeclado ? (objetos?.find((o) => o.tipoObjeto === 33) ?? null) : null;
  const objEditVariablesMultiples = objetos?.filter((o) => o.tipoObjeto === 8) ?? [];
  const esRadioButton = esSeleccion && objEditVariablesMultiples.length === 1;
  const esCheckbox = esSeleccion && objEditVariablesMultiples.length > 1;
  const esTiempoFecha = objEditVariables ? esTipoVarTiempoFecha(objEditVariables.tipoVarEdicion as number) : false;

  return {
    gruposLineas,
    tablasEstaticas,
    tablasGrupos,
    infoObjetos,
    otrosObjetos,
    esPantallaPrincipal,
    menuNavPtr,
    encabezado,
    tituloTextId,
    titulo,
    colorHeader,
    esTablaCompleja,
    encabezadoEditIcono,
    tareas,
    tipoPlantilla,
    esLista,
    esVentilacionGrupoEdit,
    esLibre,
    esLibreListadoConEncabezado,
    objVentilacionGrafico,
    objVentilacionEdit,
    tituloVentilacionEdit,
    esTeclado,
    camposMultiseleccion,
    esSeleccion,
    objEditVariables,
    objEditVariablesString,
    objEditVariablesMultiples,
    esRadioButton,
    esCheckbox,
    esTiempoFecha
  };
}

export function isEditValueValido(editValue: string, objEditVariables: ObjBase | null, objEditVariablesString: ObjBase | null, esTiempoFecha: boolean): boolean {
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
}

export function isSeleccionConfirmable(esSeleccion: boolean, esRadioButton: boolean, esCheckbox: boolean, selectedIdSeleccion: number | null, tipoPlantilla: number): boolean {
  if (!esSeleccion) return false;
  if (esRadioButton) {
    const esConfirmacionEdicion = tipoPlantilla === 5;
    return esConfirmacionEdicion || selectedIdSeleccion !== null;
  }
  if (esCheckbox) return true;
  return false;
}

export function buildGuardarVentiladoresParams(args: {
  mac: string;
  objetos: ObjBase[];
  objVentilacionEdit: ObjBase;
  objVentilacionGrafico: ObjBase | null;
  estadosVentiladores: number[];
}): URLSearchParams | null {
  const { mac, objetos, objVentilacionEdit, objVentilacionGrafico, estadosVentiladores } = args;
  const objIdUnicoEdicion = objetos.find((o) => o.tipoObjeto === 12);
  const objPlantilla = objetos.find((o) => o.tipoObjeto === 1);
  if (!objIdUnicoEdicion || !objPlantilla) return null;

  const idPantallaActual = objPlantilla.idPantalla as number;
  const indicePantallaActual = objPlantilla.indicePantalla as number;
  const numDatos = (objVentilacionGrafico?.numDatos as number | undefined) ?? estadosVentiladores.length;
  const params = new URLSearchParams({
    eventId: '255',
    idEnvio: nextIdEnvio(),
    mac,
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

  return params;
}

export function buildEscribirVariableParams(args: BaseWriteParamsArgs & { objEditVariables: ObjBase; valor: string }): URLSearchParams | null {
  const { mac, destinoTrasEdicion, objIdUnicoEdicion, idPantallaRespuesta, indicePantallaRespuesta, objEditVariables, valor } = args;
  const ptrSalto = objEditVariables.ptrFuncionSaltoTrasEdit as number;
  const tipoVarEdicion = objEditVariables.tipoVarEdicion as number;
  const params = new URLSearchParams({
    eventId: '255',
    idEnvio: nextIdEnvio(),
    mac,
    readWrite: '1',
    esPantallaPrincipal: destinoTrasEdicion.destino.esPrincipal ? '1' : '0',
    idNav: String(idPantallaRespuesta),
    idUnicoEdicion: String(objIdUnicoEdicion.idUnicoEdicion as number),
    indicePantalla: String(indicePantallaRespuesta),
    navIdPantallaRespuestaTrama: String(idPantallaRespuesta),
    tipoVariableEdicion: String(tipoVarEdicion),
    punteroVariableEdicion: String(objEditVariables.ptrVariableEdicion as number),
    punteroFuncionSaltoTrasEdit: String(ptrSalto !== 0 ? ptrSalto : idPantallaRespuesta),
    textoTituloVariable: String(objEditVariables.textoVar as number),
    textoNombreVariable: String(objEditVariables.textoVar as number)
  });

  if (esTipoVarTiempoFecha(tipoVarEdicion)) {
    const u32 = parseTiempoFechaString(valor, tipoVarEdicion);
    if (u32 === null) return null;
    params.set('valorVariableHex', u32.toString(16).padStart(8, '0'));
  } else {
    params.set('valorVariable', valor);
  }

  return params;
}

export function buildEscribirVariableStringParams(args: BaseWriteParamsArgs & { objEditVariablesString: ObjBase; valor: string }): URLSearchParams {
  const { mac, destinoTrasEdicion, objIdUnicoEdicion, idPantallaRespuesta, indicePantallaRespuesta, objEditVariablesString, valor } = args;
  const ptrSalto = objEditVariablesString.ptrFuncionSaltoTrasEdit as number;

  return new URLSearchParams({
    eventId: '1',
    idEnvio: nextIdEnvio(),
    mac,
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
}

function buildGruposLineas(objetos: ObjBase[] | null): ObjBase[][] {
  const gruposLineas: ObjBase[][] = [];
  if (!objetos) return gruposLineas;

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

  return gruposLineas;
}

function buildTablasEstaticas(objetos: ObjBase[] | null): TablaEstaticaTc5[] {
  const tablasEstaticas: TablaEstaticaTc5[] = [];
  if (!objetos) return tablasEstaticas;

  for (let i = 0; i < objetos.length - 1; i++) {
    if (objetos[i]!.tipoObjeto === 14 && objetos[i + 1]!.tipoObjeto === 28) {
      tablasEstaticas.push({ config: objetos[i]!, datos: objetos[i + 1]! });
    }
  }

  return tablasEstaticas;
}

function buildTablasGrupos(objetos: ObjBase[] | null): TablaGrupoTc5[] {
  const tablasGrupos: TablaGrupoTc5[] = [];
  if (!objetos) return tablasGrupos;

  const inits = objetos.map((o, i) => (o.tipoObjeto === 70 ? i : -1)).filter((i) => i !== -1);
  const filasIndices = objetos.map((o, i) => (o.tipoObjeto === 71 ? i : -1)).filter((i) => i !== -1);

  for (const initIdx of inits) {
    const init = objetos[initIdx]!;
    const nextInitIdx = inits.find((i) => i > initIdx) ?? objetos.length;
    const filasParaEsteInit = filasIndices.filter((fIdx) => fIdx > initIdx && fIdx < nextInitIdx).map((fIdx) => objetos[fIdx]!);

    tablasGrupos.push({ init, filas: filasParaEsteInit });
  }

  return tablasGrupos;
}

function esOtroObjeto(o: ObjBase): boolean {
  return (
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
    o.tipoObjeto !== 82 &&
    !TIPOS_LINEA.has(o.tipoObjeto)
  );
}

function esLibreListado(objetos: ObjBase[] | null): boolean {
  return (
    objetos?.some(
      (o) =>
        (o.tipoObjeto === 79 && ((o.ancho as number | undefined) ?? 0) > 0 && ((o.alto as number | undefined) ?? 0) > 0) ||
        (o.tipoObjeto === 76 &&
          ((o.color as number | undefined) ?? 0) === 13 &&
          ((o.posXFin as number | undefined) ?? 0) > ((o.posXInicio as number | undefined) ?? 0) &&
          ((o.posYFin as number | undefined) ?? 0) > ((o.posYInicio as number | undefined) ?? 0))
    ) ?? false
  );
}
