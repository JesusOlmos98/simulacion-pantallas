import { EnTmOmegaPantallaPlaca } from '@/src/utils/common-lib-commac-generador/enumTipoMensaje';
import { EnObjPintaPantallasOmega, EnTipoVariable } from '@/src/utils/common-lib-commac-generador/NXP_BE/globals/enumOld';
import { crc16IBM } from '@/src/utils/common-lib-commac-generador/crc';

const START = Buffer.from([0xcc, 0xaa, 0xaa, 0xaa]);
const END = Buffer.from([0xcc, 0xbb, 0xbb, 0xbb]);
const PROTO_VERSION = 2;
const MAX_DATA_BYTES = 2480;
const TT_OMEGA_PANTALLA_PLACA = 13;

interface FrameDtoLike {
  inicioTrama: Buffer;
  versionProtocolo: number;
  reserva: number;
  nodoOrigen: number;
  nodoDestino: number;
  tipoTrama: number;
  tipoMensaje: number;
  longitud: number;
  datos: Buffer;
  crc: number;
  finTrama: Buffer;
}

export type EventBusDataPantalla = {
  esPantallaPrincipal: 0 | 1;
  idNav?: number;
  indicePantalla?: number;
  idUnicoEdicion?: number;
  navIdPantallaRespuestaTrama?: number;
  navegacion?: number;
  tipoVariableEdicion?: number;
  valorVariable?: number;
  punteroVariableEdicion?: number;
  textoTituloVariable?: number;
  textoNombreVariable?: number;
  textoOpcionCambioParametro?: number;
  textoOpcionCambioParametroPersonalizado?: number;
  valorVariableTexto?: string;
  valores?: number[];
  punterosVariablesEdicion?: number[];
  textosNombreVariable?: number[];
  numDatosEditar?: number;
  punteroFuncionSaltoTrasEdit?: number;
  idUsuarioServidor?: number;
  idClienteServidor?: number;
  valorVariableHex?: string;
};

export enum PantallaWriteKind {
  STRING = 2,
  MULTI = 3,
  VENTILACION = 4,
  SIMPLE = 5
}

export interface PantallaRequestBuildResult {
  tipoMensaje: EnTmOmegaPantallaPlaca;
  payload: Buffer;
}

export interface ScreenFrameBuildInput {
  readWrite: 0 | 1;
  versionEquipo: number;
  data: EventBusDataPantalla;
}

export function buildScreenFrameHex(input: ScreenFrameBuildInput): string {
  const { tipoMensaje, payload } = buildPantallaRequest(input.versionEquipo, { readWrite: input.readWrite, data: input.data });

  const frame = crearFrame({ nodoOrigen: 0, nodoDestino: 0, tipoTrama: TT_OMEGA_PANTALLA_PLACA, tipoMensaje, data: payload });

  return serializarFrame(frame).toString('hex');
}

function crearFrame(params: { nodoOrigen: number; nodoDestino: number; tipoTrama: number; tipoMensaje: number; data: Buffer; reserva?: number; versionProtocolo?: number }): FrameDtoLike {
  const { nodoOrigen, nodoDestino, tipoTrama, tipoMensaje, data, reserva = 0, versionProtocolo = PROTO_VERSION } = params;

  if (data.length > MAX_DATA_BYTES) {
    throw new Error(`El cuerpo supera ${MAX_DATA_BYTES} bytes`);
  }

  return { inicioTrama: START, versionProtocolo, reserva, nodoOrigen, nodoDestino, tipoTrama, tipoMensaje, longitud: data.length, datos: data, crc: 0, finTrama: END };
}

function serializarFrame(f: FrameDtoLike): Buffer {
  const header = Buffer.alloc(10);
  let offset = 0;
  header.writeUInt8(f.versionProtocolo, offset);
  offset += 1;
  header.writeUInt8(f.reserva, offset);
  offset += 1;
  header.writeUInt16LE(f.nodoOrigen, offset);
  offset += 2;
  header.writeUInt16LE(f.nodoDestino, offset);
  offset += 2;
  header.writeUInt8(f.tipoTrama, offset);
  offset += 1;
  header.writeUInt8(f.tipoMensaje, offset);
  offset += 1;
  header.writeUInt16LE(f.longitud, offset);

  const crcBuf = Buffer.alloc(2);
  crcBuf.writeUInt16BE(crc16IBM(Buffer.concat([header, f.datos])), 0);

  return Buffer.concat([f.inicioTrama, header, f.datos, crcBuf, f.finTrama]);
}

