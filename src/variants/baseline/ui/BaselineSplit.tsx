"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Check, ChevronLeft, FileText, Info, Loader2, Lock, LogOut, Trash2, X } from "lucide-react";
import { BlFormBody } from "./form-body";
import { PlanPreview } from "./preview";
import { BlSuccess } from "./success";
import { useBaselineForm } from "@/variants/baseline/useBaselineForm";
import { APP_TITLE, DRAFT_SAVED, DRAFT_SAVING, PRIVACY_NOTE, infoText } from "@/shared/copy";
import { REVIEW_STEP, STEPS } from "@/shared/steps";
import { defaultValues } from "@/shared/schema";
import { isDirty, useUnsavedWarning } from "@/shared/useUnsavedWarning";
import { getVariant } from "@/shared/variants";

const meta = getVariant("baseline")!;

export function BaselineSplit() {
  const router = useRouter();
  const { api, flow, draftStatus, onClearDraft, submitResult, onReset, values, saveNow } = useBaselineForm();
  const [aboutOpen, setAboutOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useUnsavedWarning(isDirty(values, defaultValues) && !submitResult);

  if (submitResult) return <BlSuccess result={submitResult} onReset={onReset} />;

  const onReviewStep = flow.step === REVIEW_STEP;
  const pct = Math.round((flow.step / (STEPS.length - 1)) * 100);
  const saveAndExit = () => {
    saveNow();
    router.push("/");
  };

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-teal-100 bg-white/70">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-4 py-3">
          <Link href="/" className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-800">
            <ChevronLeft className="size-4" /> All variants
          </Link>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-100 px-2.5 py-1 text-xs font-semibold text-teal-800">
            <Lock className="size-3" /> {meta.design}
          </span>
          <button type="button" onClick={() => setAboutOpen(true)} className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-800">
            <Info className="size-4" /> About
          </button>
        </div>
      </header>

      <main className="mx-auto grid w-full max-w-6xl flex-1 grid-cols-1 gap-8 px-4 py-8 lg:grid-cols-[1fr_22rem]">
        {/* Form (left) */}
        <div>
          <div className="mb-5">
            <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">{APP_TITLE}</h1>
          </div>

          <form
            noValidate
            onSubmit={(e) => {
              e.preventDefault();
              void flow.submitForm();
            }}
            className="rounded-2xl border border-teal-100 bg-white/70 p-6 shadow-sm sm:p-7"
          >
            {/* progress */}
            <div className="mb-6 space-y-2">
              <div className="flex items-center justify-between text-[13px] font-medium text-slate-500">
                <span>
                  Step {flow.step + 1} of {STEPS.length} · <span className="text-slate-800">{STEPS[flow.step].title}</span>
                </span>
                <span>{pct}%</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-teal-100">
                <div className="h-full rounded-full bg-teal-600 transition-[width] duration-300" style={{ width: `${pct}%` }} />
              </div>
              <ol className="flex flex-wrap gap-1.5 pt-1">
                {STEPS.map((s, i) => {
                  const done = flow.isComplete(i);
                  const active = i === flow.step;
                  const reachable = flow.canNavigate(i);
                  return (
                    <li key={s.id}>
                      <button
                        type="button"
                        disabled={!reachable}
                        onClick={() => flow.goTo(i)}
                        aria-current={active ? "step" : undefined}
                        className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${
                          active ? "bg-teal-600 text-white" : done ? "bg-teal-50 text-teal-700" : reachable ? "bg-slate-100 text-slate-500" : "bg-slate-100 text-slate-400"
                        }`}
                      >
                        {done && <Check className="size-3" />}
                        <span className="hidden sm:inline">{s.shortTitle}</span>
                        <span className="sm:hidden">{i + 1}</span>
                      </button>
                    </li>
                  );
                })}
              </ol>
            </div>

            <h2 className="text-left text-lg font-bold text-slate-900">{STEPS[flow.step].title}</h2>
            {flow.step === 1 && <p className="mt-1 text-left text-[13px] leading-relaxed text-slate-500">{infoText.executors}</p>}
            <div className="mt-5">
              <BlFormBody step={flow.step} api={api} onEditSection={flow.goTo} />
            </div>

            <div className="mt-6 flex items-center justify-between gap-2 text-[13px] text-slate-500">
              <span className="inline-flex items-center gap-1.5" aria-live="polite">
                {draftStatus === "saving" && <Loader2 className="size-3.5 animate-spin" />}
                {draftStatus === "saved" && <Check className="size-3.5 text-teal-600" />}
                {draftStatus === "saving" ? DRAFT_SAVING : draftStatus === "saved" ? DRAFT_SAVED : ""}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Lock className="size-3.5" /> {PRIVACY_NOTE}
              </span>
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-teal-100 pt-6">
              <div className="flex items-center gap-2">
                {flow.step > 0 && (
                  <button type="button" onClick={flow.goBack} className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                    <ArrowLeft className="size-4" /> Back
                  </button>
                )}
                <button type="button" onClick={saveAndExit} className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-500 hover:text-slate-800">
                  <LogOut className="size-4" /> Save and exit
                </button>
              </div>
              {onReviewStep ? (
                <button type="submit" disabled={flow.isSubmitting} className="inline-flex items-center gap-1.5 rounded-xl bg-teal-700 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-teal-800 disabled:opacity-60">
                  {flow.isSubmitting && <Loader2 className="size-4 animate-spin" />}
                  {flow.isSubmitting ? "Submitting…" : "Submit plan"}
                </button>
              ) : (
                <button type="button" onClick={() => void flow.goNext()} className="inline-flex items-center gap-1.5 rounded-xl bg-teal-700 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-teal-800">
                  Continue <ArrowRight className="size-4" />
                </button>
              )}
            </div>

            <div className="mt-4 text-center">
              <button type="button" onClick={onClearDraft} className="inline-flex items-center gap-1 text-xs font-medium text-slate-400 hover:text-rose-600">
                <Trash2 className="size-3.5" /> Clear saved draft
              </button>
            </div>
          </form>
        </div>

        {/* Live preview (right, desktop) */}
        <aside className="hidden lg:block">
          <div className="sticky top-6 h-[calc(100vh-3rem)]">
            <PlanPreview values={values} onJump={flow.goTo} />
          </div>
        </aside>
      </main>

      {/* Mobile: floating button + bottom drawer */}
      <button
        type="button"
        onClick={() => setDrawerOpen(true)}
        className="fixed bottom-4 right-4 z-30 inline-flex items-center gap-2 rounded-full bg-teal-700 px-4 py-3 text-sm font-semibold text-white shadow-lg lg:hidden"
      >
        <FileText className="size-4" /> View your plan
      </button>
      {drawerOpen && (
        <div className="fixed inset-0 z-40 flex items-end bg-slate-900/40 lg:hidden" onClick={() => setDrawerOpen(false)}>
          <div className="max-h-[85vh] w-full overflow-hidden rounded-t-2xl bg-white" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-teal-100 px-4 py-2">
              <span className="text-sm font-bold text-teal-900">Your Digital Legacy Plan</span>
              <button type="button" onClick={() => setDrawerOpen(false)} aria-label="Close" className="rounded-md p-1 text-slate-400 hover:bg-slate-100">
                <X className="size-5" />
              </button>
            </div>
            <div className="h-[70vh]">
              <PlanPreview values={values} onJump={(s) => { flow.goTo(s); setDrawerOpen(false); }} />
            </div>
          </div>
        </div>
      )}

      {aboutOpen && <AboutPanel onClose={() => setAboutOpen(false)} />}
    </div>
  );
}

function AboutPanel({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40" onClick={onClose}>
      <div role="dialog" aria-label="About this variant" className="h-full w-full max-w-sm overflow-y-auto bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-teal-700">{meta.design}</p>
            <h2 className="text-lg font-bold text-slate-900">{meta.name}</h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="rounded-md p-1 text-slate-400 hover:bg-slate-100">
            <X className="size-5" />
          </button>
        </div>
        <p className="mt-3 text-sm text-slate-600">{meta.designTagline}</p>
        <h3 className="mt-6 text-xs font-semibold uppercase tracking-wide text-slate-400">Design &amp; build notes</h3>
        <ul className="mt-2 space-y-2">
          {meta.designNotes.map((n, i) => (
            <li key={i} className="text-[13px] leading-relaxed text-slate-600">{n}</li>
          ))}
        </ul>
        <h3 className="mt-6 text-xs font-semibold uppercase tracking-wide text-slate-400">Form library</h3>
        <p className="mt-1 font-mono text-xs text-slate-500">{meta.library}</p>
        <ul className="mt-2 space-y-2">
          {meta.stateNotes.map((n, i) => (
            <li key={i} className="text-[13px] leading-relaxed text-slate-600">{n}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
