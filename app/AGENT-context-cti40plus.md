# CTI40 Plus Agent Context

## Scope

This document summarizes how the CTI40 Plus simulator works across:

- `app/components/render-objetos-cti40plus/`
- `app/cti40plus/`
- `.claude/` status notes that explain where the last work stopped

It is written as working context for an agent that needs to modify or extend the CTI40 Plus flow without re-discovering the whole system.

## High-level architecture

`app/cti40plus/page.tsx` is only an entrypoint. It renders `PantallaCti40Plus`.

`PantallaCti40Plus.tsx` is the real controller. It:

- requests screen objects from COMMAC
- tracks navigation stack and current screen descriptor
- decides whether the current screen is normal navigation, numeric edit, string edit, time/date edit, selection screen, free canvas screen, or ventilation editor
- groups raw objects into renderable blocks
- dispatches writes back to COMMAC when the user confirms edits
- renders two separate UIs:
  - desktop fixed device simulation: `960x720`
  - responsive/mobile mode when viewport is smaller than `960x720`

`render-objetos-cti40plus/` contains the object-level renderers plus utility functions for:

- text lookup
- variable decoding
- unit decoding
- color resolution
- icon resolution
- grouped table rendering
- popup rendering
- ventilation editing widgets
- free-canvas absolute-position widgets

## External helpers used directly by CTI40 Plus

- `app/components/pantalla-types.ts`
  - `ObjBase = Record<string, unknown> & { tipoObjeto: number }`
  - `DescriptorPantalla = { idPantalla, indicePantalla, esPrincipal, idUnicoEdicion? }`
- `app/hooks/useIsSmallScreen.ts`
  - returns `true` when `window.innerWidth < 960 || window.innerHeight < 720`
  - this is the only switch between desktop and responsive rendering
- `app/api/apiFetch.ts`
  - wraps `fetch`
  - builds URL from `COMMAC_BASE_URL ?? 'http://localhost:8020/api'`
  - always calls `POST /pruebas/peticionPantallaConEspera?...`

## COMMAC request model

### Read requests

`fetchPantalla(descriptor, signal)` sends a screen request for MAC `202000029`.

Rules:

- principal screen uses `esPantallaPrincipal=1`
- non-principal screen uses:
  - `idNav`
  - `indicePantalla`
  - optional `idUnicoEdicion`
- `eventId=1`
- `readWrite=0`
- `idEnvio` is a module-level incrementing counter

`cargarPantalla()` wraps this request and also:

- aborts any in-flight request before starting a new one
- clears `error`
- clears `objetos`
- updates `actual`
- opens/closes the direct-access bar depending on whether the target is principal
- enforces a 35 second timeout via `AbortController`

When data arrives, `cargarPantalla()` also preloads `editValue`:

- from `objEditVariablesString` (`tipoObjeto === 33`) using `decodificarStringVariable(editObjString.valorVariable)`
- otherwise from `objEditVariables` (`tipoObjeto === 8`) using `decodificarVariable(editObj.valorVariable, tipoVarEdicion ?? tipoVar)`

### Write requests

Writes are screen-type-specific. The component has separate writers for:

- numeric/time/date edit: `escribirVariable()`
- string edit: `escribirVariableString()`
- single/multi selection: `escribirSeleccion()`
- ventilation editor: `guardarVentiladores()`

All writes:

- set `readWrite=1`
- increment `idEnvio`
- reuse current or post-edit target screen info
- navigate after success with `navegarTrasEscritura()`

## Navigation model

### Core screen descriptor

The simulator navigates with `DescriptorPantalla`:

- `idPantalla`
- `indicePantalla`
- `esPrincipal`
- optional `idUnicoEdicion`

### Stack behavior

`pila` stores previous screen descriptors.

`navegarA(descriptor)`:

- pushes `actual` into `pila`
- calls `cargarPantalla(descriptor)`

`volver()`:

- if stack is empty, returns to `/`
- otherwise skips duplicate descriptors at the top of the stack
- this is important because the device may resend the same screen with extra objects such as `objPopup`
- if even the bottom candidate is still the same screen, it also returns to `/`

