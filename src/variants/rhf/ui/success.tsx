"use client";

import Link from "next/link";
import { CheckCircle2, Mail, FileCheck2, ShieldCheck, RotateCcw } from "lucide-react";
import type { SubmitResult } from "@/shared/submit";

/**
 * "What happens next" confirmation page shown after a successful submit.
 * Confirms receipt, the reference, and the three next steps.
 */
export function RhfSuccess({ result, onReset }: { result: SubmitResult; onReset: () => void }) {
  const steps = [
    { icon: Mail, title: "You'll get a confirmation", body: "A copy of your plan and reference number is on its way to your inbox." },
    { icon: FileCheck2, title: "We prepare your Digital & Social Media Will", body: "Our team drafts your safeguarding document from the details you gave us." },
    { icon: ShieldCheck, title: "Your executors are notified", body: "When the time comes, the people you named are guided through what to do." },
  ];

  return (
    <div className="mx-auto max-w-xl text-left">
      <div className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
        <div className="flex flex-col items-center text-center">
          <CheckCircle2 className="size-14 text-blue-600" aria-hidden />
          <h2 className="mt-4 text-2xl font-bold tracking-tight text-slate-900">Your plan has been submitted</h2>
          <p className="mt-1 text-sm text-slate-500">
            Your reference is{" "}
            <span className="font-mono font-semibold text-slate-900">{result.reference}</span>. Keep it safe.
          </p>
        </div>

        <h3 className="mt-8 text-sm font-bold text-slate-800">What happens next</h3>
        <ol className="mt-3 space-y-3">
          {steps.map((s, i) => (
            <li key={i} className="flex gap-3 rounded-xl border border-slate-200 bg-slate-50/70 p-4">
              <s.icon className="mt-0.5 size-5 shrink-0 text-blue-600" aria-hidden />
              <div>
                <p className="text-sm font-semibold text-slate-800">{s.title}</p>
                <p className="text-[13px] text-slate-500">{s.body}</p>
              </div>
            </li>
          ))}
        </ol>

        <div className="mt-8 flex flex-wrap justify-center gap-2">
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            <RotateCcw className="size-4" /> Start again
          </button>
          <Link
            href="/"
            className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
          >
            Back to all variants
          </Link>
        </div>
      </div>
    </div>
  );
}
