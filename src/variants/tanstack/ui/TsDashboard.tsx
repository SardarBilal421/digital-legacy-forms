"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronLeft,
  Circle,
  CircleDashed,
  Info,
  Loader2,
  LogOut,
  Lock,
  Trash2,
  X,
} from "lucide-react";
import { TsFormBody } from "./form-body";
import { TsSuccess } from "./success";
import { useTanstackForm } from "@/variants/tanstack/useTanstackForm";
import { APP_TITLE, PRIVACY_NOTE, DRAFT_SAVED, DRAFT_SAVING, infoText } from "@/shared/copy";
import { REVIEW_STEP, STEPS } from "@/shared/steps";
import { defaultValues } from "@/shared/schema";
import { isDirty, useUnsavedWarning } from "@/shared/useUnsavedWarning";
import { getVariant } from "@/shared/variants";

const meta = getVariant("tanstack")!;

type Status = "notStarted" | "inProgress" | "done" | "error";

function StatusIcon({ status, active }: { status: Status; active: boolean }) {
  if (status === "error") return <AlertCircle className="size-4 text-red-400" aria-hidden />;
  if (status === "done") return <CheckCircle2 className="size-4 text-emerald-400" aria-hidden />;
  if (status === "inProgress") return <CircleDashed className="size-4 text-amber-400" aria-hidden />;
  return <Circle className={`size-4 ${active ? "text-violet-400" : "text-zinc-600"}`} aria-hidden />;
}

const STATUS_LABEL: Record<Status, string> = {
  notStarted: "Not started",
  inProgress: "In progress",
  done: "Completed",
  error: "Needs attention",
};

