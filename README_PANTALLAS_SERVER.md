# Petición y pintado de pantallas desde Next.js

Este documento describe exactamente cómo pedir pantallas al COMMAC desde el proyecto de Next.js, qué devuelve el endpoint, y cómo interpretar cada objeto del array de respuesta.

---

## Endpoint principal

```
POST /pruebas/peticionPantallaConEspera
```

La petición HTTP **queda en espera** (hasta 30 s) hasta que el dispositivo responde con los datos de la pantalla. Cuando llega la respuesta, el endpoint devuelve directamente el array de objetos `ObjPintaPantalla[]` parseados como JSON.

---

## Parámetros (query string)

Todos van como query params en la URL. Los obligatorios:

| Parámetro          | Tipo    | Obligatorio | Descripción |
|--------------------|---------|-------------|-------------|
| `mac`              | string  | ✅           | MAC numérica del dispositivo (solo dígitos, p.ej. `"1234567890123"`) |
| `eventId`          | number  | ✅           | ID de evento (0–65535) |
| `idEnvio`          | number  | ✅           | ID de envío para correlación (0–65535) |
| `readWrite`        | 0 \| 1  | ✅           | `0` = READ (pedir pantalla). Para escritura ver sección WRITE |
| `esPantallaPrincipal` | 0 \| 1 | ✅        | `1` si se pide la pantalla principal, `0` si se pide por `idNav` |
| `idNav`            | number  | ⚠️ si no es principal | ID numérico de la pantalla a pedir |
| `indicePantalla`   | number  | No          | Índice para pantallas paginadas (defecto 0) |

### Ejemplo: pedir pantalla principal

```
POST /pruebas/peticionPantallaConEspera?mac=1234567890123&eventId=1&idEnvio=1&readWrite=0&esPantallaPrincipal=1
```

### Ejemplo: pedir pantalla concreta (idNav=302949)

```
POST /pruebas/peticionPantallaConEspera?mac=1234567890123&eventId=2&idEnvio=2&readWrite=0&esPantallaPrincipal=0&idNav=302949
```

### Ejemplo en fetch (Next.js)

```ts
const params = new URLSearchParams({
  mac: '1234567890123',
  eventId: '1',
  idEnvio: '1',
  readWrite: '0',
  esPantallaPrincipal: '0',
  idNav: '302949',
});

const res = await fetch(`${process.env.COMMAC_BASE_URL}/pruebas/peticionPantallaConEspera?${params}`, {
  method: 'POST',
});

const objetos: ObjPintaPantalla[] = await res.json();
```

---

## Estructura de la respuesta

La respuesta es un array `ObjPintaPantalla[]`. **El primer elemento siempre es `objPlantilla`** y el resto son los objetos de la pantalla en orden.

```json
[
  { "tipoObjeto": "objPlantilla", "idPantalla": 302949, "indicePantalla": 0, ... },
  { "tipoObjeto": "objEncabezado", "tituloText": 1540, ... },
  { "tipoObjeto": "objLineaTextVar", "texto": 137, "variable": 1089889894, ... },
  ...
]
```

> ⚠️ El campo `tipoObjeto` viene como **string** con el nombre del tipo (ver tabla de tipos abajo).
> En el enum `EnObjPintaPantallasOmega` (`src/utils/common-lib-commac-generador/NXP_BE/globals/enumOld.ts`) están los valores numéricos correspondientes.

---

## Tabla de tipos de objetos (`tipoObjeto`)

