---
trigger: glob
description: TCP connection and socket management rules for NXP protocol (ports 8004/8002)
---

# NXP Protocol TCP Connection Handling

## Connection Lifecycle

- **Socket Timeout**: Always set `socket.setTimeout(40000)` on new connections
- **Socket Key**: Use `remoteAddress:remotePort` format for unique identification
- **Connection Tracking**: Register connections with `ControlMetricsService.addNewConnexion()`
- **Cleanup**: Always call `ControlMetricsService.removeConnection()` on close/error

## Data Reception

- **Chunk Processing**: Handle partial frames and multiple frames per chunk
- **Frame Detection**: Check for `0xccaaaaaa` header to identify valid frames
- **Length Validation**: Validate `payloadSize <= 2500` before processing
- **Multi-frame Detection**: Log when multiple frames detected in single chunk

## Response Handling

- **MAC-based Routing**: Use `DevicesQueueService.enqueueOutgoingMessage()` for known devices
- **Direct Response**: Use `socket.write()` only for unknown devices (MAC = 0)
- **Metrics Recording**: Always call `ControlMetricsService.recordMetric()` after processing

## Error Handling

- **Parser Exceptions**: Catch and log parser errors, return `NORESPONSE` status
- **Socket Errors**: Log and clean up connections on socket errors
- **Timeout Handling**: Implement proper cleanup on socket timeouts

## Performance Considerations

- **Window Counters**: Use 10-second windows for performance metrics
- **Lag Monitoring**: Track and log processing lag in window flushes
- **Chunk Statistics**: Monitor long chunks and trama hits for TCP coalescing

## NXP-Specific Notes

- **Protocol Version**: Use version 1 for responses
- **Endianness**: Big endian for all numeric fields
- **Frame Length**: 18 + payloadSize (header 13 + payload + CRC 1 + tail 4)
- **CRC**: 1-byte CRC (LSB of CRC16 IBM ARC)
- **Device Families**: Support Omega and First-Generation devices
