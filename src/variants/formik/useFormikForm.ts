"use client";

import { useState } from "react";
import { useFormik, getIn, type FormikErrors } from "formik";
import { defaultValues, emptyContact, type FormValues, type ServiceId } from "@/shared/schema";
import {
  STEPS,
  cleanData,
  errorsForStep,
  firstErrorPath,
  stepOfPath,
  validateValues,
  type ErrorMap,
} from "@/shared/steps";
import { getByPath } from "@/shared/object";
import { useAutosave, loadDraft, clearDraft } from "@/shared/useAutosave";
import { clearStep, saveStep } from "@/shared/progress";
import { useStepFlow } from "@/shared/useStepFlow";
import { submitForm, type SubmitResult } from "@/shared/submit";
import type { FormApi } from "@/shared/form-api";
import { getVariant } from "@/shared/variants";
import { formikSchema } from "./schema";

const DRAFT_KEY = getVariant("formik")!.draftKey;

/** Flatten Formik's nested errors object into dot-path -> message. */
function flattenErrors(obj: unknown, prefix = ""): ErrorMap {
  const out: ErrorMap = {};
  if (obj == null) return out;
  if (typeof obj === "string") {
    if (prefix) out[prefix] = obj;
    return out;
  }
  if (Array.isArray(obj)) {
    obj.forEach((item, i) => Object.assign(out, flattenErrors(item, prefix ? `${prefix}.${i}` : String(i))));
    return out;
  }
  if (typeof obj === "object") {
    for (const [k, val] of Object.entries(obj)) {
      Object.assign(out, flattenErrors(val, prefix ? `${prefix}.${k}` : k));
    }
  }
  return out;
}

/**
 * Formik logic.
 *
 * - `useFormik` holds the whole-form state object; everything is a controlled
 *   component, so a keystroke re-renders the form (classic Formik behaviour).
 * - Validation uses the equivalent Yup schema (`validationSchema`) with
 *   `validateOnBlur` + `validateOnChange`.
 * - Error display is gated by Formik's own `touched` map plus a per-step
 *   `revealed` set so a failed Next shows the whole step.
 */
