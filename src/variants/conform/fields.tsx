"use client";

import * as React from "react";
import { AlertCircle } from "lucide-react";
import {
  getInputProps,
  getSelectProps,
  getTextareaProps,
  getCollectionProps,
  type FieldMetadata,
} from "@conform-to/react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import type { Option } from "@/shared/options";
import { cn } from "@/lib/utils";

/**
 * Conform field components. Unlike the other variants these are **native,
 * uncontrolled inputs** bound by `name` so the form submits and validates
 * server-side even with JavaScript disabled. Conform's `getInputProps` etc.
 * wire up id / name / defaultValue / aria-invalid / aria-describedby for us.
 */

function firstError(meta: FieldMetadata<unknown>): string | undefined {
  return meta.errors?.[0];
}

function Chrome({
  id,
  label,
  hint,
  error,
  required,
  errorId,
  labelAs = "label",
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  errorId: string;
  labelAs?: "label" | "legend";
  children: React.ReactNode;
}) {
  const labelNode = (
    <>
      {label}
      {required && (
        <span className="ml-0.5 text-destructive" aria-hidden>
          *
        </span>
      )}
    </>
  );
  const body = (
    <>
      {children}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      {error && (
        <p id={errorId} role="alert" className="flex items-center gap-1 text-xs font-medium text-destructive">
          <AlertCircle className="size-3.5 shrink-0" aria-hidden />
          {error}
        </p>
      )}
    </>
  );
  if (labelAs === "legend") {
    return (
      <fieldset className="space-y-2">
        <legend className="mb-1 text-sm font-medium leading-none">{labelNode}</legend>
        {body}
      </fieldset>
    );
  }
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="leading-snug">
        {labelNode}
      </Label>
      {body}
    </div>
  );
}

export function CText({
  meta,
  label,
  type = "text",
  hint,
  required,
  autoComplete,
  inputMode,
}: {
  meta: FieldMetadata<string>;
  label: string;
  type?: "text" | "email" | "tel" | "url" | "date";
  hint?: string;
  required?: boolean;
  autoComplete?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
}) {
  const { key, ...props } = getInputProps(meta, { type, ariaAttributes: true });
  return (
    <Chrome
      id={meta.id}
      label={label}
      hint={hint}
      error={firstError(meta)}
      required={required}
      errorId={meta.errorId}
    >
      <Input key={key} {...props} autoComplete={autoComplete} inputMode={inputMode} />
    </Chrome>
  );
}

export function CTextarea({
  meta,
  label,
  required,
}: {
  meta: FieldMetadata<string>;
  label: string;
  required?: boolean;
}) {
  const { key, ...props } = getTextareaProps(meta, { ariaAttributes: true });
  return (
    <Chrome id={meta.id} label={label} error={firstError(meta)} required={required} errorId={meta.errorId}>
      <Textarea key={key} {...props} />
    </Chrome>
  );
}

export function CRadioGroup<T extends string>({
  meta,
  label,
  options,
  hint,
  required,
}: {
  meta: FieldMetadata<T>;
  label: string;
  options: Option<T>[];
  hint?: string;
  required?: boolean;
}) {
  const collection = getCollectionProps(meta, {
    type: "radio",
    options: options.map((o) => o.value),
    ariaAttributes: true,
  });
  return (
    <Chrome
      id={meta.id}
      label={label}
      hint={hint}
      error={firstError(meta)}
      required={required}
      errorId={meta.errorId}
      labelAs="legend"
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:gap-4">
        {collection.map((props) => {
          const { key, ...rest } = props;
          const opt = options.find((o) => o.value === props.value);
          return (
            <div key={key} className="flex items-center gap-2">
              <input {...rest} className="size-4 accent-primary" />
              <Label htmlFor={rest.id} className="font-normal">
                {opt?.label}
              </Label>
            </div>
          );
        })}
      </div>
    </Chrome>
  );
}

export function CSelect<T extends string>({
  meta,
  label,
  options,
  placeholder,
  required,
}: {
  meta: FieldMetadata<T>;
  label: string;
  options: Option<T>[];
  placeholder: string;
  required?: boolean;
}) {
  const { key, ...props } = getSelectProps(meta, { ariaAttributes: true });
  return (
    <Chrome id={meta.id} label={label} error={firstError(meta)} required={required} errorId={meta.errorId}>
      <select
        key={key}
        {...props}
        defaultValue={meta.initialValue ?? ""}
        className={cn(
          "h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-destructive dark:bg-input/30",
        )}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </Chrome>
  );
}

export function CCheckboxGroup<T extends string>({
  meta,
  label,
  options,
  required,
}: {
  meta: FieldMetadata<T[]>;
  label: string;
  options: Option<T>[];
  required?: boolean;
}) {
  const collection = getCollectionProps(meta, {
    type: "checkbox",
    options: options.map((o) => o.value),
    ariaAttributes: true,
  });
  return (
    <Chrome
      id={meta.id}
      label={label}
      error={firstError(meta)}
      required={required}
      errorId={meta.errorId}
      labelAs="legend"
    >
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {collection.map((props) => {
          const { key, ...rest } = props;
          const opt = options.find((o) => o.value === props.value);
          return (
            <label
              key={key}
              htmlFor={rest.id}
              className="flex cursor-pointer items-center gap-3 rounded-md border px-3 py-2.5 text-sm hover:bg-accent has-checked:border-primary has-checked:bg-primary/5"
            >
              <input {...rest} className="size-4 accent-primary" />
              {opt?.label}
            </label>
          );
        })}
      </div>
    </Chrome>
  );
}

export function CCheckbox({
  meta,
  label,
  required,
}: {
  meta: FieldMetadata<boolean>;
  label: string;
  required?: boolean;
}) {
  const { key, ...props } = getInputProps(meta, { type: "checkbox", ariaAttributes: true });
  const error = firstError(meta);
  return (
    <div className="space-y-2">
      <div className="flex items-start gap-3">
        <input key={key} {...props} className="mt-0.5 size-4 accent-primary" />
        <Label htmlFor={meta.id} className="font-normal leading-snug">
          {label}
          {required && (
            <span className="ml-0.5 text-destructive" aria-hidden>
              *
            </span>
          )}
        </Label>
      </div>
      {error && (
        <p
          id={meta.errorId}
          role="alert"
          className="flex items-center gap-1 text-xs font-medium text-destructive"
        >
          <AlertCircle className="size-3.5 shrink-0" aria-hidden />
          {error}
        </p>
      )}
    </div>
  );
}
