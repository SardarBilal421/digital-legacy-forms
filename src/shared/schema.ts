import { z } from "zod";

/**
 * Shared Zod schema for the "Digital Assets & Digital Legacy Safeguarding" form.
 *
 * Design notes:
 * - The schema validates the *loose* draft shape (FormValues): radio groups hold
 *   "" when unselected, every field is always present so inputs stay controlled.
 * - Unconditional requirements use field-level checks; cross-field / conditional
 *   requirements live in `superRefine` so hidden fields never block validation.
 * - This single schema is reused by RHF, TanStack, Conform and the baseline
 *   variant. Formik gets an equivalent Yup schema in its own folder.
 */

// ---------------------------------------------------------------------------
// Shared primitive validators
// ---------------------------------------------------------------------------

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// International-friendly phone: optional +, digits, spaces, (), -, min 7 digits.
const PHONE_RE = /^[+]?[0-9][0-9\s().-]{6,}$/;

export function isValidEmail(value: string): boolean {
  return EMAIL_RE.test(value.trim());
}

export function isValidPhone(value: string): boolean {
  return PHONE_RE.test(value.trim());
}

export function isValidUrl(value: string): boolean {
  try {
    const u = new URL(value.trim());
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

/** DOB must be a real calendar date and not in the future. */
export function dobError(value: string): string | null {
  if (!value) return "Date of birth is required";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "Enter a valid date";
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  if (d.getTime() > today.getTime()) return "Date of birth cannot be in the future";
  // Guard absurd dates.
  if (d.getFullYear() < 1900) return "Enter a valid date";
  return null;
}

// ---------------------------------------------------------------------------
// Enums / unions used by the UI
// ---------------------------------------------------------------------------

export type YesNo = "yes" | "no";
export type YesNoNotSure = "yes" | "no" | "notSure";
export type SupportSetup = "yes" | "no" | "alreadySetUp";
export type AccountAction = "memorialise" | "delete" | "manage" | "notSure";
export type ServiceId = "gmail" | "googlePhotos" | "drive" | "youtube" | "other";

// ---------------------------------------------------------------------------
// Draft (form-state) types — radios allow "" while unselected.
// ---------------------------------------------------------------------------

export interface ContactValues {
  name: string;
  email: string;
  relationship: string;
  phone: string;
}

export interface ExecutorValues {
  fullName: string;
  email: string;
  phone: string;
  relationship: string;
}

export interface FormValues {
  // Step 1 — About you
  fullName: string;
  previousSurname: string;
  dob: string;
  isOver18: YesNo | "";
  guardianPrimary: string;
  guardianSecond: string;

  // Step 2 — Digital Executors
  execPrimary: ExecutorValues;
  execSecond: ExecutorValues;
  execSecondEqualAccess: YesNo | "";
  execSecondAccessExplain: string;

  // Step 3 — Core services
  services: ServiceId[];
  servicesOther: string;
  photosBackedUp: YesNoNotSure | "";
  photosCopyWho: string;
  driveBackedUp: YesNoNotSure | "";
  driveCopyWho: string;
  youtubeUrl: string;
  youtubeManager: string;

  // Step 4 — Google Inactive Account Manager
  iamSetup: YesNoNotSure | "";
  iamSupport: SupportSetup | "";
  iamContacts: ContactValues[];
  iamBypass: YesNoNotSure | "";

  // Step 5 — Facebook
  fbHas: YesNoNotSure | "";
  fbEmail: string;
  fbPhone: string;
  fbLegacyContact: YesNoNotSure | "";
  fbMediaDownloaded: YesNoNotSure | "";
  fbBackupLocation: string;
  fbBackupWho: string;
  fbAccountAction: AccountAction | "";
  fbPrivateMessagesAccess: YesNo | "";
  fbPrivateMessagesWho: string;
  fbMediaAccess: YesNo | "";
  fbSupport: YesNo | "";
  fbManager: ContactValues;

  // Step 6 — Instagram
  igHas: YesNoNotSure | "";
  igEmail: string;
  igPhone: string;
  igPlans: YesNoNotSure | "";
  igMediaDownloaded: YesNoNotSure | "";
  igAccountAction: AccountAction | "";
  igFullAccess: YesNo | "";
  igFullAccessWho: string;
  igSupport: YesNo | "";

  // Step 7 — Review
  consent: boolean;
}

// ---------------------------------------------------------------------------
// Default (empty) values — keeps every input controlled from first render.
// ---------------------------------------------------------------------------

export function emptyContact(): ContactValues {
  return { name: "", email: "", relationship: "", phone: "" };
}

export function emptyExecutor(): ExecutorValues {
  return { fullName: "", email: "", phone: "", relationship: "" };
}

export const defaultValues: FormValues = {
  fullName: "",
  previousSurname: "",
  dob: "",
  isOver18: "",
  guardianPrimary: "",
  guardianSecond: "",

  execPrimary: emptyExecutor(),
  execSecond: emptyExecutor(),
  execSecondEqualAccess: "",
  execSecondAccessExplain: "",

  services: [],
  servicesOther: "",
  photosBackedUp: "",
  photosCopyWho: "",
  driveBackedUp: "",
  driveCopyWho: "",
  youtubeUrl: "",
  youtubeManager: "",

  iamSetup: "",
  iamSupport: "",
  iamContacts: [emptyContact()],
  iamBypass: "",

  fbHas: "",
  fbEmail: "",
  fbPhone: "",
  fbLegacyContact: "",
  fbMediaDownloaded: "",
  fbBackupLocation: "",
  fbBackupWho: "",
  fbAccountAction: "",
  fbPrivateMessagesAccess: "",
  fbPrivateMessagesWho: "",
  fbMediaAccess: "",
  fbSupport: "",
  fbManager: emptyContact(),

  igHas: "",
  igEmail: "",
  igPhone: "",
  igPlans: "",
  igMediaDownloaded: "",
  igAccountAction: "",
  igFullAccess: "",
  igFullAccessWho: "",
  igSupport: "",

  consent: false,
};

// ---------------------------------------------------------------------------
// Zod schema
// ---------------------------------------------------------------------------

const requiredText = (message: string) => z.string().trim().min(1, message);

const executorSchema = z.object({
  fullName: z.string().default(""),
  email: z.string().default(""),
  phone: z.string().default(""),
  relationship: z.string().default(""),
});

const contactSchema = z.object({
  name: z.string().default(""),
  email: z.string().default(""),
  relationship: z.string().default(""),
  phone: z.string().default(""),
});

const yesNo = ["yes", "no"] as const;
const yesNoNotSure = ["yes", "no", "notSure"] as const;

/** Whether the Google IAM repeatable contact list should be shown/validated. */
export function iamContactsRequired(v: Pick<FormValues, "iamSetup" | "iamSupport">): boolean {
  return v.iamSetup === "yes" || v.iamSupport === "yes";
}

/** Whether a second executor has been started (any field filled). */
export function secondExecutorStarted(e: ExecutorValues): boolean {
  return Boolean(e.fullName || e.email || e.phone || e.relationship);
}

/** Whether the Facebook "manager" block has been started. */
export function contactStarted(c: ContactValues): boolean {
  return Boolean(c.name || c.email || c.relationship || c.phone);
}

export const formSchema = z
  .object({
    // Step 1
    fullName: requiredText("Full name is required"),
    previousSurname: z.string().default(""),
    dob: z.string().default(""),
    isOver18: z.enum(yesNo, { error: "Please select an option" }),
    guardianPrimary: z.string().default(""),
    guardianSecond: z.string().default(""),

    // Step 2
    execPrimary: executorSchema,
    execSecond: executorSchema,
    execSecondEqualAccess: z.union([z.enum(yesNo), z.literal("")]).default(""),
    execSecondAccessExplain: z.string().default(""),

    // Step 3
    services: z.array(z.enum(["gmail", "googlePhotos", "drive", "youtube", "other"])),
    servicesOther: z.string().default(""),
    photosBackedUp: z.union([z.enum(yesNoNotSure), z.literal("")]).default(""),
    photosCopyWho: z.string().default(""),
    driveBackedUp: z.union([z.enum(yesNoNotSure), z.literal("")]).default(""),
    driveCopyWho: z.string().default(""),
    youtubeUrl: z.string().default(""),
    youtubeManager: z.string().default(""),

    // Step 4
    iamSetup: z.enum(yesNoNotSure, { error: "Please select an option" }),
    iamSupport: z.enum(["yes", "no", "alreadySetUp"], { error: "Please select an option" }),
    iamContacts: z.array(contactSchema),
    iamBypass: z.enum(yesNoNotSure, { error: "Please select an option" }),

    // Step 5
    fbHas: z.enum(yesNoNotSure, { error: "Please select an option" }),
    fbEmail: z.string().default(""),
    fbPhone: z.string().default(""),
    fbLegacyContact: z.union([z.enum(yesNoNotSure), z.literal("")]).default(""),
    fbMediaDownloaded: z.union([z.enum(yesNoNotSure), z.literal("")]).default(""),
    fbBackupLocation: z.string().default(""),
    fbBackupWho: z.string().default(""),
    fbAccountAction: z
      .union([z.enum(["memorialise", "delete", "manage", "notSure"]), z.literal("")])
      .default(""),
    fbPrivateMessagesAccess: z.union([z.enum(yesNo), z.literal("")]).default(""),
    fbPrivateMessagesWho: z.string().default(""),
    fbMediaAccess: z.union([z.enum(yesNo), z.literal("")]).default(""),
    fbSupport: z.union([z.enum(yesNo), z.literal("")]).default(""),
    fbManager: contactSchema,

    // Step 6
    igHas: z.enum(yesNoNotSure, { error: "Please select an option" }),
    igEmail: z.string().default(""),
    igPhone: z.string().default(""),
    igPlans: z.union([z.enum(yesNoNotSure), z.literal("")]).default(""),
    igMediaDownloaded: z.union([z.enum(yesNoNotSure), z.literal("")]).default(""),
    igAccountAction: z
      .union([z.enum(["memorialise", "delete", "manage", "notSure"]), z.literal("")])
      .default(""),
    igFullAccess: z.union([z.enum(yesNo), z.literal("")]).default(""),
    igFullAccessWho: z.string().default(""),
    igSupport: z.union([z.enum(yesNo), z.literal("")]).default(""),

    // Step 7 — optional at the type level so an unchecked box doesn't abort the
    // whole schema before superRefine runs; the "must be true" rule is enforced below.
    consent: z.boolean().optional(),
  })
  .superRefine((v, ctx) => {
    const req = (path: (string | number)[], ok: boolean, message: string) => {
      if (!ok) ctx.addIssue({ code: "custom", path, message });
    };

    // --- Step 1 -----------------------------------------------------------
    const dobMsg = dobError(v.dob);
    if (dobMsg) ctx.addIssue({ code: "custom", path: ["dob"], message: dobMsg });

    if (v.isOver18 === "no") {
      req(
        ["guardianPrimary"],
        v.guardianPrimary.trim().length > 0,
        "Primary legal guardian name is required",
      );
    }

    // --- Step 2: primary executor (all required) --------------------------
    req(["execPrimary", "fullName"], v.execPrimary.fullName.trim().length > 0, "Full name is required");
    req(
      ["execPrimary", "email"],
      isValidEmail(v.execPrimary.email),
      v.execPrimary.email.trim() ? "Enter a valid email" : "Email is required",
    );
    req(
      ["execPrimary", "phone"],
      isValidPhone(v.execPrimary.phone),
      v.execPrimary.phone.trim() ? "Enter a valid phone number" : "Phone is required",
    );
    req(
      ["execPrimary", "relationship"],
      v.execPrimary.relationship.trim().length > 0,
      "Relationship is required",
    );

    // --- Step 2: second executor (all-or-nothing) -------------------------
    if (secondExecutorStarted(v.execSecond)) {
      req(["execSecond", "fullName"], v.execSecond.fullName.trim().length > 0, "Full name is required");
      req(
        ["execSecond", "email"],
        isValidEmail(v.execSecond.email),
        v.execSecond.email.trim() ? "Enter a valid email" : "Email is required",
      );
      req(
        ["execSecond", "phone"],
        isValidPhone(v.execSecond.phone),
        v.execSecond.phone.trim() ? "Enter a valid phone number" : "Phone is required",
      );
      req(
        ["execSecond", "relationship"],
        v.execSecond.relationship.trim().length > 0,
        "Relationship is required",
      );
      req(
        ["execSecondEqualAccess"],
        v.execSecondEqualAccess === "yes" || v.execSecondEqualAccess === "no",
        "Please select an option",
      );
      if (v.execSecondEqualAccess === "no") {
        req(["execSecondAccessExplain"], v.execSecondAccessExplain.trim().length > 0, "Please explain");
      }
    }

    // --- Step 3: services -------------------------------------------------
    req(["services"], v.services.length > 0, "Select at least one service");
    if (v.services.includes("other")) {
      req(["servicesOther"], v.servicesOther.trim().length > 0, "Please describe the other service");
    }
    if (v.services.includes("googlePhotos")) {
      req(["photosBackedUp"], v.photosBackedUp !== "", "Please select an option");
      if (v.photosBackedUp === "yes") {
        req(["photosCopyWho"], v.photosCopyWho.trim().length > 0, "Please say who has a copy");
      }
    }
    if (v.services.includes("drive")) {
      req(["driveBackedUp"], v.driveBackedUp !== "", "Please select an option");
      if (v.driveBackedUp === "yes") {
        req(["driveCopyWho"], v.driveCopyWho.trim().length > 0, "Please say who has a copy");
      }
    }
    if (v.services.includes("youtube")) {
      req(
        ["youtubeUrl"],
        isValidUrl(v.youtubeUrl),
        v.youtubeUrl.trim() ? "Enter a valid URL" : "Channel URL is required",
      );
      req(["youtubeManager"], v.youtubeManager.trim().length > 0, "Please say who should manage the channel");
    }

    // --- Step 4: Google IAM ----------------------------------------------
    if (iamContactsRequired(v)) {
      req(["iamContacts"], v.iamContacts.length >= 1, "Add at least one contact");
      v.iamContacts.forEach((c, i) => {
        req(["iamContacts", i, "name"], c.name.trim().length > 0, "Name is required");
        req(
          ["iamContacts", i, "email"],
          isValidEmail(c.email),
          c.email.trim() ? "Enter a valid email" : "Email is required",
        );
        req(["iamContacts", i, "relationship"], c.relationship.trim().length > 0, "Relationship is required");
        req(
          ["iamContacts", i, "phone"],
          isValidPhone(c.phone),
          c.phone.trim() ? "Enter a valid phone number" : "Phone is required",
        );
      });
    }

    // --- Step 5: Facebook -------------------------------------------------
    if (v.fbHas === "yes") {
      req(
        ["fbEmail"],
        isValidEmail(v.fbEmail),
        v.fbEmail.trim() ? "Enter a valid email" : "Email is required",
      );
      req(
        ["fbPhone"],
        isValidPhone(v.fbPhone),
        v.fbPhone.trim() ? "Enter a valid phone number" : "Phone is required",
      );
      req(["fbLegacyContact"], v.fbLegacyContact !== "", "Please select an option");
      req(["fbMediaDownloaded"], v.fbMediaDownloaded !== "", "Please select an option");
      if (v.fbMediaDownloaded === "yes") {
        req(
          ["fbBackupLocation"],
          v.fbBackupLocation.trim().length > 0,
          "Please say where the backup is located",
        );
        req(["fbBackupWho"], v.fbBackupWho.trim().length > 0, "Please say who has a copy");
      }
      req(["fbAccountAction"], v.fbAccountAction !== "", "Please select an option");
      req(["fbPrivateMessagesAccess"], v.fbPrivateMessagesAccess !== "", "Please select an option");
      if (v.fbPrivateMessagesAccess === "yes") {
        req(["fbPrivateMessagesWho"], v.fbPrivateMessagesWho.trim().length > 0, "Please say who");
      }
      req(["fbMediaAccess"], v.fbMediaAccess !== "", "Please select an option");
      req(["fbSupport"], v.fbSupport !== "", "Please select an option");
      if (contactStarted(v.fbManager)) {
        req(["fbManager", "name"], v.fbManager.name.trim().length > 0, "Name is required");
        req(
          ["fbManager", "email"],
          isValidEmail(v.fbManager.email),
          v.fbManager.email.trim() ? "Enter a valid email" : "Email is required",
        );
        req(
          ["fbManager", "relationship"],
          v.fbManager.relationship.trim().length > 0,
          "Relationship is required",
        );
        req(
          ["fbManager", "phone"],
          isValidPhone(v.fbManager.phone),
          v.fbManager.phone.trim() ? "Enter a valid phone number" : "Phone is required",
        );
      }
    }

    // --- Step 6: Instagram ------------------------------------------------
    if (v.igHas === "yes") {
      req(
        ["igEmail"],
        isValidEmail(v.igEmail),
        v.igEmail.trim() ? "Enter a valid email" : "Email is required",
      );
      req(
        ["igPhone"],
        isValidPhone(v.igPhone),
        v.igPhone.trim() ? "Enter a valid phone number" : "Phone is required",
      );
      req(["igPlans"], v.igPlans !== "", "Please select an option");
      req(["igMediaDownloaded"], v.igMediaDownloaded !== "", "Please select an option");
      req(["igAccountAction"], v.igAccountAction !== "", "Please select an option");
      req(["igFullAccess"], v.igFullAccess !== "", "Please select an option");
      if (v.igFullAccess === "yes") {
        req(["igFullAccessWho"], v.igFullAccessWho.trim().length > 0, "Please say who");
      }
      req(["igSupport"], v.igSupport !== "", "Please select an option");
    }

    // --- Step 7: consent --------------------------------------------------
    req(["consent"], v.consent === true, "You must consent to continue");
  });

export type FormSchema = typeof formSchema;
