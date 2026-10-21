"use client";

import { buildReviewSections } from "@/shared/reviewModel";
import type { FormValues } from "@/shared/schema";

export function BlReview({ values, onEdit }: { values: FormValues; onEdit: (step: number) => void }) {
  const sections = buildReviewSections(values);
  return (
    <div className="space-y-4 text-left">
      {sections.map((section) => (
        <div key={section.step} className="overflow-hidden rounded-2xl border border-teal-100 bg-white/70">
          <div className="flex items-center justify-between gap-2 border-b border-teal-100 bg-teal-50/60 px-4 py-2.5">
            <h3 className="text-sm font-bold text-teal-900">{section.title}</h3>
            <button type="button" onClick={() => onEdit(section.step)} className="text-sm font-semibold text-teal-700 hover:underline">
              Change
            </button>
          </div>
          <dl className="divide-y divide-teal-50">
            {section.rows.map((row, i) => (
              <div key={i} className="grid grid-cols-1 gap-0.5 px-4 py-2.5 sm:grid-cols-[13rem_1fr] sm:gap-4">
                <dt className="text-[13px] text-slate-500">{row.label}</dt>
                <dd className="break-words text-sm text-slate-900">{row.value || <span className="text-slate-400">—</span>}</dd>
              </div>
            ))}
          </dl>
        </div>
      ))}
    </div>
  );
}
