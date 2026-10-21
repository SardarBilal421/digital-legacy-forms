"use client";

import Link from "next/link";
import { CheckCircle2, Mail, FileCheck2, ShieldCheck, RotateCcw } from "lucide-react";
import type { SubmitResult } from "@/shared/submit";

export function TsSuccess({ result, onReset }: { result: SubmitResult; onReset: () => void }) {
  const steps = [
    { icon: Mail, title: "You'll get a confirmation", body: "A copy of your plan and reference number is on its way to your inbox." },
    { icon: FileCheck2, title: "We prepare your Digital & Social Media Will", body: "Our team drafts your safeguarding document from the details you gave us." },
    { icon: ShieldCheck, title: "Your executors are notified", body: "When the time comes, the people you named are guided through what to do." },
  ];
  return (
    <div className="mx-auto flex min-h-screen max-w-xl flex-col justify-center px-4 py-12 text-left">
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-8">
        <div className="flex flex-col items-center text-center">
          <CheckCircle2 className="size-14 text-violet-400" aria-hidden />
          <h2 className="mt-4 text-2xl font-semibold tracking-tight text-zinc-50">Your plan has been submitted</h2>
          <p className="mt-1 text-sm text-zinc-400">
            Reference <span className="font-[family-name:var(--font-tanstack-mono)] font-semibold text-zinc-100">{result.reference}</span>. Keep it safe.
          </p>
        </div>
        <h3 className="mt-8 text-sm font-semibold text-zinc-300">What happens next</h3>
        <ol className="mt-3 space-y-3">
          {steps.map((s, i) => (
            <li key={i} className="flex gap-3 rounded-lg border border-zinc-800 bg-zinc-950/40 p-4">
              <s.icon className="mt-0.5 size-5 shrink-0 text-violet-400" aria-hidden />
              <div>
                <p className="text-sm font-medium text-zinc-200">{s.title}</p>
                <p className="text-xs text-zinc-500">{s.body}</p>
              </div>
            </li>
          ))}
        </ol>
        <div className="mt-8 flex flex-wrap justify-center gap-2">
          <button type="button" onClick={onReset} className="inline-flex items-center gap-1.5 rounded-md border border-zinc-700 bg-zinc-900 px-4 py-2.5 text-sm font-medium text-zinc-200 hover:bg-zinc-800">
            <RotateCcw className="size-4" /> Start again
          </button>
          <Link href="/" className="inline-flex items-center rounded-md bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-violet-500">
            Back to all variants
          </Link>
        </div>
      </div>
    </div>
  );
}
