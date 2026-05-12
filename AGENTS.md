<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

<!-- BEGIN:windsurf-rules -->
# MANDATORY: Check rules before editing

**ALL AIs (Claude, Codex, etc.) MUST check the rules in `.windsurf/rules/` BEFORE making any edits to the code.**

## Mandatory process:

1. **Read applicable rules** - Review `.windsurf/rules/` to find relevant rules
2. **Apply rules** - Follow exactly the established guidelines
3. **Verify compliance** - Ensure changes comply with the rules

## Key rules to remember:

- **SVG vs Lucide usage**: Only use SVG if explicitly requested
- **Quality verification**: Always run `yarn lint` and `yarn tsc --noEmit` after changes
- **Code standards**: Follow project patterns and conventions
- **Names and structure**: Maintain consistency with existing code

**EXCEPTION**: None. Always check rules first.

<!-- END:windsurf-rules -->

<!-- BEGIN:project-description -->
# Web Frontend Screen Simulator

This project is a **Web Frontend Simulator for Device Screens**. We communicate directly with COMMAC via HTTP requests to retrieve screen data from devices. COMMAC handles the device communication and returns parsed JSON objects containing screen information, which we automatically render based on the received screen objects.

## Architecture
- **Frontend**: Next.js web application
- **Backend Communication**: Direct HTTP requests to COMMAC
- **Screen Rendering**: Dynamic rendering based on JSON screen objects from COMMAC
- **Device Support**: Supports all COMMAC-compatible devices through unified interface

## Data Flow
1. Frontend requests screen data from COMMAC via HTTP
2. COMMAC communicates with devices using appropriate protocols (ST/NXP)
3. COMMAC returns parsed JSON screen objects
4. Frontend automatically renders screens based on received objects
<!-- END:project-description -->