export function buildPantallaRequest(versionEquipo: number, msgEvent: Pick<ScreenFrameBuildInput, 'readWrite' | 'data'>): PantallaRequestBuildResult {
  const { data } = msgEvent;

  if (msgEvent.readWrite === 0 && data.esPantallaPrincipal === 1) {
    return { tipoMensaje: EnTmOmegaPantallaPlaca.tmOmegaPantallaPlacaPidePantallaPrincipal, payload: buildPantallaPrincipalPayload(versionEquipo, data.idUnicoEdicion ?? 0) };
  }

  if (msgEvent.readWrite === 1) {
    return { tipoMensaje: EnTmOmegaPantallaPlaca.tmOmegaPantallaPlacaCambioParametro, payload: buildPantallaWritePayload(versionEquipo, data).payload };
  }

  return { tipoMensaje: EnTmOmegaPantallaPlaca.tmOmegaPantallaPlacaPidePantalla, payload: buildPantallaReadPayload(versionEquipo, data) };
}

export function buildPantallaPrincipalPayload(versionEquipo: number, modoEdicion = 0): Buffer {
  const payload = Buffer.alloc(15);
  let off = 0;

  payload.writeUInt32BE(Number(modoEdicion) >>> 0, off);
  off += 4;
  payload.writeUInt8(0, off);
  off += 1;
  payload.writeUInt16BE(0, off);
  off += 2;
  payload.writeUInt16BE(versionEquipo & 0xffff, off);
  off += 2;
  payload.writeUInt16BE(versionEquipo & 0xffff, off);
  off += 2;
  payload.writeUInt32BE(0, off);

  return payload;
}

export function buildPantallaReadPayload(versionEquipo: number, data: EventBusDataPantalla): Buffer {
  const payload = Buffer.alloc(17);
  let off = 0;

  payload.writeUInt16BE(versionEquipo & 0xffff, off);
  off += 2;
  payload.writeUInt32BE((data.idNav ?? 0) >>> 0, off);
  off += 4;
  payload.writeUInt8((data.indicePantalla ?? 0) & 0xff, off);
  off += 1;
  payload.writeUInt32BE((data.idUnicoEdicion ?? 0) >>> 0, off);
  off += 4;
  payload.writeUInt16BE((data.idUsuarioServidor ?? 0) & 0xffff, off);
  off += 2;
  payload.writeUInt32BE((data.idClienteServidor ?? 0) >>> 0, off);

  return payload;
}