export function TsDashboard() {
  const router = useRouter();
  const { api, flow, draftStatus, onClearDraft, submitResult, onReset, values, saveNow, sectionStatus } =
    useTanstackForm();
  const [aboutOpen, setAboutOpen] = useState(false);

  useUnsavedWarning(isDirty(values, defaultValues) && !submitResult);

  if (submitResult) return <TsSuccess result={submitResult} onReset={onReset} />;

  const onReviewStep = flow.step === REVIEW_STEP;
  const saveAndExit = () => {
    saveNow();
    router.push("/");
  };

  const nav = (
    <nav className="space-y-1">
      {STEPS.map((s, i) => {
        const status = sectionStatus(i);
        const active = i === flow.step;
        const reachable = flow.canNavigate(i);
        return (
          <button
            key={s.id}
            type="button"
            disabled={!reachable}
            onClick={() => flow.goTo(i)}
            aria-current={active ? "step" : undefined}
            title={STATUS_LABEL[status]}
            className={`flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm transition ${
              active
                ? "bg-violet-500/15 text-zinc-50 ring-1 ring-violet-500/40"
                : reachable
                  ? "text-zinc-300 hover:bg-zinc-800/60"
                  : "text-zinc-600"
            } ${reachable ? "cursor-pointer" : "cursor-not-allowed"}`}
          >
            <StatusIcon status={status} active={active} />
            <span className="flex-1 truncate">{s.shortTitle}</span>
            <span className="text-[10px] uppercase tracking-wide text-zinc-500">{STATUS_LABEL[status]}</span>
          </button>
        );
      })}
    </nav>
  );

  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      {/* Sidebar (desktop) */}
      <aside className="hidden w-72 shrink-0 flex-col border-r border-zinc-800 bg-zinc-900/40 p-4 lg:flex">
        <Link href="/" className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-400 hover:text-zinc-100">
          <ChevronLeft className="size-4" /> All variants
        </Link>
        <div className="mt-4">
          <span className="rounded-full bg-violet-500/15 px-2.5 py-1 text-[11px] font-semibold text-violet-300">
            {meta.design}
          </span>
          <h1 className="mt-2 text-sm font-semibold leading-snug text-zinc-200">{APP_TITLE}</h1>
        </div>
        <div className="mt-5 flex-1 overflow-y-auto">{nav}</div>
        <button
          type="button"
          onClick={() => setAboutOpen(true)}
          className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-zinc-400 hover:text-zinc-100"
        >
          <Info className="size-4" /> About this variant
        </button>
      </aside>

      {/* Mobile top bar + section chips */}
      <div className="border-b border-zinc-800 bg-zinc-900/40 p-3 lg:hidden">
        <div className="flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-1 text-xs text-zinc-400">
            <ChevronLeft className="size-4" /> All variants
          </Link>
          <span className="rounded-full bg-violet-500/15 px-2 py-0.5 text-[10px] font-semibold text-violet-300">
            {meta.design}
          </span>
          <button type="button" onClick={() => setAboutOpen(true)} className="inline-flex items-center gap-1 text-xs text-zinc-400">
            <Info className="size-4" /> About
          </button>
        </div>
        <div className="mt-3 flex gap-1.5 overflow-x-auto pb-1">
          {STEPS.map((s, i) => {
            const status = sectionStatus(i);
            const active = i === flow.step;
            return (
              <button
                key={s.id}
                type="button"
                disabled={!flow.canNavigate(i)}
                onClick={() => flow.goTo(i)}
                className={`flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs ${
                  active ? "bg-violet-500/20 text-violet-100 ring-1 ring-violet-500/40" : "bg-zinc-800/60 text-zinc-400"
                }`}
              >
                <StatusIcon status={status} active={active} />
                {s.shortTitle}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main panel */}
      <div className="flex min-w-0 flex-1 flex-col">
        <form
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            void flow.submitForm();
          }}
          className="flex flex-1 flex-col"
        >
          <div className="flex-1 overflow-y-auto px-5 py-8 sm:px-10">
            <div className="mx-auto max-w-2xl">
              <p className="text-xs font-medium uppercase tracking-wide text-violet-400">
                Section {flow.step + 1} of {STEPS.length}
              </p>
              <h2 className="mt-1 text-xl font-semibold text-zinc-50">{STEPS[flow.step].title}</h2>
              {flow.step === 1 && <p className="mt-2 text-[13px] leading-relaxed text-zinc-500">{infoText.executors}</p>}
              <div className="mt-6">
                <TsFormBody step={flow.step} api={api} onEditSection={flow.goTo} />
              </div>
              <button
                type="button"
                onClick={onClearDraft}
                className="mt-8 inline-flex items-center gap-1 text-xs font-medium text-zinc-500 hover:text-red-400"
              >
                <Trash2 className="size-3.5" /> Clear saved draft
              </button>
            </div>
          </div>

          {/* Sticky save bar */}
          <div className="sticky bottom-0 border-t border-zinc-800 bg-zinc-950/90 px-5 py-3 backdrop-blur sm:px-10">
            <div className="mx-auto flex max-w-2xl flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-4 text-xs text-zinc-500">
                <span className="inline-flex items-center gap-1.5" aria-live="polite">
                  {draftStatus === "saving" && <Loader2 className="size-3.5 animate-spin" />}
                  {draftStatus === "saved" && <Check className="size-3.5 text-emerald-400" />}
                  {draftStatus === "saving" ? DRAFT_SAVING : draftStatus === "saved" ? DRAFT_SAVED : <span className="inline-flex items-center gap-1.5"><Lock className="size-3.5" /> Autosaving</span>}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button type="button" onClick={saveAndExit} className="inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium text-zinc-400 hover:text-zinc-100">
                  <LogOut className="size-4" /> Save and exit
                </button>
                {flow.step > 0 && (
                  <button type="button" onClick={flow.goBack} className="inline-flex items-center gap-1.5 rounded-md border border-zinc-700 bg-zinc-900 px-4 py-2 text-sm font-medium text-zinc-200 hover:bg-zinc-800">
                    <ArrowLeft className="size-4" /> Back
                  </button>
                )}
                {onReviewStep ? (
                  <button type="submit" disabled={flow.isSubmitting} className="inline-flex items-center gap-1.5 rounded-md bg-violet-600 px-5 py-2 text-sm font-semibold text-white hover:bg-violet-500 disabled:opacity-60">
                    {flow.isSubmitting && <Loader2 className="size-4 animate-spin" />}
                    {flow.isSubmitting ? "Submitting…" : "Submit plan"}
                  </button>
                ) : (
                  <button type="button" onClick={() => void flow.goNext()} className="inline-flex items-center gap-1.5 rounded-md bg-violet-600 px-5 py-2 text-sm font-semibold text-white hover:bg-violet-500">
                    Continue <ArrowRight className="size-4" />
                  </button>
                )}
              </div>
            </div>
            <p className="mx-auto mt-2 max-w-2xl text-[11px] text-zinc-600">{PRIVACY_NOTE}</p>
          </div>
        </form>
      </div>

      {aboutOpen && <AboutPanel onClose={() => setAboutOpen(false)} />}
    </div>
  );
}

function AboutPanel({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50" onClick={onClose}>
      <div
        role="dialog"
        aria-label="About this variant"
        className="h-full w-full max-w-sm overflow-y-auto border-l border-zinc-800 bg-zinc-900 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-violet-400">{meta.design}</p>
            <h2 className="text-lg font-semibold text-zinc-50">{meta.name}</h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="rounded p-1 text-zinc-500 hover:bg-zinc-800">
            <X className="size-5" />
          </button>
        </div>
        <p className="mt-3 text-sm text-zinc-400">{meta.designTagline}</p>
        <h3 className="mt-6 text-xs font-semibold uppercase tracking-wide text-zinc-500">Design &amp; build notes</h3>
        <ul className="mt-2 space-y-2">
          {meta.designNotes.map((n, i) => (
            <li key={i} className="text-[13px] leading-relaxed text-zinc-400">{n}</li>
          ))}
        </ul>
        <h3 className="mt-6 text-xs font-semibold uppercase tracking-wide text-zinc-500">Form library</h3>
        <p className="mt-1 font-[family-name:var(--font-tanstack-mono)] text-xs text-zinc-500">{meta.library}</p>
        <ul className="mt-2 space-y-2">
          {meta.stateNotes.map((n, i) => (
            <li key={i} className="text-[13px] leading-relaxed text-zinc-400">{n}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
