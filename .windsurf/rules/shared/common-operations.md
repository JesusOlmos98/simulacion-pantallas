---
trigger: model_decision
description: Common operations shared between ST and NXP protocols
---

# Common Operations for Both Protocols

## Socket Management

- **Socket Key Format**: `remoteAddress:remotePort` for both protocols
- **Timeout Setting**: 40-second timeout for all connections
- **Connection Tracking**: Use `ControlMetricsService` for both
- **Cleanup Procedures**: Same cleanup for close/error events

## Queue Management

- **Device Registration**: `DevicesQueueService.registerDevice()` for both
- **Message Enqueuing**: `enqueueOutgoingMessage()` with priority
- **Unregistration**: `unregisterDevice()` on disconnect
- **Priority Levels**: Use `QueuePriority.LOW/HIGH` consistently

## Metrics and Monitoring

- **Window Counters**: 10-second windows for both protocols
- **Performance Metrics**: Same lag and throughput tracking
- **Error Recording**: `ControlMetricsService.recordMetric()` for both
- **Chunk Analysis**: Same multi-frame detection logic

## Error Handling

- **Parser Exceptions**: Return `NORESPONSE` status
- **Socket Errors**: Cleanup and log consistently
- **CRC Errors**: Return `CRCERROR` status
- **Unknown Messages**: Route to `MsgUnknown.procesa()`

## Response Patterns

- **Status Codes**: Same `FrameMsgStatus` enum for both
- **MAC Handling**: Same MAC validation logic
- **Buffer Management**: Same buffer safety practices
- **Logging Levels**: Consistent logging across protocols

## RabbitMQ Integration

- **Fire-and-Forget**: Use `void` for non-blocking sends
- **Message Groups**: Use appropriate `EnEstadisTipoRegistro` for routing
- **Metadata Format**: Same MAC/location/date/time structure
- **Error Handling**: Same error recovery patterns

## Frame Validation

- **Header Check**: Both use `0xccaaaaaa` header
- **Tail Check**: Both use `0xccbbbbbb` tail
- **Size Limits**: Both enforce 2500-byte payload limit
- **Fragmentation**: Both handle partial frames similarly

## Development Guidelines

- **Code Reuse**: Share common utilities between protocols
- **Testing**: Test both protocols with same test patterns
- **Documentation**: Maintain protocol-specific documentation
- **Monitoring**: Unified monitoring dashboard for both