export function buildPantallaWritePayload(versionEquipo: number, data: EventBusDataPantalla): { payload: Buffer; kind: PantallaWriteKind } {
  const chunks: Buffer[] = [];
  const wU8 = (n: number): void => {
    chunks.push(Buffer.from([n & 0xff]));
  };
  const wU16 = (n: number): void => {
    const b = Buffer.alloc(2);
    b.writeUInt16BE(n & 0xffff, 0);
    chunks.push(b);
  };
  const wU32 = (n: number): void => {
    const b = Buffer.alloc(4);
    b.writeUInt32BE(n >>> 0, 0);
    chunks.push(b);
  };

  const tipoVarEdicion = Number(data.tipoVariableEdicion ?? 0) & 0xff;
  const ptrFuncionSaltoTrasEdit = Number(data.punteroFuncionSaltoTrasEdit ?? 0) >>> 0;
  const textoTituloVariable = Number(data.textoTituloVariable ?? 0) & 0xffff;
  const textoNombreVariable = Number(data.textoNombreVariable ?? 0) & 0xffff;
  const textoOpcionCambioParametro = Number(data.textoOpcionCambioParametro ?? 0) & 0xffff;
  const textoOpcionCambioParametroPersonalizado = Number(data.textoOpcionCambioParametroPersonalizado ?? 0) & 0xffff;

  wU16(versionEquipo & 0xffff);
  wU16(EnObjPintaPantallasOmega.objIdUnicoEdicion);
  wU8(Number(data.idUnicoEdicion ?? 0) & 0xff);
  wU16(EnObjPintaPantallasOmega.objPantallaRespuestaTrama);
  wU32(Number(data.navIdPantallaRespuestaTrama ?? 0) >>> 0);
  wU8(Number(data.indicePantalla ?? 0) & 0xff);
  wU32(Number(data.navegacion ?? 0) >>> 0);
  wU16(Number(data.idUsuarioServidor ?? 0) & 0xffff);
  wU32(Number(data.idClienteServidor ?? 0) >>> 0);

  if (typeof data.valorVariableTexto === 'string') {
    wU16(EnObjPintaPantallasOmega.objCambioParametroString);
    wU8(tipoVarEdicion);
    chunks.push(packString32(data.valorVariableTexto));
    wU32(Number(data.punteroVariableEdicion ?? 0) >>> 0);
    wU32(ptrFuncionSaltoTrasEdit);
    wU16(textoTituloVariable);
    wU16(textoNombreVariable);
    wU16(textoOpcionCambioParametro);

    return { payload: Buffer.concat(chunks), kind: PantallaWriteKind.STRING };
  }

  if (isPantallaMultiCambio(data)) {
    const valores = (data.valores ?? []).map((x) => Number(x));
    const ptrs = (data.punterosVariablesEdicion ?? []).map((x) => Number(x) >>> 0);
    const textos = (data.textosNombreVariable ?? []).map((x) => Number(x) & 0xffff);
    const n = Math.min(valores.length, ptrs.length, textos.length);

    for (let i = 0; i < n; i++) {
      wU16(EnObjPintaPantallasOmega.objCambioParametro);
      wU8(tipoVarEdicion);
      chunks.push(packValorVariable4B(tipoVarEdicion, valores[i]!));
      wU32(ptrs[i]!);
      wU32(ptrFuncionSaltoTrasEdit);
      wU16(textoTituloVariable);
      wU16(textos[i]!);
      wU16(textoOpcionCambioParametro);
      wU16(textoOpcionCambioParametroPersonalizado);
    }

    return { payload: Buffer.concat(chunks), kind: PantallaWriteKind.MULTI };
  }

  if (isPantallaVentilacionGrupo(data)) {
    const valoresArr = (data.valores ?? []).map((x) => Number(x) & 0xff);
    const numDatosEditar = Number(data.numDatosEditar ?? valoresArr.length) & 0xff;

    wU16(EnObjPintaPantallasOmega.objCambioParametroVentilacionGrupo);
    wU8(tipoVarEdicion);
    wU16(textoTituloVariable);
    wU16(textoNombreVariable);
    wU32(Number(data.punteroVariableEdicion ?? 0) >>> 0);
    wU32(ptrFuncionSaltoTrasEdit);
    wU8(numDatosEditar);

    for (let i = 0; i < numDatosEditar; i++) {
      wU8(valoresArr[i] ?? 0);
    }

    return { payload: Buffer.concat(chunks), kind: PantallaWriteKind.VENTILACION };
  }

  wU16(EnObjPintaPantallasOmega.objCambioParametro);
  wU8(tipoVarEdicion);
  chunks.push(data.valorVariableHex !== undefined ? hexToBuffer(data.valorVariableHex) : packValorVariable4B(tipoVarEdicion, Number(data.valorVariable ?? 0)));
  wU32(Number(data.punteroVariableEdicion ?? 0) >>> 0);
  wU32(ptrFuncionSaltoTrasEdit);
  wU16(textoTituloVariable);
  wU16(textoNombreVariable);
  wU16(textoOpcionCambioParametro);
  wU16(textoOpcionCambioParametroPersonalizado);

  return { payload: Buffer.concat(chunks), kind: PantallaWriteKind.SIMPLE };
}

