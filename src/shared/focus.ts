/**
 * Scroll to and focus the field at a flattened path (e.g. `execPrimary.email`
 * or `iamContacts.0.name`). Works for plain inputs, selects, and radio/checkbox
 * groups where the id sits on a non-focusable container.
 */
export function focusFirstError(path: string | null): void {
  if (!path || typeof document === "undefined") return;

  // Defer so the step we navigated to has rendered.
  requestAnimationFrame(() => {
    const escaped = cssEscape(path);
    let el = document.getElementById(path) as HTMLElement | null;

    // If the matched element can't take focus, find a focusable descendant.
    if (el && !isFocusable(el)) {
      el = el.querySelector<HTMLElement>("input, select, textarea, button, [tabindex]:not([tabindex='-1'])");
    }

    // Fallback: match by name attribute.
    if (!el) {
      el = document.querySelector<HTMLElement>(`[name="${escaped}"]`);
    }

    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "center" });
    el.focus({ preventScroll: true });
  });
}

function isFocusable(el: HTMLElement): boolean {
  const tag = el.tagName.toLowerCase();
  if (["input", "select", "textarea", "button"].includes(tag)) return true;
  return el.tabIndex >= 0;
}

function cssEscape(value: string): string {
  if (typeof CSS !== "undefined" && typeof CSS.escape === "function") return CSS.escape(value);
  return value.replace(/["\\]/g, "\\$&");
}
