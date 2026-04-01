---
trigger: model_decision
description: Error handling and edge case management for both protocols
---

# Error Handling and Edge Cases (Both Protocols)

## TCP Level Errors

- **Socket Timeouts**: Handle 40-second timeouts gracefully
- **Connection Drops**: Clean up resources on disconnection
- **Partial Frames**: Detect and handle incomplete frames
- **Buffer Overflows**: Prevent buffer overflow attacks

## Frame Level Errors

- **Invalid Headers**: Reject frames with wrong header/tail
- **CRC Mismatches**: Return CRCERROR status (different CRC sizes)
- **Size Validation**: Reject oversized payloads (>2500)
- **Malformed Frames**: Handle frames with invalid structure

## Message Processing Errors

- **Unknown Frame Types**: Route to unknown message handler
- **Unsupported Message Types**: Return appropriate error status
- **Parser Exceptions**: Catch and log parsing errors
- **Handler Failures**: Handle service-level failures gracefully

## Device Management Errors

- **Unregistered Devices**: Reject statistics from unknown devices
- **Duplicate Registrations**: Handle multiple presentation attempts
- **MAC Conflicts**: Detect and resolve MAC address conflicts
- **Socket Binding Failures**: Handle socket association errors

## Data Validation Errors

- **Payload Length**: Validate minimum required lengths
- **Date/Time Format**: Validate timestamp formats
- **Data Type Validation**: Check supported data types
- **Version Compatibility**: Handle protocol version mismatches

## Protocol-Specific Edge Cases

### ST Protocol Edge Cases

- **Little Endian Parsing**: Handle LE byte order correctly
- **Reserved Byte**: Ensure reserved byte is handled properly
- **2-byte CRC**: Validate 16-bit CRC calculation
- **Unified Devices**: Single device type handling

### NXP Protocol Edge Cases

- **Big Endian Parsing**: Handle BE byte order correctly
- **1-byte CRC**: Validate LSB-only CRC calculation
- **Device Families**: Handle Omega vs First-Generation differences
- **Table Management**: Handle multi-frame table assembly
- **ASCII MAC**: Parse 8-digit ASCII MAC addresses

## Recovery Strategies

- **Graceful Degradation**: Continue processing other messages
- **Error Logging**: Log detailed error information
- **Resource Cleanup**: Always clean up resources on errors
- **Retry Logic**: Implement appropriate retry mechanisms

## Monitoring and Alerts

- **Error Rates**: Monitor error rates by protocol and type
- **Performance Impact**: Track performance impact of errors
- **Resource Usage**: Monitor resource consumption
- **Connection Health**: Track connection health metrics

## Debugging Support

- **Protocol Tracing**: Enable detailed logging per protocol
- **Frame Dumping**: Log raw frames for debugging
- **State Inspection**: Track device state transitions
- **Error Context**: Provide context for error conditions
