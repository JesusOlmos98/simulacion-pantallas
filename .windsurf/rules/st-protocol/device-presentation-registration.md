---
trigger: glob
description: Device presentation, registration, and socket association rules for ST protocol
---

# ST Protocol Device Presentation and Registration

## Presentation Message Format

- **Frame Version**: UInt32LE at offset 4
- **MAC Address**: UInt32LE at offset 8
- **Software Version**: UInt32LE at offset 12
- **Device Type**: UInt32LE at offset 16
- **Password**: UInt32LE at offset 20
- **Hardware Version**: UInt32LE at offset 24
- **Minimum Length**: 28 bytes required

## Registration Process

1. **Parse Presentation**: Extract device information from payload (little-endian)
2. **Socket Association**: Call `ControlMetricsService.addNewPresentedDevice(socketKey, info)`
3. **Device Queue Registration**: Call `DevicesQueueService.registerDevice(mac, socket)`
4. **Screen Service Update**: Set socket key for screen service
5. **Response Generation**: Return OK status with empty payload

## Socket Key Management

- **Format**: `remoteAddress:remotePort`
- **Uniqueness**: Ensures unique identification per connection
- **Lifecycle**: Managed from connection to disconnection
- **Device Binding**: MAC address bound to socket key after presentation

## ST-Specific Validation

- **MAC Validation**: Ensure valid MAC address format (UInt32LE)
- **Version Compatibility**: Check frame version compatibility
- **Device Type**: Validate device type is supported
- **Authentication**: Validate password if required

## Response Handling

- **Success**: Return `FrameMsgStatus.OK` with `msg = 2`
- **Error**: Return appropriate error status
- **Payload**: Empty payload for successful presentation
- **MAC Assignment**: Use device MAC in response

## State Management

- **Pre-Presentation**: Socket exists but no MAC association
- **Post-Presentation**: Socket associated with device MAC
- **Queue Ready**: Device ready for message queuing
- **Metrics Tracking**: Device registered in control metrics
