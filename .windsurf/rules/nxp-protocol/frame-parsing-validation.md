---
trigger: glob
description: Frame parsing, validation, and CRC handling for NXP protocol (ports 8004/8002)
---

# NXP Protocol Frame Parsing and Validation

## Frame Structure

- **Header**: Must be `0xccaaaaaa` (big-endian)
- **Protocol Version**: Byte at offset 4
- **Origin Node**: UInt16BE at offset 5
- **Destiny Node**: UInt16BE at offset 7
- **Frame Type**: Byte at offset 9
- **Message Type**: Byte at offset 10
- **Payload Size**: UInt16BE at offset 11 (max 2500)
- **Payload**: Starts at offset 13
- **CRC**: UInt8 (LSB of CRC16) after payload
- **Tail**: Must be `0xccbbbbbb` (big-endian)

## Length Calculations

- **Expected Length**: `18 + payloadSize` (header 13 + payload + CRC 1 + tail 4)
- **Fragmentation**: If `msgLength < expectedLen`, return `CRCERROR` (don't validate CRC)
- **Coalescing**: If `msgLength > expectedLen`, process only first frame

## CRC Validation

- **Algorithm**: CRC16 IBM ARC, take only LSB (1 byte)
- **Helper Function**: Use `crc16IbmArcInit0000LsbHdr()` from `src/utils/common-lib-commac-generador/crc.ts`
- **Validation Range**: CRC calculated over bytes 0 to `crcOffset`
- **Error Handling**: Return `CRCERROR` on mismatch, don't process payload

## Response Construction

- **Header**: Use `0xccaaaaaa` for responses
- **Protocol Version**: Set to 1 in responses
- **Node Swapping**: Origin = received destination, Destination = received origin
- **CRC Calculation**: Calculate CRC16 and take LSB
- **Tail**: Use `0xccbbbbbb` for responses

## NXP-Specific Details

- **Endianness**: Big endian for payloadSize, origin/destination nodes
- **No Reserved Byte**: Different from ST protocol
- **CRC Size**: 1 byte (LSB only)
- **Payload Offset**: Fixed at offset 13
- **Node Swapping**: Response frames swap origin/destination nodes
- **Helper Functions**: Located in `src/utils/common-lib-commac-generador/NXP_BE/get/`
