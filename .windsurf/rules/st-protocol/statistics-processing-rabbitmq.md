---
trigger: glob
description: Statistics message processing and RabbitMQ integration rules for ST protocol
---

# ST Protocol Statistics Processing and RabbitMQ

## Statistics Message Format

- **MAC Address**: UInt32LE at offset 0
- **Data Type**: UInt8 at offset 4
- **Second ID**: UInt8 at offset 5 (used for ACK)
- **Version**: UInt8 at offset 6
- **Register Type**: UInt8 at offset 7
- **Date**: 3 bytes at offset 12-14
- **Time**: 3 bytes at offset 15-17
- **Data Number**: UInt8 at offset 19
- **Data Payload**: Starts at offset 20

## Device Validation

- **Location Lookup**: Call `ControlMetricsService.getLocation()` with MAC
- **Unregistered Device**: Return `NORESPONSE` if location = 0
- **Duplicate Detection**: Return `REPEATED` if location = -2
- **ACK Response**: Always include Second ID in response payload

## Register Type Handling

- **Statistics (2)**: Send to `EnEstadisTipoRegistro.estadisticos`
- **Alarms (3)**: Send via `sendAlarmsRabbit()`
- **Events (4)**: Send to `EnEstadisTipoRegistro.eventos`
- **Parameter Changes (1)**: Log but don't forward
- **Debug (5)**: Log but don't forward

## RabbitMQ Integration

- **Fire-and-Forget**: Use `void` for non-blocking sends
- **Message Groups**: Use appropriate `EnEstadisTipoRegistro` for routing
- **Payload Forwarding**: Send raw data bytes from offset 20
- **Metadata**: Include MAC, location, date, time, data number

## ST-Specific Processing

- **Unified Handler**: Single `EnviaEstadisticoMsg` for all ST devices
- **Consistent Format**: All statistics use same payload structure
- **Simple ACK**: 1-byte response with Second ID
- **Direct RabbitMQ**: No intermediate processing

## Parsing Functions

### ST Protocol Statistics
- **Location**: `src/utils/common-lib-commac-generador/ST_LE/get/getEstadistico.ts`
- **Function**: `getEstadisticoPayloadBytes()` and related helpers
- **Endianness**: Little endian parsing

### NXP Protocol Statistics

#### Omega Devices
- **Location**: `src/utils/common-lib-commac-generador/NXP_BE/get/getEstadisticoPayloadOmega.ts`
- **Functions**: Multiple `getEstadistico...()` functions for different payload types
- **Endianness**: Big endian parsing

#### First-Generation Devices
- **Location**: `src/utils/common-lib-commac-generador/NXP_BE/get/getEstadisticoPayloadPrimeraGeneracion.ts`
- **Functions**: `parseEstadisticoPrimeraGeneracion()` and `logEstadisticoPrimeraGeneracion()`
- **Endianness**: Big endian parsing

## Response Generation

- **Success**: Return `FrameMsgStatus.OK` with `msg = 2`
- **ACK Payload**: Single byte containing Second ID
- **Error Handling**: Return appropriate error status
- **MAC Handling**: Set MAC = 0 for most responses