### Post-edit destination

After writing, CTI40 Plus does not always return to the immediate previous screen.

`resolverDestinoTrasEdicion()`:

- finds any object carrying `numeroPantallasRetroceso`
- computes how many levels to pop
- returns:
  - `destino`
  - `nuevaPila`

`navegarTrasEscritura()` applies that destination and reloads it.

## Template-level behavior

`tipoPlantilla` from `objPlantilla` (`tipoObjeto === 1`) drives the entire screen mode.

Important values:

- `2`: keyboard/edit screen
- `4`: list screen
- `10`: ventilation group edit
- `21`: free canvas
- `5` is treated as a confirmation-style selection case in `seleccionConfirmable`
- any other non-list mode is effectively rendered as icon/grid-oriented content

Derived booleans:

- `esLista`
- `esVentilacionGrupoEdit`
- `esLibre`
- `esTeclado`
- `esSeleccion`

## Main screen-state buckets in `PantallaCti40Plus`

State kept by the controller:

- `pila`
- `actual`
- `objetos`
- `loading`
- `error`
- `infoDialogAbierto`
- `editValue`
- `selectedIdSeleccion`
- `selectedIdSelecciones`
- `estadosVentiladores`
- `pestanaActivaVentilacion`
- `barraAbierta`

Refs:

- `controllerRef`: current fetch abort controller
- `escribirSeleccionRef`: latest selection submitter, used by Enter key listener
- `barraAccesoDirectoPersistente`: direct-access buttons captured once from principal screen and reused across the whole session

## Persistent direct-access bar

Objects of `tipoObjeto === 66` only arrive on the principal screen.

When principal data is fetched:

- all `tipoObjeto === 66` are stored in `barraAccesoDirectoPersistente.current`
- those buttons then remain available for the rest of the session

`BarraBotonesCti40Plus.tsx`:

- renders the persistent shortcuts
- uses icon id `3` as a special "home" behavior
- has `compact` mode for responsive layout

## Screen grouping logic

The controller does not render the raw `objetos` array directly. It first derives grouped structures.

### Line groups

`TIPOS_LINEA = { 3, 4, 5, 16, 21, 35 }`

These are grouped into `gruposLineas`, split by `objLineaGrafica` (`tipoObjeto === 20`).

Important consequence:

- `ObjLineaGrafica` itself renders `null`
- its purpose is structural, not visual

### Static tables

Static tables are detected as consecutive pairs:

- `objTablaConfig` (`14`)
- immediately followed by `objTablaDatosSinEdicion` (`28`)

They become `tablasEstaticas`.

### Dynamic tables

Dynamic tables are grouped as:

- one `objTablaDinamicaInit` (`70`)
- all subsequent `objTablaDinamicaFila` (`71`) until the next `70` or end of array

They become `tablasGrupos`.

### Info objects

Info rows are collected separately:

- `7`
- `6`
- `19`

These are not shown inline. They appear in the bottom info button and modal/dialog.

### Other objects

`otrosObjetos` filters out:

- headers
- info rows
- selection rows
- line separators
- concatenated text payload objects
- table metadata/rows
- line-group object types

These are rendered either:

- in a vertical list when `esLista`
- or in a grid in non-list screens

## Text system

### Text lookup

`textos/resolverTexto.ts` exposes `resolveText(numText, lang?)`.

Behavior:

- default language is Spanish
- language dispatch is explicit through a switch
- maps exist for:
  - `ES`, `EN`, `AR`, `CA`, `DE`, `EL`, `FR`, `HI`, `HU`, `ID`, `JP`, `KO`, `PL`, `PT`, `RO`, `RU`, `SK`, `TR`, `VI`, `ZH`

Each `textMapXX.ts` is a large `Map<number | EnTextos, string>`.
They are content dictionaries, not logic-heavy modules.

### Concatenated texts

Objects of `tipoObjeto === 67` define concatenated text payloads.

`textoConcatenadoMap` is built as:

- key: `idTextoConcatenado`
- value: `parseConcatenado(cadenaConcatenadaRaw)`

