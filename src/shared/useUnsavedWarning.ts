"use client";

import { useEffect } from "react";

/**
 * Warn the user before leaving (tab close / reload / back) while they have
 * unsaved work in progress. Pure logic, no UI — shared by every variant.
 *
 * Browsers show their own generic prompt for `beforeunload`; the returned
 * string is ignored by modern browsers but set for older ones.
 */
export function useUnsavedWarning(enabled: boolean): void {
  useEffect(() => {
    if (!enabled) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      // Legacy browsers require a returnValue to trigger the prompt.
      e.returnValue = "";
      return "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [enabled]);
}

/** Whether the form holds any user input (i.e. differs from defaults). */
export function isDirty<T>(values: T, defaults: T): boolean {
  return JSON.stringify(values) !== JSON.stringify(defaults);
}
