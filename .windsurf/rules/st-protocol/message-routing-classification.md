---
trigger: glob
description: Message routing and classification logic for ST protocol
---

# ST Protocol Message Routing and Classification

## Frame Type Routing

- **System Frames** (`EnTipoTrama.sistema`):
  - `txPresentacion` → `PresentacionMsg.procesa()`
  - `txPresencia` → `PresenciaMsg.procesa()`
  - `txEstadoDispositivo` → `EstadoDispositivoMsg.procesa()`
  - `txUrlDescargaOta` → `OTAmsg.procesa()`

- **Statistics Frames** (`EnTipoTrama.estadisticos`):
  - `enviaEstadistico` → `EnviaEstadisticoMsg.process()`

- **Key-Value Frames** (`EnTipoTrama.serviciosClaveValor`):
  - All messages → `KeyValueManagerService.process()`

## Global Message Mode

- **System Messages**: Require `globalMsgMode > 0` to process
- **Statistics Messages**: Blocked when `globalMsgMode >= 10`
- **Debug Mode**: Statistics enabled after 2 messages when `globalMsgMode < 10`

## Response Handling

- **OK Status**: Forward response to frame constructor
- **REPEATED Status**: Handle duplicate message detection
- **Error Status**: Return appropriate error response
- **Unknown Messages**: Route to `MsgUnknown.procesa()`

## ST-Specific Message Flow

1. Parse frame type and message type (little-endian)
2. Check global message mode
3. Route to appropriate handler
4. Process response
5. Set frame type in response DTO
6. Return to parser for frame construction

## Parsing Functions Location

- **Statistics**: `src/utils/common-lib-commac-generador/ST_LE/get/getEstadistico.ts`
- **Helpers**: `src/utils/common-lib-commac-generador/ST_LE/get/` for other ST parsing functions
- **CRC Functions**: `src/utils/common-lib-commac-generador/crc.ts`

## Device Types

- **ST Devices**: Single unified device type
- **Unified Statistics**: Single statistics handler for all ST devices
- **Simple Flow**: Presentation → Presence → Statistics
