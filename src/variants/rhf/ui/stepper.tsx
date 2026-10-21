"use client";

import { Check } from "lucide-react";
import { STEPS } from "@/shared/steps";

/**
 * Horizontal numbered progress bar for the Classic Wizard. Completed steps show
 * a tick and are clickable; the current step is highlighted in blue.
 */
export function RhfStepper({
  current,
  canNavigate,
  isComplete,
  onNavigate,
}: {
  current: number;
  canNavigate: (step: number) => boolean;
  isComplete: (step: number) => boolean;
  onNavigate: (step: number) => void;
}) {
  const pct = Math.round((current / (STEPS.length - 1)) * 100);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-[13px] font-medium text-slate-500">
        <span>
          Step {current + 1} of {STEPS.length} · <span className="text-slate-800">{STEPS[current].title}</span>
        </span>
        <span>{pct}%</span>
      </div>

      <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
        <div
          className="h-full rounded-full bg-blue-600 transition-[width] duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>

      <ol className="flex flex-wrap gap-1.5">
        {STEPS.map((s, i) => {
          const done = isComplete(i);
          const active = i === current;
          const reachable = canNavigate(i);
          return (
            <li key={s.id}>
              <button
                type="button"
                disabled={!reachable}
                onClick={() => onNavigate(i)}
                aria-current={active ? "step" : undefined}
                className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
                  active
                    ? "bg-blue-600 text-white"
                    : done
                      ? "bg-blue-50 text-blue-700 hover:bg-blue-100"
                      : reachable
                        ? "bg-slate-100 text-slate-500 hover:bg-slate-200"
                        : "bg-slate-100 text-slate-400"
                } ${reachable ? "cursor-pointer" : "cursor-not-allowed"}`}
              >
                <span
                  className={`flex size-4 items-center justify-center rounded-full text-[10px] ${
                    active ? "bg-white/25" : done ? "bg-blue-600 text-white" : "bg-slate-300 text-white"
                  }`}
                >
                  {done ? <Check className="size-2.5" /> : i + 1}
                </span>
                <span className="hidden sm:inline">{s.shortTitle}</span>
              </button>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
