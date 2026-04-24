# Responsive Checklist — render-objetos-cti40plus

Components in `app/components/render-objetos-cti40plus/` that need responsive adaptation.
Methodology: see `.claude/commands/responsive-obj.md` or invoke `/responsive-obj`.

## Infrastructure (done)

- [x] `app/hooks/useIsSmallScreen.ts` — viewport detection hook (< 960×720)
- [x] `app/cti40plus/PantallaCti40Plus.tsx` — desktop / responsive split + mobile navbar
- [x] `app/cti40plus/PantallaLibre.tsx` — `containerWidth` prop for dynamic ESCALA
- [x] `RenderObjeto.tsx` — `responsive` prop cascaded to children

## Navigable row components (ObjLinea*)

- [x] `ObjLineaText.tsx` — `responsive` prop
- [x] `ObjLineaTextVar.tsx` — `responsive` prop
- [x] `ObjLineaTextVarVar.tsx` — `responsive` prop
- [x] `ObjLineaTextText.tsx` — `responsive` prop
- [x] `ObjLineaTextString.tsx` — `responsive` prop
- [ ] `ObjLineaGrafica.tsx` — visual separator; check if height needs adjustment

## Info row components (ObjLineaInfo*)

- [x] `ObjLineaInfoTextText.tsx` — `responsive` prop
- [x] `ObjLineaInfoTextVar.tsx` — `responsive` prop
- [x] `ObjLineaInfoTextTextVarVar.tsx` — `responsive` prop

## Edit controls

- [ ] `ObjEditVariables.tsx` — numeric input; `text-6xl` → `text-2xl`, `w-48` → `w-36`
- [ ] `ObjEditVariablesString.tsx` — text input; same pattern
- [ ] `ObjEditVariablesTiempoFecha.tsx` — time/date picker; complex layout (★★★)
- [ ] `ObjCamposMultiseleccion.tsx` — radio/checkbox rows; `text-5xl` → `text-lg`
- [ ] `ObjEncabezadoEditIcono.tsx` — header action button; already rendered inside responsive navbar

## Ventilation

- [x] `ObjVentilacionGrupoGraficoEdit.tsx` — tabs + trash; `responsive` prop, `py-[15.5px]`
- [ ] `ObjVentilacionGrupoGrafico.tsx` — fan SVG grid; hardcoded dimensions (★★★)

## Free canvas (PosXyLibre*)

- [ ] `ObjPosXyLibreIcon.tsx` — icon at absolute coords; scaling via ESCALA in PantallaLibre
- [ ] `ObjPosXyLibreVariable.tsx` — variable at absolute coords; same
- [ ] `ObjPosXyLibreLineas.tsx` — rectangle at absolute coords; same

## Tables

- [ ] `ObjTablaDatosSinEdicion.tsx` — static table; `overflow-x-auto`, `text-5xl` → `text-sm`
- [ ] `ObjTablaDinamica.tsx` — dynamic table; same
- [ ] `ObjTablaDinamicaFila.tsx` — dynamic table row; scale text
- [ ] `ObjTablaDinamicaInit.tsx` — dynamic table header; scale text

## Direct access bar

- [x] `BarraBotonesCti40Plus.tsx` — `compact` prop; `grid grid-cols-4` on mobile

## Overlays / modals

- [ ] `ObjPopup.tsx` — already uses `fixed inset-0 max-w-md`; verify inner text doesn't use `text-5xl`

## Helpers (no UI of their own, no changes needed)

- [ ] `ObjDescripcionPantallaCambioParametro.tsx` — metadata, renders nothing
- [ ] `ObjVarIndividual.tsx` — not rendered in CTI40+
- [ ] `ObjVineta.tsx` — not rendered
- [ ] `ObjTablaConfig.tsx` — parse helper, no JSX
