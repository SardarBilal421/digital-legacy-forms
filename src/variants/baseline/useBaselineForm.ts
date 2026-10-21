"use client";

import { useMemo, useReducer, useState } from "react";
import { defaultValues, emptyContact, type FormValues, type ServiceId } from "@/shared/schema";
import { STEPS, cleanData, errorsForStep, firstErrorPath, stepOfPath, validateValues } from "@/shared/steps";
import { getByPath } from "@/shared/object";
import { useAutosave, loadDraft, clearDraft } from "@/shared/useAutosave";
import { loadStep, saveStep, clearStep } from "@/shared/progress";
import { useStepFlow } from "@/shared/useStepFlow";
import { submitForm, type SubmitResult } from "@/shared/submit";
import type { FormApi } from "@/shared/form-api";
import { getVariant } from "@/shared/variants";

const DRAFT_KEY = getVariant("baseline")!.draftKey;

// --- Hand-written immutable setter by dot-path -----------------------------
function setIn(obj: FormValues, path: string, value: unknown): FormValues {
  const keys = path.split(".");
  const root = Array.isArray(obj) ? [...obj] : { ...(obj as unknown as Record<string, unknown>) };
  let node = root as Record<string, unknown> | unknown[];
  for (let i = 0; i < keys.length - 1; i += 1) {
    const key = keys[i] as string & number;
    const child = (node as Record<string, unknown>)[key];
    const copy = Array.isArray(child) ? [...child] : { ...(child as Record<string, unknown>) };
    (node as Record<string, unknown>)[key] = copy;
    node = copy as Record<string, unknown> | unknown[];
  }
  (node as Record<string, unknown>)[keys[keys.length - 1]] = value;
  return root as unknown as FormValues;
}

// --- Reducer ----------------------------------------------------------------
interface State {
  values: FormValues;
  touched: Record<string, true>;
  dirty: Record<string, true>;
  revealed: number[];
}

type Action =
  | { type: "set"; path: string; value: unknown }
  | { type: "blur"; path: string }
  | { type: "reveal"; step: number }
  | { type: "revealAll" }
  | { type: "reset" };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "set":
      return {
        ...state,
        values: setIn(state.values, action.path, action.value),
        dirty: { ...state.dirty, [action.path]: true },
      };
    case "blur":
      return { ...state, touched: { ...state.touched, [action.path]: true } };
    case "reveal":
      return state.revealed.includes(action.step)
        ? state
        : { ...state, revealed: [...state.revealed, action.step] };
    case "revealAll":
      return { ...state, revealed: STEPS.map((_, i) => i) };
    case "reset":
      return { values: structuredClone(defaultValues), touched: {}, dirty: {}, revealed: [] };
    default:
      return state;
  }
}

/**
 * Baseline variant — no form library.
 *
 * A single `useReducer` holds `values`, `touched` and `dirty`. Validation is the
 * shared Zod schema (`validateValues`) run on every render; errors are gated by
 * our own `touched` map + per-step `revealed` list. Everything the libraries do
 * for us — change/blur handling, arrays, per-step validation, focus — is wired
 * by hand here.
 */
export function useBaselineForm() {
  const [state, dispatch] = useReducer(reducer, undefined, (): State => ({
    values: { ...defaultValues, ...(loadDraft<FormValues>(DRAFT_KEY) ?? {}) },
    touched: {},
    dirty: {},
    revealed: [],
  }));

  const [submitResult, setSubmitResult] = useState<SubmitResult | null>(null);
  const [startStep] = useState<number>(() => loadStep(DRAFT_KEY) ?? 0);

  const draftStatus = useAutosave(DRAFT_KEY, state.values);
  const errorMap = useMemo(() => validateValues(state.values).errors, [state.values]);

  const showError = (path: string): string | undefined => {
    const visible = Boolean(state.touched[path]) || state.revealed.includes(stepOfPath(path));
    return visible ? errorMap[path] : undefined;
  };

  const set = (path: string, value: unknown) => dispatch({ type: "set", path, value });
  const blur = (path: string) => dispatch({ type: "blur", path });

  const api: FormApi = {
    values: state.values,
    text: (path) => ({
      value: (getByPath(state.values, path) as string) ?? "",
      error: showError(path),
      onChange: (val) => set(path, val),
      onBlur: () => blur(path),
    }),
    choice: <T extends string>(path: string) => ({
      value: ((getByPath(state.values, path) as string) || "") as T | "",
      error: showError(path),
      onChange: (val: T) => {
        set(path, val);
        blur(path);
      },
      onBlur: () => blur(path),
    }),
    multi: (path) => ({
      value: (getByPath(state.values, path) as ServiceId[]) ?? [],
      error: showError(path),
      onChange: (val) => {
        set(path, val);
        blur(path);
      },
      onBlur: () => blur(path),
    }),
    bool: (path) => ({
      value: Boolean(getByPath(state.values, path)),
      error: showError(path),
      onChange: (val) => {
        set(path, val);
        blur(path);
      },
      onBlur: () => blur(path),
    }),
    contacts: {
      items: state.values.iamContacts,
      add: () => set("iamContacts", [...state.values.iamContacts, emptyContact()]),
      remove: (index) =>
        set(
          "iamContacts",
          state.values.iamContacts.filter((_, i) => i !== index),
        ),
    },
  };

  const flow = useStepFlow({
    validateStep: (step) => {
      dispatch({ type: "reveal", step });
      const { errors } = validateValues(state.values);
      const stepErrors = errorsForStep(errors, step);
      return { ok: Object.keys(stepErrors).length === 0, firstErrorPath: firstErrorPath(errors, step) };
    },
    validateAll: () => {
      dispatch({ type: "revealAll" });
      const { ok, errors } = validateValues(state.values);
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
      const result = await submitForm(cleanData(state.values));
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
    dispatch({ type: "reset" });
    flow.resetFlow();
  };

  const onReset = () => {
    clearDraft(DRAFT_KEY);
    clearStep(DRAFT_KEY);
    dispatch({ type: "reset" });
    setSubmitResult(null);
    flow.resetFlow();
  };

  const saveNow = () => {
    try {
      window.localStorage.setItem(DRAFT_KEY, JSON.stringify(state.values));
    } catch {
      /* ignore */
    }
    saveStep(DRAFT_KEY, flow.step);
  };

  return { api, flow, draftStatus, onClearDraft, submitResult, onReset, values: state.values, saveNow };
}
