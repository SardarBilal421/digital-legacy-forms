"use client";

import * as React from "react";
import { AlertCircle } from "lucide-react";
import type { Option } from "@/shared/options";

/**
 * TanStack dashboard field kit — dark SaaS styling, violet accent. Top-left
 * labels, compact rows. Self-contained; shares nothing visual with other variants.
 */

const inputBase =
  "w-full rounded-md border bg-zinc-900 px-3 py-2 text-sm text-zinc-100 outline-none transition placeholder:text-zinc-500 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/30";

function borderClass(error?: string) {
  return error ? "border-red-500/70 focus:border-red-500 focus:ring-red-500/30" : "border-zinc-700";
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
        <span className="ml-0.5 text-violet-400" aria-hidden>
          *
        </span>
      )}
    </>
  );

  const body = (
    <>
      {hint && (
        <p id={hintId} className="text-xs leading-snug text-zinc-500">
          {hint}
        </p>
      )}
      {children(aria)}
      {error && (
        <p id={errorId} role="alert" className="flex items-center gap-1.5 text-xs font-medium text-red-400">
          <AlertCircle className="size-3.5 shrink-0" aria-hidden />
          {error}
        </p>
      )}
    </>
  );

  if (labelAs === "legend") {
    return (
      <fieldset className="space-y-2 text-left">
        <legend className="mb-1 text-[13px] font-medium text-zinc-300">{labelNode}</legend>
        {body}
      </fieldset>
    );
  }
  return (
    <div className="space-y-2 text-left">
      <label htmlFor={id} className="block text-[13px] font-medium text-zinc-300">
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

export function TsText(p: TextProps) {
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
          className={`${inputBase} ${borderClass(p.error)} [color-scheme:dark]`}
          onChange={(e) => p.onChange(e.target.value)}
          onBlur={p.onBlur}
        />
      )}
    </Wrapper>
  );
}

export function TsTextarea(p: Omit<TextProps, "type" | "inputMode" | "autoComplete">) {
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

export function TsRadio<T extends string>(p: ChoiceProps<T>) {
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
                className={`flex cursor-pointer items-center gap-2 rounded-md border px-3.5 py-2 text-sm transition ${
                  checked
                    ? "border-violet-500 bg-violet-500/10 text-violet-100"
                    : "border-zinc-700 bg-zinc-900 text-zinc-300 hover:border-zinc-600"
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
                  className="size-4 accent-violet-500"
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

export function TsSelect<T extends string>(p: ChoiceProps<T> & { placeholder?: string }) {
  return (
    <Wrapper id={p.id} label={p.label} hint={p.hint} error={p.error} required={p.required}>
      {(aria) => (
        <select
          {...aria}
          name={p.id}
          value={p.value}
          className={`${inputBase} ${borderClass(p.error)} appearance-none [color-scheme:dark]`}
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

export function TsCheckboxGroup<T extends string>(p: MultiProps<T>) {
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
                className={`flex cursor-pointer items-center gap-3 rounded-md border px-3.5 py-2 text-sm transition ${
                  checked
                    ? "border-violet-500 bg-violet-500/10 text-violet-100"
                    : "border-zinc-700 bg-zinc-900 text-zinc-300 hover:border-zinc-600"
                }`}
              >
                <input
                  type="checkbox"
                  id={optId}
                  checked={checked}
                  onChange={(e) => toggle(opt.value, e.target.checked)}
                  className="size-4 accent-violet-500"
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

export function TsCheckbox(p: CheckboxProps) {
  const errorId = p.error ? `${p.id}-error` : undefined;
  return (
    <div className="space-y-2 text-left">
      <label
        htmlFor={p.id}
        className="flex cursor-pointer items-start gap-3 rounded-md border border-zinc-700 bg-zinc-900 p-3.5 text-sm leading-snug text-zinc-200"
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
          className="mt-0.5 size-4 accent-violet-500"
        />
        <span>
          {p.label}
          {p.required && (
            <span className="ml-0.5 text-violet-400" aria-hidden>
              *
            </span>
          )}
        </span>
      </label>
      {p.error && (
        <p id={errorId} role="alert" className="flex items-center gap-1.5 text-xs font-medium text-red-400">
          <AlertCircle className="size-3.5 shrink-0" aria-hidden />
          {p.error}
        </p>
      )}
    </div>
  );
}
