# Regla: Verificación de Calidad del Código

## Comandos Obligatorios Después de Cambios

**SIEMPRE** después de implementar cambios en el código, ejecuta estos dos comandos en secuencia:

### 1. Linting
```bash
yarn lint
```
- Verifica el estilo y calidad del código
- Identifica problemas potenciales
- Debe ejecutarse sin errores

### 2. Type Checking
```bash
yarn tsc --noEmit
```
- Verifica la seguridad de tipos de TypeScript
- Asegura que no hay errores de compilación
- Debe ejecutarse sin errores (exit code 0)

## Proceso de Verificación

1. **Implementar cambios** - Realizar las modificaciones solicitadas
2. **Ejecutar yarn lint** - Corregir todos los warnings y errores de linting
3. **Ejecutar yarn tsc --noEmit** - Corregir todos los errores de TypeScript
4. **Confirmar éxito** - Ambos comandos deben terminar sin errores

## Importancia

- **Calidad**: Asegura código limpio y mantenible
- **Seguridad**: Previene errores en tiempo de ejecución
- **Consistencia**: Mantiene estándares del equipo
- **Performance**: Detecta problemas temprano

## No Omitir

Estos comandos son **OBLIGATORIOS** y no deben omitirse bajo ninguna circunstancia después de realizar cambios en el códigobase.
