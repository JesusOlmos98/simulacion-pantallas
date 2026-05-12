<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**  *generated with [DocToc](https://github.com/thlorenz/doctoc)*

- [DTO para las peticiones de pantallas](#dto-para-las-peticiones-de-pantallas)
- [PETICION](#peticion)
  - [Ejemplo de envío de variables en petición de pantalla (para pedir la pantalla de Calefaccion 1 del CTI40 PLUS):](#ejemplo-de-env%C3%ADo-de-variables-en-petici%C3%B3n-de-pantalla-para-pedir-la-pantalla-de-calefaccion-1-del-cti40-plus)
- [RESPUESTA](#respuesta)
  - [Ejemplo JSON de respuesta (estos objetos los interpreta el @app\components\render-objetos-cti40plus\RenderObjeto.tsx y los renderiza según lo que traigan) de la pantalla de Calefacción 1 del CTI40 PLUS:](#ejemplo-json-de-respuesta-estos-objetos-los-interpreta-el-appcomponentsrender-objetos-cti40plusrenderobjetotsx-y-los-renderiza-seg%C3%BAn-lo-que-traigan-de-la-pantalla-de-calefacci%C3%B3n-1-del-cti40-plus)
  - [De forma más legible en los logs del COMMAC tenemos algo como esto:](#de-forma-m%C3%A1s-legible-en-los-logs-del-commac-tenemos-algo-como-esto)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

---

## DTO para las peticiones de pantallas

Las variables que SIEMPRE se envían son:

eventId, idEnvio, mac, readWrite, esPantallaPrincipal

El resto son opcionales, la mayoría por defecto 0 en caso de necesitarse y no haberse enviado.

```ts
export class EventBusPantallasDto {
  @Type(() => Number)
  @IsInt({ message: 'eventId debe ser un número entero' })
  eventId!: number;

  @Type(() => Number)
  @IsInt({ message: 'idEnvio debe ser un número entero' })
  idEnvio!: number;

  @IsString({ message: 'mac debe ser un string' })
  @Matches(/^\d+$/, { message: 'mac debe contener solo dígitos' })
  mac!: string;

  @Type(() => Number)
  @IsIn([0, 1], { message: 'readWrite debe ser 0 (READ) o 1 (WRITE)' })
  readWrite!: 0 | 1;

  @Type(() => Number)
  @IsIn([0, 1], { message: 'esPantallaPrincipal debe ser 0 (false) o 1 (true)' })
  esPantallaPrincipal!: 0 | 1;

  /** Navegación simple */
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'idNav debe ser un número entero' })
  idNav?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'indicePantalla debe ser un número entero' })
  indicePantalla?: number;

  /** Cabecera de edición */
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'idUnicoEdicion debe ser un número entero' })
  idUnicoEdicion?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'navIdPantallaRespuestaTrama debe ser un número entero' })
  navIdPantallaRespuestaTrama?: number;

  /** En principio, sin uso, se usa para navegar DIRECTAMENTE a otra pantalla de edición. */
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'navegacion debe ser un número entero' })
  navegacion?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'tipoVariableEdicion debe ser un número entero' })
  tipoVariableEdicion?: number;

  /** Cambio simple numérico / float */
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ allowNaN: false, allowInfinity: false }, { message: 'valorVariable debe ser numérico' })
  valorVariable?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'punteroVariableEdicion debe ser un número entero' })
  punteroVariableEdicion?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'textoTituloVariable debe ser un número entero' })
  textoTituloVariable?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'textoNombreVariable debe ser un número entero' })
  textoNombreVariable?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'textoOpcionCambioParametro debe ser un número entero' })
  textoOpcionCambioParametro?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'textoOpcionCambioParametroPersonalizado debe ser un número entero' })
  textoOpcionCambioParametroPersonalizado?: number;

  /** Cambio string */
  @IsOptional()
  @IsString({ message: 'valorVariableTexto debe ser string' })
  @MaxLength(32, { message: 'valorVariableTexto no puede superar 32 caracteres' })
  valorVariableTexto?: string;

  /** Cambio multi genérico */
  @IsOptional()
  @IsArray({ message: 'valores debe ser un array' })
  @Type(() => Number)
  @IsNumber({ allowNaN: false, allowInfinity: false }, { each: true, message: 'valores debe contener números' })
  valores?: number[];

  @IsOptional()
  @IsArray({ message: 'punterosVariablesEdicion debe ser un array' })
  @Type(() => Number)
  @IsInt({ each: true, message: 'punterosVariablesEdicion debe contener enteros' })
  punterosVariablesEdicion?: number[];

  @IsOptional()
  @IsArray({ message: 'textosNombreVariable debe ser un array' })
  @Type(() => Number)
  @IsInt({ each: true, message: 'textosNombreVariable debe contener enteros' })
  textosNombreVariable?: number[];

  /** Ventilación/grupo */
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'numDatosEditar debe ser un número entero' })
  numDatosEditar?: number;

  /** Concatenado */
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'textoTituloConcat debe ser un número entero' })
  textoTituloConcat?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'textoOpcionConcat debe ser un número entero' })
  textoOpcionConcat?: number;

  @IsOptional()
  @IsString({ message: 'textoValorConcat debe ser string' })
  @MaxLength(128, { message: 'textoValorConcat no puede superar 128 caracteres' })
  textoValorConcat?: string;

  /** Otros */
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'punteroFuncionSaltoTrasEdit debe ser un número entero' })
  punteroFuncionSaltoTrasEdit?: number;

  /** Auditoría */
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'idUsuarioServidor debe ser un número entero' })
  idUsuarioServidor?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'idClienteServidor debe ser un número entero' })
  idClienteServidor?: number;

  // obj_cambio_parametro_concatenado
  @IsOptional()
  @Type(() => Number)
  @IsIn([0, 1], { message: 'usarObjCambioParametroConcatenado debe ser 0 o 1' })
  usarObjCambioParametroConcatenado?: 0 | 1;

  @IsOptional()
  @IsString({ message: 'valorVariableHex debe ser string hex' })
  valorVariableHex?: string;

  @IsOptional()
  @IsString({ message: 'textoTituloConcatHex debe ser string hex' })
  textoTituloConcatHex?: string;

  @IsOptional()
  @IsString({ message: 'textoOpcionConcatHex debe ser string hex' })
  textoOpcionConcatHex?: string;

  @IsOptional()
  @IsString({ message: 'textoValorConcatHex debe ser string hex' })
  textoValorConcatHex?: string;
}
```

---

## PETICION

### Ejemplo de envío de variables en petición de pantalla (para pedir la pantalla de Calefaccion 1 del CTI40 PLUS):
```json

mac 202000029
eventId 1
idEnvio 111
readWrite 0
esPantallaPrincipal 0
idNav 134375613
indicePantalla 0

```

## RESPUESTA

### Ejemplo JSON de respuesta (estos objetos los interpreta el @app\components\render-objetos-cti40plus\RenderObjeto.tsx y los renderiza según lo que traigan) de la pantalla de Calefacción 1 del CTI40 PLUS: 
```json
[
    {
        "tipoObjeto": 1,
        "tipoPlantilla": 1,
        "estiloPlantilla": 1,
        "versionEquipo": 130,
        "idPantalla": 134375613,
        "indicePantalla": 0,
        "idioma": 0,
        "idSesionServidor": 0,
        "flagEstadisticosLocal": 0,
        "reserva1": 202,
        "reserva2": 0
    },
    {
        "tipoObjeto": 67,
        "idTextoConcatenado": 65400,
        "sizeTexto": 26,
        "cadenaConcatenadaRaw": {
            "type": "Buffer",
            "data": [
                253,
                255,
                4,
                6,
                32,
                0,
                45,
                0,
                32,
                0,
                101,
                0,
                106,
                0,
                101,
                0,
                109,
                0,
                112,
                0,
                108,
                0,
                111,
                0,
                49,
                0
            ]
        }
    },
    {
        "tipoObjeto": 2,
        "navIconMenuPtr": 0,
        "colorTitulo": 1,
        "tituloText": 65400,
        "iconoTarea3": 0,
        "pantallaSaltoTarea3": 0,
        "indicePantallaTarea3": 0,
        "iconoTarea2": 322,
        "pantallaSaltoTarea2": 134375353,
        "indicePantallaTarea2": 0
    },
    {
        "tipoObjeto": 3,
        "iconoLinea": 0,
        "coloresLinea": 1,
        "texto": 2,
        "iconoVarCentral": 50,
        "tipoVarCentral": 17,
        "variableCentral": 1109917696,
        "unidadCentral": 1,
        "tipoVar": 17,
        "variable": 1065353216,
        "unidad": 1,
        "valorEditableONav": 134376721,
        "indicePantalla": 0
    },
    {
        "tipoObjeto": 4,
        "iconoLinea": 0,
        "coloresLineaEdit": 1,
        "texto": 147,
        "tipoVar": 1,
        "variable": 60555276,
        "unidad": 10,
        "valorEditableONav": 1,
        "indicePantalla": 0
    },
    {
        "tipoObjeto": 4,
        "iconoLinea": 0,
        "coloresLineaEdit": 1,
        "texto": 148,
        "tipoVar": 1,
        "variable": 59965528,
        "unidad": 10,
        "valorEditableONav": 2,
        "indicePantalla": 0
    },
    {
        "tipoObjeto": 4,
        "iconoLinea": 0,
        "coloresLineaEdit": 1,
        "texto": 149,
        "tipoVar": 17,
        "variable": 1078774989,
        "unidad": 1,
        "valorEditableONav": 3,
        "indicePantalla": 0
    },
    {
        "tipoObjeto": 6,
        "coloresLineaEdit": 1,
        "texto": 40,
        "tipoVar": 17,
        "variable": 3259498496,
        "unidad": 1
    },
    {
        "tipoObjeto": 6,
        "coloresLineaEdit": 1,
        "texto": 146,
        "tipoVar": 1,
        "variable": 0,
        "unidad": 10
    },
    {
        "tipoObjeto": 7,
        "coloresLineaEdit": 1,
        "texto": 829,
        "textoVar": 45
    },
    {
        "tipoObjeto": 7,
        "coloresLineaEdit": 1,
        "texto": 99,
        "textoVar": 105
    }
]
```

### De forma más legible en los logs del COMMAC tenemos algo como esto:
```log

INFO [05/06/2026  08:52:33.511]: Objetos recibidos (11):
{"tipoObjeto":"objPlantilla","tipoPlantilla":1,"estiloPlantilla":1,"versionEquipo":130,"idPantalla":134375613,"indicePantalla":0,"idioma":0,"idSesionServidor":0,"flagEstadisticosLocal":0,"reserva1":202,"reserva2":0}
{"tipoObjeto":"objTextoConcatenadoPlantilla","idTextoConcatenado":65400,"sizeTexto":26,"cadenaConcatenadaRaw":{"type":"Buffer","data":[253,255,4,6,32,0,45,0,32,0,101,0,106,0,101,0,109,0,112,0,108,0,111,0,49,0]}}
  idTextoConcatenado --> 65400
  concatenado --> textCalefaccion1 - ejemplo1
{"tipoObjeto":"objEncabezado","navIconMenuPtr":0,"colorTitulo":1,"tituloText":65400,"iconoTarea3":0,"pantallaSaltoTarea3":0,"indicePantallaTarea3":0,"iconoTarea2":322,"pantallaSaltoTarea2":134375353,"indicePantallaTarea2":0}
  tituloText --> ┬┐desconocido? (65400)
{"tipoObjeto":"objLineaTextVarVar","iconoLinea":0,"coloresLinea":1,"texto":2,"iconoVarCentral":50,"tipoVarCentral":17,"variableCentral":1109917696,"unidadCentral":1,"tipoVar":17,"variable":1065353216,"unidad":1,"valorEditableONav":134376721,"indicePantalla":0}
  texto --> textTemperaturaDeseada (2)
{"tipoObjeto":"objLineaTextVar","iconoLinea":0,"coloresLineaEdit":1,"texto":147,"tipoVar":1,"variable":60555276,"unidad":10,"valorEditableONav":1,"indicePantalla":0}
  texto --> textCalefaccionMinima (147)
  valor --> 12
{"tipoObjeto":"objLineaTextVar","iconoLinea":0,"coloresLineaEdit":1,"texto":148,"tipoVar":1,"variable":59965528,"unidad":10,"valorEditableONav":2,"indicePantalla":0}
  texto --> textCalefaccionMaxima (148)
  valor --> 88
{"tipoObjeto":"objLineaTextVar","iconoLinea":0,"coloresLineaEdit":1,"texto":149,"tipoVar":17,"variable":1078774989,"unidad":1,"valorEditableONav":3,"indicePantalla":0}
  texto --> textRango (149)
  valor --> 3.200000047683716
{"tipoObjeto":"objLineaInfoTextVar","coloresLineaEdit":1,"texto":40,"tipoVar":17,"variable":3259498496,"unidad":1}   
  texto --> textTemperatura (40)
{"tipoObjeto":"objLineaInfoTextVar","coloresLineaEdit":1,"texto":146,"tipoVar":1,"variable":0,"unidad":10}
  texto --> textPorcentaje (146)
{"tipoObjeto":"objLineaInfoTextText","coloresLineaEdit":1,"texto":829,"textoVar":45}
  texto --> textT1R6 (829)
  textoVar --> textDesconectado (45)
{"tipoObjeto":"objLineaInfoTextText","coloresLineaEdit":1,"texto":99,"textoVar":105}
  texto --> textValvula3Vias (99)
  textoVar --> textEnfriando (105)
  ```