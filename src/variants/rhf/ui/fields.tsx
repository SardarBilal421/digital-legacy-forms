"use client";

import * as React from "react";
import { AlertCircle } from "lucide-react";
import type { Option } from "@/shared/options";

/**
 * RHF "Classic Wizard" field kit. Deliberately plain and corporate: top-left
 * labels, generous rounded inputs, a single blue accent and a blue focus ring.
 * Self-contained styling (no shared visual components) so the look can't drift
 * toward any other variant.
 */

const inputBase =
  "w-full rounded-lg border bg-white px-3.5 py-2.5 text-[15px] text-slate-900 shadow-xs outline-none transition-colors placeholder:text-slate-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/15";

function borderClass(error?: string) {
  return error ? "border-red-400 focus:border-red-500 focus:ring-red-500/15" : "border-slate-300";
}

interface AriaProps {
  id: string;
  "aria-invalid": boolean;
  "aria-describedby": string | undefined;
}

function Wrapper({
  id,
  label,
  hint,
  error,
  required,
  labelAs = "label",
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  labelAs?: "label" | "legend";
  children: (aria: AriaProps) => React.ReactNode;
}) {
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;
  const aria: AriaProps = { id, "aria-invalid": Boolean(error), "aria-describedby": describedBy };

  const labelNode = (
    <>
      {label}
      {required && (
        <span className="ml-0.5 text-blue-600" aria-hidden>
          *
        </span>
      )}
    </>
  );

  const body = (
    <>
      {hint && (
        <p id={hintId} className="text-[13px] leading-snug text-slate-500">
          {hint}
        </p>
      )}
      {children(aria)}
      {error && (
        <p id={errorId} role="alert" className="flex items-center gap-1.5 text-[13px] font-medium text-red-600">
          <AlertCircle className="size-4 shrink-0" aria-hidden />
          {error}
        </p>
      )}
    </>
  );

  if (labelAs === "legend") {
    return (
      <fieldset className="space-y-2 text-left">
        <legend className="mb-1 text-sm font-semibold text-slate-800">{labelNode}</legend>
        {body}
      </fieldset>
    );
  }

  return (
    <div className="space-y-2 text-left">
      <label htmlFor={id} className="block text-sm font-semibold text-slate-800">
        {labelNode}
      </label>
      {body}
    </div>
  );
}

export interface TextProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  error?: string;
  hint?: string;
  required?: boolean;
  type?: React.HTMLInputTypeAttribute;
  autoComplete?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  placeholder?: string;
}

export function RhfText(p: TextProps) {
  return (
    <Wrapper id={p.id} label={p.label} hint={p.hint} error={p.error} required={p.required}>
      {(aria) => (
        <input
          {...aria}
          name={p.id}
          type={p.type ?? "text"}
          value={p.value}
          autoComplete={p.autoComplete}
          inputMode={p.inputMode}
          placeholder={p.placeholder}
          className={`${inputBase} ${borderClass(p.error)}`}
          onChange={(e) => p.onChange(e.target.value)}
          onBlur={p.onBlur}
        />
      )}
    </Wrapper>
  );
}

export function RhfTextarea(p: Omit<TextProps, "type" | "inputMode" | "autoComplete">) {
  return (
    <Wrapper id={p.id} label={p.label} hint={p.hint} error={p.error} required={p.required}>
      {(aria) => (
        <textarea
          {...aria}
          name={p.id}
          value={p.value}
          placeholder={p.placeholder}
          rows={3}
          className={`${inputBase} ${borderClass(p.error)} resize-y`}
          onChange={(e) => p.onChange(e.target.value)}
          onBlur={p.onBlur}
        />
      )}
    </Wrapper>
  );
}

export interface ChoiceProps<T extends string> {
  id: string;
  label: string;
  options: Option<T>[];
  value: T | "";
  onChange: (value: T) => void;
  onBlur?: () => void;
  error?: string;
  hint?: string;
  required?: boolean;
}

