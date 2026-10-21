"use client";

import { buildReviewSections } from "@/shared/reviewModel";
import type { FormValues } from "@/shared/schema";

export function FkReview({ values, onEditStep }: { values: FormValues; onEditStep: (step: number) => void }) {
  const sections = buildReviewSections(values);
  return (
    <div className="space-y-4 text-left">
      {sections.map((section) => (
        <div key={section.step} className="overflow-hidden rounded-2xl border-2 border-rose-200 bg-white/70">
          <div className="flex items-center justify-between gap-2 border-b border-rose-100 px-4 py-2.5">
            <h3 className="text-sm font-bold text-rose-900">{section.title}</h3>
            <button type="button" onClick={() => onEditStep(section.step)} className="text-sm font-bold text-rose-600 hover:underline">
              Change
            </button>
          </div>
          <dl className="divide-y divide-rose-100">
            {section.rows.map((row, i) => (
              <div key={i} className="grid grid-cols-1 gap-0.5 px-4 py-2.5 sm:grid-cols-[13rem_1fr] sm:gap-4">
                <dt className="text-xs text-rose-500">{row.label}</dt>
                <dd className="break-words text-sm text-rose-950">{row.value || <span className="text-rose-300">—</span>}</dd>
              </div>
            ))}
          </dl>
        </div>
      ))}
    </div>
  );
}
