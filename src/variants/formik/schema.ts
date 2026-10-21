import * as yup from "yup";
import {
  isValidEmail,
  isValidPhone,
  isValidUrl,
  dobError,
  secondExecutorStarted,
  contactStarted,
  iamContactsRequired,
  type FormValues,
} from "@/shared/schema";

/**
 * Yup equivalent of the shared Zod schema (Formik's native validator).
 *
 * The always-required fields use idiomatic field-level Yup. All conditional /
 * cross-field rules live in one object-level `.test` that mirrors the Zod
 * `superRefine` — it pushes a `createError` per offending path so Formik maps
 * them onto the right fields. Keeping them in one place guarantees parity with
 * the other variants.
 */

const contactShape = yup.object({
  name: yup.string().default(""),
  email: yup.string().default(""),
  relationship: yup.string().default(""),
  phone: yup.string().default(""),
});

const executorShape = yup.object({
  fullName: yup.string().default(""),
  email: yup.string().default(""),
  phone: yup.string().default(""),
  relationship: yup.string().default(""),
});

export const formikSchema = yup
  .object({
    // Always required ----------------------------------------------------
    fullName: yup.string().trim().required("Full name is required"),
    previousSurname: yup.string().default(""),
    dob: yup
      .string()
      .default("")
      .test("dob", (value, ctx) => {
        const msg = dobError(value ?? "");
        return msg ? ctx.createError({ message: msg }) : true;
      }),
    isOver18: yup
      .string()
      .oneOf(["yes", "no"], "Please select an option")
      .required("Please select an option"),
    guardianPrimary: yup.string().default(""),
    guardianSecond: yup.string().default(""),

    execPrimary: yup.object({
      fullName: yup.string().trim().required("Full name is required"),
      email: yup
        .string()
        .required("Email is required")
        .test("email", "Enter a valid email", (v) => isValidEmail(v ?? "")),
      phone: yup
        .string()
        .required("Phone is required")
        .test("phone", "Enter a valid phone number", (v) => isValidPhone(v ?? "")),
      relationship: yup.string().trim().required("Relationship is required"),
    }),
    execSecond: executorShape,
    execSecondEqualAccess: yup.string().default(""),
    execSecondAccessExplain: yup.string().default(""),

    services: yup.array().of(yup.string().required()).min(1, "Select at least one service").default([]),
    servicesOther: yup.string().default(""),
    photosBackedUp: yup.string().default(""),
    photosCopyWho: yup.string().default(""),
    driveBackedUp: yup.string().default(""),
    driveCopyWho: yup.string().default(""),
    youtubeUrl: yup.string().default(""),
    youtubeManager: yup.string().default(""),

    iamSetup: yup
      .string()
      .oneOf(["yes", "no", "notSure"], "Please select an option")
      .required("Please select an option"),
    iamSupport: yup
      .string()
      .oneOf(["yes", "no", "alreadySetUp"], "Please select an option")
      .required("Please select an option"),
    iamContacts: yup.array().of(contactShape).default([]),
    iamBypass: yup
      .string()
      .oneOf(["yes", "no", "notSure"], "Please select an option")
      .required("Please select an option"),

    fbHas: yup
      .string()
      .oneOf(["yes", "no", "notSure"], "Please select an option")
      .required("Please select an option"),
    fbEmail: yup.string().default(""),
    fbPhone: yup.string().default(""),
    fbLegacyContact: yup.string().default(""),
    fbMediaDownloaded: yup.string().default(""),
    fbBackupLocation: yup.string().default(""),
    fbBackupWho: yup.string().default(""),
    fbAccountAction: yup.string().default(""),
    fbPrivateMessagesAccess: yup.string().default(""),
    fbPrivateMessagesWho: yup.string().default(""),
    fbMediaAccess: yup.string().default(""),
    fbSupport: yup.string().default(""),
    fbManager: contactShape,

    igHas: yup
      .string()
      .oneOf(["yes", "no", "notSure"], "Please select an option")
      .required("Please select an option"),
    igEmail: yup.string().default(""),
    igPhone: yup.string().default(""),
    igPlans: yup.string().default(""),
    igMediaDownloaded: yup.string().default(""),
    igAccountAction: yup.string().default(""),
    igFullAccess: yup.string().default(""),
    igFullAccessWho: yup.string().default(""),
    igSupport: yup.string().default(""),

    consent: yup
      .boolean()
      .oneOf([true], "You must consent to continue")
      .required("You must consent to continue"),
  })
  // Conditional + cross-field rules ------------------------------------------
  .test("cross-field", function crossField(v) {
    const errors: yup.ValidationError[] = [];
    const add = (path: string, message: string) => errors.push(this.createError({ path, message }));
    const values = v as unknown as FormValues;

    if (values.isOver18 === "no" && !values.guardianPrimary.trim()) {
      add("guardianPrimary", "Primary legal guardian name is required");
    }

    if (secondExecutorStarted(values.execSecond)) {
      const e = values.execSecond;
      if (!e.fullName.trim()) add("execSecond.fullName", "Full name is required");
      if (!isValidEmail(e.email))
        add("execSecond.email", e.email.trim() ? "Enter a valid email" : "Email is required");
      if (!isValidPhone(e.phone))
        add("execSecond.phone", e.phone.trim() ? "Enter a valid phone number" : "Phone is required");
      if (!e.relationship.trim()) add("execSecond.relationship", "Relationship is required");
      if (values.execSecondEqualAccess !== "yes" && values.execSecondEqualAccess !== "no") {
        add("execSecondEqualAccess", "Please select an option");
      }
      if (values.execSecondEqualAccess === "no" && !values.execSecondAccessExplain.trim()) {
        add("execSecondAccessExplain", "Please explain");
      }
    }

    if (values.services.includes("other") && !values.servicesOther.trim()) {
      add("servicesOther", "Please describe the other service");
    }
    if (values.services.includes("googlePhotos")) {
      if (!values.photosBackedUp) add("photosBackedUp", "Please select an option");
      if (values.photosBackedUp === "yes" && !values.photosCopyWho.trim())
        add("photosCopyWho", "Please say who has a copy");
    }
    if (values.services.includes("drive")) {
      if (!values.driveBackedUp) add("driveBackedUp", "Please select an option");
      if (values.driveBackedUp === "yes" && !values.driveCopyWho.trim())
        add("driveCopyWho", "Please say who has a copy");
    }
    if (values.services.includes("youtube")) {
      if (!isValidUrl(values.youtubeUrl))
        add("youtubeUrl", values.youtubeUrl.trim() ? "Enter a valid URL" : "Channel URL is required");
      if (!values.youtubeManager.trim()) add("youtubeManager", "Please say who should manage the channel");
    }

    if (iamContactsRequired(values)) {
      if (values.iamContacts.length < 1) add("iamContacts", "Add at least one contact");
      values.iamContacts.forEach((c, i) => {
        if (!c.name.trim()) add(`iamContacts.${i}.name`, "Name is required");
        if (!isValidEmail(c.email))
          add(`iamContacts.${i}.email`, c.email.trim() ? "Enter a valid email" : "Email is required");
        if (!c.relationship.trim()) add(`iamContacts.${i}.relationship`, "Relationship is required");
        if (!isValidPhone(c.phone))
          add(`iamContacts.${i}.phone`, c.phone.trim() ? "Enter a valid phone number" : "Phone is required");
      });
    }

    if (values.fbHas === "yes") {
      if (!isValidEmail(values.fbEmail))
        add("fbEmail", values.fbEmail.trim() ? "Enter a valid email" : "Email is required");
      if (!isValidPhone(values.fbPhone))
        add("fbPhone", values.fbPhone.trim() ? "Enter a valid phone number" : "Phone is required");
      if (!values.fbLegacyContact) add("fbLegacyContact", "Please select an option");
      if (!values.fbMediaDownloaded) add("fbMediaDownloaded", "Please select an option");
      if (values.fbMediaDownloaded === "yes") {
        if (!values.fbBackupLocation.trim())
          add("fbBackupLocation", "Please say where the backup is located");
        if (!values.fbBackupWho.trim()) add("fbBackupWho", "Please say who has a copy");
      }
      if (!values.fbAccountAction) add("fbAccountAction", "Please select an option");
      if (!values.fbPrivateMessagesAccess) add("fbPrivateMessagesAccess", "Please select an option");
      if (values.fbPrivateMessagesAccess === "yes" && !values.fbPrivateMessagesWho.trim())
        add("fbPrivateMessagesWho", "Please say who");
      if (!values.fbMediaAccess) add("fbMediaAccess", "Please select an option");
      if (!values.fbSupport) add("fbSupport", "Please select an option");
      if (contactStarted(values.fbManager)) {
        const c = values.fbManager;
        if (!c.name.trim()) add("fbManager.name", "Name is required");
        if (!isValidEmail(c.email))
          add("fbManager.email", c.email.trim() ? "Enter a valid email" : "Email is required");
        if (!c.relationship.trim()) add("fbManager.relationship", "Relationship is required");
        if (!isValidPhone(c.phone))
          add("fbManager.phone", c.phone.trim() ? "Enter a valid phone number" : "Phone is required");
      }
    }

    if (values.igHas === "yes") {
      if (!isValidEmail(values.igEmail))
        add("igEmail", values.igEmail.trim() ? "Enter a valid email" : "Email is required");
      if (!isValidPhone(values.igPhone))
        add("igPhone", values.igPhone.trim() ? "Enter a valid phone number" : "Phone is required");
      if (!values.igPlans) add("igPlans", "Please select an option");
      if (!values.igMediaDownloaded) add("igMediaDownloaded", "Please select an option");
      if (!values.igAccountAction) add("igAccountAction", "Please select an option");
      if (!values.igFullAccess) add("igFullAccess", "Please select an option");
      if (values.igFullAccess === "yes" && !values.igFullAccessWho.trim())
        add("igFullAccessWho", "Please say who");
      if (!values.igSupport) add("igSupport", "Please select an option");
    }

    return errors.length ? new yup.ValidationError(errors) : true;
  });
