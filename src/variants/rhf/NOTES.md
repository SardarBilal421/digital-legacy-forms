# React Hook Form — implementation notes

**Library:** `react-hook-form` 7.90 + `@hookform/resolvers` (Zod)

## Design: "Classic Wizard" (GEICO-minimal)

Clean, corporate and trustworthy: a single centered white card on a light-gray
canvas, one blue accent, Inter typeface, top-left labels and a numbered top
progress bar. One step at a time, Back / Continue at the bottom, no
distractions — straight to the questions, GEICO-style.

Everything visual lives under `src/variants/rhf/ui/` (its own `fields`, `stepper`,
`form-body`, `review`, `success` and the `RhfWizard` shell) plus the per-route
font/scope in `src/app/rhf/layout.tsx`. Nothing visual is shared with the other
variants.

Added behaviours (all variants): **Save and exit** (flushes the draft + step and
returns to the index; on return you resume on the saved step via
`shared/progress.ts` + `useStepFlow({ initialStep })`), a **Warn before leaving**
prompt while there is unsaved input (`shared/useUnsavedWarning.ts`), and a
**"What happens next"** confirmation page after submit (`ui/success.tsx`).

**Driving the wizard from RHF:** cheap. `watch()` already powers the stepper's
completion state and the conditional sections, and uncontrolled refs keep the
single card snappy while typing. The only real friction is that gating errors to
a per-step *reveal* set is separate from RHF's own `touched`, so error display is
still hand-managed (see below).

## What was easy

- One-line validation wiring: `resolver: zodResolver(formSchema)` reuses the
  shared schema verbatim, including all cross-field `superRefine` rules.
- Field arrays: `useFieldArray({ name: "iamContacts" })` gives `append` / `remove`
  and a stable `fields` array with keys — the Google IAM list was trivial.
- `watch()` returns a live snapshot that re-renders the component, which is
  exactly what the conditional sections and the review step need.
- Per-step gating: `trigger(STEPS[step].rootKeys)` validates just that step.

## What was awkward

- **Controlled shared components.** Our shared fields are controlled
  (`value` / `onChange`), while RHF is happiest with uncontrolled `register`.
  Because the adapter resolves fields by dynamic string path, we can't call
  `useController` per field (rules of hooks), so we bind manually with
  `setValue` / `watch` / `trigger`.
- **Error timing.** With a resolver, a single blur runs the whole schema and
  populates `formState.errors` for *every* field. To honour "errors only after
  touched" we keep our own `touched` set and a per-step `revealed` set and gate
  display ourselves, rather than trusting `formState.errors` directly.
- Typing `setValue(path, value)` against a dynamic string path needs a cast to
  `FieldPath<FormValues>`.

## Workarounds

- `zodResolver(formSchema)` is cast to `Resolver<FormValues>` because the schema
  input type narrows radio values to their literal unions while the draft state
  allows `""` for "not yet chosen".
- First-error focus uses the shared `validateValues` helper for a deterministic
  path, then `focusFirstError` scrolls/focuses it.

## Conditionals / arrays / multi-step

- **Conditionals:** read straight from `watch()` in the shared `<FormBody>`
  (`v.isOver18 === "no"`, `v.services.includes("youtube")`, …). Hidden fields are
  stripped from the payload by the shared `cleanData` before submit.
- **Field arrays:** `useFieldArray` (min 1 / max 3 enforced in the UI + schema).
- **Multi-step:** the shared `useStepFlow` owns the step index; RHF only provides
  `validateStep` / `validateAll` via `trigger` + the shared schema.
