---
trigger: always_on
description: Global coding standards and performance guidelines for COMMAC project
---

# Global Coding Standards

## Logging Standards

### Preferred Logging Library
- **Always use `mlogger`**: Use the project's configured logger (`mlogger` from `src/logs-manager/ctilogs`)
- **Never use `console.log`**: Forbidden in production code
- **Avoid `JSON.stringify()`**: Never stringify objects in logs, especially Error objects
- **Lightweight logging**: Keep log messages minimal and performant

### Log Levels Usage
- **`mlogger.trace()`**: Detailed debugging (development only)
- **`mlogger.debug()`**: Development debugging information
- **`mlogger.info()`**: Important operational information
- **`mlogger.warn()`**: Warning conditions that don't stop processing
- **`mlogger.error()`**: Error conditions that need attention
- **`mlogger.fatal()`**: Critical errors that may require immediate attention

### Performance Logging
- **Avoid object serialization**: Never log full objects in hot paths
- **Use selective logging**: Log only essential information
- **Conditional logging**: Use `if (LOG_ENABLED)` blocks for expensive operations
- **Error logging**: Log error messages, not full Error objects

## Performance Guidelines

### Buffer Operations
- **Use `Buffer.allocUnsafe()`**: For performance-critical allocations
- **Avoid `Buffer.from()`**: In hot paths when possible
- **Use `subarray()`**: For zero-copy buffer operations
- **Minimize copying**: Avoid unnecessary buffer copies

### Async Operations
- **Use `async/await`**: For all async operations
- **Fire-and-forget**: Use `void` for non-blocking operations when response not needed
- **Avoid blocking**: Never block the event loop
- **Batch operations**: Group similar operations when possible

### Memory Management
- **Clean up resources**: Always clean up timers, listeners, and connections
- **Avoid memory leaks**: Properly dispose of resources
- **Use Maps/Sets**: For O(1) lookups instead of arrays when appropriate
- **Pool resources**: Consider object pooling for frequently created objects

## Error Handling

### Error Patterns
- **Never throw in hot paths**: Use return values or status codes
- **Log errors efficiently**: Log error messages, not stack traces in production
- **Graceful degradation**: Continue processing when possible
- **Resource cleanup**: Always clean up on errors

### Error Objects
- **Avoid Error serialization**: Never stringify Error objects
- **Use error codes**: Prefer numeric error codes over strings
- **Minimal error context**: Log only essential error information
- **Error recovery**: Implement proper error recovery mechanisms

## Code Structure

### Function Design
- **Keep functions small**: Single responsibility principle
- **Avoid deep nesting**: Use early returns and guard clauses
- **Minimize parameters**: Prefer objects over many parameters
- **Pure functions**: Avoid side effects when possible

### Variable Naming
- **Use descriptive names**: Clear, meaningful variable names
- **Consistent conventions**: Follow project naming patterns
- **Avoid abbreviations**: Use full words except for common ones
- **Type annotations**: Use TypeScript types effectively

## Protocol-Specific Guidelines

### ST Protocol (Port 8003)
- **Little endian**: Use LE methods (`readUInt32LE`, `writeUInt16LE`)
- **2-byte CRC**: Use full CRC16 calculation
- **Unified handling**: Single device type approach
- **Simple routing**: Minimal message routing overhead
- **Parsing Functions**: Located in `src/utils/common-lib-commac-generador/ST_LE/get/`
- **Statistics Handler**: `getEstadistico.ts` for all ST statistics

### NXP Protocol (Ports 8004/8002)
- **Big endian**: Use BE methods (`readUInt32BE`, `writeUInt16BE`)
- **1-byte CRC**: Use LSB of CRC16 only
- **Family routing**: Handle different device families
- **Table management**: Efficient multi-frame assembly
- **Parsing Functions**: Located in `src/utils/common-lib-commac-generador/NXP_BE/get/`
- **Statistics Handlers**: Separate files for Omega and First-Generation

## Testing Guidelines

### Unit Tests
- **Test edge cases**: Boundary conditions and error scenarios
- **Mock external dependencies**: Isolate unit tests
- **Performance tests**: Test critical paths with timing
- **Protocol testing**: Test both ST and NXP protocols

### Integration Tests
- **End-to-end flows**: Test complete message flows
- **Error scenarios**: Test failure and recovery paths
- **Load testing**: Test under realistic load conditions
- **Protocol mixing**: Test both protocols simultaneously

## Security Considerations

### Input Validation
- **Validate all inputs**: Never trust external data
- **Buffer bounds**: Always check buffer boundaries
- **Size limits**: Enforce maximum sizes for all inputs
- **Type validation**: Validate data types before processing

### Resource Protection
- **Rate limiting**: Implement appropriate rate limits
- **Connection limits**: Limit concurrent connections
- **Memory limits**: Prevent memory exhaustion
- **Timeout handling**: Implement proper timeouts

## Development Practices

### Code Reviews
- **Performance focus**: Review for performance impact
- **Security review**: Check for security issues
- **Protocol compliance**: Ensure protocol adherence
- **Error handling**: Verify proper error handling

### Documentation
- **Inline comments**: Explain complex logic
- **Protocol documentation**: Document protocol specifics
- **Performance notes**: Document performance considerations
- **Error scenarios**: Document error handling paths
