# CTI40 Plus Buffer Diff Summary

This file summarizes the current working-tree changes around the CTI40 Plus screen-buffer migration.

## Goal

Move `simulacion-pantallas` away from the legacy COMMAC endpoint:

```txt
POST /pruebas/peticionPantallaConEspera
```

and use the new screen-command endpoint:

```txt
POST /pruebas/rabbitmq-command-simulator-screen
```

The front/Next side now builds the full screen request frame as hexadecimal, sends it to COMMAC, receives a full response frame as hexadecimal, extracts the ST payload, parses the screen objects, and renders them in the browser.

## Current Changed Files

### `simulacion-pantallas/app/api/apiFetch.ts`

- Removed direct calls to COMMAC from the browser-facing helper.
- `apiFetch(params, signal)` now calls the local Next route:

```txt
POST /api/pantalla?...
```

This keeps the public interface used by `PantallaCti40Plus` mostly unchanged.

### `simulacion-pantallas/app/api/pantalla/route.ts`

- Replaced the old unused/local proxy route with a real Next route handler.
- Reads the same query params previously sent to COMMAC.
- Converts query params into a local `EventBusDataPantalla`-like object.
- Calls `buildScreenFrameHex(...)`.
- Sends a screen command payload to COMMAC:

```json
{
  "type": "screen",
  "mac": "...",
  "data": "fullRequestFrameHex",
  "readWrite": 0,
  "cid": "..."
}
```

- Handles COMMAC responses:
  - one-byte errors are converted to HTTP errors;
  - full ST frames are converted from hex to `Buffer`;
  - the ST data section is extracted;
  - `parseObjetosPintaPantallasOmegaFromPayload(...)` returns the screen objects expected by the React components.
- Current state: `COMMAC_BASE_URL` is using `NEXT_PUBLIC_COMMAC_BASE_URL ?? "http://localhost:8020/api"`. A dev-local `COMMAC_BASE_URL`-first version is present as a commented line.

### `simulacion-pantallas/app/api/pantalla/screen-command.ts`

New server-side helper for CTI40 Plus/ST screen commands.

It contains:

- local screen request types;
- ST frame creation/serialization equivalent to COMMAC `crearFrame()` + `serializarFrame()`;
- screen payload builders equivalent to the relevant COMMAC `readwrite.helpers.ts` branches:
  - main screen;
  - screen by `idNav`;
  - simple parameter write;
  - string write;
  - multi write;
  - ventilation/group write;
  - `valorVariableHex` writes for time/date values.

Known limitation:

- The `OBJ68 / objCambioParametroConcatenado` branch from COMMAC has not been ported yet. The current `PantallaCti40Plus` flow does not appear to emit those concat params.

### `simulacion-pantallas/app/cti40plus/PantallaCti40Plus.tsx`

- Added `versionEquipoRef`, initialized to `304`.
- Read requests include `versionEquipo`.
- After each screen response, the component updates `versionEquipoRef` from the template object (`tipoObjeto === 1`) when `versionEquipo` is available.
- Added `requestPantalla(...)`, which injects the current `versionEquipo` before delegating to `apiFetch`.
- Write flows now use `requestPantalla(...)`, so writes also carry the latest known equipment version.

### `simulacion-pantallas/package.json` and `package-lock.json`

- Current diff includes added dependencies:
  - `pino`
  - `pino-pretty`

These were added while dealing with server-side imports/logging around the common COMMAC library.

## Runtime Behavior

For the new CTI40 Plus path:

1. The browser calls the local Next route through `apiFetch`.
2. Next builds the complete ST screen frame as hex.
3. Next posts that frame to COMMAC using `type: "screen"`.
4. COMMAC treats screen data as a raw frame: hex string to `Buffer`, enqueue, wait for response.
5. COMMAC returns the full response frame as hex.
6. Next extracts the payload and parses screen objects.
7. React renders the objects as before.

COMMAC is therefore agnostic to screen-object semantics for this new path. It still keeps the legacy screen builders and handlers for old endpoints and other flows.

## Validation Done

- `yarn tsc --noEmit` passed.
- `yarn lint` passed.
- Manual endpoint checks showed the new path can return parsed screen objects when it points to the correct COMMAC instance.

## Notes

- If `NEXT_PUBLIC_COMMAC_BASE_URL` points to a remote COMMAC, the local Next route will use that remote URL in the current file state.
- For local E2E with COMMAC on port `8020`, make sure `NEXT_PUBLIC_COMMAC_BASE_URL` resolves to the local COMMAC URL, or restore the `COMMAC_BASE_URL`-first dev fallback in `route.ts`.