export function useFormikForm() {
  const [initialValues] = useState<FormValues>(() => ({
    ...defaultValues,
    ...(loadDraft<FormValues>(DRAFT_KEY) ?? {}),
  }));

  const [revealed, setRevealed] = useState<Set<number>>(new Set());
  const [submitResult, setSubmitResult] = useState<SubmitResult | null>(null);

  const formik = useFormik<FormValues>({
    initialValues,
    validationSchema: formikSchema,
    validateOnBlur: true,
    validateOnChange: true,
    onSubmit: async (values) => {
      const result = await submitForm(cleanData(values));
      setSubmitResult(result);
      clearDraft(DRAFT_KEY);
    },
  });

  const values = formik.values;
  const draftStatus = useAutosave(DRAFT_KEY, values);

  const showError = (path: string): string | undefined => {
    const visible = Boolean(getIn(formik.touched, path)) || revealed.has(stepOfPath(path));
    if (!visible) return undefined;
    const err = getIn(formik.errors, path);
    return typeof err === "string" ? err : undefined;
  };

  const setField = (path: string, val: unknown) => {
    void formik.setFieldValue(path, val);
  };
  const touch = (path: string) => {
    void formik.setFieldTouched(path, true);
  };

  const api: FormApi = {
    values,
    text: (path) => ({
      value: (getByPath(values, path) as string) ?? "",
      error: showError(path),
      onChange: (val) => setField(path, val),
      onBlur: () => touch(path),
    }),
    choice: <T extends string>(path: string) => ({
      value: ((getByPath(values, path) as string) || "") as T | "",
      error: showError(path),
      onChange: (val: T) => {
        setField(path, val);
        touch(path);
      },
      onBlur: () => touch(path),
    }),
    multi: (path) => ({
      value: (getByPath(values, path) as ServiceId[]) ?? [],
      error: showError(path),
      onChange: (val) => {
        setField(path, val);
        touch(path);
      },
      onBlur: () => touch(path),
    }),
    bool: (path) => ({
      value: Boolean(getByPath(values, path)),
      error: showError(path),
      onChange: (val) => {
        setField(path, val);
        touch(path);
      },
      onBlur: () => touch(path),
    }),
    contacts: {
      items: values.iamContacts,
      add: () => setField("iamContacts", [...values.iamContacts, emptyContact()]),
      remove: (index) =>
        setField(
          "iamContacts",
          values.iamContacts.filter((_, i) => i !== index),
        ),
    },
  };

  const computeFlat = async (): Promise<ErrorMap> => {
    const errs: FormikErrors<FormValues> = await formik.validateForm();
    return flattenErrors(errs);
  };

  const flow = useStepFlow({
    validateStep: async (step) => {
      setRevealed((prev) => new Set(prev).add(step));
      const flat = await computeFlat();
      const stepErrors = errorsForStep(flat, step);
      return { ok: Object.keys(stepErrors).length === 0, firstErrorPath: firstErrorPath(flat, step) };
    },
    validateAll: async () => {
      setRevealed(new Set(STEPS.map((_, i) => i)));
      const flat = await computeFlat();
      let firstStep: number | null = null;
      for (let i = 0; i < STEPS.length; i += 1) {
        if (Object.keys(errorsForStep(flat, i)).length > 0) {
          firstStep = i;
          break;
        }
      }
      return {
        ok: Object.keys(flat).length === 0,
        firstStep,
        firstErrorPath: firstStep === null ? null : firstErrorPath(flat, firstStep),
      };
    },
    onValidSubmit: async () => {
      await submitForm(cleanData(formik.values)).then((result) => {
        setSubmitResult(result);
        clearDraft(DRAFT_KEY);
      });
    },
  });

  const resetAll = () => {
    formik.resetForm({ values: defaultValues });
    setRevealed(new Set());
    flow.resetFlow();
  };

  const onClearDraft = () => {
    clearDraft(DRAFT_KEY);
    clearStep(DRAFT_KEY);
    resetAll();
  };

  const onReset = () => {
    clearDraft(DRAFT_KEY);
    clearStep(DRAFT_KEY);
    setSubmitResult(null);
    resetAll();
  };

  // --- One-question-at-a-time flow (Typeform style) -----------------------
  const revealAll = () => setRevealed(new Set(STEPS.map((_, i) => i)));

  /** Mark a field touched so its error surfaces (used when advancing fails). */
  const touchPath = (path: string) => {
    void formik.setFieldTouched(path, true);
  };

  /** Validate the whole form (shared Zod) and submit if clean. */
  const submitPlan = async (): Promise<{ ok: boolean; firstErrorPath: string | null }> => {
    revealAll();
    const { ok, errors } = validateValues(formik.values);
    if (!ok) {
      let fep: string | null = null;
      for (let i = 0; i < STEPS.length && !fep; i += 1) fep = firstErrorPath(errors, i);
      return { ok: false, firstErrorPath: fep };
    }
    const result = await submitForm(cleanData(formik.values));
    setSubmitResult(result);
    clearDraft(DRAFT_KEY);
    clearStep(DRAFT_KEY);
    return { ok: true, firstErrorPath: null };
  };

  /** Flush the current draft + question index immediately (Save and exit). */
  const saveNow = (questionIndex: number) => {
    try {
      window.localStorage.setItem(DRAFT_KEY, JSON.stringify(formik.values));
    } catch {
      /* ignore */
    }
    saveStep(DRAFT_KEY, questionIndex);
  };

  const errorFor = (path: string): string | undefined => validateValues(values).errors[path];

  return {
    api,
    flow,
    draftStatus,
    onClearDraft,
    submitResult,
    onReset,
    values,
    revealAll,
    touchPath,
    submitPlan,
    saveNow,
    errorFor,
  };
}
