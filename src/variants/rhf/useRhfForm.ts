"use client";

import { useState } from "react";
import { useForm, useFieldArray, type FieldPath, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { defaultValues, emptyContact, formSchema, type FormValues, type ServiceId } from "@/shared/schema";
import { STEPS, errorsForStep, firstErrorPath, validateValues } from "@/shared/steps";
import { cleanData } from "@/shared/steps";
import { getByPath } from "@/shared/object";
import { useAutosave, loadDraft, clearDraft } from "@/shared/useAutosave";
import { loadStep, saveStep, clearStep } from "@/shared/progress";
import { useStepFlow } from "@/shared/useStepFlow";
import { submitForm, type SubmitResult } from "@/shared/submit";
import type { FormApi } from "@/shared/form-api";
import { getVariant } from "@/shared/variants";

const DRAFT_KEY = getVariant("rhf")!.draftKey;
type FP = FieldPath<FormValues>;

/**
 * React Hook Form logic.
 *
 * - `useForm` holds state in refs (uncontrolled under the hood). We read it with
 *   `watch()` to drive conditional rendering + the shared <FormBody>.
 * - Validation runs through `zodResolver(formSchema)` in `onBlur` mode.
 * - Because our shared fields are controlled, we bind them with
 *   `setValue` / `watch` / `trigger` and gate error display with a `touched`
 *   set + a per-step "reveal" set (so a failed Next shows every step error).
 */
export function useRhfForm() {
  const [initialValues] = useState<FormValues>(() => ({
    ...defaultValues,
    ...(loadDraft<FormValues>(DRAFT_KEY) ?? {}),
  }));
  const [startStep] = useState<number>(() => loadStep(DRAFT_KEY) ?? 0);

  const form = useForm<FormValues>({
    defaultValues: initialValues,
    resolver: zodResolver(formSchema) as unknown as Resolver<FormValues>,
    mode: "onBlur",
    reValidateMode: "onChange",
  });

  const { watch, setValue, getValues, trigger, formState, reset } = form;
  const fieldArray = useFieldArray({ control: form.control, name: "iamContacts" });

  // watch() intentionally re-renders on every change to drive conditionals.
  // eslint-disable-next-line react-hooks/incompatible-library
  const values = watch();
  const draftStatus = useAutosave(DRAFT_KEY, values);

  const [touched, setTouched] = useState<Set<string>>(new Set());
  const [revealed, setRevealed] = useState<Set<number>>(new Set());
  const [submitResult, setSubmitResult] = useState<SubmitResult | null>(null);

  const touch = (path: string) => setTouched((prev) => (prev.has(path) ? prev : new Set(prev).add(path)));

  const rhfError = (path: string): string | undefined => {
    const node = getByPath(formState.errors, path) as { message?: string } | undefined;
    return typeof node?.message === "string" ? node.message : undefined;
  };

  const stepOf = (path: string): number => {
    const root = path.split(".")[0];
    return STEPS.findIndex((s) => (s.rootKeys as string[]).includes(root));
  };

  const showError = (path: string): string | undefined => {
    const visible = touched.has(path) || revealed.has(stepOf(path));
    return visible ? rhfError(path) : undefined;
  };

  const setField = (path: string, value: unknown) => {
    setValue(path as FP, value as never, { shouldDirty: true });
    if (touched.has(path)) void trigger(path as FP);
  };

  const blurField = (path: string) => {
    touch(path);
    void trigger(path as FP);
  };

  const setChoice = (path: string, val: string) => {
    setValue(path as FP, val as never, { shouldDirty: true });
    touch(path);
    void trigger(path as FP);
  };

  const api: FormApi = {
    values,
    text: (path) => ({
      value: (getByPath(values, path) as string) ?? "",
      error: showError(path),
      onChange: (val) => setField(path, val),
      onBlur: () => blurField(path),
    }),
    choice: <T extends string>(path: string) => ({
      value: ((getByPath(values, path) as string) || "") as T | "",
      error: showError(path),
      onChange: (val: T) => setChoice(path, val),
      onBlur: () => blurField(path),
    }),
    multi: (path) => ({
      value: (getByPath(values, path) as ServiceId[]) ?? [],
      error: showError(path),
      onChange: (val) => {
        setValue(path as FP, val as never, { shouldDirty: true });
        touch(path);
        void trigger(path as FP);
      },
      onBlur: () => touch(path),
    }),
    bool: (path) => ({
      value: Boolean(getByPath(values, path)),
      error: showError(path),
      onChange: (val) => {
        setValue(path as FP, val as never, { shouldDirty: true });
        touch(path);
        void trigger(path as FP);
      },
      onBlur: () => blurField(path),
    }),
    contacts: {
      items: fieldArray.fields,
      add: () => fieldArray.append(emptyContact()),
      remove: (index) => fieldArray.remove(index),
    },
  };

  const flow = useStepFlow({
    validateStep: (step) => {
      setRevealed((prev) => new Set(prev).add(step));
      void trigger(STEPS[step].rootKeys as FP[]);
      const { errors } = validateValues(getValues());
      const stepErrors = errorsForStep(errors, step);
      return { ok: Object.keys(stepErrors).length === 0, firstErrorPath: firstErrorPath(errors, step) };
    },
    validateAll: () => {
      setRevealed(new Set(STEPS.map((_, i) => i)));
      void trigger();
      const { ok, errors } = validateValues(getValues());
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
      const result = await submitForm(cleanData(getValues()));
      setSubmitResult(result);
      clearDraft(DRAFT_KEY);
      clearStep(DRAFT_KEY);
    },
    initialStep: startStep,
    onStepChange: (s) => saveStep(DRAFT_KEY, s),
  });

  const onClearDraft = () => {
    clearDraft(DRAFT_KEY);
    clearStep(DRAFT_KEY);
    reset(defaultValues);
    setTouched(new Set());
    setRevealed(new Set());
    flow.resetFlow();
  };

  const onReset = () => {
    clearDraft(DRAFT_KEY);
    clearStep(DRAFT_KEY);
    reset(defaultValues);
    setTouched(new Set());
    setRevealed(new Set());
    setSubmitResult(null);
    flow.resetFlow();
  };

  /** Flush the current draft immediately (used by "Save and exit"). */
  const saveNow = () => {
    try {
      window.localStorage.setItem(DRAFT_KEY, JSON.stringify(getValues()));
    } catch {
      /* ignore */
    }
    saveStep(DRAFT_KEY, flow.step);
  };

  return { api, flow, draftStatus, onClearDraft, submitResult, onReset, values, saveNow };
}
