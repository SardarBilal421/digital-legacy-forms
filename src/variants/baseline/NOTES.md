# Baseline (no library) — implementation notes

**Library:** none — plain React `useReducer` + Zod

## Design: "Split Screen Live Preview"

Calm and premium with a teal accent and a secure feel (lock icons, trust
badges). The form sits on the left; on the right a live **"Your Digital Legacy
Plan"** document fills in as you type — names, executors, services, per-platform
decisions — with a draft stamp and a "nothing leaves your browser" footer. On
mobile the preview collapses into a **bottom drawer** opened by a floating
"View your plan" button. Typeface: Plus Jakarta Sans (`.baseline-scope`).

Visual code is in `src/variants/baseline/ui/` (`fields`, `form-body`, `review`,
`preview`, `success`, `BaselineSplit`) plus `src/app/baseline/layout.tsx`.

**Driving a live preview with no library:** this is where "no library" actually
shines. The hand-written `useReducer` already holds the single source of truth,
so the preview is just a second reader of `state.values` — it re-renders in
lock-step with the form for free, no extra wiring, subscriptions or selectors.
The cost is everything else: every keystroke handler, immutable nested `setIn`
update, touched/dirty flag and per-step validation gate that both the form and
the preview depend on is written by hand (see the reducer + `setIn`).
## What was easy

- **No magic.** A single `useReducer` holds `values`, `touched`, `dirty` and the
  per-step `revealed` list. Every state transition is explicit and greppable.
- Reusing the shared Zod schema means validation is one call —
  `validateValues(state.values)` — recomputed with `useMemo` on each change.
- Conditionals and the review step just read `state.values`; nothing to
  subscribe to.

## What was awkward

- **You build everything.** Change/blur handlers, immutable nested updates
  (`setIn` by dot-path), array add/remove, touched gating, per-step validation,
  first-error focus and draft restore are all hand-written. It's the most code of
  the five — which is exactly the point of the comparison.
- **Immutable nested writes.** Updating `execPrimary.email` or
  `iamContacts.2.phone` means cloning each node along the path; a small `setIn`
  helper handles both objects and array indices.
- **Error gating.** Without a library tracking touched state, we keep our own
  `touched` map and only show an error once a field is blurred (or its step is
  revealed by a failed Next).

## Workarounds

- None needed — but note how much plumbing the libraries remove. The reducer +
  `setIn` + gating is ~120 lines that RHF/TanStack/Formik give you for free.

## Conditionals / arrays / multi-step

- **Conditionals:** plain `state.values.x === …` checks in the shared `<FormBody>`.
- **Field arrays:** `set("iamContacts", [...])` with append / filter.
- **Multi-step:** shared `useStepFlow`; the reducer supplies values that the
  shared schema validates per step, and `dirty`/`touched` drive the UX.
