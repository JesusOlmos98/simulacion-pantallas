---
trigger: glob
description: Frame parsing, validation, and CRC handling for ST protocol (port 8003)
---

# ST Protocol Frame Parsing and Validation

## Frame Structure

- **Header**: Must be `0xccaaaaaa` (big-endian)
- **Protocol Version**: Byte at offset 4
- **Reserved**: Byte at offset 5
- **Node Fields**: Origin (6-7) and Destination (8-9) nodes (little-endian)
- **Frame Type**: Byte at offset 10
- **Message Type**: Byte at offset 11
- **Payload Size**: UInt16LE at offset 12 (max 2500)
- **Payload**: Starts at offset 14
- **CRC**: UInt16BE after payload
- **Tail**: Must be `0xccbbbbbb` (big-endian)

## Length Calculations

- **Expected Length**: `20 + payloadSize` (header 14 + payload + CRC 2 + tail 4)
- **Fragmentation**: If `msgLength < expectedLen`, return `UNKNOWN` (don't validate CRC)
- **Coalescing**: If `msgLength > expectedLen`, process only first frame

## CRC Validation

- **Algorithm**: CRC16 IBM ARC (little-endian result, swap bytes for comparison)
- **Helper Function**: Use `crc16IbmArcInit0000Le()` from `src/utils/common-lib-commac-generador/crc.ts`
- **Validation Range**: CRC calculated over bytes 4 to `responseSize - 6`
- **Error Handling**: Return `CRCERROR` on mismatch, don't process payload

## Response Construction

- **Header**: Use `0xccaaaaaa` for responses
- **Protocol Version**: Set to 2 in responses
- **Node Fields**: Set to 0 in responses
- **CRC Calculation**: Always calculate CRC over response frame
- **Tail**: Use `0xccbbbbbb` for responses

## ST-Specific Details

- **Endianness**: Little endian for payloadSize, origin/destination nodes
- **Reserved Byte**: Always set to 0 in responses
- **CRC Size**: 2 bytes (big-endian in frame)
- **Payload Offset**: Fixed at offset 14
- **Helper Functions**: Located in `src/utils/common-lib-commac-generador/ST_LE/get/`
