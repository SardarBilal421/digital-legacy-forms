"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft, ArrowRight, Check, ChevronLeft, Info, Loader2, LogOut, Lock, Trash2, X } from "lucide-react";
import { buildQuestions } from "./questions";
import { FkReview } from "./review";
import { FkSuccess } from "./success";
import { useFormikForm } from "@/variants/formik/useFormikForm";
import { APP_TITLE, DRAFT_SAVED, DRAFT_SAVING, labels } from "@/shared/copy";
import { validateValues, stepOfPath } from "@/shared/steps";
import { focusFirstError } from "@/shared/focus";
import { defaultValues } from "@/shared/schema";
import { isDirty, useUnsavedWarning } from "@/shared/useUnsavedWarning";
import { loadStep, saveStep } from "@/shared/progress";
import { getVariant } from "@/shared/variants";

const meta = getVariant("formik")!;
const DRAFT_KEY = meta.draftKey;

export function FormikFlow() {
  const router = useRouter();
  const f = useFormikForm();
  const { api, values, draftStatus, submitResult, onReset, onClearDraft, touchPath, submitPlan, saveNow } = f;

  const questions = buildQuestions(api);
  const total = questions.length; // index === total → review screen

  const [index, setIndex] = useState(() => {
    const saved = loadStep(DRAFT_KEY) ?? 0;
    return Math.min(Math.max(0, saved), total);
  });
  const [dir, setDir] = useState(1);
  const [aboutOpen, setAboutOpen] = useState(false);

  useUnsavedWarning(isDirty(values, defaultValues) && !submitResult);

  // Clamp without setState-in-effect: the visible question list can shrink when
  // a conditional answer changes, so derive a safe index for this render.
  const idx = Math.min(index, total);

  useEffect(() => {
    saveStep(DRAFT_KEY, idx);
  }, [idx]);

  if (submitResult) return <FkSuccess result={submitResult} onReset={onReset} />;

  const onReviewScreen = idx >= total;
  const pct = Math.round((idx / total) * 100);

  const jumpToPath = (path: string | null) => {
    if (!path) return;
    const qi = questions.findIndex((q) => q.paths.some((p) => path === p || path.startsWith(`${p}.`)));
    if (qi >= 0) {
      setDir(-1);
      setIndex(qi);
    }
    touchPath(path);
    focusFirstError(path);
  };

  const editStep = (step: number) => {
    const qi = questions.findIndex((q) => stepOfPath(q.paths[0]) === step);
    if (qi >= 0) {
      setDir(-1);
      setIndex(qi);
    }
  };

  const next = async () => {
    if (onReviewScreen) {
      const res = await submitPlan();
      if (!res.ok) jumpToPath(res.firstErrorPath);
      return;
    }
    const q = questions[idx];
    const errs = validateValues(values).errors;
    const bad = Object.keys(errs).filter((k) => q.paths.some((p) => k === p || k.startsWith(`${p}.`)));
    if (bad.length) {
      bad.forEach(touchPath);
      focusFirstError(bad[0]);
      return;
    }
    setDir(1);
    setIndex((i) => Math.min(i + 1, total));
  };

  const back = () => {
    setDir(-1);
    setIndex((i) => Math.max(0, i - 1));
  };

  const saveAndExit = () => {
    saveNow(idx);
    router.push("/");
  };

  const consent = api.bool("consent");

  return (
    <div className="relative flex min-h-screen flex-col">
      {/* progress line */}
      <div className="fixed inset-x-0 top-0 z-20 h-1 bg-rose-100">
        <div className="h-full bg-rose-500 transition-[width] duration-300" style={{ width: `${pct}%` }} />
      </div>

      {/* top bar */}
      <header className="flex items-center justify-between px-5 py-4">
        <Link href="/" className="inline-flex items-center gap-1.5 text-sm font-semibold text-rose-700/70 hover:text-rose-900">
          <ChevronLeft className="size-4" /> All variants
        </Link>
        <span className="inline-flex items-center gap-2 text-xs font-semibold text-rose-700/60" aria-live="polite">
          {draftStatus === "saving" && (
            <>
              <Loader2 className="size-3.5 animate-spin" /> {DRAFT_SAVING}
            </>
          )}
          {draftStatus === "saved" && (
            <>
              <Check className="size-3.5" /> {DRAFT_SAVED}
            </>
          )}
        </span>
        <button type="button" onClick={() => setAboutOpen(true)} className="inline-flex items-center gap-1.5 text-sm font-semibold text-rose-700/70 hover:text-rose-900">
          <Info className="size-4" /> About
        </button>
      </header>

      <main className="flex flex-1 items-center justify-center px-5 py-6">
        <div className="w-full max-w-xl">
          <AnimatePresence mode="wait" custom={dir}>
            <motion.div
              key={onReviewScreen ? "review" : questions[idx]?.id}
              custom={dir}
              initial={{ opacity: 0, x: dir > 0 ? 48 : -48 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: dir > 0 ? -48 : 48 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
            >
              {onReviewScreen ? (
                <div className="space-y-6">
                  <div>
                    <p className="text-sm font-bold uppercase tracking-wide text-rose-500">Almost there</p>
                    <h1 className="mt-1 text-3xl font-bold tracking-tight text-rose-950">Review your answers</h1>
                  </div>
                  <FkReview values={values} onEditStep={editStep} />
                  <label className="flex cursor-pointer items-start gap-3 rounded-2xl border-2 border-rose-200 bg-white/70 p-4 text-left text-sm text-rose-950">
                    <input
                      type="checkbox"
                      checked={consent.value}
                      onChange={(e) => consent.onChange(e.target.checked)}
                      className="mt-0.5 size-5 accent-rose-500"
                    />
                    <span>{labels.consent}</span>
                  </label>
                  {consent.error && <p className="text-sm font-medium text-rose-600">{consent.error}</p>}
                </div>
              ) : (
                <div className="space-y-6">
                  <div>
                    <p className="text-sm font-bold text-rose-400">
                      Question {idx + 1}
                      <span className="text-rose-300"> / {total}</span>
                    </p>
                    <h1 className="mt-1 text-2xl font-bold tracking-tight text-rose-950 sm:text-3xl">
                      {questions[idx].title}
                    </h1>
                    {questions[idx].subtitle && (
                      <p className="mt-2 text-rose-700/80">{questions[idx].subtitle}</p>
                    )}
                  </div>
                  <div>{questions[idx].render(api, next)}</div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* nav */}
          <div className="mt-8 flex items-center gap-3">
            {idx > 0 && (
              <button type="button" onClick={back} className="inline-flex items-center gap-1.5 rounded-full border-2 border-rose-200 bg-white/70 px-5 py-3 text-base font-bold text-rose-700 hover:bg-white">
                <ArrowLeft className="size-5" /> Back
              </button>
            )}
            <button
              type="button"
              onClick={() => void next()}
              disabled={false}
              className="inline-flex items-center gap-2 rounded-full bg-rose-500 px-7 py-3 text-base font-bold text-white shadow-lg shadow-rose-500/25 hover:bg-rose-600"
            >
              {onReviewScreen ? "Submit plan" : "OK"}
              {!onReviewScreen && <span className="hidden text-sm font-normal text-white/70 sm:inline">press Enter ↵</span>}
              <ArrowRight className="size-5" />
            </button>
          </div>

          <div className="mt-6 flex items-center justify-between text-xs text-rose-600/60">
            <button type="button" onClick={saveAndExit} className="inline-flex items-center gap-1.5 font-semibold hover:text-rose-800">
              <LogOut className="size-3.5" /> Save and exit
            </button>
            <span className="inline-flex items-center gap-1.5">
              <Lock className="size-3.5" /> Never enter passwords
            </span>
            <button type="button" onClick={onClearDraft} className="inline-flex items-center gap-1 font-semibold hover:text-rose-800">
              <Trash2 className="size-3.5" /> Clear draft
            </button>
          </div>
        </div>
      </main>

      {aboutOpen && <AboutPanel onClose={() => setAboutOpen(false)} />}
    </div>
  );
}

function AboutPanel({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-rose-950/30" onClick={onClose}>
      <div role="dialog" aria-label="About this variant" className="h-full w-full max-w-sm overflow-y-auto bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-rose-500">{meta.design}</p>
            <h2 className="text-lg font-bold text-rose-950">{meta.name}</h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="rounded-md p-1 text-rose-400 hover:bg-rose-100">
            <X className="size-5" />
          </button>
        </div>
        <p className="mt-3 text-sm text-rose-700">{meta.designTagline}</p>
        <p className="sr-only">{APP_TITLE}</p>
        <h3 className="mt-6 text-xs font-bold uppercase tracking-wide text-rose-400">Design &amp; build notes</h3>
        <ul className="mt-2 space-y-2">
          {meta.designNotes.map((n, i) => (
            <li key={i} className="text-[13px] leading-relaxed text-rose-700">{n}</li>
          ))}
        </ul>
        <h3 className="mt-6 text-xs font-bold uppercase tracking-wide text-rose-400">Form library</h3>
        <p className="mt-1 font-mono text-xs text-rose-500">{meta.library}</p>
        <ul className="mt-2 space-y-2">
          {meta.stateNotes.map((n, i) => (
            <li key={i} className="text-[13px] leading-relaxed text-rose-700">{n}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
