---
trigger: glob
description: Message routing and classification logic for NXP protocol
---

# NXP Protocol Message Routing and Classification

## Frame Type Routing

- **Central-Server Frames** (`EnTipoTramaOld.centralServidor`):
  - `tmTramaPresentacionCentral` → `PresentacionMsgOld.procesaOld()`
  - `tmRtPresenciaCentral` → `PresentacionMsgOld.marcarPresenciaOk()`
  - `tmEnviaParametroHistorico` → `EnviaEstadisticoMsgOldPrimeraGeneracion.process()`
  - `tmRtTablaCentralMas/Fin` → Table management in `StoreTablasDispositivosCentralesService`

- **Omega Screen Frames** (`EnTipoTramaOld.omegaPantallaPlaca`):
  - `tmOmegaPantallaPlacaEnviaEstadistico` → `EnviaEstadisticoMsgOldOmega.process()`
  - `tmOmegaPantallaPlacaRtPantalla` → Screen object processing
  - `tmOmegaPantallaPlacaRtEstadistico` → ACK handling

- **Key-Value Frames** (`EnTipoTramaOld.serviciosClaveValor`):
  - All messages → `EnviaSCVMsg.process()` (Silows3V2 devices)

## Device Family Routing

- **Omega Devices**: Use `EnviaEstadisticoMsgOldOmega`
- **First-Generation Devices**: Use `EnviaEstadisticoMsgOldPrimeraGeneracion`
- **Central Devices**: Table management and presence handling
- **SCV Devices**: Specialized key-value service handling

## Parsing Functions Location

- **Omega Statistics**: `src/utils/common-lib-commac-generador/NXP_BE/get/getEstadisticoPayloadOmega.ts`
- **First-Generation Statistics**: `src/utils/common-lib-commac-generador/NXP_BE/get/getEstadisticoPayloadPrimeraGeneracion.ts`
- **Screen Objects**: `src/utils/common-lib-commac-generador/NXP_BE/get/getObjPintaPantallasOmega.ts`
- **Table Devices**: `src/utils/common-lib-commac-generador/NXP_BE/get/getTablaDispositivos.ts`

## Response Handling

- **OK Status**: Forward response to frame constructor
- **REPEATED Status**: Handle duplicate message detection
- **Error Status**: Return appropriate error response
- **Unknown Messages**: Route to `MsgUnknown.procesa()`

## NXP-Specific Message Flow

1. Parse frame type and message type (big-endian)
2. Route to appropriate handler based on device family
3. Process device-specific logic (tables, statistics, etc.)
4. Set frame type in response DTO
5. Return to parser for frame construction

## Complex Routing Scenarios

- **Table Management**: Multi-frame table assembly (MAS + FIN)
- **Presence with CRC**: Table CRC validation and re-request
- **Screen Objects**: Variable-length screen object parsing
- **Device Discovery**: Central device table management