| Valor numérico | Nombre string       | Interfaz TS                       | Uso |
|----------------|---------------------|-----------------------------------|-----|
| 1              | `objPlantilla`      | `ObjTipoPlantilla`                | **Siempre primero.** Metadatos de la pantalla (idPantalla, tipoPlantilla, idioma…) |
| 2              | `objEncabezado`     | `ObjEncabezado`                   | Cabecera: título, iconos de tarea |
| 3              | `objLineaTextVarVar`| `ObjLineaTextVarVar`              | Línea con texto fijo + dos variables numéricas |
| 4              | `objLineaTextVar`   | `ObjLineaTextVar`                 | Línea con texto fijo + una variable numérica |
| 5              | `objLineaText`      | `ObjLineaText`                    | Línea solo texto fijo |
| 6              | `objLineaInfoTextVar`| `ObjLineaInfoTextVar`            | Info compacta texto + variable |
| 7              | `objLineaInfoTextText`| `ObjLineaInfoTextText`          | Info compacta dos textos |
| 8              | `objEditVariables`  | `ObjEdicionVariables`             | Edición de variable numérica (valor actual, min, max) |
| 9              | `objCambioParametro`| `ObjCambiaParametros`             | Cambio de parámetro con selección simple/múltiple |
| 10             | `objCamposMultiseleccion`| `ObjCamposMultiseleccion`    | Opción dentro de una multiselección |
| 12             | `objIdUnicoEdicion` | `ObjIdUnicoEdicion`               | ID único de edición (necesario para WRITEs) |
| 13             | `objPantallaRespuestaTrama`| `ObjPantallaRespuestaTrama` | Pantalla de destino tras confirmar un cambio |
| 14             | `objTablaConfig`    | `ObjTablaConfig`                  | Config de tabla (cols, filas, colores) |
| 15             | `objTablaDatos`     | `ObjTablaDatos`                   | Datos de tabla |
| 16             | `objLineaTextText`  | `ObjLineaTextText`                | Línea con texto fijo + texto variable (enum) |
| 17             | `objTextoConfirmacionCambioVariable` | — | Texto de confirmación para cambio |
| 18             | `objLineaTextTextVarVar` | `ObjLineaTextTextVarVar`     | Línea texto + texto + dos vars |
| 19             | `objLineaInfoTextTextVarVar` | —                          | Info compacta texto + texto + dos vars |
| 20             | `objLineaGrafica`   | `ObjLineaGrafica`                 | Separador/línea gráfica |
| 25             | `objPaginaMasMenos` | `ObjPaginaMasMenos`               | Paginación +/- |
| 33             | `objEditVariablesString` | —                           | Edición de variable tipo string |
| 34             | `objCambioParametroString` | —                         | Cambio de parámetro tipo string |
| 35             | `objLineaTextString`| —                                 | Línea texto + variable string |
| 38             | `objEncabezado3Iconos` | —                              | Cabecera con 3 iconos |
| 40             | `objPopup`          | —                                 | Popup de confirmación |
| 41             | `objVineta`         | —                                 | Viñeta/nota informativa |

Los tipos están definidos en:
`src/utils/common-lib-commac-generador/NXP_BE/dtoBE/objetosPintaPantallaOmega.dto.ts`

---

## Campos clave por tipo

### `objPlantilla` — siempre el primero

```ts
{
  tipoObjeto: "objPlantilla",
  tipoPlantilla: number,      // estilo de layout de la pantalla
  estiloPlantilla: number,
  versionEquipo: number,
  idPantalla: number,         // ← ID de esta pantalla (0 = principal)
  indicePantalla: number,     // ← índice de página
  idioma: number,
  idSesionServidor: number,
  flagEstadisticosLocal: number,
}
```

### `objEncabezado` — título de la pantalla

```ts
{
  tipoObjeto: "objEncabezado",
  tituloText: number,         // ← ID de texto del título (buscar en enumTextos)
  colorTitulo: number,
  navIconMenuPtr: number,
  iconoTarea2: number, pantallaSaltoTarea2: number,
  iconoTarea3: number, pantallaSaltoTarea3: number,
}
```

### `objLineaTextVar` — línea con valor numérico

```ts
{
  tipoObjeto: "objLineaTextVar",
  iconoLinea: number,         // icono de la línea
  coloresLineaEdit: number,
  texto: number,              // ID texto de la etiqueta
  tipoVar: number,            // tipo de variable (float, int…)
  variable: number,           // valor crudo (u32, interpretar según tipoVar)
  unidad: number,             // ID de unidad (°C, %, etc.)
  valorEditableONav: number,  // > 0 = editable, el número es el idUnicoEdicion que hay que pasar al WRITE
  indicePantalla: number,
}
```

### `objLineaTextText` — línea con valor tipo enum/texto

```ts
{
  tipoObjeto: "objLineaTextText",
  iconoLinea: number,
  coloresLineaEdit: number,
  texto: number,              // ID texto etiqueta
  textoVar: number,           // ID texto del valor actual (enum)
  valorEditableONav: number,  // > 0 = editable
  indicePantalla: number,
}
```

### `objEditVariables` — edición de variable numérica

Aparece cuando se pide una pantalla de edición. Contiene el valor actual y los límites.

