"use client";

import * as React from "react";
import { AlertCircle, Check } from "lucide-react";
import type { Option } from "@/shared/options";

/**
 * Formik "One Question at a Time" field kit — Typeform/Lemonade style: big type,
 * underline text inputs, large pill choices (with A/B/C keys) that auto-advance.
 * Warm rose accent. Self-contained styling.
 */

function ErrorLine({ id, error }: { id: string; error?: string }) {
  if (!error) return null;
  return (
    <p id={`${id}-error`} role="alert" className="mt-3 flex items-center gap-1.5 text-sm font-medium text-rose-600">
      <AlertCircle className="size-4 shrink-0" aria-hidden />
      {error}
    </p>
  );
}

export interface TextProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  error?: string;
  type?: React.HTMLInputTypeAttribute;
  autoComplete?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  placeholder?: string;
  onEnter?: () => void;
}

export function FkText(p: TextProps) {
  return (
    <div>
      <input
        id={p.id}
        name={p.id}
        type={p.type ?? "text"}
        value={p.value}
        autoComplete={p.autoComplete}
        inputMode={p.inputMode}
        placeholder={p.placeholder ?? "Type your answer here…"}
        aria-invalid={Boolean(p.error)}
        aria-describedby={p.error ? `${p.id}-error` : undefined}
        autoFocus
        className="w-full border-0 border-b-2 border-rose-200 bg-transparent pb-2 text-2xl text-rose-950 outline-none transition-colors placeholder:text-rose-300/70 focus:border-rose-500 sm:text-3xl"
        onChange={(e) => p.onChange(e.target.value)}
        onBlur={p.onBlur}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            p.onEnter?.();
          }
        }}
      />
      <ErrorLine id={p.id} error={p.error} />
    </div>
  );
}

export function FkTextarea(p: Omit<TextProps, "type" | "inputMode">) {
  return (
    <div>
      <textarea
        id={p.id}
        name={p.id}
        value={p.value}
        placeholder={p.placeholder ?? "Type your answer here…"}
        rows={3}
        autoFocus
        aria-invalid={Boolean(p.error)}
        aria-describedby={p.error ? `${p.id}-error` : undefined}
        className="w-full resize-none border-0 border-b-2 border-rose-200 bg-transparent pb-2 text-xl text-rose-950 outline-none transition-colors placeholder:text-rose-300/70 focus:border-rose-500"
        onChange={(e) => p.onChange(e.target.value)}
        onBlur={p.onBlur}
        onKeyDown={(e) => {
          if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
            e.preventDefault();
            p.onEnter?.();
          }
        }}
      />
      <ErrorLine id={p.id} error={p.error} />
    </div>
  );
}

const KEYS = "ABCDEFGH";

export interface ChoiceProps<T extends string> {
  id: string;
  options: Option<T>[];
  value: T | "";
  onChange: (value: T) => void;
  error?: string;
  onPick?: () => void;
}

export function FkChoice<T extends string>(p: ChoiceProps<T>) {
  return (
    <div role="radiogroup" aria-invalid={Boolean(p.error)} className="space-y-3">
      {p.options.map((opt, i) => {
        const checked = p.value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={checked}
            onClick={() => {
              p.onChange(opt.value);
              p.onPick?.();
            }}
            className={`group flex w-full items-center gap-3 rounded-2xl border-2 px-5 py-4 text-left text-lg transition ${
              checked
                ? "border-rose-500 bg-rose-500 text-white shadow-lg shadow-rose-500/20"
                : "border-rose-200 bg-white/70 text-rose-950 hover:border-rose-400 hover:bg-white"
            }`}
          >
            <span
              className={`flex size-7 shrink-0 items-center justify-center rounded-md border text-sm font-bold ${
                checked ? "border-white/40 bg-white/20 text-white" : "border-rose-300 text-rose-500"
              }`}
            >
              {KEYS[i] ?? i + 1}
            </span>
            <span className="flex-1">{opt.label}</span>
            {checked && <Check className="size-5" aria-hidden />}
          </button>
        );
      })}
      <ErrorLine id={p.id} error={p.error} />
    </div>
  );
}

export interface MultiProps<T extends string> {
  id: string;
  options: Option<T>[];
  value: T[];
  onChange: (values: T[]) => void;
  error?: string;
}

export function FkMulti<T extends string>(p: MultiProps<T>) {
  const toggle = (val: T, checked: boolean) => {
    if (checked) p.onChange([...p.value, val]);
    else p.onChange(p.value.filter((v) => v !== val));
  };
  return (
    <div role="group" className="space-y-3">
      {p.options.map((opt, i) => {
        const checked = p.value.includes(opt.value);
        return (
          <button
            key={opt.value}
            type="button"
            aria-pressed={checked}
            onClick={() => toggle(opt.value, !checked)}
            className={`flex w-full items-center gap-3 rounded-2xl border-2 px-5 py-4 text-left text-lg transition ${
              checked
                ? "border-rose-500 bg-rose-500 text-white shadow-lg shadow-rose-500/20"
                : "border-rose-200 bg-white/70 text-rose-950 hover:border-rose-400 hover:bg-white"
            }`}
          >
            <span
              className={`flex size-7 shrink-0 items-center justify-center rounded-md border text-sm font-bold ${
                checked ? "border-white/40 bg-white/20 text-white" : "border-rose-300 text-rose-500"
              }`}
            >
              {checked ? <Check className="size-4" /> : (KEYS[i] ?? i + 1)}
            </span>
            <span className="flex-1">{opt.label}</span>
          </button>
        );
      })}
      <ErrorLine id={p.id} error={p.error} />
    </div>
  );
}

/** Compact labelled input used inside multi-field groups (executors/contacts). */
export function FkSubInput({
  id,
  label,
  value,
  onChange,
  onBlur,
  error,
  type,
  autoComplete,
  inputMode,
  onEnter,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  onBlur?: () => void;
  error?: string;
  type?: React.HTMLInputTypeAttribute;
  autoComplete?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  onEnter?: () => void;
}) {
  return (
    <div className="text-left">
      <label htmlFor={id} className="mb-1 block text-sm font-semibold text-rose-900/80">
        {label}
      </label>
      <input
        id={id}
        name={id}
        type={type ?? "text"}
        value={value}
        autoComplete={autoComplete}
        inputMode={inputMode}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        className={`w-full rounded-xl border-2 bg-white/80 px-4 py-3 text-base text-rose-950 outline-none transition-colors focus:border-rose-500 ${
          error ? "border-rose-400" : "border-rose-200"
        }`}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            onEnter?.();
          }
        }}
      />
      {error && (
        <p id={`${id}-error`} role="alert" className="mt-1.5 flex items-center gap-1 text-xs font-medium text-rose-600">
          <AlertCircle className="size-3.5 shrink-0" aria-hidden />
          {error}
        </p>
      )}
    </div>
  );
}