export function RhfRadio<T extends string>(p: ChoiceProps<T>) {
  return (
    <Wrapper id={p.id} label={p.label} hint={p.hint} error={p.error} required={p.required} labelAs="legend">
      {(aria) => (
        <div
          role="radiogroup"
          aria-invalid={aria["aria-invalid"]}
          aria-describedby={aria["aria-describedby"]}
          className="flex flex-col gap-2 sm:flex-row sm:flex-wrap"
        >
          {p.options.map((opt) => {
            const optId = `${p.id}-${opt.value}`;
            const checked = p.value === opt.value;
            return (
              <label
                key={opt.value}
                htmlFor={optId}
                className={`flex cursor-pointer items-center gap-2.5 rounded-lg border px-4 py-2.5 text-[15px] transition-colors ${
                  checked
                    ? "border-blue-600 bg-blue-50 text-blue-900 ring-1 ring-blue-600"
                    : "border-slate-300 bg-white hover:border-slate-400"
                }`}
              >
                <input
                  type="radio"
                  id={optId}
                  name={p.id}
                  value={opt.value}
                  checked={checked}
                  onChange={() => p.onChange(opt.value)}
                  onBlur={p.onBlur}
                  className="size-4 accent-blue-600"
                />
                {opt.label}
              </label>
            );
          })}
        </div>
      )}
    </Wrapper>
  );
}

export function RhfSelect<T extends string>(p: ChoiceProps<T> & { placeholder?: string }) {
  return (
    <Wrapper id={p.id} label={p.label} hint={p.hint} error={p.error} required={p.required}>
      {(aria) => (
        <select
          {...aria}
          name={p.id}
          value={p.value}
          className={`${inputBase} ${borderClass(p.error)} appearance-none`}
          onChange={(e) => p.onChange(e.target.value as T)}
          onBlur={p.onBlur}
        >
          <option value="" disabled>
            {p.placeholder ?? "Select an option"}
          </option>
          {p.options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      )}
    </Wrapper>
  );
}

export interface MultiProps<T extends string> {
  id: string;
  label: string;
  options: Option<T>[];
  value: T[];
  onChange: (values: T[]) => void;
  onBlur?: () => void;
  error?: string;
  hint?: string;
  required?: boolean;
}

export function RhfCheckboxGroup<T extends string>(p: MultiProps<T>) {
  const toggle = (val: T, checked: boolean) => {
    if (checked) p.onChange([...p.value, val]);
    else p.onChange(p.value.filter((v) => v !== val));
  };
  return (
    <Wrapper id={p.id} label={p.label} hint={p.hint} error={p.error} required={p.required} labelAs="legend">
      {(aria) => (
        <div
          role="group"
          aria-describedby={aria["aria-describedby"]}
          className="grid grid-cols-1 gap-2 sm:grid-cols-2"
          onBlur={p.onBlur}
        >
          {p.options.map((opt) => {
            const optId = `${p.id}-${opt.value}`;
            const checked = p.value.includes(opt.value);
            return (
              <label
                key={opt.value}
                htmlFor={optId}
                className={`flex cursor-pointer items-center gap-3 rounded-lg border px-4 py-2.5 text-[15px] transition-colors ${
                  checked
                    ? "border-blue-600 bg-blue-50 text-blue-900 ring-1 ring-blue-600"
                    : "border-slate-300 bg-white hover:border-slate-400"
                }`}
              >
                <input
                  type="checkbox"
                  id={optId}
                  checked={checked}
                  onChange={(e) => toggle(opt.value, e.target.checked)}
                  className="size-4 accent-blue-600"
                />
                {opt.label}
              </label>
            );
          })}
        </div>
      )}
    </Wrapper>
  );
}

export interface CheckboxProps {
  id: string;
  label: string;
  value: boolean;
  onChange: (checked: boolean) => void;
  onBlur?: () => void;
  error?: string;
  required?: boolean;
}

export function RhfCheckbox(p: CheckboxProps) {
  const errorId = p.error ? `${p.id}-error` : undefined;
  return (
    <div className="space-y-2 text-left">
      <label
        htmlFor={p.id}
        className="flex cursor-pointer items-start gap-3 rounded-lg border border-slate-300 bg-white p-4 text-[15px] leading-snug"
      >
        <input
          type="checkbox"
          id={p.id}
          name={p.id}
          checked={p.value}
          onChange={(e) => p.onChange(e.target.checked)}
          onBlur={p.onBlur}
          aria-invalid={Boolean(p.error)}
          aria-describedby={errorId}
          className="mt-0.5 size-4 accent-blue-600"
        />
        <span>
          {p.label}
          {p.required && (
            <span className="ml-0.5 text-blue-600" aria-hidden>
              *
            </span>
          )}
        </span>
      </label>
      {p.error && (
        <p id={errorId} role="alert" className="flex items-center gap-1.5 text-[13px] font-medium text-red-600">
          <AlertCircle className="size-4 shrink-0" aria-hidden />
          {p.error}
        </p>
      )}
    </div>
  );
}
