# Formik — implementation notes

**Library:** `formik` 2.4 + `yup` 1.7

## Design: "One Question at a Time"

Typeform/Lemonade style: a full-screen, warm rose/amber gradient, friendly
Poppins type, one big question per screen with playful microcopy. Single-choice
answers auto-advance; text answers continue on **Enter**; a slim progress line
runs along the top; screens slide/fade via `motion`. Ends on a Review screen with
per-section **Change** links and the consent checkbox.

Visual + flow code is in `src/variants/formik/ui/` (`fields`, `questions`,
`review`, `success`, `FormikFlow`) plus `src/app/formik/layout.tsx`.

**Driving a question-at-a-time flow from Formik:** mostly a good fit. Formik's
fully-controlled `values` object makes rendering a single field trivial — each
screen just reads/writes one path. The friction is that Formik (like the shared
Zod schema) validates the *whole* form, so the flow filters the error map down to
the current question's `paths` before letting Enter advance, and marks just those
fields touched on a failed advance. The ordered, conditional question list is
rebuilt from `values` every render (`buildQuestions`) so new questions appear the
instant a controlling answer changes. Save-and-exit persists the **question
index** (not a step) via the shared `progress.ts`, so you resume on the exact
screen you left.
## What was easy

- `useFormik` gives a batteries-included object: `values`, `errors`, `touched`,
  `setFieldValue`, `setFieldTouched`, `validateForm`, `resetForm` — enough to
  drive the whole adapter without extra hooks.
- Field-level Yup reads naturally for the always-required fields
  (`.required()`, `.oneOf()`), and `validateForm()` returns a ready-made nested
  errors object.
- Formik already tracks `touched` per field, so error gating needed only a small
  per-step `revealed` set on top.

## What was awkward

- **Cross-field rules in Yup.** `.when()` chains get unwieldy for "fill one field
  → all required" and deeply conditional branches. We put every conditional /
  cross-field rule in a single object-level `.test` that pushes a
  `this.createError({ path })` per issue and returns an aggregated
  `yup.ValidationError` — effectively Yup's version of Zod's `superRefine`.
- **Nested errors.** Formik errors are a nested object mirroring values, so we
  flatten them to dot-paths to reuse the shared per-step / first-error helpers.
- **Re-render cost.** Formik is fully controlled, so every keystroke re-renders
  the whole form — fine here, but the most expensive of the five at scale.

## Workarounds

- Arrays are managed with `setFieldValue("iamContacts", …)` rather than
  `<FieldArray>`, because the shared `<FormBody>` is library-agnostic and can't
  depend on Formik context.

## Conditionals / arrays / multi-step

- **Conditionals:** read from `formik.values` in the shared `<FormBody>`.
- **Field arrays:** `setFieldValue` with a new array (append / filter).
- **Multi-step:** shared `useStepFlow`; Formik supplies `validateForm()` whose
  flattened errors feed per-step gating and first-error focus.
