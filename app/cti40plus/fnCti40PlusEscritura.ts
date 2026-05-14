import { esTipoVarTiempoFecha, parseTiempoFechaString } from '@/src/utils/common-lib-commac-generador/fnTiempo';
import type { ObjBase } from '../components/pantalla-types';
import type { DestinoTrasEdicion } from './fnCti40Plus';
import { nextIdEnvio } from './fnCti40PlusEnvio';

interface BaseWriteParamsArgs {
  mac: string;
  destinoTrasEdicion: DestinoTrasEdicion;
  objIdUnicoEdicion: ObjBase;
  idPantallaRespuesta: number;
  indicePantallaRespuesta: number;
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
