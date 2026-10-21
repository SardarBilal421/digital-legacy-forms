"use client";

import Link from "next/link";
import { Mail, FileCheck2, ShieldCheck } from "lucide-react";
import type { SubmitResult } from "@/shared/submit";

export function ConformSuccess({ result, onReset }: { result: SubmitResult; onReset: () => void }) {
  const steps = [
    { icon: Mail, title: "You'll get a confirmation", body: "A copy of your plan and reference number is on its way to your inbox." },
    { icon: FileCheck2, title: "We prepare your Digital & Social Media Will", body: "Our team drafts your safeguarding document from the details you gave us." },
    { icon: ShieldCheck, title: "Your executors are notified", body: "When the time comes, the people you named are guided through what to do." },
  ];
  return (
    <div className="mx-auto w-full max-w-2xl px-5 py-16">
      <div className="rounded border-l-4 border-green-600 bg-green-50 p-6">
        <h1 className="font-[family-name:var(--font-conform-serif)] text-3xl font-semibold tracking-tight text-green-950">
          Plan submitted
        </h1>
        <p className="mt-2 text-green-900">
          Your reference number is <span className="font-bold">{result.reference}</span>.
        </p>
      </div>

      <h2 className="mt-10 font-[family-name:var(--font-conform-serif)] text-xl font-semibold">What happens next</h2>
      <ol className="mt-4 space-y-4 border-t border-stone-200 pt-4">
        {steps.map((s, i) => (
          <li key={i} className="flex gap-3">
            <s.icon className="mt-0.5 size-5 shrink-0 text-sky-800" aria-hidden />
            <div>
              <p className="font-semibold text-stone-900">{s.title}</p>
              <p className="text-sm text-stone-600">{s.body}</p>
            </div>
          </li>
        ))}
      </ol>

      <div className="mt-10 flex flex-wrap gap-4">
        <button type="button" onClick={onReset} className="rounded border border-stone-400 px-5 py-2.5 text-sm font-bold text-stone-800 hover:bg-stone-100">
          Start again
        </button>
        <Link href="/" className="rounded bg-sky-800 px-5 py-2.5 text-sm font-bold text-white hover:bg-sky-900">
          Back to all variants
        </Link>
      </div>
    </div>
  );
}
