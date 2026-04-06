# Regla: Uso de SVG vs Iconos Lucide

## Cuándo usar SVG
- **SOLO** cuando el usuario lo solicita explícitamente
- Para iconos personalizados que no existen en Lucide
- Cuando se requiere un diseño específico no disponible en Lucide

## Cuándo NO usar SVG
- **NUNCA** usar SVG para iconos estándar (flechas, menús, etc.)
- **NUNCA** usar SVG sin permiso explícito del usuario
- **NUNCA** usar SVG como reemplazo de iconos comunes

## Qué usar en su lugar
- **SIEMPRE** usar iconos de `react-icons/lu` (Lucide)
- **SIEMPRE** preferir iconos estándar de Lucide
- **SIEMPRE** usar componentes de iconos en lugar de SVG inline

## Ejemplos correctos
```tsx
import { LuChevronRight, LuMenu, LuSettings } from 'react-icons/lu'

// Correcto
<LuChevronRight size={24} />

// Incorrecto
<svg width="24" height="24" viewBox="0 0 20 20" fill="none">
  <path d="M7.5 15L12.5 10L7.5 5" stroke="currentColor" strokeWidth="2" />
</svg>
```

## Excepciones
- Solo cuando el usuario dice explícitamente "usa un SVG para..."
- Solo para diseños personalizados no disponibles en Lucide
