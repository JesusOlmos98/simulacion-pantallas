# Frontend to COMMAC Raw Screen Buffer Flow

## Goal

Screen requests are moving from the legacy EventBus-style flow to the command-based flow. The frontend must build the full device TCP frame for screen navigation/actions, serialize it as a hexadecimal string, and send it to COMMAC as a `type: "screen"` command.

COMMAC no longer interprets screen navigation fields or builds screen frames for this new flow. For `type: "screen"`, COMMAC only receives the already-built hex frame, converts it to a `Buffer`, sends it to the target device socket, tracks the pending request, waits for the screen response, and returns the complete response frame as hex.

## New Input Contract

The frontend should send this object shape:

```ts
export class RabbitMqCommandScreenDto {
  @IsString({ message: 'type debe ser string' })
  @IsIn(['screen'], { message: 'type debe ser screen' })
  type!: 'screen';

  @IsString({ message: 'mac debe ser string' })
  @Matches(/^\d+$/, { message: 'mac debe contener solo digitos' })
  mac!: string;

  @IsString({ message: 'data debe ser string hex' })
  @Matches(/^(?:[0-9a-fA-F]{2})+$/, { message: 'data debe ser hex no vacio y de longitud par' })
  data!: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'readWrite debe ser entero' })
  @IsIn([0, 1], { message: 'readWrite debe ser 0 (read) o 1 (write)' })
  readWrite?: 0 | 1;

  @IsDefined({ message: 'cid es requerido' })
  cid!: number | string;
}
```

Example payload:

```json
{
  "mac": "202000029",
  "type": "screen",
  "data": "bufferHexLarguisimo",
  "readWrite": 0,
  "cid": 1
}
```

For local/manual simulation, the command is sent to:

```txt
POST /pruebas/rabbitmq-command-simulator-screen
```

Production RabbitMQ uses:

```txt
EXCH_FROM_CORE
commands.core.to.commac
```

COMMAC responds through:

```txt
EXCH_FROM_COMMAC
commands.commac.to.core
```

## Deprecated Flow

Previously, the frontend called the legacy `peticionPantallaConEspera` endpoint in:

```txt
src/management-msg/pruebas/simulacion-pinta-pantallas.controller.ts
```

The frontend sent many semantic screen/navigation fields, such as:

- `idNav`
- `indicePantalla`
- `esPantallaPrincipal`
- edit/navigation metadata
- variable pointers
- values to write
- user/client identifiers

COMMAC then validated and interpreted those fields, selected the screen message type, serialized the payload, created the protocol frame with helpers such as `crearFrame()` / `crearFrameOld()`, serialized it, wrote it to the socket, registered pending state, waited for the response, parsed or forwarded the screen payload, and resolved the simulator request.

That path is now deprecated for the new frontend screen flow. It remains available only for compatibility/testing while the frontend migration is completed.

## New Flow

The frontend now owns screen frame construction.

Frontend responsibilities:

- Gather all screen navigation/edit variables.
- Validate those variables before sending.
- Serialize the screen payload exactly as the target protocol expects.
- Build the complete TCP frame that will be sent to the final device.
- Include protocol header, version, nodes, TT/TM, payload size, CRC, and tail.
- Convert the complete frame bytes to a hex string.
- Send the `CommacToCoreCommand` object with `type: "screen"`, `mac`, `data`, `readWrite`, and `cid`.

COMMAC responsibilities for `type: "screen"`:

- Receive the command from RabbitMQ or the simulator endpoint.
- Validate only the command shell: MAC, required CID, `readWrite`, and non-empty even-length hex `data`.
- Convert `data` with `Buffer.from(command.data, "hex")`.
- Register pending using logical `mac:cid`.
- Resolve the output socket:
  - ST/direct devices: send to the device MAC socket.
  - NXP devices behind a central: send to the central socket, using the central table route, without modifying the raw frame bytes.
- Write the raw frame buffer to the device queue.
- Wait for the screen response.
- Return the complete received response frame as hex, preserving the original `cid`.

## Server Changes Already Implemented

`src/management-msg/pruebas/pruebas.dto.ts`

- Added `RabbitMqCommandScreenDto`.
- `data` is a required hex string.
- `cid` is required and can be `number | string`.

`src/management-msg/pruebas/pruebas.controller.ts`

- Added:

```txt
POST /pruebas/rabbitmq-command-simulator-screen
```

- This mirrors the SCV simulator endpoint and sends the command into the same `ReadWriteService` path used by RabbitMQ.

`src/management-msg/pruebas/pruebas.service.ts`

- Added `callScreenAndWaitResponse()`.
- It sends the screen command through `ReadWriteService.handleEventBusReadWrite()`.
- It captures the screen response command so the simulator can wait and return the result.

`src/rabbitmq/rabbitmq.controller.ts`

- `commands.core.to.commac` already routes `type: "screen"` into `ReadWriteService.handleEventBusReadWrite()`.

`src/management-msg/readWrite/readwrite.service.ts`

- Added `type === EnCommandType.screen` handling.
- Added validation for:
  - required `cid`
  - `readWrite` as `0 | 1`, defaulting to `0`
  - `data` as non-empty even-length hex
