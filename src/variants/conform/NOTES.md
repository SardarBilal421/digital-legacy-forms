# Conform — implementation notes

**Library:** `@conform-to/react` 1.21 + `@conform-to/zod` (v4) + Next.js Server Actions

## Design: "Task List Hub" (GOV.UK style)

Minimal and editorial: serif headings (Source Serif 4), lots of whitespace, a
single link-blue accent, over a near-white page (`.conform-scope`). The landing
view is a **task list hub** — the six sections listed with status tags
(**Not started / In progress / Completed**, never the answers themselves), each
row fully clickable. Opening a section shows just that section with **Save and
continue** and **Save and exit** (both return to the hub). A final
**Review and submit** section lists every answer with **Change** links.

Repeatable / optional people use an **add-to-list** pattern: the Google IAM
contacts are a summary of added people with an **Add another person** button and
a **confirm-before-remove** step; the optional second executor and the Meta
account manager use the same affordance (**Add…** to reveal, **Remove** with a
confirm).

**Works with JavaScript disabled — the hard constraint.** Because Conform keeps
the DOM as the source of truth and validates in a Server Action, every field for
every section is always rendered in one `<form>` (the hub/section/review split is
a client enhancement that only shows/hides them). With no JS you simply see all
sections and one submit button; validation still runs server-side via
`parseWithZod(formSchema)`.

**Friction:** the add-to-list "remove" has to be a real Conform intent so it
survives with no JS — the IAM list uses `form.remove`, and the optional
executor/manager use `form.reset` on the field name; the confirm step itself is a
JS-only nicety layered on top. Status tags are derived from the live snapshot by
bucketing the shared validator's issues per step, carefully phrased so they only
ever expose *status*, never a value.
## What was easy

- **Progressive enhancement for free.** Fields are native inputs bound by `name`
  with `defaultValue`, so the form posts to the Server Action and validates with
  the shared Zod schema **even with JavaScript disabled**.
- `getInputProps` / `getSelectProps` / `getCollectionProps` generate id, name,
  defaultValue and the aria attributes, so wiring a field is one call.
- Field arrays use Conform intents: `form.insert.getButtonProps(...)` /
  `form.remove.getButtonProps(...)` render real submit buttons that mutate the
  list — no local array state.
- Server-side validation is literally `parseWithZod(formData, { schema })`.

## What was awkward

- **No-JS multi-step.** A wizard is inherently JS-driven. We render *all* steps
  in one `<form>`; before hydration every step is visible (works no-JS), and
  after mount we collapse to the stepper, keeping hidden steps in the DOM so they
  still submit and validate.
- **Uncontrolled + review/conditionals.** Conform is uncontrolled, so to drive
  the conditional sections, the review summary and per-step "Next" validation we
  snapshot the DOM with `new FormData(form)` → `formDataToValues` and run the
  shared Zod schema on that.
- **Boolean coercion.** An unchecked checkbox submits *nothing*, so `z.boolean()`
  failed base parsing (`expected boolean, received undefined`) and short-circuited
  `superRefine`. Making `consent` optional and enforcing `=== true` in
  `superRefine` fixes it for both the checkbox and the controlled variants.

## Workarounds

- Draft autosave serialises the form to a nested object on `input`; "Clear draft"
  and "Start again" clear storage and reload so Conform re-reads a clean
  `defaultValue` (simplest reliable reset for an uncontrolled form).
- The array field `name` is cast to `never` at the intent call — a known Conform
  typing quirk when the form type is an `interface` (no index signature).

## Conditionals / arrays / multi-step

- **Conditionals:** read from the FormData snapshot; the server schema also only
  requires conditional fields when relevant, so no-JS submissions validate too.
- **Field arrays:** Conform `insert` / `remove` intents.
- **Multi-step:** client-only stepper over always-mounted step sections; the
  Server Action is the single source of truth on submit.
