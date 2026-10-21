"use client";

import Link from "next/link";
import { ShieldCheck, Mail, FileCheck2, Lock, RotateCcw } from "lucide-react";
import type { SubmitResult } from "@/shared/submit";

export function BlSuccess({ result, onReset }: { result: SubmitResult; onReset: () => void }) {
  const steps = [
    { icon: Mail, title: "You'll get a confirmation", body: "A copy of your plan and reference number is on its way to your inbox." },
    { icon: FileCheck2, title: "We prepare your Digital & Social Media Will", body: "Our team drafts your safeguarding document from the details you gave us." },
    { icon: ShieldCheck, title: "Your executors are notified", body: "When the time comes, the people you named are guided through what to do." },
  ];
  return (
    <div className="mx-auto flex min-h-screen max-w-xl flex-col justify-center px-5 py-12 text-left">
      <div className="rounded-2xl border border-teal-100 bg-white p-8 shadow-sm">
        <div className="flex flex-col items-center text-center">
          <div className="flex size-14 items-center justify-center rounded-full bg-teal-100">
            <ShieldCheck className="size-8 text-teal-700" aria-hidden />
          </div>
          <h2 className="mt-4 text-2xl font-bold tracking-tight text-slate-900">Your plan is safeguarded</h2>
          <p className="mt-1 text-sm text-slate-500">
            Reference <span className="font-mono font-semibold text-slate-900">{result.reference}</span>.
          </p>
        </div>
        <h3 className="mt-8 text-sm font-bold text-teal-900">What happens next</h3>
        <ol className="mt-3 space-y-3">
          {steps.map((s, i) => (
            <li key={i} className="flex gap-3 rounded-xl border border-teal-100 bg-teal-50/50 p-4">
              <s.icon className="mt-0.5 size-5 shrink-0 text-teal-700" aria-hidden />
              <div>
                <p className="text-sm font-semibold text-slate-800">{s.title}</p>
                <p className="text-[13px] text-slate-500">{s.body}</p>
              </div>
            </li>
          ))}
        </ol>
        <p className="mt-6 flex items-center justify-center gap-1.5 text-xs text-teal-800">
          <Lock className="size-3.5" /> Encrypted end to end · trusted by families
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button type="button" onClick={onReset} className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">
            <RotateCcw className="size-4" /> Start again
          </button>
          <Link href="/" className="inline-flex items-center rounded-xl bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-800">
            Back to all variants
          </Link>
        </div>
      </div>
    </div>
  );
}