`parseConcatenado()` understands NXP-style UTF-16LE word streams and markers:

- `0xFFFD`: fixed text id follows, resolved with `resolveText`
- `0xFFFC`: section separator
- `0xFFFB`: end marker

This map is used by `ObjLineaText` and also by the header title fallback.

## Variable decoding and formatting

`pantalla-utils.ts` centralizes data interpretation.

Important exports:

- `resolverUnidad(id)`
- `decodificarVariable(raw, tipoVar)`
- `decodificarStringVariable(raw)`
- `decodificarRangoFloat(raw)`
- `parseConcatenado(raw)`

### `decodificarVariable`

It handles:

- signed/unsigned 8/16/32 bit integers
- floats with precision variants
- time variants:
  - `tiempo`
  - `tiempoHm`
  - `tiempoMs`
  - `tiempoHms`
- `fecha`
- text-like values:
  - `string4`
  - `texto`
  - `textoTexto`

### String decoding

`decodificarStringVariable()` expects a JSON Buffer-like object or byte array, interprets it as UTF-16LE, and stops at the first null codepoint.

### Unit decoding

`resolverUnidad()` maps `EnUnidades` ids to display strings such as:

- `°C`
- `%`
- `kg`
- `m³/h`
- `Hz`

It returns empty string for `noUnidad`.

## Colors

`colors.ts` defines the CTI40 Plus palette in `COLORES`.

Special rules:

- `getColorHex()` maps numeric color ids
- `resolverColor()` overrides standard meaning for CTI40 Plus:
  - `15` -> `light_gray`
  - `1` and `0` -> `light`
  - others -> `getColorHex()`

Notable extra semantic colors:

- `menuWords`
- `wifi`
- `influences`

## Icon system

`iconos-cti40plus.ts` maps numeric icon ids to Lucide-based renderers.

Most ids use direct Lucide icons. Some ids use composite renderers built with `React.createElement`, including:

- influences icon
- climate-room icon
- CO2 cloud
- NH3 cloud
- wifi layered icons
- half-colored fan
- spinning fan
- ellipsis icon

Important special ids:

- `69`: climate room composite icon
- `84/85/86`: static/timed/fixed fan variants
- `145/146/147/148`: wifi states
- `270`: ringing bell
- `322`: vertical ellipsis
- `346`: spinning orange fan

`resolverIconoCTI40Plus(id)` returns the icon component or `null`.

## Object router

`RenderObjeto.tsx` is the central object switch for visual rendering.

It intentionally returns `null` for many object types that are:

- metadata only
- handled at screen level
- grouped elsewhere

Important `null` object categories:

- `objPlantilla`
- `objEncabezado`
- `objEncabezadoEditIcono`
- `objIdUnicoEdicion`
- `objEditVariables`
- `objEditVariablesString`
- `objTextoConcatenadoPlantilla`
- `objBarraAccesoDirectoIcon`
- `objTablaConfig`
- `objTablaDatosSinEdicion`
- `objTablaDinamicaFila`
- `objPosXyLibreResolucion`

Renderable cases include:

- line rows
- info rows
- free-canvas widgets
- popup
- ventilation widgets

The fallback renders `[Tipo X sin renderizador]`.

## Navigation conventions inside row renderers

Several row components follow the same rule:

- `valorEditableONav <= 0`: no action
- `valorEditableONav >= 65536`: navigate to another screen
- `valorEditableONav < 65536`: treat as `idUnicoEdicion` and remain on current screen descriptor

This convention is used by:

- `ObjLineaTextVar`
- `ObjLineaTextVarVar`
- `ObjLineaTextText`
- `ObjLineaTextString`
- `ObjEncabezadoEditIcono`
- `ObjVentilacionGrupoGrafico` in non-edit mode

`ObjLineaText` is slightly different:

- `nav > 1000` is treated as screen navigation
- smaller positive values are treated as `idUnicoEdicion`

That threshold difference is real and worth preserving unless the protocol behavior is intentionally normalized later.

## Object renderer catalog

### Row-like navigable objects

