---
trigger: glob
description: Device presentation, registration, and socket association rules for NXP protocol
---

# NXP Protocol Device Presentation and Registration

## Presentation Message Format

- **Device Type**: UInt8 at offset 0
- **MAC Address**: 8 bytes ASCII (digits) at offset 1-8
- **Team Version**: UInt16BE at offset 9-10
- **Password**: 16 bytes ASCII (C-string) at offset 11-26
- **Table CRC**: UInt16BE at offset 27-28
- **Minimum Length**: 29 bytes required

## Registration Process

1. **Parse Presentation**: Extract device information from payload (big-endian)
2. **MAC Conversion**: Convert 8-digit ASCII MAC to number
3. **Socket Association**: Call `ControlMetricsService.addNewPresentedDevice(socketKey, info)`
4. **Device Queue Registration**: Call `DevicesQueueService.registerDevice(mac, socket)`
5. **Screen Service Update**: Set socket key for screen service
6. **Table Management**: Register central if deviceType = 3 and CRC ≠ 0

## Socket Key Management

- **Format**: `remoteAddress:remotePort`
- **Uniqueness**: Ensures unique identification per connection
- **Lifecycle**: Managed from connection to disconnection
- **Device Binding**: MAC address bound to socket key after presentation

## NXP-Specific Validation

- **MAC Format**: 8-digit ASCII string, convert to number
- **Password**: C-string within 16-byte field
- **Device Type**: Type 3 = Central with table management
- **Table CRC**: 0 = Omega emulating central, ≠0 = Real central

## Central Device Table Management

- **Table Registration**: If deviceType = 3 and CRC ≠ 0
- **CRC Validation**: Compare with stored table CRC
- **Table Request**: Automatic table request if CRC mismatch
- **Table Assembly**: Handle MAS + FIN multi-frame tables

## Response Handling

- **Success**: Return `FrameMsgStatus.OK` with `tmAceptacionCentral`
- **Frame Type**: `EnTipoTramaOld.servidorCentral`
- **Message Type**: `EnTipoMensajeServidorCentral.tmAceptacionCentral`
- **Payload**: 1 byte with action = 0x00 (acceptance)

## State Management

- **Pre-Presentation**: Socket exists but no MAC association
- **Post-Presentation**: Socket associated with device MAC
- **Central Registration**: Optional table management for centrals
- **Queue Ready**: Device ready for message queuing
