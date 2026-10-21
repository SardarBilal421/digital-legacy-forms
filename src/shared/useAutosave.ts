"use client";

import { useEffect, useRef, useState } from "react";

export type DraftStatus = "idle" | "saving" | "saved";

/** Read a persisted draft. Returns null on miss / parse error / SSR. */
export function loadDraft<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function clearDraft(key: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(key);
  } catch {
    /* ignore */
  }
}

/**
 * Debounced autosave of `values` to localStorage. Returns a status that moves
 * idle → saving → saved so the UI can show a "Draft saved" badge. The first
 * render does not write (so merely loading a page is not treated as a change).
 */
export function useAutosave<T>(key: string, values: T, enabled = true): DraftStatus {
  const [status, setStatus] = useState<DraftStatus>("idle");
  const firstRun = useRef(true);
  const savedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const writeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!enabled) return;
    if (firstRun.current) {
      firstRun.current = false;
      return;
    }
    setStatus("saving");
    if (writeTimer.current) clearTimeout(writeTimer.current);
    writeTimer.current = setTimeout(() => {
      try {
        window.localStorage.setItem(key, JSON.stringify(values));
      } catch {
        /* ignore quota / serialization errors */
      }
      setStatus("saved");
      if (savedTimer.current) clearTimeout(savedTimer.current);
      savedTimer.current = setTimeout(() => setStatus("idle"), 2000);
    }, 600);

    return () => {
      if (writeTimer.current) clearTimeout(writeTimer.current);
    };
  }, [key, values, enabled]);

  useEffect(() => {
    return () => {
      if (savedTimer.current) clearTimeout(savedTimer.current);
    };
  }, []);

  return status;
}