- Converts screen hex to a raw `Buffer`.
- Registers pending using the logical MAC and CID.
- Sends raw bytes directly through `DevicesQueueService.enqueueOutgoingMessage(...)`.
- Does not call `crearFrame()`, `crearFrameOld()`, `serializarFrame()`, `serializarFrameOld()`, `buildPantallaReadPayload()`, `buildPantallaWritePayload()`, or any screen-specific payload builder for the new command flow.
- Keeps legacy EventBus screen handling untouched.

`src/management-msg/readWrite/readwrite-pending.service.ts`

- Pending correlation now supports `number | string`.
- Internally the pending map uses a string correlation id.
- Existing numeric `idEnvio` flows still work.
- Screen commands can use arbitrary frontend/Core `cid` values without the old uint16 restriction.

`src/rabbitmq/rabbitmq.service.ts`

- Added `sendScreenResponseCommandToCore(request, responseFrame)`.
- Publishes:

```json
{
  "type": "screen",
  "mac": "...",
  "data": "completeResponseFrameHex",
  "readWrite": 0,
  "cid": 1
}
```

`src/tcpsocket-server/parsers/cti-parser.ts`

- ST parser now preserves the complete validated incoming frame as `rawFrame`.
- The complete frame is passed into `ClasificadorMsg`.

`src/tcpsocket-server/parsers/cti-parser-old.ts`

- NXP/OLD parser now preserves the complete validated incoming frame as `rawFrame`.
- The complete frame is passed into `ClasificadorMsgOld`.

`src/management-msg/clasificadorMsg.ts`

- ST screen responses now pass `rawFrame` into `ReadWriteService.onPantallaResponseST(...)`.

`src/management-msg/clasificadorMsg-old.ts`

- NXP/Omega screen responses now pass `rawFrame` into `ReadWriteService.onPantallaResponseOmega(...)` or `onPantallaResponseOmegaFromCentral(...)`.

## Response Contract

On success, COMMAC publishes a command response:

```json
{
  "type": "screen",
  "mac": "202000029",
  "data": "completeResponseFrameHex",
  "readWrite": 0,
  "cid": 1
}
```

Important details:

- `data` is the full TCP response frame as hex, not only the screen payload.
- `cid` is preserved from the original request.
- The frontend/Core can use `cid` to correlate the response with the original screen request.

On error/timeout, COMMAC returns the same command shape but with `data` as a one-byte legacy error code encoded as hex:

```txt
01 = TIMEOUT
02 = DUPLICATE_PENDING
04 = VALIDATION_ERROR
05 = CAUGHT_ERROR
```

Example timeout response:

```json
{
  "type": "screen",
  "mac": "202000029",
  "data": "01",
  "readWrite": 0,
  "cid": 1
}
```

## Frontend Frame Construction Notes

The most important frontend work is reproducing the frame construction that COMMAC previously did for screens.

For ST screens, COMMAC legacy code used the ST frame path:

- Build the screen payload.
- Use `crearFrame(...)`.
- Serialize with `serializarFrame(...)`.
- ST numeric fields are little endian where required by the ST protocol.
- Frame structure is `20 + payloadSize` bytes.
- Header is `0xccaaaaaa`.
- Tail is `0xccbbbbbb`.
- CRC is CRC16 IBM/ARC, 2 bytes.

For NXP/Omega/OLD screens, COMMAC legacy code used the OLD frame path:

- Build the screen payload.
- Use `crearFrameOld(...)`.
- Serialize with `serializarFrameOld(...)`.
- OLD/NXP numeric fields are big endian where required by the OLD protocol.
- Frame structure is `18 + payloadSize` bytes.
- Header is `0xccaaaaaa`.
- Tail is `0xccbbbbbb`.
- CRC is 1 byte, the LSB of CRC16 IBM/ARC.

The frontend should import/use the shared frame-building and serialization helpers from the common library where possible, instead of reimplementing CRC/endianness manually.

The frame sent in `data` must be exactly what the final device expects on the TCP socket.

## Central-Device Routing Detail

For logical NXP/Omega devices behind a central:

- The frontend still sends the logical final device MAC in `mac`.
- COMMAC uses its central-device table to resolve the actual central socket.
- COMMAC sends the raw frame to the central socket.
- COMMAC does not patch node fields or modify the raw frame.
- Therefore, the frontend-built frame must already contain the correct node information for that route.

## Current Migration Boundary

The server side is prepared for the raw screen command flow.

Remaining frontend-side migration work:

- Stop calling the deprecated screen simulation endpoint that sends semantic navigation fields.
- Build the screen frame in the frontend using the same common-library semantics COMMAC previously used.
- Send `CommacToCoreCommand` with `type: "screen"` and full frame hex in `data`.
- Wait for the command response using the same `cid`.
- Decode or parse the returned full response frame on the frontend/Core side as needed.

Legacy COMMAC screen builders remain in `readwrite.service.ts` for deprecated EventBus compatibility, but they should not be used by the new `type: "screen"` command path.