#### `ObjLineaText` (`tipoObjeto 5`)

- renders line icon + text + chevron
- supports concatenated text via `textoConcatenados`
- uses `obj.iconoLinea`
- if `coloresLineaEdit === 4`, text becomes `COLORES.influences`

#### `ObjLineaTextVar` (`4`)

- left label text
- right decoded numeric value + unit
- selected/right-side value uses success color unless disabled

#### `ObjLineaTextVarVar` (`3`)

- label
- center value + unit
- right value + unit + optional chevron

#### `ObjLineaTextText` (`16`)

- left label, optional line icon
- right resolved text label in success color
- layout constrains left/right widths to avoid overflow

#### `ObjLineaTextString` (`35`)

- label
- right decoded UTF-16LE string

### Info rows

#### `ObjLineaInfoTextText` (`7`)

- renders a non-clickable info row
- if `textoVar === 151`, shows `--`
- empty state uses `light_gray`

#### `ObjLineaInfoTextVar` (`6`)

- renders label + decoded numeric value
- special case: when `tipoVar === 40`, interprets the variable as icon id and renders the icon instead of text

#### `ObjLineaInfoTextTextVarVar` (`19`)

- left label
- right two values
- special case for `tipoVar1 === 31`:
  - resolves text from low 16 bits
  - post-processes `"G n"` into `"S<n>"`
  - this mirrors CTI40+ firmware using `textG0...` as probe labels

### Edit widgets

#### `ObjEditVariables` (`8`)

- numeric input
- shows min/max hint
- `step` is derived from `tipoVar`
- validation is performed in parent

#### `ObjEditVariablesString` (`33`)

- text input
- max 15 chars

#### `ObjEditVariablesTiempoFecha`

- specialized multi-field editor for:
  - `MMSS`
  - `HHMM`
  - `HHMMSS`
  - `fecha`
- parses display strings and re-emits formatted values
- auto-tabs between fields when max digits are reached
- parent still performs protocol-level validity check

### Selection object

#### `ObjCamposMultiseleccion` (`10`)

- renders radio/checkbox-like row
- disabled when parent passes `isDisabled`
- text comes from `textoVar`
- selection state is fully parent-controlled

### Ventilation objects

#### `ObjVentilacionGrupoGrafico` (`21`)

- renders up to 5 fans
- each fan shows:
  - index
  - icon
  - `km3`
  - state number
- state meaning:
  - `255`: alarm/static orange
  - `0`: off gray
  - active numbered states are ranked and then colored according to `numFijos` and `numTemporizados`
- in edit mode, clicking a fan is delegated to parent instead of navigating

#### `ObjVentilacionGrupoGraficoEdit` (`22`)

- top tabs + trash button
- parent controls:
  - active tab
  - tab change
  - trash action

### Table objects

#### `ObjTablaConfig`

- no UI
- only exposes `parseConfigTabla()`

#### `ObjTablaDatosSinEdicion`

- takes parsed config + data object
- slices flat `items` array into rows
- row 0 is transparent header-like row
- alternating body rows use `tertiary` and `quaternary`
- cell text color depends on row/column role and config colors

#### `ObjTablaDinamica`

- only maps rows to `ObjTablaDinamicaFila`

#### `ObjTablaDinamicaFila`

- resolves each cell according to `tipoVar`
- special cases:
  - text from low 16 bits for text type `31`
  - range float decoding for `EnTipoVariable.rangoFloat`
- row may be navigable through `navPtr`
- first column color and remaining column color are independent

### Free-canvas objects

These belong to template `21` and are rendered by `PantallaLibre`.

#### `PantallaLibre`

- finds `objPosXyLibreResolucion` (`72`) to read native `sizeX/sizeY`
- default native size is `320x240`
- desktop uses fixed `ESCALA = 3`
- responsive uses `containerWidth / sizeX`
- only renders object types `73`, `75`, `76`

#### `ObjPosXyLibreIcon` (`73`)

- absolute positioned icon box
- cursor becomes pointer if `accion > 0`
- bell icon `270` blinks through inline keyframes
- note: it does not currently trigger navigation itself

