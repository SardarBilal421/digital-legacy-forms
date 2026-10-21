"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronLeft,
  Info,
  Loader2,
  LogOut,
  Lock,
  Trash2,
  X,
} from "lucide-react";
import { RhfStepper } from "./stepper";
import { RhfFormBody } from "./form-body";
import { RhfSuccess } from "./success";
import { useRhfForm } from "@/variants/rhf/useRhfForm";
import { APP_TITLE, APP_SUBTITLE, PRIVACY_NOTE, DRAFT_SAVED, DRAFT_SAVING, infoText } from "@/shared/copy";
import { REVIEW_STEP, STEPS } from "@/shared/steps";
import { defaultValues } from "@/shared/schema";
import { isDirty, useUnsavedWarning } from "@/shared/useUnsavedWarning";
import { getVariant } from "@/shared/variants";

const meta = getVariant("rhf")!;

export function RhfWizard() {
  const router = useRouter();
  const { api, flow, draftStatus, onClearDraft, submitResult, onReset, values, saveNow } = useRhfForm();
  const [aboutOpen, setAboutOpen] = useState(false);

  const dirty = isDirty(values, defaultValues);
  useUnsavedWarning(dirty && !submitResult);

  const onReview = flow.step === REVIEW_STEP;

  const saveAndExit = () => {
    saveNow();
    router.push("/");
  };

  return (
    <div className="flex min-h-screen flex-col">
      {/* Top bar */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex w-full max-w-3xl items-center justify-between gap-3 px-4 py-3">
          <Link href="/" className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-800">
            <ChevronLeft className="size-4" /> All variants
          </Link>
          <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
            {meta.design}
          </span>
          <button
            type="button"
            onClick={() => setAboutOpen(true)}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-800"
          >
            <Info className="size-4" /> About
          </button>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 sm:py-12">
        {submitResult ? (
          <RhfSuccess result={submitResult} onReset={onReset} />
        ) : (
          <>
            <div className="mb-6 text-center">
              <h1 className="text-balance text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                {APP_TITLE}
              </h1>
              <p className="mx-auto mt-2 max-w-xl text-sm text-slate-500">{APP_SUBTITLE}</p>
            </div>

            <form
              noValidate
              onSubmit={(e) => {
                e.preventDefault();
                void flow.submitForm();
              }}
              className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200 sm:p-8"
            >
              <RhfStepper
                current={flow.step}
                canNavigate={flow.canNavigate}
                isComplete={flow.isComplete}
                onNavigate={flow.goTo}
              />

              <div className="mt-7">
                <h2 className="text-left text-lg font-bold text-slate-900">{STEPS[flow.step].title}</h2>
                {flow.step === 1 && (
                  <p className="mt-1 text-left text-[13px] leading-relaxed text-slate-500">{infoText.executors}</p>
                )}
                <div className="mt-5">
                  <RhfFormBody step={flow.step} api={api} onEditSection={flow.goTo} />
                </div>
              </div>

              {/* Draft status + privacy */}
              <div className="mt-6 flex items-center justify-between gap-2 text-[13px] text-slate-500">
                <span className="inline-flex items-center gap-1.5" aria-live="polite">
                  {draftStatus === "saving" && <Loader2 className="size-3.5 animate-spin" />}
                  {draftStatus === "saved" && <Check className="size-3.5 text-blue-600" />}
                  {draftStatus === "saving" ? DRAFT_SAVING : draftStatus === "saved" ? DRAFT_SAVED : ""}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Lock className="size-3.5" /> {PRIVACY_NOTE}
                </span>
              </div>

              {/* Footer actions */}
              <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-6">
                <div className="flex items-center gap-2">
                  {flow.step > 0 && (
                    <button
                      type="button"
                      onClick={flow.goBack}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      <ArrowLeft className="size-4" /> Back
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={saveAndExit}
                    className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-500 hover:text-slate-800"
                  >
                    <LogOut className="size-4" /> Save and exit
                  </button>
                </div>

                {onReview ? (
                  <button
                    type="submit"
                    disabled={flow.isSubmitting}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:opacity-60"
                  >
                    {flow.isSubmitting && <Loader2 className="size-4 animate-spin" />}
                    {flow.isSubmitting ? "Submitting…" : "Submit plan"}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => void flow.goNext()}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
                  >
                    Continue <ArrowRight className="size-4" />
                  </button>
                )}
              </div>

              <div className="mt-4 text-center">
                <button
                  type="button"
                  onClick={onClearDraft}
                  className="inline-flex items-center gap-1 text-xs font-medium text-slate-400 hover:text-red-600"
                >
                  <Trash2 className="size-3.5" /> Clear saved draft
                </button>
              </div>
            </form>
          </>
        )}
      </main>

      {aboutOpen && <AboutPanel onClose={() => setAboutOpen(false)} />}
    </div>
  );
}

function AboutPanel({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40" onClick={onClose}>
      <div
        role="dialog"
        aria-label="About this variant"
        className="h-full w-full max-w-sm overflow-y-auto bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">{meta.design}</p>
            <h2 className="text-lg font-bold text-slate-900">{meta.name}</h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="rounded-md p-1 text-slate-400 hover:bg-slate-100">
            <X className="size-5" />
          </button>
        </div>
        <p className="mt-3 text-sm text-slate-600">{meta.designTagline}</p>

        <h3 className="mt-6 text-xs font-semibold uppercase tracking-wide text-slate-400">Design & build notes</h3>
        <ul className="mt-2 space-y-2">
          {meta.designNotes.map((n, i) => (
            <li key={i} className="text-[13px] leading-relaxed text-slate-600">
              {n}
            </li>
          ))}
        </ul>

        <h3 className="mt-6 text-xs font-semibold uppercase tracking-wide text-slate-400">Form library</h3>
        <p className="mt-1 font-mono text-xs text-slate-500">{meta.library}</p>
        <ul className="mt-2 space-y-2">
          {meta.stateNotes.map((n, i) => (
            <li key={i} className="text-[13px] leading-relaxed text-slate-600">
              {n}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
