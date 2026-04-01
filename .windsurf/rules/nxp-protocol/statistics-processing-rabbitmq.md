---
trigger: glob
description: Statistics message processing and RabbitMQ integration rules for NXP protocol
---

# NXP Protocol Statistics Processing and RabbitMQ

## Device Family Statistics

### Omega Devices Statistics

- **Frame Type**: `EnTipoTramaOld.omegaPantallaPlaca`
- **Message Type**: `tmOmegaPantallaPlacaEnviaEstadistico`
- **Handler**: `EnviaEstadisticoMsgOldOmega.process()`
- **Second ID**: Variable (offset 9 or 15 based on data type)
- **Response**: `tmOmegaPantallaPlacaRtEstadistico` with ACK

### First-Generation Devices Statistics

- **Frame Type**: `EnTipoTramaOld.centralServidor`
- **Message Type**: `tmEnviaParametroHistorico`
- **Handler**: `EnviaEstadisticoMsgOldPrimeraGeneracion.process()`
- **Second ID**: Fixed at offset 15
- **Response**: `tmRtEnviaParametroHistorico` with ACK

## Common Validation

- **Location Lookup**: Call `ControlMetricsService.getLocation()` with MAC
- **Unregistered Device**: Return `NORESPONSE` if location = 0
- **Duplicate Detection**: Return `REPEATED` if location = -2
- **ACK Response**: Always include Second ID in response payload

## Omega-Specific Processing

- **Variable Second ID**: Depends on `EnTipoDatoDFAccion` type
- **Data Types**: Concatenated parameters, events, generic statistics
- **Payload Parsing**: Use `getEstadisticoPayloadOmega()` helper
- **Response Frame**: `EnTipoTramaOld.omegaPantallaPlaca`

## First-Generation Processing

- **Fixed Second ID**: Always at offset 15
- **Payload Parsing**: Use `logEstadisticoPrimeraGeneracion()` helper
- **Response Frame**: `EnTipoTramaOld.servidorCentral`
- **Simpler Format**: More basic statistics structure

## RabbitMQ Integration

- **Fire-and-Forget**: Use `void` for non-blocking sends
- **Message Groups**: Use appropriate `EnEstadisTipoRegistro` for routing
- **Payload Forwarding**: Send raw data bytes from offset 20
- **Metadata**: Include MAC, location, date, time, data number

## Parsing Functions

### Omega Devices Statistics
- **Location**: `src/utils/common-lib-commac-generador/NXP_BE/get/getEstadisticoPayloadOmega.ts`
- **Functions**: Multiple `getEstadistico...()` functions for different payload types
- **Endianness**: Big endian parsing
- **Complex Types**: DF actions, events, concatenados, generic statistics

### First-Generation Devices Statistics
- **Location**: `src/utils/common-lib-commac-generador/NXP_BE/get/getEstadisticoPayloadPrimeraGeneracion.ts`
- **Functions**: `parseEstadisticoPrimeraGeneracion()` and `logEstadisticoPrimeraGeneracion()`
- **Endianness**: Big endian parsing
- **Simpler Format**: Basic statistics structure

## NXP-Specific Considerations

- **Dual Handlers**: Separate handlers for Omega and First-Generation
- **Variable Formats**: Different payload structures per family
- **Complex Routing**: Different frame types for responses
- **Table Context**: Statistics may be related to device tables
