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
- [x] `ObjLineaGrafica.tsx` — visual separator; check if height needs adjustment

## Info row components (ObjLineaInfo*)

- [x] `ObjLineaInfoTextText.tsx` — `responsive` prop
- [x] `ObjLineaInfoTextVar.tsx` — `responsive` prop
- [x] `ObjLineaInfoTextTextVarVar.tsx` — `responsive` prop

## Edit controls

- [x] `ObjEditVariables.tsx` — `responsive` prop; `text-6xl`→`text-2xl`, `w-48`→`w-32`, padding/gap scaled
- [x] `ObjEditVariablesString.tsx` — `responsive` prop; `text-6xl`→`text-2xl`, `w-120`→`w-48`
- [x] `ObjEditVariablesTiempoFecha.tsx` — `responsive` prop cascaded to `FieldsWrapper` + `TimeField`
- [x] `ObjCamposMultiseleccion.tsx` — `responsive` prop; circle 52→24px, dot 26→12px, `text-5xl`→`text-lg`
- [x] `ObjEncabezadoEditIcono.tsx` — `responsive` prop; icon `size={60}`→`size={28}`

## Ventilation

- [x] `ObjVentilacionGrupoGraficoEdit.tsx` — tabs + trash; `responsive` prop, `py-[15.5px]`
- [x] `ObjVentilacionGrupoGrafico.tsx` — fan SVG grid; `responsive` prop, fan `size={28}`, text `text-lg`, chevron `size={20}`

## Free canvas (PosXyLibre*)

- [ ] `ObjPosXyLibreIcon.tsx` — icon at absolute coords; scaling via ESCALA in PantallaLibre
- [ ] `ObjPosXyLibreVariable.tsx` — variable at absolute coords; same
- [ ] `ObjPosXyLibreLineas.tsx` — rectangle at absolute coords; same

## Tables

- [x] `ObjTablaDatosSinEdicion.tsx` — `responsive` prop; `h-20`→`h-10`, `text-3xl`→`text-sm`
- [x] `ObjTablaDinamica.tsx` — `responsive` prop cascaded to `ObjTablaDinamicaFila`
- [x] `ObjTablaDinamicaFila.tsx` — `responsive` prop; `h-20`→`h-10`, text `text-3xl`→`text-sm` (skips length-based shrink)
- [x] `ObjTablaDinamicaInit.tsx` — returns null, no UI, no changes needed

## Direct access bar

- [x] `BarraBotonesCti40Plus.tsx` — `compact` prop; `grid grid-cols-4` on mobile

## Overlays / modals

- [ ] `ObjPopup.tsx` — already uses `fixed inset-0 max-w-md`; verify inner text doesn't use `text-5xl`

## Helpers (no UI of their own, no changes needed)

- [ ] `ObjDescripcionPantallaCambioParametro.tsx` — metadata, renders nothing
- [ ] `ObjVarIndividual.tsx` — not rendered in CTI40+
- [ ] `ObjVineta.tsx` — not rendered
- [ ] `ObjTablaConfig.tsx` — parse helper, no JSX
