"use client";

/**
 * Tiny unstyled helper for persisting the user's current step so a "Save and
 * exit" / reload restores them to where they left off. Kept in shared because
 * it is pure logic (no UI) and every variant needs the same behaviour.
 *
 * The step is stored under a sibling key to the draft, e.g. `dlf:rhf:step`.
 */

function stepKey(draftKey: string): string {
  return `${draftKey}:step`;
}

export function loadStep(draftKey: string): number | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(stepKey(draftKey));
    if (raw == null) return null;
    const n = Number.parseInt(raw, 10);
    return Number.isFinite(n) && n >= 0 ? n : null;
  } catch {
    return null;
  }
}

export function saveStep(draftKey: string, step: number): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(stepKey(draftKey), String(step));
  } catch {
    /* ignore */
  }
}

export function clearStep(draftKey: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(stepKey(draftKey));
  } catch {
    /* ignore */
  }
}
