# TanStack Form — implementation notes

**Library:** `@tanstack/react-form` 1.33 + Zod (Standard Schema)

## Design: "Sidebar Dashboard"

Dark, modern SaaS (Linear/Vercel). A persistent left sidebar lists every section
with a live status icon — not started / in progress / completed / needs attention
— the main panel shows the current section, and a sticky bottom save bar carries
the "Draft saved" status plus Back / Continue / Save and exit. On mobile the
sidebar collapses to a horizontal strip of status chips. Its own typeface (Geist)
and a near-black violet-accented palette live under `.tanstack-scope`.

All visual code is in `src/variants/tanstack/ui/` (`fields`, `form-body`, `review`,
`success`, `TsDashboard`) plus `src/app/tanstack/layout.tsx`. Shared behaviours
(Save and exit + resume, warn-before-leave, what-happens-next) reuse the same
`shared/progress.ts`, `shared/useUnsavedWarning.ts` and `useStepFlow({ initialStep })`
helpers as every variant.

**Driving the sidebar from TanStack:** a good fit. `useStore` subscriptions give
the sidebar a live read of the store, and the new `sectionStatus(step)` helper in
the hook buckets the shared validator's issues by step to compute each badge. The
one piece of care: distinguishing *error* (revealed + has issues) from *in
progress* (started, issues not yet surfaced) means tracking a per-step "reveal"
set alongside the store, since TanStack validates on submit rather than per step.
## What was easy

- **Store subscriptions.** `useStore(form.store, s => s.values)` gives a precise,
  typed subscription to exactly the slice we need. The same store powers the
  conditional sections and the review step.
- **Array helpers.** `form.pushFieldValue("iamContacts", …)` and
  `form.removeFieldValue("iamContacts", i)` made the Google IAM list a two-liner —
  no extra array-field hook required.
- **Standard Schema.** Zod 4 implements Standard Schema, so the schema drops
  straight into `validators.onSubmit` with no adapter package.

## What was awkward

- **Dynamic paths vs typed Field.** The idiomatic TanStack pattern is
  `<form.Field name="…">` with fully-typed names. Our shared `<FormBody>` resolves
  fields by dynamic string path, so we use the imperative `setFieldValue` /
  `getFieldValue` surface instead and cast the path to `never`.
- **Touched gating.** Because we don't mount `<form.Field>` components, TanStack
  isn't tracking `isTouched` for us, so we keep a small `touched` set + a per-step
  `revealed` set to decide when an error is shown (same approach as the RHF variant).

## Workarounds

- `validators.onSubmit` is cast (`formSchema as never`) because the schema's input
  type narrows radios to literal unions while the draft state allows `""`.
- Per-step validation and first-error focus read the shared `validateValues`
  helper for determinism rather than scraping field meta.

## Conditionals / arrays / multi-step

- **Conditionals:** read from the subscribed `values` snapshot in `<FormBody>`.
- **Field arrays:** TanStack's built-in `pushFieldValue` / `removeFieldValue`.
- **Multi-step:** shared `useStepFlow`; TanStack supplies the live values that the
  shared schema validates per step.