#### `ObjPosXyLibreVariable` (`75`)

- absolute positioned decoded variable
- justification is implemented through CSS transform:
  - left
  - right
  - center
- contains a hardcoded special color hack:
  - `posX === 150 && posY === 8` -> success green
  - everything else -> light

#### `ObjPosXyLibreLineas` (`76`)

- renders an absolute rectangle
- color handling has special overrides:
  - `17` -> primary
  - `6` -> tertiary
  - `13` -> error
  - otherwise `getColorHex(color)`

### Other objects

#### `ObjPopup` (`40`)

- local modal with close button
- self-managed visibility through internal `isVisible`
- title, message and button text use `resolveText`
- button is optional when `botonId === 0`

#### `ObjDescripcionPantallaCambioParametro` (`56`)

- renders nothing
- semantic meaning:
  - when present, its `descripcionText` should be used as `textoTituloVariable` for parameter-change requests instead of screen title
- current code only documents this meaning; the write functions still mostly pull titles from header/edit objects

#### `ObjVarIndividual` (`36`)

- intentionally unused in CTI40 Plus

#### `ObjVineta` (`41`)

- intentionally ignored

## Selection workflow details

Selection screens are inferred from the presence of `tipoObjeto === 10`.

Initialization:

- if exactly one `objEditVariables` exists, parent treats it as radio mode
- if more than one `objEditVariables` exists, parent treats it as checkbox mode
- preselected options are those with `opcionSeleccionada === 2`
- disabled options are those with `opcionSeleccionada === 0`

Submission has multiple protocol branches inside `escribirSeleccion()`:

1. `tipoVarEdicion = 9` and exactly one edit object
   - send singular `valorVariable`
2. `tipoVarEdicion = 9` and multiple edit objects
   - send arrays:
     - `valores`
     - `punterosVariablesEdicion`
     - `textosNombreVariable`
3. `tipoVarEdicion = 1` with one or zero selection options
   - special confirm/delete flow
   - sends current `indicePantalla` as `valorVariable`
4. regular radio case
5. regular checkbox case
   - sends one request per selected edit object

An Enter key listener is installed globally only when:

- current screen is a selection screen
- confirmation is allowed
- not loading
- no error

It ignores Enter when focus is inside an input/textarea/select.

## Edit workflow details

### Numeric/time/date validation

`editValido` is derived with `useMemo`.

Rules:

- string edits are always valid
- time/date edits:
  - use `parseTiempoFechaString()`
  - compare encoded value against `maskMinMaxTiempoFecha(min/max, tipoVarEdicion)`
- other numeric edits:
  - parse display string as float
  - compare against decoded min/max strings

### Numeric/time/date write

`escribirVariable()`:

- resolves post-edit destination first
- sends either:
  - `valorVariable`
  - or `valorVariableHex` for time/date
- uses:
  - `ptrVariableEdicion`
  - `ptrFuncionSaltoTrasEdit`
  - `textoTituloVariable`
  - `textoNombreVariable`

### String write

`escribirVariableString()`:

- sends `valorVariableTexto`
- uses `eventId=1`
- also sends `textoOpcionCambioParametro=0`

## Ventilation edit workflow details

When template `10` is loaded:

- parent finds the graph object `21`
- extracts `datos[].estadoVentilador`
- initializes `estadosVentiladores`
- resets active tab to `0`

Parent editing rules:

- tab `0`: static fans
  - toggles only `0 <-> 255`
  - timed states are untouched
- tab `1`: timed fans
  - `0` becomes next highest timed number
  - a timed fan can be removed only if it is the current maximum timed number
  - static `255` is untouched

Trash action:

- resets all states to `0`

Save action:

- sends `numDatosEditar`
- appends one `valores` entry per edited fan state

## Header model

The header is derived from `objEncabezado` (`tipoObjeto === 2`).

Fields consumed:

- `tituloText`
- `colorTitulo`
- `iconoTarea2`
- `pantallaSaltoTarea2`
- `indicePantallaTarea2`
- `iconoTarea3`
- `pantallaSaltoTarea3`
- `indicePantallaTarea3`

