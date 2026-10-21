"use client";

import { useCallback, useState } from "react";
import { REVIEW_STEP, STEP_COUNT } from "./steps";
import { focusFirstError } from "./focus";

export interface StepValidation {
  ok: boolean;
  firstErrorPath: string | null;
}

export interface AllValidation {
  ok: boolean;
  firstStep: number | null;
  firstErrorPath: string | null;
}

export interface StepFlowOptions {
  /** Validate a single step. Variants implement this in their library idiom. */
  validateStep: (step: number) => Promise<StepValidation> | StepValidation;
  /** Validate the whole form (used on final submit). */
  validateAll: () => Promise<AllValidation> | AllValidation;
  /** Called only when the whole form is valid — do the actual submit here. */
  onValidSubmit: () => Promise<void>;
  /**
   * Restore the user to a previously-saved step (e.g. after "Save and exit").
   * Every step up to this index is treated as reached + completed so the user
   * can freely navigate back. Clamped to the review step.
   */
  initialStep?: number;
  /** Notified whenever the current step changes (used to persist progress). */
  onStepChange?: (step: number) => void;
}

export interface StepFlow {
  step: number;
  isSubmitting: boolean;
  goNext: () => Promise<void>;
  goBack: () => void;
  goTo: (step: number) => void;
  canNavigate: (step: number) => boolean;
  isComplete: (step: number) => boolean;
  submitForm: () => Promise<void>;
  resetFlow: () => void;
}

export function useStepFlow({
  validateStep,
  validateAll,
  onValidSubmit,
  initialStep = 0,
  onStepChange,
}: StepFlowOptions): StepFlow {
  const start = Math.min(Math.max(0, initialStep), REVIEW_STEP);
  const [step, setStep] = useState(start);
  const [maxReached, setMaxReached] = useState(start);
  const [completed, setCompleted] = useState<Set<number>>(
    () => new Set(Array.from({ length: start }, (_, i) => i)),
  );
  const [isSubmitting, setSubmitting] = useState(false);

  const changeStep = useCallback(
    (next: number) => {
      setStep(next);
      onStepChange?.(next);
    },
    [onStepChange],
  );

  const markComplete = useCallback((i: number) => {
    setCompleted((prev) => {
      const next = new Set(prev);
      next.add(i);
      return next;
    });
  }, []);

  const advanceTo = useCallback(
    (target: number) => {
      changeStep(target);
      setMaxReached((m) => Math.max(m, target));
    },
    [changeStep],
  );

  const goNext = useCallback(async () => {
    const result = await validateStep(step);
    if (!result.ok) {
      focusFirstError(result.firstErrorPath);
      return;
    }
    markComplete(step);
    advanceTo(Math.min(step + 1, REVIEW_STEP));
  }, [step, validateStep, markComplete, advanceTo]);

  const goBack = useCallback(() => {
    changeStep(Math.max(0, step - 1));
  }, [changeStep, step]);

  const goTo = useCallback(
    (target: number) => {
      if (target < 0 || target >= STEP_COUNT) return;
      if (target <= maxReached) changeStep(target);
    },
    [maxReached, changeStep],
  );

  const canNavigate = useCallback((target: number) => target <= maxReached, [maxReached]);

  const isComplete = useCallback((i: number) => completed.has(i) && i !== step, [completed, step]);

  const submitForm = useCallback(async () => {
    if (isSubmitting) return;
    const result = await validateAll();
    if (!result.ok) {
      if (result.firstStep !== null) advanceTo(result.firstStep);
      focusFirstError(result.firstErrorPath);
      return;
    }
    setSubmitting(true);
    try {
      await onValidSubmit();
    } finally {
      setSubmitting(false);
    }
  }, [isSubmitting, validateAll, onValidSubmit, advanceTo]);

  const resetFlow = useCallback(() => {
    changeStep(0);
    setMaxReached(0);
    setCompleted(new Set());
    setSubmitting(false);
  }, [changeStep]);

  return { step, isSubmitting, goNext, goBack, goTo, canNavigate, isComplete, submitForm, resetFlow };
}