```ts
{
  tipoObjeto: "objEditVariables",
  textoVar: number,           // ID texto del nombre de la variable
  tipoVar: number,
  valorVariable: number,      // valor actual (u32, interpretar según tipoVar)
  unidad: number,
  maximo: number,
  minimo: number,
  tipoVarEdicion: number,
  ptrVariableEdicion: number, // punteroVariableEdicion → necesario para el WRITE
  ptrFuncionSaltoTrasEdit: number,
}
```

### `objIdUnicoEdicion` — ID para el WRITE

```ts
{
  tipoObjeto: "objIdUnicoEdicion",
  idUnicoEdicion: number,     // ← usar como idUnicoEdicion en la petición de WRITE
}
```

---

## Cómo navegar de una pantalla a otra

Los objetos de línea con `valorEditableONav > 0` indican que esa línea permite navegar a una subpantalla o editarla. El valor `valorEditableONav` es el `idUnicoEdicion` que hay que pasar en la siguiente petición.

Para **navegar** a la subpantalla de edición de esa línea:

```
POST /pruebas/peticionPantallaConEspera
  ?mac=...&eventId=3&idEnvio=3
  &readWrite=0&esPantallaPrincipal=0
  &idNav=<idPantalla_actual>
  &indicePantalla=0
  &idUnicoEdicion=<valorEditableONav>
```

---

## Cómo hacer un WRITE (cambiar un parámetro)

Para cambiar el valor de una variable tras haber recibido la pantalla, usar los endpoints de `core-simulation`:

```
POST /core-simulation/cambia-parametro-numerico
  ?mac=...&idPantalla=...&indicePantalla=0&idUnicoEdicion=...
  Body JSON: { "punteroVariableEdicion": ..., "tipoVariableEdicion": ..., "valorVariable": ... }
```

Los valores necesarios (`punteroVariableEdicion`, `tipoVariableEdicion`, `idUnicoEdicion`) vienen dentro de los objetos `objEditVariables`, `objCambiaParametros` y `objIdUnicoEdicion` de la respuesta de la pantalla.

---

## Endpoint de debug

```
POST /pruebas/peticionesPendientes
```

Devuelve las claves `mac_idPantalla` de las peticiones que están actualmente en espera:

```json
{ "total": 1, "peticiones": ["1234567890123_302949"] }
```

---

## Tipos TS disponibles en la librería compartida

El proyecto Next.js tiene acceso a `src/utils/common-lib-commac-generador/`. Las interfaces de cada objeto de pantalla están en:

```
src/utils/common-lib-commac-generador/NXP_BE/dtoBE/objetosPintaPantallaOmega.dto.ts
```

El enum con todos los `tipoObjeto`:

```ts
import { EnObjPintaPantallasOmega } from 'src/utils/common-lib-commac-generador/NXP_BE/globals/enumOld';
// EnObjPintaPantallasOmega.objPlantilla === 1
// EnObjPintaPantallasOmega.objLineaTextVar === 4
// etc.
```

El tipo unión de todos los objetos posibles:

```ts
import { ObjPintaPantalla } from 'src/utils/common-lib-commac-generador/NXP_BE/dtoBE/objetosPintaPantallaOmega.dto';
```

### Patrón recomendado para renderizar en Next.js

```ts
import { EnObjPintaPantallasOmega } from '.../enumOld';
import type { ObjPintaPantalla, ObjTipoPlantilla, ObjLineaTextVar } from '.../objetosPintaPantallaOmega.dto';

function renderObjeto(obj: ObjPintaPantalla) {
  switch (obj.tipoObjeto) {
    case EnObjPintaPantallasOmega.objPlantilla:
      return <PlantillaHeader plantilla={obj as ObjTipoPlantilla} />;
    case EnObjPintaPantallasOmega.objEncabezado:
      return <Encabezado data={obj as ObjEncabezado} />;
    case EnObjPintaPantallasOmega.objLineaTextVar:
      return <LineaTextVar data={obj as ObjLineaTextVar} />;
    case EnObjPintaPantallasOmega.objLineaTextText:
      return <LineaTextText data={obj as ObjLineaTextText} />;
    case EnObjPintaPantallasOmega.objLineaGrafica:
      return <Separador />;
    // ...
  }
}
```

> ℹ️ El campo `tipoObjeto` en la respuesta JSON viene como **string** (p.ej. `"objLineaTextVar"`), no como número. Al comparar con el enum, el enum devuelve **número**. Para comparar usa `EnObjPintaPantallasOmega[obj.tipoObjeto as keyof typeof EnObjPintaPantallasOmega]` o simplemente compara el string directamente: `obj.tipoObjeto === 'objLineaTextVar'`.
