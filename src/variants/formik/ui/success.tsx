"use client";

import Link from "next/link";
import { PartyPopper, Mail, FileCheck2, ShieldCheck, RotateCcw } from "lucide-react";
import type { SubmitResult } from "@/shared/submit";

export function FkSuccess({ result, onReset }: { result: SubmitResult; onReset: () => void }) {
  const steps = [
    { icon: Mail, title: "You'll get a confirmation", body: "A copy of your plan and reference number is on its way to your inbox." },
    { icon: FileCheck2, title: "We prepare your Digital & Social Media Will", body: "Our team drafts your safeguarding document from the details you gave us." },
    { icon: ShieldCheck, title: "Your people are notified", body: "When the time comes, the people you named are guided through what to do." },
  ];
  return (
    <div className="mx-auto flex min-h-screen max-w-xl flex-col justify-center px-5 py-12 text-center">
      <PartyPopper className="mx-auto size-16 text-rose-500" aria-hidden />
      <h2 className="mt-4 text-3xl font-bold tracking-tight text-rose-950">All done — thank you!</h2>
      <p className="mt-2 text-rose-700">
        Your reference is <span className="font-bold text-rose-950">{result.reference}</span>. Keep it somewhere safe.
      </p>
      <div className="mt-8 space-y-3 text-left">
        <h3 className="text-sm font-bold uppercase tracking-wide text-rose-500">What happens next</h3>
        {steps.map((s, i) => (
          <div key={i} className="flex gap-3 rounded-2xl border-2 border-rose-200 bg-white/70 p-4">
            <s.icon className="mt-0.5 size-5 shrink-0 text-rose-500" aria-hidden />
            <div>
              <p className="text-sm font-bold text-rose-900">{s.title}</p>
              <p className="text-sm text-rose-600">{s.body}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-8 flex flex-wrap justify-center gap-2">
        <button type="button" onClick={onReset} className="inline-flex items-center gap-1.5 rounded-full border-2 border-rose-300 bg-white px-5 py-2.5 text-sm font-bold text-rose-700 hover:bg-rose-50">
          <RotateCcw className="size-4" /> Start again
        </button>
        <Link href="/" className="inline-flex items-center rounded-full bg-rose-500 px-5 py-2.5 text-sm font-bold text-white hover:bg-rose-600">
          Back to all variants
        </Link>
      </div>
    </div>
  );
}