function isPantallaMultiCambio(data: EventBusDataPantalla): boolean {
  return Array.isArray(data.punterosVariablesEdicion) || Array.isArray(data.textosNombreVariable);
}

function isPantallaVentilacionGrupo(data: EventBusDataPantalla): boolean {
  return !isPantallaMultiCambio(data) && Array.isArray(data.valores) && data.punteroVariableEdicion !== undefined;
}

function isTipoVariableString32(tipoVarEdicion: number): boolean {
  return (
    tipoVarEdicion === EnTipoVariable.string32 ||
    tipoVarEdicion === EnTipoVariable.stringUnicode16 ||
    tipoVarEdicion === EnTipoVariable.pStringUnicode16 ||
    tipoVarEdicion === EnTipoVariable.pString32 ||
    tipoVarEdicion === EnTipoVariable.pStringUnicode16Simple ||
    tipoVarEdicion === EnTipoVariable.stringUnicode16Simple
  );
}

function packValorVariable4B(tipoVarEdicion: number, valor: number): Buffer {
  if (isTipoVariableString32(tipoVarEdicion)) {
    return packString32(String(valor));
  }

  const b = Buffer.alloc(4);

  switch (tipoVarEdicion) {
    case EnTipoVariable.float:
    case EnTipoVariable.float0:
    case EnTipoVariable.float1:
    case EnTipoVariable.float2:
    case EnTipoVariable.float3:
    case EnTipoVariable.float1ConSigno:
    case EnTipoVariable.pFloat:
    case EnTipoVariable.pFloat0:
    case EnTipoVariable.pFloat1:
    case EnTipoVariable.pFloat2:
    case EnTipoVariable.pFloat3:
      b.writeFloatBE(Number(valor) || 0, 0);
      return b;
    case EnTipoVariable.int8:
      b.writeInt32BE((Number(valor) << 24) >> 24, 0);
      return b;
    case EnTipoVariable.uint8:
      b.writeUInt32BE(Number(valor) & 0xff, 0);
      return b;
    case EnTipoVariable.int16:
      b.writeInt32BE((Number(valor) << 16) >> 16, 0);
      return b;
    case EnTipoVariable.uint16:
      b.writeUInt32BE(Number(valor) & 0xffff, 0);
      return b;
    case EnTipoVariable.int32:
    case EnTipoVariable.pInt32:
      b.writeInt32BE(Number(valor) | 0, 0);
      return b;
    case EnTipoVariable.uint32:
    case EnTipoVariable.pUint32:
    case EnTipoVariable.pUint32C2Unidos:
    case EnTipoVariable.icono:
      b.writeUInt32BE(Number(valor) >>> 0, 0);
      return b;
    case EnTipoVariable.tiempoHm:
      b.writeUInt32BE((Number(valor) >>> 0) & 0xffff, 0);
      return b;
    case EnTipoVariable.tiempoMs:
    case EnTipoVariable.tiempo:
    case EnTipoVariable.tiempoHms:
    case EnTipoVariable.pTiempo:
    case EnTipoVariable.pTiempoHm:
    case EnTipoVariable.pTiempoMs:
    case EnTipoVariable.pTiempoHms:
      b.writeUInt32BE(Number(valor) >>> 0, 0);
      return b;
    case EnTipoVariable.texto:
      b.writeInt32BE(Number(valor) | 0, 0);
      return b;
    default:
      b.writeUInt32BE(Number(valor) >>> 0, 0);
      return b;
  }
}

function packString32(valor: string): Buffer {
  const buf = Buffer.alloc(32, 0x00);
  if (!valor) return buf;

  const src = Buffer.from(valor.slice(0, 16), 'utf16le');
  src.copy(buf, 0, 0, Math.min(src.length, 32));

  return buf;
}

function hexToBuffer(hex: string): Buffer {
  const clean = hex.replace(/\s+/g, '');
  if (clean.length === 0 || clean.length % 2 !== 0 || !/^[0-9a-fA-F]+$/.test(clean)) {
    throw new Error(`Hex invalido: "${hex}"`);
  }
  return Buffer.from(clean, 'hex');
}
