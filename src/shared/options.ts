import type { AccountAction, ServiceId, SupportSetup, YesNo, YesNoNotSure } from "./schema";

export interface Option<T extends string = string> {
  value: T;
  label: string;
}

export const yesNoOptions: Option<YesNo>[] = [
  { value: "yes", label: "Yes" },
  { value: "no", label: "No" },
];

export const yesNoNotSureOptions: Option<YesNoNotSure>[] = [
  { value: "yes", label: "Yes" },
  { value: "no", label: "No" },
  { value: "notSure", label: "Not sure" },
];

export const supportSetupOptions: Option<SupportSetup>[] = [
  { value: "yes", label: "Yes" },
  { value: "no", label: "No" },
  { value: "alreadySetUp", label: "Not relevant, already set up" },
];

export const serviceOptions: Option<ServiceId>[] = [
  { value: "gmail", label: "Gmail" },
  { value: "googlePhotos", label: "Google Photos" },
  { value: "drive", label: "Drive" },
  { value: "youtube", label: "YouTube" },
  { value: "other", label: "Other" },
];

export const accountActionOptions: Option<AccountAction>[] = [
  { value: "memorialise", label: "Memorialise" },
  { value: "delete", label: "Delete" },
  { value: "manage", label: "Let someone manage it" },
  { value: "notSure", label: "Not sure" },
];

/** Human-readable label for any stored option value (used by the review step). */
export const labelFor: Record<string, string> = {
  yes: "Yes",
  no: "No",
  notSure: "Not sure",
  alreadySetUp: "Not relevant, already set up",
  memorialise: "Memorialise",
  delete: "Delete",
  manage: "Let someone manage it",
  gmail: "Gmail",
  googlePhotos: "Google Photos",
  drive: "Drive",
  youtube: "YouTube",
  other: "Other",
};

export const iamContactOrdinals = ["First", "Second", "Third"] as const;
