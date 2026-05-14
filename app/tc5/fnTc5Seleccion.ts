import type { ObjBase } from '../components/pantalla-types';
import type { DestinoTrasEdicion } from './fnTc5';
import { nextIdEnvio } from './fnTc5Envio';

interface BaseWriteParamsArgs {
  mac: string;
  destinoTrasEdicion: DestinoTrasEdicion;
  objIdUnicoEdicion: ObjBase;
  idPantallaRespuesta: number;
  indicePantallaRespuesta: number;
}

interface BuildSeleccionParamsArgs {
  objetos: ObjBase[];
  camposMultiseleccion: ObjBase[];
  esRadioButton: boolean;
  esCheckbox: boolean;
  selectedIdSeleccion: number | null;
  selectedIdSelecciones: Set<number>;
  mac: string;
  destinoTrasEdicion: DestinoTrasEdicion;
}

export interface ParametrosSeleccionTc5 {
  params: URLSearchParams[];
  errorMessage: string;
  navegarSinPeticiones?: boolean;
}
export function buildParametrosSeleccionTc5(args: BuildSeleccionParamsArgs): ParametrosSeleccionTc5 | null {
  const { objetos, camposMultiseleccion, esRadioButton, esCheckbox, selectedIdSeleccion, selectedIdSelecciones, mac, destinoTrasEdicion } = args;
  const objPlantilla = objetos.find((o) => o.tipoObjeto === 1);
  const objIdUnicoEdicion = objetos.find((o) => o.tipoObjeto === 12);
  if (!objPlantilla || !objIdUnicoEdicion) return null;

  const idPantallaRespuesta = destinoTrasEdicion.destino.idPantalla;
  const indicePantallaRespuesta = destinoTrasEdicion.destino.indicePantalla;
  const encabezadoObj = objetos.find((o) => o.tipoObjeto === 2);
  const objEditVarsV9 = objetos.filter((o) => o.tipoObjeto === 8 && (o.tipoVarEdicion as number) === 9);

  if (objEditVarsV9.length === 1) {
    if (selectedIdSeleccion === null) return null;
    return {
      params: [
        buildSeleccionUnicaV9Params({ mac, destinoTrasEdicion, objIdUnicoEdicion, idPantallaRespuesta, indicePantallaRespuesta, objEditVar: objEditVarsV9[0]!, selectedIdSeleccion, encabezadoObj })
      ],
      errorMessage: 'Error al escribir selección'
    };
  }

  if (objEditVarsV9.length > 1) {
    return {
      params: [
        buildMultiseleccionV9Params({
          mac,
          destinoTrasEdicion,
          objIdUnicoEdicion,
          idPantallaRespuesta,
          indicePantallaRespuesta,
          objEditVarsV9,
          camposMultiseleccion,
          selectedIdSelecciones,
          encabezadoObj
        })
      ],
      errorMessage: 'Error al escribir selección'
    };
  }

  const objEditVarV1 = objetos.find((o) => o.tipoObjeto === 8 && (o.tipoVarEdicion as number) === 1);
  if (objEditVarV1 && camposMultiseleccion.length <= 1) {
    return { params: [buildEliminarPuntoParams({ mac, objPlantilla, objIdUnicoEdicion, objEditVarV1, encabezadoObj })], errorMessage: 'Error al eliminar punto' };
  }

  if (esRadioButton) {
    const objEditVar = objetos.find((o) => o.tipoObjeto === 8);
    const objSeleccionado = objetos.find((o) => o.tipoObjeto === 10 && (o.idSeleccion as number) === selectedIdSeleccion);
    const esConfirmacionEdicion = ((objPlantilla.tipoPlantilla as number | undefined) ?? 0) === 5;
    if (!objEditVar) return null;
    if (!esConfirmacionEdicion && (selectedIdSeleccion === null || !objSeleccionado)) return null;

    return {
      params: [
        buildRadioParams({ mac, destinoTrasEdicion, objIdUnicoEdicion, idPantallaRespuesta, indicePantallaRespuesta, objEditVar, objSeleccionado, selectedIdSeleccion, encabezadoObj, objetos })
      ],
      errorMessage: 'Error al escribir selección'
    };
  }

  if (esCheckbox) {
    if (selectedIdSelecciones.size === 0) {
      return { params: [], errorMessage: 'Error al escribir selecciones', navegarSinPeticiones: true };
    }

    const objEditVars = objetos.filter((o) => o.tipoObjeto === 8);
    const params = buildCheckboxParams({ mac, destinoTrasEdicion, objIdUnicoEdicion, idPantallaRespuesta, indicePantallaRespuesta, objEditVars, objetos, selectedIdSelecciones, encabezadoObj });

    return { params, errorMessage: 'Error al escribir selecciones' };
  }

  return null;
}

