# Digital Legacy Forms — one big form, five ways

A demo that builds the **same** multi-step form — _Digital Assets & Digital Legacy
Safeguarding_ — five different ways, one per form library. The UI, steps, fields,
copy and validation rules are identical across all five; **only the form logic
differs**, so you can compare the developer experience and the resulting UX
side by side.

| Route        | Library                                             |
| ------------ | --------------------------------------------------- |
| `/rhf`       | React Hook Form + Zod (`@hookform/resolvers`)       |
| `/tanstack`  | TanStack Form + Zod (Standard Schema)               |
| `/formik`    | Formik + Yup                                        |
| `/conform`   | Conform + Zod + Server Actions (works with no JS)   |
| `/baseline`  | No library — plain React `useReducer` + Zod         |

The landing page at `/` links to each variant; every variant page has a top nav
to jump between them and an **About this variant** drawer.

> **Privacy:** this is a demo. There is no real backend — submitting calls a fake
> server action that waits ~1s and returns a reference. Nothing is stored or
> logged. Never enter passwords; the form only asks _who_ should manage accounts.

## Running it

Requires Node 20+ and pnpm.

```bash
pnpm install
pnpm dev          # http://localhost:3000
```

Other scripts:

```bash
pnpm build        # production build (Turbopack)
pnpm start        # serve the production build
pnpm lint         # ESLint (strict, no `any`)
pnpm format       # Prettier write
pnpm format:check # Prettier check
pnpm report       # build, then print LOC / files / First Load JS per variant
```

### `pnpm report`

Prints, per variant, the number of source files, non-blank lines of code
(`src/variants/<slug>` + its route page), and the **First Load JS** — computed
from the prerendered HTML by summing the gzipped size of the `/_next/static`
chunks each route loads. (Next 16 + Turbopack doesn't print First Load JS in the
build table, so the script derives it from the build output.)

## How it's structured

```
src/
  app/
    page.tsx                 # landing page (variant cards)
    layout.tsx               # root layout, theme provider
    rhf|tanstack|formik|conform|baseline/page.tsx   # one route per variant
  shared/                    # everything that must be identical across variants
    schema.ts                # the Zod schema (reused by RHF, TanStack, Conform, baseline)
    steps.ts                 # step config + per-step validation + cleanData()
    copy.ts                  # all user-facing text
    options.ts               # field options + labels
    variants.ts              # variant metadata (landing cards, nav, About panel)
    form-api.ts              # the FormApi adapter interface (the shared/variant seam)
    useStepFlow.ts           # multi-step nav, completed steps, focus-first-error, submit
    useAutosave.ts           # debounced localStorage draft (+ load/clear)
    focus.ts                 # scroll to + focus the first error
    submit.ts                # fake server action (JS variants)
    ui/                       # presentational components (identical UI everywhere)
      form-body.tsx          # renders all 7 steps' fields via the FormApi
      controlled-variant.tsx # shared chrome for the 4 controlled variants
      stepper, step-shell, fields, contact-block, review-summary,
      draft-saved-badge, privacy-note, about-panel, variant-shell,
      success-screen, top-nav, theme-*
  variants/                  # each variant's OWN form logic lives here
    rhf/        useRhfForm.ts        + NOTES.md
    tanstack/   useTanstackForm.ts   + NOTES.md
    formik/     schema.ts (Yup) + useFormikForm.ts + NOTES.md
    conform/    ConformForm.tsx + fields.tsx + action.ts + formData.ts + NOTES.md
    baseline/   useBaselineForm.ts   + NOTES.md
scripts/report.mjs
```

### The shared/variant seam

To keep the UI genuinely identical while letting each library be idiomatic, the
four controlled variants render through a shared `<FormBody>` that asks a small
**`FormApi`** adapter (`src/shared/form-api.ts`) for each field's value, error
and change/blur handlers. Each variant implements that adapter in its own idiom —
that's where RHF, TanStack, Formik and the baseline genuinely differ (state
storage, touched tracking, field arrays, validation wiring).

**Conform is different on purpose.** It is uncontrolled and progressively
enhanced, so it does _not_ use `<FormBody>`; it has its own native,
`name`-based field components and a Server Action, and it works with JavaScript
disabled. See `src/variants/conform/NOTES.md`.

Every variant folder has a `NOTES.md` describing what was easy, what was awkward,
and how it handles conditional fields, field arrays and the multi-step flow.

## The libraries, briefly

- **React Hook Form** — uncontrolled/ref-based, minimal re-renders, one-line Zod
  resolver, `useFieldArray` for the repeatable list. Great DX; binding to
  controlled components needs a little care.
- **TanStack Form** — fully-typed, store-based with granular subscriptions
  (`useStore`), built-in array helpers, Zod via Standard Schema (no adapter).
- **Formik** — classic controlled form state; batteries-included object
  (`values`/`errors`/`touched`). Cross-field rules in Yup are the fiddly part.
- **Conform** — the progressive-enhancement option: the DOM is the source of
  truth and validation runs in a Server Action, so the form survives with no JS.
- **Baseline** — no library. Shows exactly how much plumbing (immutable updates,
  touched/dirty, per-step validation, focus) the libraries remove for you.

## UX & accessibility

All variants share: a progress stepper with clickable completed steps; validate-
on-blur with errors shown only after a field is touched (and cleared as soon as
it's fixed); scroll-to and focus the first error on a failed Next/submit;
debounced autosave to `localStorage` with a "Draft saved" badge, restore on
reload and a "Clear draft" button; a loading, double-submit-proof submit button;
a final review step with per-section Edit links and a consent checkbox; a success
screen; proper labels, `aria-invalid`/`aria-describedby`, input types,
`autocomplete` and `inputMode`; full keyboard support; responsive layout; and
light/dark mode.

## Stack

Next.js 16 (App Router, Turbopack) · React 19 · TypeScript (strict) ·
Tailwind CSS v4 · shadcn/ui (Base UI primitives) · Zod 4 · pnpm.
