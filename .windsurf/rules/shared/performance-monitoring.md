---
trigger: model_decision
description: Performance optimization and monitoring guidelines for both protocols
---

# Performance and Monitoring (Both Protocols)

## Window-based Metrics

- **10-Second Windows**: Use fixed 10-second windows for both protocols
- **Message Counting**: Track messages per window per protocol
- **Average Calculation**: Calculate messages per second
- **Lag Monitoring**: Track processing lag in milliseconds

## TCP Performance

- **Chunk Analysis**: Monitor chunk sizes and patterns
- **Multi-frame Detection**: Track coalesced frames
- **Fragmentation Rate**: Monitor partial frame occurrences
- **Connection Patterns**: Track connection lifecycle metrics

## Memory Management

- **Buffer Allocation**: Use `allocUnsafe()` for performance
- **Buffer Copying**: Minimize unnecessary buffer copies
- **Subarray Usage**: Use `subarray()` for zero-copy operations
- **Resource Cleanup**: Ensure proper resource disposal

## Processing Optimization

- **Async Operations**: Use async/await for I/O operations
- **Fire-and-Forget**: Use `void` for non-blocking RabbitMQ sends
- **Error Handling**: Minimize error handling overhead
- **Logging Strategy**: Use appropriate log levels

## Queue Management

- **Message Queuing**: Use device queues for response management
- **Priority Handling**: Implement message priority systems
- **Backpressure**: Handle queue overflow scenarios
- **Throughput Monitoring**: Track queue processing rates

## Protocol-Specific Performance

### ST Protocol Optimization

- **Little Endian**: Optimize LE parsing operations
- **Unified Handler**: Single statistics handler
- **Simple Flow**: Minimal routing overhead
- **2-byte CRC**: Efficient CRC calculation

### NXP Protocol Optimization

- **Big Endian**: Optimize BE parsing operations
- **Dual Handlers**: Efficient family-based routing
- **Table Management**: Optimize multi-frame assembly
- **1-byte CRC**: Faster CRC calculation

## System Health

- **Connection Health**: Monitor active connections per protocol
- **Error Rates**: Track error rates by category and protocol
- **Response Times**: Monitor response time distributions
- **Resource Usage**: Track CPU and memory usage

## Performance Targets

- **Message Processing**: Target < 1ms per message (both protocols)
- **Response Latency**: Target < 10ms response time
- **Connection Handling**: Support 1000+ concurrent connections
- **Throughput**: Target 10,000+ messages per second total

## Monitoring Tools

- **Protocol Dashboards**: Separate views for ST and NXP
- **Performance Alerts**: Alert on threshold breaches
- **Resource Monitoring**: Track system resource usage
- **Error Tracking**: Monitor error patterns and rates
