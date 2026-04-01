---
trigger: glob
description: Presence management and table handling rules for NXP protocol
---

# NXP Protocol Presence Management

## Presence Interval Management

- **Automatic Presence**: Start 30-second interval after presentation
- **Message Type**: `tmPresenciaCentral` sent to devices
- **Response Expected**: `tmRtPresenciaCentral` from devices
- **Miss Tracking**: Track consecutive missed responses

## Presence State Machine

- **State Tracking**: `PresenceState` with misses and awaiting flags
- **Miss Limit**: Disconnect after 3 consecutive missed presences
- **Reset on Response**: Reset miss counter on successful presence response
- **Cleanup**: Clear timers and state on socket close/error

## Table Management Integration

- **CRC Validation**: Compare table CRC in presence messages
- **Table Request**: Automatic `tmPeticionTablaDispositivos` if CRC mismatch
- **Multi-frame Assembly**: Handle MAS + FIN table frames
- **Central Registration**: Only for deviceType = 3 with CRC ≠ 0

## WiFi Presence Variant

- **Message Type**: `tmRtPresenciaCentralWifi`
- **No CRC**: No table CRC in WiFi presence messages
- **Alarm State**: Single byte indicating alarm on/off
- **No Table Request**: Never requests tables for WiFi presence

## Response Handling

- **ACK Processing**: Call `marcarPresenciaOk()` on presence response
- **Table Decision**: Request table only if CRC mismatch
- **State Reset**: Clear awaiting flag and miss counter
- **Logging**: Track presence success/failure rates

## NXP-Specific Features

- **Active Presence**: Server-initiated presence requests
- **Table Synchronization**: Presence triggers table validation
- **Device Types**: Different handling for centrals vs devices
- **WiFi Variant**: Special handling for WiFi-based presence
- **Table Management**: Multi-frame MAS + FIN assembly from `src/utils/common-lib-commac-generador/NXP_BE/get/getTablaDispositivos.ts`

## Error Recovery

- **Timeout Handling**: Disconnect after 3 missed presences
- **Table Recovery**: Force table refresh on CRC mismatch
- **Socket Cleanup**: Clear presence timers on disconnect
- **Queue Reset**: Unregister device on presence failure
