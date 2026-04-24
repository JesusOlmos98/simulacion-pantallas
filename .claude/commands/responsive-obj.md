# Make an ObjXxx component responsive

Use this command when the user says "make [ComponentName] responsive" or similar.

## Project context

- Desktop view: fixed 960×720px screen, everything at 3x scale. Text `text-5xl`, large icons.
- Responsive view (mobile): native Tailwind layout. Text `text-lg`, small icons.
- The split happens in `PantallaCti40Plus.tsx` via `useIsSmallScreen()`.
- In the responsive branch, all `RenderObjeto` calls receive `responsive={true}` (already propagated in `RenderObjeto.tsx`).

## Standard pattern

### 1. Add prop to interface

```tsx
interface Props {
  obj: ObjBase;           // or Record<string, unknown>
  // ... existing props ...
  responsive?: boolean;   // ← add this
}
```

### 2. Destructure

```tsx
export default function ObjXxx({ obj, ..., responsive }: Props): JSX.Element {
```

### 3. Class conversion table

| Desktop (no prop)  | Responsive (`responsive=true`) |
|--------------------|-------------------------------|
| `py-7`             | `py-3`                        |
| `px-3`             | `px-4`                        |
| `text-5xl`         | `text-lg`                     |
| `leading-[50px]`   | *(remove)*                    |
| `gap-3`            | `gap-2`                       |
| `gap-6`            | `gap-3`                       |

### 4. Icon size conversion table

| Usage                      | Desktop | Responsive |
|----------------------------|---------|------------|
| Chevron (`LuChevronRight`) | `50`    | `20`       |
| Row icon                   | `56`    | `24`       |
| Info / trash icon          | `75`    | `28`       |
| Icon container (`w-/h-`)   | `w-14 h-14` | `w-8 h-8` |

### 5. JSX application pattern

```tsx
// row padding
className={`flex items-center ... ${responsive ? 'px-4 py-3' : 'px-3 py-7'}`}

// text
className={`font-light ${responsive ? 'text-lg' : 'text-5xl'}`}

// leading (ObjLineaInfo* only)
const leading = responsive ? '' : 'leading-[50px]';

// chevron
<LuChevronRight size={responsive ? 20 : 50} color={COLORES.light} />

// icon container
<div className={`flex items-center justify-center ${responsive ? 'w-8 h-8' : 'w-14 h-14'}`}>
  <Icono size={responsive ? 24 : 56} color="white" />
</div>
```

## Special components

- **`ObjVentilacionGrupoGraficoEdit`**: uses `py-[15.5px]` in responsive (matches navbar height). Already done.
- **`BarraBotonesCti40Plus`**: uses `compact` prop instead of `responsive`. Already done.
- **`PantallaLibre`**: uses `containerWidth` prop instead of `responsive`. Already done.
- **`ObjPopup`**: already responsive by design (`max-w-md`, `fixed inset-0`). No changes needed.

## Propagation

If the component is used inside `RenderObjeto.tsx`, verify that the matching `case` passes `responsive={responsive}`. Already done for all ObjLinea* and ObjLineaInfo*.

## Mandatory check after each component

```bash
yarn tsc --noEmit
```

No errors = ready to tick off in `responsive-checklist.md`.
