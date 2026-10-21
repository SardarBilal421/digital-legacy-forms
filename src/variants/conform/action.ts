"use server";

import { parseWithZod } from "@conform-to/zod/v4";
import type { SubmissionResult } from "@conform-to/react";
import { formSchema, type FormValues } from "@/shared/schema";
import { cleanData } from "@/shared/steps";

export interface ConformState {
  result?: SubmissionResult;
  success?: { reference: string; receivedAt: string };
}

/**
 * Server Action for the Conform variant. Runs the shared Zod schema server-side
 * (so it works with JavaScript disabled). On success it strips hidden fields
 * with `cleanData` and returns a reference — nothing is stored or logged.
 */
export async function submitConform(
  _prev: ConformState | undefined,
  formData: FormData,
): Promise<ConformState> {
  const submission = parseWithZod(formData, { schema: formSchema });

  if (submission.status !== "success") {
    return { result: submission.reply() };
  }

  // Strip conditional/hidden fields; intentionally not persisted or logged.
  cleanData(submission.value as unknown as FormValues);
  await new Promise((resolve) => setTimeout(resolve, 1000));

  return {
    success: {
      reference: `DL-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
      receivedAt: new Date().toISOString(),
    },
  };
}
