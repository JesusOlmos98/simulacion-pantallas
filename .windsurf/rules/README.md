---
trigger: manual
description: Overview of COMMAC protocol rules structure
---

# COMMAC Protocol Rules

This directory contains Windsurf rules for the COMMAC device communication system, supporting two main protocols:

## Protocol Structure

### ST Protocol (Port 8003)
- **Path**: `st-protocol/`
- **Devices**: Modern ST devices
- **Endianness**: Little endian
- **CRC**: 2-byte CRC16
- **Frame Length**: 20 + payloadSize
- **Device Types**: Unified device handling

### NXP Protocol (Ports 8004/8002)
- **Path**: `nxp-protocol/`
- **Devices**: Legacy NXP devices (Omega and First-Generation)
- **Endianness**: Big endian
- **CRC**: 1-byte CRC (LSB of CRC16)
- **Frame Length**: 18 + payloadSize
- **Device Families**: Omega, First-Generation, Central, SCV

## Shared Components

### Common Operations
- **Path**: `shared/common-operations.md`
- **Content**: Operations shared between both protocols
- **Includes**: Socket management, queue operations, metrics

### Error Handling
- **Path**: `shared/error-handling-edge-cases.md`
- **Content**: Error handling for both protocols
- **Includes**: Protocol-specific edge cases and recovery

### Performance Monitoring
- **Path**: `shared/performance-monitoring.md`
- **Content**: Performance guidelines for both protocols
- **Includes**: Metrics, optimization, monitoring

## Rule Files by Category

### ST Protocol Rules
- `tcp-connection-handling.md` - TCP connection management
- `frame-parsing-validation.md` - Frame parsing and CRC
- `message-routing-classification.md` - Message routing logic
- `device-presentation-registration.md` - Device registration
- `statistics-processing-rabbitmq.md` - Statistics handling

### NXP Protocol Rules
- `tcp-connection-handling.md` - TCP connection management
- `frame-parsing-validation.md` - Frame parsing and CRC
- `message-routing-classification.md` - Message routing logic
- `device-presentation-registration.md` - Device registration
- `statistics-processing-rabbitmq.md` - Statistics handling
- `presence-management.md` - Presence and table management

## Key Differences

| Feature | ST Protocol | NXP Protocol |
|---------|-------------|--------------|
| Endianness | Little | Big |
| CRC Size | 2 bytes | 1 byte |
| Frame Length | 20 + payload | 18 + payload |
| Device Types | Unified | Multiple families |
| Table Management | None | Central device tables |
| Presence | Implicit | Active with intervals |

## Usage

These rules are designed to help Windsurf understand:
- Protocol-specific implementations
- Correct endianness handling
- Proper CRC calculation
- Device family routing
- Error handling patterns
- Performance optimization

## Development Notes

- Both protocols share common TCP infrastructure
- Error handling patterns are similar but protocol-specific
- Performance monitoring is unified across protocols
- Device registration differs significantly between protocols
