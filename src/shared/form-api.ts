import type { ContactValues, FormValues, ServiceId } from "./schema";

/**
 * The seam between shared presentation and per-library form logic.
 *
 * The shared <FormBody> renders identical JSX for every controlled variant by
 * asking the `FormApi` for each field's value + error + change/blur handlers.
 * Each variant (RHF, TanStack, Formik, baseline) implements this interface in
 * its own idiom — that is where the libraries actually differ. Conform does not
 * use this (it is uncontrolled / progressively enhanced).
 */

export interface TextBinding {
  value: string;
  error?: string;
  onChange: (value: string) => void;
  onBlur: () => void;
}

export interface ChoiceBinding<T extends string> {
  value: T | "";
  error?: string;
  onChange: (value: T) => void;
  onBlur: () => void;
}

export interface MultiBinding {
  value: ServiceId[];
  error?: string;
  onChange: (value: ServiceId[]) => void;
  onBlur: () => void;
}

export interface BoolBinding {
  value: boolean;
  error?: string;
  onChange: (value: boolean) => void;
  onBlur: () => void;
}

export interface FormApi {
  /** Live snapshot of all values (drives conditional rendering + review). */
  values: FormValues;
  /** Text / email / tel / url / textarea fields. */
  text: (path: string) => TextBinding;
  /** Radio groups and selects. */
  choice: <T extends string>(path: string) => ChoiceBinding<T>;
  /** Multi-select checkbox group (services). */
  multi: (path: string) => MultiBinding;
  /** Single checkbox (consent). */
  bool: (path: string) => BoolBinding;
  /** Google IAM repeatable contact list. */
  contacts: {
    items: ContactValues[];
    add: () => void;
    remove: (index: number) => void;
  };
}

export type { ContactValues, FormValues, ServiceId };
