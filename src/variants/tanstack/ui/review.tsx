"use client";

import { buildReviewSections } from "@/shared/reviewModel";
import type { FormValues } from "@/shared/schema";

export function TsReview({ values, onEdit }: { values: FormValues; onEdit: (step: number) => void }) {
  const sections = buildReviewSections(values);
  return (
    <div className="space-y-4 text-left">
      {sections.map((section) => (
        <div key={section.step} className="overflow-hidden rounded-lg border border-zinc-800 bg-zinc-900/50">
          <div className="flex items-center justify-between gap-2 border-b border-zinc-800 px-4 py-2.5">
            <h3 className="text-sm font-semibold text-zinc-200">{section.title}</h3>
            <button
              type="button"
              onClick={() => onEdit(section.step)}
              className="text-sm font-medium text-violet-400 hover:text-violet-300"
            >
              Change
            </button>
          </div>
          <dl className="divide-y divide-zinc-800">
            {section.rows.map((row, i) => (
              <div key={i} className="grid grid-cols-1 gap-0.5 px-4 py-2.5 sm:grid-cols-[14rem_1fr] sm:gap-4">
                <dt className="text-xs text-zinc-500">{row.label}</dt>
                <dd className="break-words text-sm text-zinc-100">{row.value || <span className="text-zinc-600">—</span>}</dd>
              </div>
            ))}
          </dl>
        </div>
      ))}
    </div>
  );
}
