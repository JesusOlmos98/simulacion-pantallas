import { type NextRequest } from 'next/server';
import { parseObjetosPintaPantallasOmegaFromPayload } from '@/src/utils/common-lib-commac-generador/NXP_BE/get/getObjPintaPantallasOmega';
import type { ObjPintaPantalla } from '@/src/utils/common-lib-commac-generador/NXP_BE/dtoBE/objetosPintaPantallaOmega.dto';
import { mlogger } from '@/src/utils/common-lib-commac-generador/ctilogs';
import { buildScreenFrameHex, type EventBusDataPantalla } from './screen-command-helpers';

const COMMAC_BASE_URL = process.env.NEXT_PUBLIC_COMMAC_BASE_URL ?? 'http://localhost:8020/api';
// process.env['COMMAC_BASE_URL'] ?? (process.env['NODE_ENV'] === 'production' ? process.env['NEXT_PUBLIC_COMMAC_BASE_URL'] : undefined) ?? 'http://127.0.0.1:8020/api';
const COMMAC_AUTH_TOKEN = process.env.TOKEN?.trim();
const SCREEN_ENDPOINT_PATH = '/device/screen';
const READWRITE_ERROR = { TIMEOUT: 1, DUPLICATE_PENDING: 2, BUSY: 3, VALIDATION_ERROR: 4, CAUGHT_ERROR: 5 } as const;

type ScreenCommandResponse = { status?: boolean; data?: unknown; payload?: unknown };

export async function POST(request: NextRequest): Promise<Response> {
  try {
    const query = request.nextUrl.searchParams;
    const mac = requiredString(query, 'mac');
    const readWrite = readWriteFromQuery(query);
    const versionEquipo = intFromQuery(query, 'versionEquipo') ?? 304;
    const data = eventBusDataPantallaFromQuery(query);
    const frameHex = buildScreenFrameHex({ readWrite, versionEquipo, data });
    const commacUrl = `${COMMAC_BASE_URL}${SCREEN_ENDPOINT_PATH}`;
    const commacBody = { mac, payload: frameHex };
    const commacHeaders: Record<string, string> = { 'content-type': 'application/json' };
    if (COMMAC_AUTH_TOKEN) {
      commacHeaders.authorization = `Bearer ${COMMAC_AUTH_TOKEN}`;
    }

    mlogger.info(`Pedimos a endpoint ${commacUrl} con body mac=${commacBody.mac} payload=${commacBody.payload}`);

    const commacResponse = await fetch(commacUrl, { method: 'POST', headers: commacHeaders, body: JSON.stringify(commacBody), signal: AbortSignal.timeout(35_000) });
    const commacResponseText = await commacResponse.text();
    const commacContentType = commacResponse.headers.get('content-type') ?? '';

    mlogger.info(`Recibimos respuesta status=${commacResponse.status} content-type=${commacContentType} body=${commacResponseText}`);

    if (!commacResponse.ok) {
      return Response.json({ error: `COMMAC respondio con ${commacResponse.status}`, body: commacResponseText }, { status: commacResponse.status });
    }

    const command = parseScreenCommandResponse(commacResponseText);
    const responseHex = getScreenResponseHex(command);

    // mlogger.info(`Recibimos JSON data=${responseHex !== '' ? responseHex : '<data no string>'} status=${String(command.status)}`);

    if (command.status === false) {
      return responseHex.length === 2 && isValidHex(responseHex)
        ? responseError(responseHex)
        : Response.json({ error: 'COMMAC no devolvio respuesta screen valida', commacUrl: `${COMMAC_BASE_URL}${SCREEN_ENDPOINT_PATH}` }, { status: 502 });
    }

    if (!isValidHex(responseHex)) {
      return Response.json({ error: 'Respuesta screen invalida: payload no es hex', command }, { status: 502 });
    }

    if (responseHex.length === 2) {
      return responseError(responseHex);
    }

    const responseFrame = Buffer.from(responseHex, 'hex');
    const payload = getDataSectionSt(responseFrame);
    const objetos = parseObjetosPintaPantallasOmegaFromPayload(payload, payload.length, false);

    return Response.json(objetos satisfies ObjPintaPantalla[]);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error de red';
    const status = err instanceof DOMException && err.name === 'TimeoutError' ? 504 : 500;
    return Response.json({ error: message }, { status });
  }
}

function getScreenResponseHex(command: ScreenCommandResponse): string {
  if (typeof command.data === 'string') {
    return command.data;
  }

  if (typeof command.payload === 'string') {
    return command.payload;
  }

  return '';
}

function parseScreenCommandResponse(responseText: string): ScreenCommandResponse {
  if (responseText.trim() === '') {
    throw new Error('COMMAC devolvio cuerpo vacio');
  }

  try {
    return JSON.parse(responseText) as ScreenCommandResponse;
  } catch {
    throw new Error('COMMAC devolvio una respuesta que no es JSON valido');
  }
}