function buildSeleccionUnicaV9Params(args: BaseWriteParamsArgs & { objEditVar: ObjBase; selectedIdSeleccion: number; encabezadoObj: ObjBase | undefined }): URLSearchParams {
  const { mac, destinoTrasEdicion, objIdUnicoEdicion, idPantallaRespuesta, indicePantallaRespuesta, objEditVar, selectedIdSeleccion, encabezadoObj } = args;
  return new URLSearchParams({
    eventId: '1',
    idEnvio: nextIdEnvio(),
    mac,
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
}

function buildMultiseleccionV9Params(
  args: BaseWriteParamsArgs & { objEditVarsV9: ObjBase[]; camposMultiseleccion: ObjBase[]; selectedIdSelecciones: Set<number>; encabezadoObj: ObjBase | undefined }
): URLSearchParams {
  const { mac, destinoTrasEdicion, objIdUnicoEdicion, idPantallaRespuesta, indicePantallaRespuesta, objEditVarsV9, camposMultiseleccion, selectedIdSelecciones, encabezadoObj } = args;
  const primeraV9 = objEditVarsV9[0]!;
  const valores = camposMultiseleccion.map((opt) => {
    const idSel = opt.idSeleccion as number;
    return selectedIdSelecciones.has(idSel) ? idSel : 0;
  });
  const params = new URLSearchParams({
    eventId: '1',
    idEnvio: nextIdEnvio(),
    mac,
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

  return params;
}

function buildEliminarPuntoParams(args: { mac: string; objPlantilla: ObjBase; objIdUnicoEdicion: ObjBase; objEditVarV1: ObjBase; encabezadoObj: ObjBase | undefined }): URLSearchParams {
  const { mac, objPlantilla, objIdUnicoEdicion, objEditVarV1, encabezadoObj } = args;
  const indicePantallaActual = objPlantilla.indicePantalla as number;
  const idPantallaActual = objPlantilla.idPantalla as number;

  return new URLSearchParams({
    esPantallaPrincipal: '0',
    readWrite: '1',
    eventId: '255',
    idEnvio: nextIdEnvio(),
    mac,
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
}

function buildRadioParams(
  args: BaseWriteParamsArgs & { objEditVar: ObjBase; objSeleccionado: ObjBase | undefined; selectedIdSeleccion: number | null; encabezadoObj: ObjBase | undefined; objetos: ObjBase[] }
): URLSearchParams {
  const { mac, destinoTrasEdicion, objIdUnicoEdicion, idPantallaRespuesta, indicePantallaRespuesta, objEditVar, objSeleccionado, selectedIdSeleccion, encabezadoObj, objetos } = args;
  const valorVariableSeleccion = selectedIdSeleccion !== null ? String(selectedIdSeleccion) : String((objetos.find((o) => o.tipoObjeto === 10)?.opcionSeleccionada as number | undefined) ?? 0);
  const textoNombreVariable = objSeleccionado ? String(objSeleccionado.textoVar as number) : String((objEditVar.textoVar as number | undefined) ?? 0);

  return new URLSearchParams({
    eventId: '255',
    idEnvio: nextIdEnvio(),
    mac,
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
}

function buildCheckboxParams(args: BaseWriteParamsArgs & { objEditVars: ObjBase[]; objetos: ObjBase[]; selectedIdSelecciones: Set<number>; encabezadoObj: ObjBase | undefined }): URLSearchParams[] {
  const { mac, destinoTrasEdicion, objIdUnicoEdicion, idPantallaRespuesta, indicePantallaRespuesta, objEditVars, objetos, selectedIdSelecciones, encabezadoObj } = args;
  const params: URLSearchParams[] = [];
  const selectedIds = Array.from(selectedIdSelecciones);

  for (let idx = 0; idx < objEditVars.length; idx++) {
    const objEditVar = objEditVars[idx]!;
    const idSeleccionParaEsteVar = selectedIds[idx];
    if (idSeleccionParaEsteVar === undefined) continue;

    const objSeleccionado = objetos.find((o) => o.tipoObjeto === 10 && (o.idSeleccion as number) === idSeleccionParaEsteVar);
    if (!objSeleccionado) continue;

    params.push(
      new URLSearchParams({
        eventId: '255',
        idEnvio: nextIdEnvio(),
        mac,
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
      })
    );
  }

  return params;
}
