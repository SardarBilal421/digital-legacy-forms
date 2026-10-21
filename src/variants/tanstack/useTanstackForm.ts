"use client";

import { useState } from "react";
import { useForm, useStore } from "@tanstack/react-form";
import { defaultValues, emptyContact, formSchema, type FormValues, type ServiceId } from "@/shared/schema";
import { STEPS, cleanData, errorsForStep, firstErrorPath, stepOfPath, validateValues } from "@/shared/steps";
import { getByPath } from "@/shared/object";
import { useAutosave, loadDraft, clearDraft } from "@/shared/useAutosave";
import { loadStep, saveStep, clearStep } from "@/shared/progress";
import { useStepFlow } from "@/shared/useStepFlow";
import { submitForm, type SubmitResult } from "@/shared/submit";
import type { FormApi } from "@/shared/form-api";
import { getVariant } from "@/shared/variants";

const DRAFT_KEY = getVariant("tanstack")!.draftKey;

/**
 * TanStack Form logic.
 *
 * - `useForm` owns the store; `useStore(form.store, s => s.values)` subscribes to
 *   the live values that drive conditionals + the shared <FormBody>.
 * - Zod is attached as a Standard Schema validator (`validators.onSubmit`) so the
 *   library validates through its own pipeline; per-step gating reuses the shared
 *   schema for deterministic first-error focus.
 * - Array helpers (`pushFieldValue` / `removeFieldValue`) drive the Google IAM list.
 */
export function useTanstackForm() {
  const [initialValues] = useState<FormValues>(() => ({
    ...defaultValues,
    ...(loadDraft<FormValues>(DRAFT_KEY) ?? {}),
  }));
  const [startStep] = useState<number>(() => loadStep(DRAFT_KEY) ?? 0);

  const form = useForm({
    defaultValues: initialValues,
    validators: { onSubmit: formSchema as never },
  });

  const values = useStore(form.store, (s) => s.values) as FormValues;
  const draftStatus = useAutosave(DRAFT_KEY, values);

  const [touched, setTouched] = useState<Set<string>>(new Set());
  const [revealed, setRevealed] = useState<Set<number>>(new Set());
  const [submitResult, setSubmitResult] = useState<SubmitResult | null>(null);

  const errorMap = validateValues(values).errors;

  const touch = (path: string) => setTouched((prev) => (prev.has(path) ? prev : new Set(prev).add(path)));

  const showError = (path: string): string | undefined => {
    const visible = touched.has(path) || revealed.has(stepOfPath(path));
    return visible ? errorMap[path] : undefined;
  };

  const stepStarted = (i: number): boolean =>
    STEPS[i].rootKeys.some(
      (k) => JSON.stringify(values[k]) !== JSON.stringify(defaultValues[k as keyof FormValues]),
    );

  /** Status for the dashboard sidebar: not-started / in-progress / done / error. */
  const sectionStatus = (i: number): "notStarted" | "inProgress" | "done" | "error" => {
    const hasErr = Object.keys(errorsForStep(errorMap, i)).length > 0;
    const started = stepStarted(i);
    if (revealed.has(i) && hasErr) return "error";
    if (started && !hasErr) return "done";
    if (started) return "inProgress";
    return "notStarted";
  };

  const set = (path: string, val: unknown) => form.setFieldValue(path as never, val as never);

  const api: FormApi = {
    values,
    text: (path) => ({
      value: (getByPath(values, path) as string) ?? "",
      error: showError(path),
      onChange: (val) => set(path, val),
      onBlur: () => touch(path),
    }),
    choice: <T extends string>(path: string) => ({
      value: ((getByPath(values, path) as string) || "") as T | "",
      error: showError(path),
      onChange: (val: T) => {
        set(path, val);
        touch(path);
      },
      onBlur: () => touch(path),
    }),
    multi: (path) => ({
      value: (getByPath(values, path) as ServiceId[]) ?? [],
      error: showError(path),
      onChange: (val) => {
        set(path, val);
        touch(path);
      },
      onBlur: () => touch(path),
    }),
    bool: (path) => ({
      value: Boolean(getByPath(values, path)),
      error: showError(path),
      onChange: (val) => {
        set(path, val);
        touch(path);
      },
      onBlur: () => touch(path),
    }),
    contacts: {
      items: values.iamContacts,
      add: () => form.pushFieldValue("iamContacts", emptyContact()),
      remove: (index) => form.removeFieldValue("iamContacts", index),
    },
  };

  const flow = useStepFlow({
    validateStep: (step) => {
      setRevealed((prev) => new Set(prev).add(step));
      const { errors } = validateValues(form.state.values);
      const stepErrors = errorsForStep(errors, step);
      return { ok: Object.keys(stepErrors).length === 0, firstErrorPath: firstErrorPath(errors, step) };
    },
    validateAll: () => {
      setRevealed(new Set(STEPS.map((_, i) => i)));
      const { ok, errors } = validateValues(form.state.values);
      let firstStep: number | null = null;
      for (let i = 0; i < STEPS.length; i += 1) {
        if (Object.keys(errorsForStep(errors, i)).length > 0) {
          firstStep = i;
          break;
        }
      }
      return { ok, firstStep, firstErrorPath: firstStep === null ? null : firstErrorPath(errors, firstStep) };
    },
    onValidSubmit: async () => {
      const result = await submitForm(cleanData(form.state.values));
      setSubmitResult(result);
      clearDraft(DRAFT_KEY);
      clearStep(DRAFT_KEY);
    },
    initialStep: startStep,
    onStepChange: (s) => saveStep(DRAFT_KEY, s),
  });

  const resetAll = () => {
    form.reset(defaultValues);
    setTouched(new Set());
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

  const saveNow = () => {
    try {
      window.localStorage.setItem(DRAFT_KEY, JSON.stringify(form.state.values));
    } catch {
      /* ignore */
    }
    saveStep(DRAFT_KEY, flow.step);
  };

  return { api, flow, draftStatus, onClearDraft, submitResult, onReset, values, saveNow, sectionStatus };
}