function eventBusDataPantallaFromQuery(query: URLSearchParams): EventBusDataPantalla {
  const data: EventBusDataPantalla = { esPantallaPrincipal: requiredInt(query, 'esPantallaPrincipal') as 0 | 1 };

  setOptionalInt(data, query, 'idNav');
  setOptionalInt(data, query, 'indicePantalla');
  setOptionalInt(data, query, 'idUnicoEdicion');
  setOptionalInt(data, query, 'navIdPantallaRespuestaTrama');
  setOptionalInt(data, query, 'navegacion');
  setOptionalInt(data, query, 'tipoVariableEdicion');
  setOptionalNumber(data, query, 'valorVariable');
  setOptionalInt(data, query, 'punteroVariableEdicion');
  setOptionalInt(data, query, 'textoTituloVariable');
  setOptionalInt(data, query, 'textoNombreVariable');
  setOptionalInt(data, query, 'textoOpcionCambioParametro');
  setOptionalInt(data, query, 'textoOpcionCambioParametroPersonalizado');
  setOptionalInt(data, query, 'punteroFuncionSaltoTrasEdit');
  setOptionalInt(data, query, 'idUsuarioServidor');
  setOptionalInt(data, query, 'idClienteServidor');
  setOptionalInt(data, query, 'numDatosEditar');

  const valorVariableTexto = query.get('valorVariableTexto');
  if (valorVariableTexto !== null) {
    data.valorVariableTexto = valorVariableTexto;
  }

  const valorVariableHex = query.get('valorVariableHex');
  if (valorVariableHex !== null) {
    if (!isValidHex(valorVariableHex)) {
      throw new Error('valorVariableHex invalido');
    }
    data.valorVariableHex = valorVariableHex;
  }

  const valores = intArrayFromQuery(query, 'valores');
  if (valores.length > 0) {
    data.valores = valores;
  }

  const punteros = intArrayFromQuery(query, 'punterosVariablesEdicion');
  if (punteros.length > 0) {
    data.punterosVariablesEdicion = punteros;
  }

  const textos = intArrayFromQuery(query, 'textosNombreVariable');
  if (textos.length > 0) {
    data.textosNombreVariable = textos;
  }

  return data;
}

function responseError(hex: string): Response {
  const code = Buffer.from(hex, 'hex').readUInt8(0);
  const status =
    code === READWRITE_ERROR.TIMEOUT
      ? 504
      : code === READWRITE_ERROR.DUPLICATE_PENDING
        ? 409
        : code === READWRITE_ERROR.BUSY
          ? 409
          : code === READWRITE_ERROR.VALIDATION_ERROR
            ? 400
            : code === READWRITE_ERROR.CAUGHT_ERROR
              ? 502
              : 502;

  return Response.json({ error: readWriteErrorName(code), code }, { status });
}

function readWriteErrorName(code: number): string {
  switch (code) {
    case READWRITE_ERROR.TIMEOUT:
      return 'TIMEOUT';
    case READWRITE_ERROR.DUPLICATE_PENDING:
      return 'DUPLICATE_PENDING';
    case READWRITE_ERROR.BUSY:
      return 'BUSY';
    case READWRITE_ERROR.VALIDATION_ERROR:
      return 'VALIDATION_ERROR';
    case READWRITE_ERROR.CAUGHT_ERROR:
      return 'CAUGHT_ERROR';
    default:
      return `READWRITE_ERROR_${code}`;
  }
}

function readWriteFromQuery(query: URLSearchParams): 0 | 1 {
  const readWrite = requiredInt(query, 'readWrite');
  if (readWrite !== 0 && readWrite !== 1) {
    throw new Error('readWrite debe ser 0 o 1');
  }
  return readWrite;
}

function requiredString(query: URLSearchParams, key: string): string {
  const value = query.get(key);
  if (value === null || value === '') {
    throw new Error(`${key} es requerido`);
  }
  return value;
}

function requiredInt(query: URLSearchParams, key: string): number {
  const value = intFromQuery(query, key);
  if (value === undefined) {
    throw new Error(`${key} debe ser entero`);
  }
  return value;
}

function intFromQuery(query: URLSearchParams, key: string): number | undefined {
  const value = query.get(key);
  if (value === null || value === '') return undefined;
  const n = Number(value);
  if (!Number.isFinite(n) || !Number.isInteger(n)) return undefined;
  return n;
}

function numberFromQuery(query: URLSearchParams, key: string): number | undefined {
  const value = query.get(key);
  if (value === null || value === '') return undefined;
  const n = Number(value);
  if (!Number.isFinite(n)) return undefined;
  return n;
}

function intArrayFromQuery(query: URLSearchParams, key: string): number[] {
  return query.getAll(key).map((value) => {
    const n = Number(value);
    if (!Number.isFinite(n) || !Number.isInteger(n)) {
      throw new Error(`${key} contiene un valor no entero`);
    }
    return n;
  });
}

function setOptionalInt(target: EventBusDataPantalla, query: URLSearchParams, key: keyof EventBusDataPantalla & string): void {
  const value = intFromQuery(query, key);
  if (value !== undefined) {
    (target as Record<string, unknown>)[key] = value;
  }
}

function setOptionalNumber(target: EventBusDataPantalla, query: URLSearchParams, key: keyof EventBusDataPantalla & string): void {
  const value = numberFromQuery(query, key);
  if (value !== undefined) {
    (target as Record<string, unknown>)[key] = value;
  }
}

function isValidHex(value: string): boolean {
  return value.length > 0 && value.length % 2 === 0 && /^[0-9a-fA-F]+$/.test(value);
}

function getDataSectionSt(frame: Buffer): Buffer {
  const startLength = 4;
  const headerSize = 10;
  const lengthOffset = startLength + 8;
  if (frame.length < startLength + headerSize + 2 + 4) {
    throw new Error('Respuesta screen invalida: frame ST demasiado corto');
  }

  const dataLength = frame.readUInt16LE(lengthOffset);
  const dataStart = startLength + headerSize;
  const dataEnd = dataStart + dataLength;
  if (dataEnd + 2 + 4 > frame.length) {
    throw new Error('Respuesta screen invalida: longitud de payload fuera de rango');
  }

  return frame.subarray(dataStart, dataEnd);
}
