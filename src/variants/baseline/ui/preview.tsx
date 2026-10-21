"use client";

import { ShieldCheck, Lock } from "lucide-react";
import { buildReviewSections } from "@/shared/reviewModel";
import { STEPS } from "@/shared/steps";
import { defaultValues, type FormValues } from "@/shared/schema";

/**
 * The live "Your Digital Legacy Plan" document. It reads the same values as the
 * form and fills in as the user types — a reassuring, premium artefact that
 * makes the abstract form feel concrete.
 */
export function PlanPreview({ values, onJump }: { values: FormValues; onJump?: (step: number) => void }) {
  const sections = buildReviewSections(values);

  const started = STEPS.slice(0, 6).filter((s) =>
    s.rootKeys.some((k) => JSON.stringify(values[k]) !== JSON.stringify(defaultValues[k as keyof FormValues])),
  ).length;

  const owner = values.fullName.trim() || "—";

  return (
    <div className="flex h-full flex-col rounded-2xl border border-teal-100 bg-white shadow-sm">
      {/* Document header */}
      <div className="rounded-t-2xl bg-gradient-to-br from-teal-700 to-teal-900 px-6 py-5 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="size-5" aria-hidden />
            <span className="text-xs font-semibold uppercase tracking-widest text-teal-100">Your Digital Legacy Plan</span>
          </div>
          <span className="rounded bg-white/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">Draft</span>
        </div>
        <p className="mt-3 text-lg font-bold">{owner}</p>
        <p className="text-xs text-teal-200">
          {started} of 6 sections started · updates live as you type
        </p>
      </div>

      {/* Document body */}
      <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5 text-left">
        {sections.map((section) => (
          <section key={section.step}>
            <button
              type="button"
              onClick={() => onJump?.(section.step)}
              className="mb-1.5 text-xs font-bold uppercase tracking-wide text-teal-700 hover:underline"
            >
              {section.title}
            </button>
            <dl className="space-y-1">
              {section.rows.map((row, i) => (
                <div key={i} className="flex justify-between gap-4 text-sm">
                  <dt className="shrink-0 text-slate-400">{row.label}</dt>
                  <dd className={`text-right ${row.value ? "font-medium text-slate-800" : "text-slate-300"}`}>
                    {row.value || "To be completed"}
                  </dd>
                </div>
              ))}
            </dl>
          </section>
        ))}
      </div>

      {/* Trust footer */}
      <div className="flex items-center gap-2 rounded-b-2xl border-t border-teal-100 bg-teal-50/60 px-6 py-3 text-[11px] text-teal-800">
        <Lock className="size-3.5" aria-hidden />
        Private &amp; secure — in this demo nothing leaves your browser.
      </div>
    </div>
  );
}