Title resolution order:

- if concatenated title id exists in `textoConcatenadoMap`, use that
- otherwise use `resolveText(tituloTextId)`

`objEncabezadoEditIcono` (`31`) is handled separately as an action button on the right side.

The mobile navbar and desktop top bar both adapt around:

- principal vs non-principal
- normal vs edit vs selection vs ventilation edit

## Principal-screen behavior

The principal screen is recognized by `objPlantilla.idPantalla === 0`.

Current behavior:

- it persists direct-access buttons
- it may expose a menu navigation pointer by searching the first `objVarIndividualNavegacionOEdit` (`tipoObjeto === 37`) with:
  - `tipoDato === 0`
  - `valorEditableONav > 0`
- its central content currently renders a simple placeholder:
  - `"Pantalla principal"`

This means the principal CTI40 Plus screen is not rendered from raw objects the same way as other screens. It is currently acting as a session hub.

## Responsive/mobile split

Responsive mode is not just scaled desktop. It is a separate JSX branch inside `PantallaCti40Plus`.

Key differences:

- navbar is rebuilt for mobile
- direct-access bar can collapse via hamburger
- most object renderers receive `responsive`
- free canvas uses width-based scaling instead of fixed 3x
- info dialog becomes full-screen overlay

Desktop mode keeps:

- fixed `960x720`
- fixed text/icon sizes
- direct-access bar below the simulated device

## `.claude` status: where work stopped

### `responsive-checklist.md`

Most responsive adaptations are already done.

Completed:

- infrastructure split
- all `ObjLinea*`
- all `ObjLineaInfo*`
- numeric/string/time-date edit widgets
- multiselect rows
- header edit icon
- ventilation widgets
- tables
- direct-access bar

Still marked pending:

- `ObjPosXyLibreIcon.tsx`
- `ObjPosXyLibreVariable.tsx`
- `ObjPosXyLibreLineas.tsx`
  - checklist notes that they may already be effectively covered by `PantallaLibre` scaling
- `ObjPopup.tsx`
  - checklist says verify it, but the component is already responsive in practice
- helper/non-visual objects:
  - `ObjDescripcionPantallaCambioParametro.tsx`
  - `ObjVarIndividual.tsx`
  - `ObjVineta.tsx`
  - `ObjTablaConfig.tsx`

### `.claude/commands/responsive-obj.md`

This file documents the standard responsive conversion pattern:

- `text-5xl -> text-lg`
- reduced paddings/gaps
- smaller icon sizes
- `responsive?: boolean` propagation

That work has already been applied to most CTI40 Plus object renderers.

### `.claude/settings.local.json`

Only contains local permissions allowances for:

- `npx tsc:*`
- `npm ls:*`

No feature-state information is stored there.

## Important quirks and risks to preserve

1. `ObjLineaText` uses `nav > 1000` while other row renderers use `>= 65536` to distinguish screen navigation from edit navigation.
2. `ObjPosXyLibreIcon` shows pointer cursor for clickable icons but does not currently execute any action.
3. `ObjDescripcionPantallaCambioParametro` documents a semantic requirement that is not fully wired into all write payloads.
4. Ventilation legend currently uses `textoPestana2` twice for green and half-green entries, and `textoPestana1` for orange.
5. Principal screen is mostly a navigation shell, not a faithful object-rendered screen.
6. Responsive logic is duplicated as a separate branch in `PantallaCti40Plus`, so behavioral changes often need to be mirrored in two JSX trees.

## Practical mental model

If you need to change CTI40 Plus behavior, think in this order:

1. Is the behavior screen-level or object-level?
2. Is it desktop-only, responsive-only, or duplicated in both branches?
3. Does the change affect:
   - object grouping
   - navigation descriptor construction
   - COMMAC read/write query params
   - decoded text/value formatting
4. Is the current screen mode driven by `tipoPlantilla`, by presence of certain objects, or both?
5. If it writes back to COMMAC, does post-edit navigation need `resolverDestinoTrasEdicion()`?

That is the core of how this CTI40 Plus simulator currently works.
