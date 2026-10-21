import {
  formSchema,
  iamContactsRequired,
  secondExecutorStarted,
  contactStarted,
  type FormValues,
} from "./schema";

/**
 * Step configuration shared by every variant. `rootKeys` lists the top-level
 * FormValues keys that belong to each step; this lets us map any Zod issue to
 * the step that owns it (via `issue.path[0]`) for per-step validation and the
 * clickable stepper.
 */
export interface StepDef {
  id: string;
  title: string;
  shortTitle: string;
  rootKeys: (keyof FormValues)[];
}

export const STEPS: StepDef[] = [
  {
    id: "about",
    title: "About you",
    shortTitle: "About you",
    rootKeys: ["fullName", "previousSurname", "dob", "isOver18", "guardianPrimary", "guardianSecond"],
  },
  {
    id: "executors",
    title: "Digital Executors",
    shortTitle: "Executors",
    rootKeys: ["execPrimary", "execSecond", "execSecondEqualAccess", "execSecondAccessExplain"],
  },
  {
    id: "services",
    title: "Core services",
    shortTitle: "Services",
    rootKeys: [
      "services",
      "servicesOther",
      "photosBackedUp",
      "photosCopyWho",
      "driveBackedUp",
      "driveCopyWho",
      "youtubeUrl",
      "youtubeManager",
    ],
  },
  {
    id: "iam",
    title: "Google Inactive Account Manager",
    shortTitle: "Google IAM",
    rootKeys: ["iamSetup", "iamSupport", "iamContacts", "iamBypass"],
  },
  {
    id: "facebook",
    title: "Facebook",
    shortTitle: "Facebook",
    rootKeys: [
      "fbHas",
      "fbEmail",
      "fbPhone",
      "fbLegacyContact",
      "fbMediaDownloaded",
      "fbBackupLocation",
      "fbBackupWho",
      "fbAccountAction",
      "fbPrivateMessagesAccess",
      "fbPrivateMessagesWho",
      "fbMediaAccess",
      "fbSupport",
      "fbManager",
    ],
  },
  {
    id: "instagram",
    title: "Instagram",
    shortTitle: "Instagram",
    rootKeys: [
      "igHas",
      "igEmail",
      "igPhone",
      "igPlans",
      "igMediaDownloaded",
      "igAccountAction",
      "igFullAccess",
      "igFullAccessWho",
      "igSupport",
    ],
  },
  {
    id: "review",
    title: "Review & submit",
    shortTitle: "Review",
    rootKeys: ["consent"],
  },
];

export const STEP_COUNT = STEPS.length;
export const REVIEW_STEP = STEP_COUNT - 1;

/** Map of root key -> step index. */
export const rootKeyToStep: Record<string, number> = (() => {
  const map: Record<string, number> = {};
  STEPS.forEach((step, i) => {
    step.rootKeys.forEach((k) => {
      map[k] = i;
    });
  });
  return map;
})();

/** Flatten a Zod issue path to a dot-string DOM id, e.g. `iamContacts.0.email`. */
export function flattenPath(path: ReadonlyArray<PropertyKey>): string {
  return path.map((p) => String(p)).join(".");
}

export type ErrorMap = Record<string, string>;

/**
 * Validate the whole form once. Returns the first error message per flattened
 * field path. The `consent` error is only surfaced on the review step by
 * callers; here we always compute it.
 */
export function validateValues(values: FormValues): { ok: boolean; errors: ErrorMap } {
  const result = formSchema.safeParse(values);
  if (result.success) return { ok: true, errors: {} };
  const errors: ErrorMap = {};
  for (const issue of result.error.issues) {
    const key = flattenPath(issue.path);
    if (!(key in errors)) errors[key] = issue.message;
  }
  return { ok: false, errors };
}

/** Which step owns a flattened field path. */
export function stepOfPath(path: string): number {
  const root = path.split(".")[0];
  return rootKeyToStep[root] ?? 0;
}

/** Keep only the errors that belong to `step`. */
export function errorsForStep(errors: ErrorMap, step: number): ErrorMap {
  const out: ErrorMap = {};
  for (const [k, v] of Object.entries(errors)) {
    if (stepOfPath(k) === step) out[k] = v;
  }
  return out;
}

/** Validate a single step; returns that step's errors only. */
export function validateStep(values: FormValues, step: number): ErrorMap {
  return errorsForStep(validateValues(values).errors, step);
}

