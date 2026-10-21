/** Metadata for every form variant — drives the landing cards, nav and About panels. */
export interface VariantMeta {
  slug: string;
  route: string;
  name: string;
  library: string;
  version: string;
  tagline: string;
  stateNotes: string[];
  draftKey: string;
  /** The design concept name (shown on the landing card + About panel). */
  design: string;
  /** Short description of the look, for the landing preview card. */
  designTagline: string;
  /** Design idea + library-specific friction, for the "About this variant" panel. */
  designNotes: string[];
}

export const VARIANTS: VariantMeta[] = [
  {
    slug: "rhf",
    route: "/rhf",
    name: "React Hook Form",
    library: "react-hook-form + @hookform/resolvers + zod",
    version: "react-hook-form 7.90",
    tagline: "Uncontrolled inputs, ref-based registration, Zod resolver.",
    stateNotes: [
      "Keeps field state in refs — minimal re-renders as you type.",
      "Zod validation wired through zodResolver, mode: onBlur.",
      "Conditional fields use watch(); field arrays via useFieldArray.",
    ],
    draftKey: "dlf:rhf",
    design: "Classic Wizard",
    designTagline:
      "Clean, corporate and trustworthy. A centered white card, blue accent, numbered progress bar and Back/Next at the bottom — GEICO-style, straight to the questions.",
    designNotes: [
      "Design: a focused one-step-at-a-time wizard. No distractions, clear numbered progress, top-left labels.",
      "RHF fit: watch() drives the stepper's completion state cheaply, and uncontrolled refs keep the single card snappy even as you type.",
      "Friction: gating error display to a per-step 'reveal' set takes a little care since RHF's own touched state differs from our step-aware reveal.",
    ],
  },
  {
    slug: "tanstack",
    route: "/tanstack",
    name: "TanStack Form",
    library: "@tanstack/react-form + zod (standard schema)",
    version: "@tanstack/react-form 1.33",
    tagline: "Fully typed, field-first API with granular subscriptions.",
    stateNotes: [
      "Each field subscribes to its own slice of store state.",
      "Zod used as a Standard Schema validator per field + on submit.",
      'Field arrays via form.Field mode="array"; conditionals read store.',
    ],
    draftKey: "dlf:tanstack",
    design: "Sidebar Dashboard",
    designTagline:
      "Dark, modern SaaS (Linear/Vercel). A left sidebar lists every section with status icons; the main panel shows the current one; a sticky save bar sits at the bottom.",
    designNotes: [
      "Design: a workspace-style dashboard — persistent left nav with not-started / in-progress / done / error status per section, sticky 'Draft saved' save bar.",
      "TanStack fit: granular store subscriptions (useStore) let the sidebar recompute each section's status without re-rendering the whole form.",
      "Friction: deriving a live 'error' vs 'in progress' badge per section means running the shared validator against the store snapshot and bucketing issues by step.",
    ],
  },
  {
    slug: "formik",
    route: "/formik",
    name: "Formik",
    library: "formik + yup",
    version: "formik 2.4",
    tagline: "Classic controlled-component form state with a Yup schema.",
    stateNotes: [
      "Controlled components; whole-form state object re-renders.",
      "Validation via an equivalent Yup schema (validateOnBlur).",
      "Arrays via setFieldValue on the array path; conditionals read values.",
    ],
    draftKey: "dlf:formik",
    design: "One Question at a Time",
    designTagline:
      "Typeform/Lemonade style. Full-screen, big friendly type, one question per screen, Enter to continue, smooth slide/fade transitions over a warm gradient.",
    designNotes: [
      "Design: conversational flow — a single question fills the screen with large type and friendly microcopy; Enter advances, a slim progress line runs along the top.",
      "Formik fit: a fully-controlled values object makes 'show one field at a time' trivial — the current question just reads/writes one path.",
      "Friction: Formik validates the whole form, so per-question gating means filtering its error map down to the one field currently on screen before allowing Enter to continue.",
    ],
  },
  {
    slug: "conform",
    route: "/conform",
    name: "Conform",
    library: "@conform-to/react + @conform-to/zod + Server Actions",
    version: "@conform-to/react 1.21",
    tagline: "Progressive enhancement — works with JavaScript disabled.",
    stateNotes: [
      "Server Action validates with Zod; errors returned to the form.",
      "Native form state (the DOM) is the source of truth.",
      "Field arrays & conditionals via Conform's name/intent helpers.",
    ],
    draftKey: "dlf:conform",
    design: "Task List Hub",
    designTagline:
      "Minimal, editorial GOV.UK-style task list. A hub lists every section with Not started / In progress / Completed tags; each section saves back to the hub. Works with JavaScript disabled.",
    designNotes: [
      "Design: a GOV.UK task-list hub — the landing page is a checklist of sections with status tags (never answers), each fully clickable; 'Save and exit' returns to the hub; a final 'Review and submit' lists every answer with 'Change' links.",
      "Conform fit: because the DOM is the source of truth and validation runs in a Server Action, the hub and each section are real navigable pages that work with no JavaScript.",
      "Friction: 'add to a list' (contacts/executors/manager) with a confirm-before-remove step is the hardest part — it must round-trip through form intents / server state so it still works without JS.",
    ],
  },
  {
    slug: "baseline",
    route: "/baseline",
    name: "Baseline (no library)",
    library: "plain React (useReducer) + zod",
    version: "react 19.3",
    tagline: "Hand-written state, touched/dirty tracking and validation.",
    stateNotes: [
      "Single useReducer holds values, touched and errors.",
      "Zod safeParse on blur/step-change; errors filtered per field.",
      "Everything (arrays, conditionals, focus) is wired by hand.",
    ],
    draftKey: "dlf:baseline",
    design: "Split Screen Live Preview",
    designTagline:
      "Calm and premium with a teal accent and a secure feel. The form sits on the left; a live 'Your Digital Legacy Plan' document on the right fills in as you type. On mobile the preview becomes a bottom drawer.",
    designNotes: [
      "Design: a two-pane editor — form on the left, a living plan document on the right that updates as you type, with lock icons and trust badges reinforcing privacy.",
      "Baseline fit: the hand-written useReducer already holds the single source of truth, so the live preview is just another reader of the same state — no extra wiring.",
      "Friction: with no library, every keystroke, touched/dirty flag and immutable nested update that powers both the form and the live preview is written by hand.",
    ],
  },
];

export function getVariant(slug: string): VariantMeta | undefined {
  return VARIANTS.find((v) => v.slug === slug);
}