/** First error path for a step, in DOM order (used to scroll/focus). */
export function firstErrorPath(errors: ErrorMap, step: number): string | null {
  const stepErrors = errorsForStep(errors, step);
  const order = fieldOrderForStep(step);
  for (const path of order) {
    // exact or array-member match (iamContacts matches iamContacts.0.email)
    const hit = Object.keys(stepErrors).find((k) => k === path || k.startsWith(`${path}.`));
    if (hit) return hit;
  }
  // fallback: any
  const keys = Object.keys(stepErrors);
  return keys.length ? keys[0] : null;
}

/** Declared field order per step, used to resolve the "first" error. */
export function fieldOrderForStep(step: number): string[] {
  return STEPS[step].rootKeys.map((k) => String(k));
}

/**
 * Produce the submission payload: hidden/conditional fields are removed so
 * they are never stored or sent. Radio "" placeholders are dropped too.
 */
export function cleanData(values: FormValues): Record<string, unknown> {
  const v = values;
  const out: Record<string, unknown> = {};
  const put = (k: string, val: unknown) => {
    if (val === "" || val === undefined || val === null) return;
    if (Array.isArray(val) && val.length === 0) return;
    out[k] = val;
  };

  // Step 1
  put("fullName", v.fullName.trim());
  put("previousSurname", v.previousSurname.trim());
  put("dob", v.dob);
  put("isOver18", v.isOver18);
  if (v.isOver18 === "no") {
    put("guardianPrimary", v.guardianPrimary.trim());
    put("guardianSecond", v.guardianSecond.trim());
  }

  // Step 2
  out.execPrimary = trimContactLike(v.execPrimary);
  if (secondExecutorStarted(v.execSecond)) {
    out.execSecond = trimContactLike(v.execSecond);
    put("execSecondEqualAccess", v.execSecondEqualAccess);
    if (v.execSecondEqualAccess === "no") put("execSecondAccessExplain", v.execSecondAccessExplain.trim());
  }

  // Step 3
  put("services", v.services);
  if (v.services.includes("other")) put("servicesOther", v.servicesOther.trim());
  if (v.services.includes("googlePhotos")) {
    put("photosBackedUp", v.photosBackedUp);
    if (v.photosBackedUp === "yes") put("photosCopyWho", v.photosCopyWho.trim());
  }
  if (v.services.includes("drive")) {
    put("driveBackedUp", v.driveBackedUp);
    if (v.driveBackedUp === "yes") put("driveCopyWho", v.driveCopyWho.trim());
  }
  if (v.services.includes("youtube")) {
    put("youtubeUrl", v.youtubeUrl.trim());
    put("youtubeManager", v.youtubeManager.trim());
  }

  // Step 4
  put("iamSetup", v.iamSetup);
  put("iamSupport", v.iamSupport);
  if (iamContactsRequired(v)) out.iamContacts = v.iamContacts.map(trimContactLike);
  put("iamBypass", v.iamBypass);

  // Step 5
  put("fbHas", v.fbHas);
  if (v.fbHas === "yes") {
    put("fbEmail", v.fbEmail.trim());
    put("fbPhone", v.fbPhone.trim());
    put("fbLegacyContact", v.fbLegacyContact);
    put("fbMediaDownloaded", v.fbMediaDownloaded);
    if (v.fbMediaDownloaded === "yes") {
      put("fbBackupLocation", v.fbBackupLocation.trim());
      put("fbBackupWho", v.fbBackupWho.trim());
    }
    put("fbAccountAction", v.fbAccountAction);
    put("fbPrivateMessagesAccess", v.fbPrivateMessagesAccess);
    if (v.fbPrivateMessagesAccess === "yes") put("fbPrivateMessagesWho", v.fbPrivateMessagesWho.trim());
    put("fbMediaAccess", v.fbMediaAccess);
    put("fbSupport", v.fbSupport);
    if (contactStarted(v.fbManager)) out.fbManager = trimContactLike(v.fbManager);
  }

  // Step 6
  put("igHas", v.igHas);
  if (v.igHas === "yes") {
    put("igEmail", v.igEmail.trim());
    put("igPhone", v.igPhone.trim());
    put("igPlans", v.igPlans);
    put("igMediaDownloaded", v.igMediaDownloaded);
    put("igAccountAction", v.igAccountAction);
    put("igFullAccess", v.igFullAccess);
    if (v.igFullAccess === "yes") put("igFullAccessWho", v.igFullAccessWho.trim());
    put("igSupport", v.igSupport);
  }

  out.consent = v.consent;
  return out;
}

function trimContactLike<T extends object>(obj: T): T {
  const copy: Record<string, unknown> = {};
  for (const [k, val] of Object.entries(obj)) copy[k] = typeof val === "string" ? val.trim() : val;
  return copy as T;
}
