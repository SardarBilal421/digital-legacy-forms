"use client";

import * as React from "react";
import { useActionState, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useForm, type FieldMetadata } from "@conform-to/react";
import { getZodConstraint, parseWithZod } from "@conform-to/zod/v4";
import { ChevronLeft, ChevronRight, Info, Loader2, Plus, X } from "lucide-react";
import { CText, CTextarea, CRadioGroup, CSelect, CCheckboxGroup, CCheckbox } from "./fields";
import { ConformSuccess } from "./success";
import { submitConform, type ConformState } from "./action";
import { formDataToValues } from "./formData";
import { buildReviewSections } from "@/shared/reviewModel";
import {
  defaultValues,
  formSchema,
  iamContactsRequired,
  secondExecutorStarted,
  contactStarted,
  type FormValues,
} from "@/shared/schema";
import { STEPS, REVIEW_STEP, validateValues, errorsForStep } from "@/shared/steps";
import { labels, hints, infoText, APP_TITLE, APP_SUBTITLE, PRIVACY_NOTE } from "@/shared/copy";
import {
  serviceOptions,
  yesNoOptions,
  yesNoNotSureOptions,
  supportSetupOptions,
  accountActionOptions,
  iamContactOrdinals,
} from "@/shared/options";
import { useAutosave, loadDraft, clearDraft } from "@/shared/useAutosave";
import { getVariant } from "@/shared/variants";

const DRAFT_KEY = getVariant("conform")!.draftKey;
const meta = getVariant("conform")!;

const asStr = (m: FieldMetadata<unknown>) => m as unknown as FieldMetadata<string>;
const asArr = (m: FieldMetadata<unknown>) => m as unknown as FieldMetadata<string[]>;
const asBool = (m: FieldMetadata<unknown>) => m as unknown as FieldMetadata<boolean>;

type Status = "notStarted" | "inProgress" | "completed";
const STATUS_LABEL: Record<Status, string> = {
  notStarted: "Not started",
  inProgress: "In progress",
  completed: "Completed",
};

function Tag({ status }: { status: Status }) {
  const cls =
    status === "completed"
      ? "bg-green-100 text-green-900 ring-green-300"
      : status === "inProgress"
        ? "bg-sky-100 text-sky-900 ring-sky-300"
        : "bg-stone-200 text-stone-700 ring-stone-300";
  return (
    <span className={`shrink-0 rounded px-2.5 py-1 text-xs font-bold uppercase tracking-wide ring-1 ring-inset ${cls}`}>
      {STATUS_LABEL[status]}
    </span>
  );
}

function ConfirmBar({ label, removeButton, onCancel }: { label: string; removeButton: React.ReactNode; onCancel: () => void }) {
  return (
    <div className="flex flex-wrap items-center gap-3 rounded border border-amber-300 bg-amber-50 px-4 py-3 text-sm">
      <span className="font-medium text-amber-900">{label}</span>
      {removeButton}
      <button type="button" onClick={onCancel} className="font-semibold text-stone-600 underline">
        Cancel
      </button>
    </div>
  );
}

function SubSection({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <section className="space-y-4 border-l-4 border-stone-300 pl-5">
      <div className="space-y-0.5">
        <h3 className="font-[family-name:var(--font-conform-serif)] text-lg font-semibold text-stone-900">{title}</h3>
        {description && <p className="text-sm text-stone-500">{description}</p>}
      </div>
      {children}
    </section>
  );
}

export function ConformForm() {
  const [initialValues] = useState<FormValues>(() => ({
    ...defaultValues,
    ...(loadDraft<FormValues>(DRAFT_KEY) ?? {}),
  }));

  const [state, formAction, isPending] = useActionState<ConformState, FormData>(submitConform, {});

  const [form, fields] = useForm<FormValues>({
    id: "conform-form",
    lastResult: state.result,
    constraint: getZodConstraint(formSchema),
    shouldValidate: "onBlur",
    shouldRevalidate: "onInput",
    defaultValue: initialValues,
    onValidate: ({ formData }) => parseWithZod(formData, { schema: formSchema }) as never,
  });

  const formRef = useRef<HTMLFormElement>(null);
  const sectionRefs = useRef<(HTMLElement | null)[]>([]);

  const [mounted, setMounted] = useState(false);
  // view: "hub" | section index 0..5 | "review"
  const [view, setView] = useState<"hub" | number | "review">("hub");
  const [snapshot, setSnapshot] = useState<FormValues>(initialValues);
  const [confirm, setConfirm] = useState<{ type: "iam" | "exec" | "manager"; index?: number } | null>(null);
  const [showExecSecond, setShowExecSecond] = useState(() => secondExecutorStarted(initialValues.execSecond));
  const [showManager, setShowManager] = useState(() => contactStarted(initialValues.fbManager));
  const [aboutOpen, setAboutOpen] = useState(false);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMounted(true), []);

  const draftStatus = useAutosave(DRAFT_KEY, snapshot, mounted);

  const refreshSnapshot = () => {
    if (formRef.current) setSnapshot(formDataToValues(new FormData(formRef.current)));
  };

  const v = snapshot;

  const stepStarted = (i: number): boolean =>
    STEPS[i].rootKeys.some((k) => JSON.stringify(v[k]) !== JSON.stringify(defaultValues[k as keyof FormValues]));

  const sectionStatus = (i: number): Status => {
    const hasErr = Object.keys(errorsForStep(validateValues(v).errors, i)).length > 0;
    const started = stepStarted(i);
    if (!started) return "notStarted";
    return hasErr ? "inProgress" : "completed";
  };

  const focusInvalid = (section: HTMLElement | null) => {
    requestAnimationFrame(() => {
      const el = section?.querySelector<HTMLElement>('[aria-invalid="true"]');
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        el.focus({ preventScroll: true });
      }
    });
  };

  const goToHub = () => {
    setView("hub");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const saveAndContinue = (i: number) => {
    form.validate();
    const values = formRef.current ? formDataToValues(new FormData(formRef.current)) : snapshot;
    const stepErrors = errorsForStep(validateValues(values).errors, i);
    if (Object.keys(stepErrors).length > 0) {
      focusInvalid(sectionRefs.current[i]);
      return;
    }
    goToHub();
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    const values = formDataToValues(new FormData(e.currentTarget));
    const { ok, errors } = validateValues(values);
    if (!ok) {
      e.preventDefault();
      form.validate();
      let firstStep = 0;
      for (let i = 0; i < STEPS.length; i += 1) {
        if (Object.keys(errorsForStep(errors, i)).length > 0) {
          firstStep = i;
          break;
        }
      }
      setView(firstStep);
      focusInvalid(sectionRefs.current[firstStep]);
      return;
    }
    form.onSubmit(e);
  };

  const onClearDraft = () => {
    clearDraft(DRAFT_KEY);
    window.location.reload();
  };

  if (state.success) {
    return (
      <ConformSuccess
        result={{ ok: true, reference: state.success.reference, receivedAt: state.success.receivedAt }}
        onReset={onClearDraft}
      />
    );
  }

  const execPrimary = fields.execPrimary.getFieldset();
  const execSecond = fields.execSecond.getFieldset();
  const fbManager = fields.fbManager.getFieldset();
  const iamContacts = fields.iamContacts.getFieldList();

  const sectionNodes: React.ReactNode[] = [
    // Step 1
    <div key="s0" className="space-y-6">
      <CText meta={asStr(fields.fullName)} label={labels.fullName} required autoComplete="name" />
      <CText meta={asStr(fields.previousSurname)} label={labels.previousSurname} hint={hints.previousSurname} autoComplete="family-name" />
      <CText meta={asStr(fields.dob)} label={labels.dob} type="date" required hint={hints.dob} autoComplete="bday" />
      <CRadioGroup meta={asStr(fields.isOver18)} label={labels.isOver18} required options={yesNoOptions} />
      {v.isOver18 === "no" && (
        <SubSection title="Legal guardian">
          <CText meta={asStr(fields.guardianPrimary)} label={labels.guardianPrimary} required autoComplete="name" />
          <CText meta={asStr(fields.guardianSecond)} label={labels.guardianSecond} autoComplete="name" />
        </SubSection>
      )}
    </div>,

    // Step 2 — executors (add-to-list for the optional second executor)
    <div key="s1" className="space-y-6">
      <p className="max-w-prose text-sm text-stone-500">{infoText.executors}</p>
      <SubSection title={labels.execPrimary}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <CText meta={asStr(execPrimary.fullName)} label={labels.execFullName} required autoComplete="name" />
          <CText meta={asStr(execPrimary.email)} label={labels.execEmail} type="email" inputMode="email" required autoComplete="email" />
          <CText meta={asStr(execPrimary.phone)} label={labels.execPhone} type="tel" inputMode="tel" required autoComplete="tel" hint={hints.execPhone} />
          <CText meta={asStr(execPrimary.relationship)} label={labels.execRelationship} required />
        </div>
      </SubSection>

      {mounted && !showExecSecond && !secondExecutorStarted(v.execSecond) ? (
        <button
          type="button"
          onClick={() => setShowExecSecond(true)}
          className="inline-flex items-center gap-1.5 rounded border border-stone-400 px-4 py-2 text-sm font-semibold text-stone-800 hover:bg-stone-100"
        >
          <Plus className="size-4" /> Add a second executor
        </button>
      ) : (
        <SubSection title={labels.execSecond} description="Optional — fill in one field and the rest become required.">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <CText meta={asStr(execSecond.fullName)} label={labels.execFullName} autoComplete="name" />
            <CText meta={asStr(execSecond.email)} label={labels.execEmail} type="email" inputMode="email" autoComplete="email" />
            <CText meta={asStr(execSecond.phone)} label={labels.execPhone} type="tel" inputMode="tel" autoComplete="tel" hint={hints.execPhone} />
            <CText meta={asStr(execSecond.relationship)} label={labels.execRelationship} />
          </div>
          {secondExecutorStarted(v.execSecond) && (
            <div className="space-y-6 pt-2">
              <CRadioGroup meta={asStr(fields.execSecondEqualAccess)} label={labels.execSecondEqualAccess} required options={yesNoOptions} />
              {v.execSecondEqualAccess === "no" && (
                <CTextarea meta={asStr(fields.execSecondAccessExplain)} label={labels.execSecondAccessExplain} required />
              )}
            </div>
          )}
          {mounted &&
            (confirm?.type === "exec" ? (
              <ConfirmBar
                onCancel={() => setConfirm(null)}
                label="Remove the second executor and clear these details?"
                removeButton={
                  <button
                    type="button"
                    onClick={() => {
                      setConfirm(null);
                      setShowExecSecond(false);
                    }}
                    {...form.reset.getButtonProps({ name: fields.execSecond.name as never })}
                    className="font-bold text-red-700 underline"
                  >
                    Yes, remove
                  </button>
                }
              />
            ) : (
              <button type="button" onClick={() => setConfirm({ type: "exec" })} className="text-sm font-semibold text-red-700 underline">
                Remove second executor
              </button>
            ))}
        </SubSection>
      )}
    </div>,

    // Step 3 — services
    <div key="s2" className="space-y-6">
      <CCheckboxGroup meta={asArr(fields.services)} label={labels.services} required options={serviceOptions} />
      {v.services.includes("other") && <CText meta={asStr(fields.servicesOther)} label={labels.servicesOther} required />}
      {v.services.includes("googlePhotos") && (
        <SubSection title="Google Photos">
          <CRadioGroup meta={asStr(fields.photosBackedUp)} label={labels.photosBackedUp} required options={yesNoNotSureOptions} />
          {v.photosBackedUp === "yes" && <CText meta={asStr(fields.photosCopyWho)} label={labels.photosCopyWho} required />}
        </SubSection>
      )}
      {v.services.includes("drive") && (
        <SubSection title="Drive">
          <CRadioGroup meta={asStr(fields.driveBackedUp)} label={labels.driveBackedUp} required options={yesNoNotSureOptions} />
          {v.driveBackedUp === "yes" && <CText meta={asStr(fields.driveCopyWho)} label={labels.driveCopyWho} required />}
        </SubSection>
      )}
      {v.services.includes("youtube") && (
        <SubSection title="YouTube">
          <CText meta={asStr(fields.youtubeUrl)} label={labels.youtubeUrl} type="url" inputMode="url" required hint={hints.youtubeUrl} />
          <CText meta={asStr(fields.youtubeManager)} label={labels.youtubeManager} required />
        </SubSection>
      )}
    </div>,

    // Step 4 — Google IAM (true add-to-list with confirm remove)
    <div key="s3" className="space-y-6">
      <CRadioGroup meta={asStr(fields.iamSetup)} label={labels.iamSetup} required options={yesNoNotSureOptions} />
      <CRadioGroup meta={asStr(fields.iamSupport)} label={labels.iamSupport} required options={supportSetupOptions} />
      {iamContactsRequired(v) && (
        <SubSection title={labels.iamContacts} description="Add between one and three people.">
          <div className="space-y-4">
            {iamContacts.map((item, i) => {
              const c = item.getFieldset();
              return (
                <div key={item.key} className="space-y-3 rounded border border-stone-300 bg-white p-4">
                  <div className="flex items-center justify-between">
                    <p className="font-[family-name:var(--font-conform-serif)] text-base font-semibold">
                      {iamContactOrdinals[i] ?? `#${i + 1}`} assigned manager
                    </p>
                    {iamContacts.length > 1 &&
                      (confirm?.type === "iam" && confirm.index === i ? null : (
                        <button
                          type="button"
                          aria-label={`Remove contact ${i + 1}`}
                          onClick={() => setConfirm({ type: "iam", index: i })}
                          className="inline-flex items-center gap-1 text-sm font-semibold text-red-700 underline"
                        >
                          <X className="size-4" /> Remove
                        </button>
                      ))}
                  </div>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <CText meta={asStr(c.name)} label={labels.contactName} required autoComplete="name" />
                    <CText meta={asStr(c.email)} label={labels.contactEmail} type="email" inputMode="email" required autoComplete="email" />
                    <CText meta={asStr(c.relationship)} label={labels.contactRelationship} required />
                    <CText meta={asStr(c.phone)} label={labels.contactPhone} type="tel" inputMode="tel" required autoComplete="tel" hint={hints.execPhone} />
                  </div>
                  {confirm?.type === "iam" && confirm.index === i && (
                    <ConfirmBar
                      onCancel={() => setConfirm(null)}
                      label="Remove this person?"
                      removeButton={
                        <button
                          type="button"
                          onClick={() => setConfirm(null)}
                          {...form.remove.getButtonProps({ name: fields.iamContacts.name as never, index: i })}
                          className="font-bold text-red-700 underline"
                        >
                          Yes, remove
                        </button>
                      }
                    />
                  )}
                </div>
              );
            })}
            {iamContacts.length < 3 && (
              <button
                type="button"
                {...form.insert.getButtonProps({ name: fields.iamContacts.name as never })}
                className="inline-flex items-center gap-1.5 rounded border border-stone-400 px-4 py-2 text-sm font-semibold text-stone-800 hover:bg-stone-100"
              >
                <Plus className="size-4" /> Add another person
              </button>
            )}
          </div>
        </SubSection>
      )}
      <CRadioGroup meta={asStr(fields.iamBypass)} label={labels.iamBypass} required options={yesNoNotSureOptions} />
    </div>,

    // Step 5 — Facebook (Meta manager as add-to-list)
    <div key="s4" className="space-y-6">
      <CRadioGroup meta={asStr(fields.fbHas)} label={labels.fbHas} required options={yesNoNotSureOptions} />
      {v.fbHas === "yes" && (
        <div className="space-y-6">
          <CText meta={asStr(fields.fbEmail)} label={labels.fbEmail} type="email" inputMode="email" required autoComplete="email" />
          <CText meta={asStr(fields.fbPhone)} label={labels.fbPhone} type="tel" inputMode="tel" required autoComplete="tel" hint={hints.execPhone} />
          <CRadioGroup meta={asStr(fields.fbLegacyContact)} label={labels.fbLegacyContact} required options={yesNoNotSureOptions} />
          <CRadioGroup meta={asStr(fields.fbMediaDownloaded)} label={labels.fbMediaDownloaded} required options={yesNoNotSureOptions} />
          {v.fbMediaDownloaded === "yes" && (
            <SubSection title="Facebook media backup">
              <CText meta={asStr(fields.fbBackupLocation)} label={labels.fbBackupLocation} required />
              <CText meta={asStr(fields.fbBackupWho)} label={labels.fbBackupWho} required />
            </SubSection>
          )}
          <CSelect meta={asStr(fields.fbAccountAction)} label={labels.fbAccountAction} required options={accountActionOptions} placeholder={labels.accountActionPlaceholder} />
          <CRadioGroup meta={asStr(fields.fbPrivateMessagesAccess)} label={labels.fbPrivateMessagesAccess} required options={yesNoOptions} />
          {v.fbPrivateMessagesAccess === "yes" && <CText meta={asStr(fields.fbPrivateMessagesWho)} label={labels.fbPrivateMessagesWho} required autoComplete="name" />}
          <CRadioGroup meta={asStr(fields.fbMediaAccess)} label={labels.fbMediaAccess} required options={yesNoOptions} />
          <CRadioGroup meta={asStr(fields.fbSupport)} label={labels.fbSupport} required hint={infoText.support} options={yesNoOptions} />

          {mounted && !showManager && !contactStarted(v.fbManager) ? (
            <button
              type="button"
              onClick={() => setShowManager(true)}
              className="inline-flex items-center gap-1.5 rounded border border-stone-400 px-4 py-2 text-sm font-semibold text-stone-800 hover:bg-stone-100"
            >
              <Plus className="size-4" /> Add a Meta account manager
            </button>
          ) : (
            <SubSection title={labels.fbManager} description="Optional — fill in one field and the rest become required.">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <CText meta={asStr(fbManager.name)} label={labels.contactName} autoComplete="name" />
                <CText meta={asStr(fbManager.email)} label={labels.contactEmail} type="email" inputMode="email" autoComplete="email" />
                <CText meta={asStr(fbManager.relationship)} label={labels.contactRelationship} />
                <CText meta={asStr(fbManager.phone)} label={labels.contactPhone} type="tel" inputMode="tel" autoComplete="tel" hint={hints.execPhone} />
              </div>
              {mounted &&
                (confirm?.type === "manager" ? (
                  <ConfirmBar
                    onCancel={() => setConfirm(null)}
                    label="Remove the Meta account manager and clear these details?"
                    removeButton={
                      <button
                        type="button"
                        onClick={() => {
                          setConfirm(null);
                          setShowManager(false);
                        }}
                        {...form.reset.getButtonProps({ name: fields.fbManager.name as never })}
                        className="font-bold text-red-700 underline"
                      >
                        Yes, remove
                      </button>
                    }
                  />
                ) : (
                  <button type="button" onClick={() => setConfirm({ type: "manager" })} className="text-sm font-semibold text-red-700 underline">
                    Remove manager
                  </button>
                ))}
            </SubSection>
          )}
        </div>
      )}
    </div>,

    // Step 6 — Instagram
    <div key="s5" className="space-y-6">
      <CRadioGroup meta={asStr(fields.igHas)} label={labels.igHas} required options={yesNoNotSureOptions} />
      {v.igHas === "yes" && (
        <div className="space-y-6">
          <CText meta={asStr(fields.igEmail)} label={labels.igEmail} type="email" inputMode="email" required autoComplete="email" />
          <CText meta={asStr(fields.igPhone)} label={labels.igPhone} type="tel" inputMode="tel" required autoComplete="tel" hint={hints.execPhone} />
          <CRadioGroup meta={asStr(fields.igPlans)} label={labels.igPlans} required options={yesNoNotSureOptions} />
          <CRadioGroup meta={asStr(fields.igMediaDownloaded)} label={labels.igMediaDownloaded} required options={yesNoNotSureOptions} />
          <CSelect meta={asStr(fields.igAccountAction)} label={labels.igAccountAction} required options={accountActionOptions} placeholder={labels.accountActionPlaceholder} />
          <CRadioGroup meta={asStr(fields.igFullAccess)} label={labels.igFullAccess} required options={yesNoOptions} />
          {v.igFullAccess === "yes" && <CText meta={asStr(fields.igFullAccessWho)} label={labels.igFullAccessWho} required autoComplete="name" />}
          <CRadioGroup meta={asStr(fields.igSupport)} label={labels.igSupport} required hint={infoText.support} options={yesNoOptions} />
        </div>
      )}
    </div>,
  ];

  const reviewSections = buildReviewSections(v);

  const showReview = !mounted || view === "review";

  return (
    <div className="mx-auto w-full max-w-2xl px-5 py-10 sm:py-16">
      {/* top bar */}
      <div className="mb-8 flex items-center justify-between text-sm">
        <Link href="/" className="inline-flex items-center gap-1 font-medium text-sky-800 hover:underline">
          <ChevronLeft className="size-4" /> All variants
        </Link>
        <div className="flex items-center gap-3">
          <span className="rounded bg-stone-200 px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-stone-700">
            {meta.design}
          </span>
          <button type="button" onClick={() => setAboutOpen(true)} className="inline-flex items-center gap-1 font-medium text-sky-800 hover:underline">
            <Info className="size-4" /> About
          </button>
        </div>
      </div>

      {aboutOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-stone-900/30" onClick={() => setAboutOpen(false)}>
          <div role="dialog" aria-label="About this variant" className="h-full w-full max-w-sm overflow-y-auto bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-sky-800">{meta.design}</p>
                <h2 className="font-[family-name:var(--font-conform-serif)] text-lg font-semibold">{meta.name}</h2>
              </div>
              <button type="button" onClick={() => setAboutOpen(false)} aria-label="Close" className="rounded p-1 text-stone-400 hover:bg-stone-100">
                <X className="size-5" />
              </button>
            </div>
            <p className="mt-3 text-sm text-stone-600">{meta.designTagline}</p>
            <h3 className="mt-6 text-xs font-bold uppercase tracking-wide text-stone-400">Design &amp; build notes</h3>
            <ul className="mt-2 space-y-2">
              {meta.designNotes.map((n, i) => (
                <li key={i} className="text-[13px] leading-relaxed text-stone-600">{n}</li>
              ))}
            </ul>
            <h3 className="mt-6 text-xs font-bold uppercase tracking-wide text-stone-400">Form library</h3>
            <p className="mt-1 font-mono text-xs text-stone-500">{meta.library}</p>
            <ul className="mt-2 space-y-2">
              {meta.stateNotes.map((n, i) => (
                <li key={i} className="text-[13px] leading-relaxed text-stone-600">{n}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <form
        id={form.id}
        ref={formRef}
        action={formAction}
        onSubmit={handleSubmit}
        onInput={refreshSnapshot}
        onChange={refreshSnapshot}
        noValidate
      >
        {/* HUB */}
        {mounted && view === "hub" && (
          <div className="space-y-8">
            <header className="space-y-3">
              <h1 className="font-[family-name:var(--font-conform-serif)] text-3xl font-semibold tracking-tight sm:text-4xl">
                {APP_TITLE}
              </h1>
              <p className="max-w-prose text-stone-600">{APP_SUBTITLE}</p>
            </header>

            <ol className="divide-y divide-stone-200 border-y border-stone-200">
              {STEPS.slice(0, REVIEW_STEP).map((s, i) => (
                <li key={s.id}>
                  <button
                    type="button"
                    onClick={() => {
                      setView(i);
                      window.scrollTo({ top: 0 });
                    }}
                    className="flex w-full items-center justify-between gap-4 py-4 text-left hover:bg-stone-100"
                  >
                    <span className="font-[family-name:var(--font-conform-serif)] text-lg text-sky-900 underline-offset-2 group-hover:underline">
                      {i + 1}. {s.title}
                    </span>
                    <Tag status={sectionStatus(i)} />
                  </button>
                </li>
              ))}
              <li>
                <button
                  type="button"
                  onClick={() => {
                    setView("review");
                    window.scrollTo({ top: 0 });
                  }}
                  className="flex w-full items-center justify-between gap-4 py-4 text-left hover:bg-stone-100"
                >
                  <span className="font-[family-name:var(--font-conform-serif)] text-lg text-sky-900">
                    {REVIEW_STEP + 1}. Review and submit
                  </span>
                  <ChevronRight className="size-5 text-stone-400" />
                </button>
              </li>
            </ol>

            <div className="flex items-center justify-between text-sm text-stone-500">
              <span className="inline-flex items-center gap-1.5">
                <Info className="size-4" /> {PRIVACY_NOTE}
              </span>
              <button type="button" onClick={onClearDraft} className="font-semibold text-stone-600 underline">
                Clear draft
              </button>
            </div>
          </div>
        )}

        {/* SECTIONS (always in the DOM so values submit even with JS disabled) */}
        <div className={mounted && view === "hub" ? "hidden" : "space-y-10"}>
          {sectionNodes.map((node, i) => (
            <section
              key={i}
              ref={(el) => {
                sectionRefs.current[i] = el;
              }}
              hidden={mounted && view !== i}
              aria-hidden={mounted && view !== i}
              className="space-y-6"
            >
              {mounted && (
                <button type="button" onClick={goToHub} className="inline-flex items-center gap-1 text-sm font-medium text-sky-800 hover:underline">
                  <ChevronLeft className="size-4" /> Back to task list
                </button>
              )}
              <h2 className="font-[family-name:var(--font-conform-serif)] text-2xl font-semibold tracking-tight">{STEPS[i].title}</h2>
              {node}
              {mounted && (
                <div className="flex flex-wrap items-center gap-4 border-t border-stone-200 pt-5">
                  <button
                    type="button"
                    onClick={() => saveAndContinue(i)}
                    className="rounded bg-sky-800 px-5 py-2.5 text-sm font-bold text-white hover:bg-sky-900"
                  >
                    Save and continue
                  </button>
                  <button type="button" onClick={goToHub} className="text-sm font-semibold text-stone-600 underline">
                    Save and exit
                  </button>
                </div>
              )}
            </section>
          ))}

          {/* REVIEW */}
          <section
            ref={(el) => {
              sectionRefs.current[REVIEW_STEP] = el;
            }}
            hidden={!showReview}
            aria-hidden={!showReview}
            className="space-y-6"
          >
            {mounted && (
              <button type="button" onClick={goToHub} className="inline-flex items-center gap-1 text-sm font-medium text-sky-800 hover:underline">
                <ChevronLeft className="size-4" /> Back to task list
              </button>
            )}
            <h2 className="font-[family-name:var(--font-conform-serif)] text-2xl font-semibold tracking-tight">Review and submit</h2>

            <div className="space-y-5">
              {reviewSections.map((section) => (
                <div key={section.step} className="border-t border-stone-200 pt-4">
                  <div className="mb-2 flex items-center justify-between">
                    <h3 className="font-[family-name:var(--font-conform-serif)] text-lg font-semibold">{section.title}</h3>
                    {mounted && (
                      <button type="button" onClick={() => setView(section.step)} className="text-sm font-semibold text-sky-800 underline">
                        Change
                      </button>
                    )}
                  </div>
                  <dl className="divide-y divide-stone-100">
                    {section.rows.map((row, i) => (
                      <div key={i} className="grid grid-cols-1 gap-0.5 py-2 sm:grid-cols-[13rem_1fr] sm:gap-4">
                        <dt className="text-sm text-stone-500">{row.label}</dt>
                        <dd className="break-words text-sm text-stone-900">{row.value || <span className="text-stone-400">—</span>}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              ))}
            </div>

            <div className="border-t border-stone-200 pt-5">
              <CCheckbox meta={asBool(fields.consent)} label={labels.consent} required />
            </div>

            <button
              type="submit"
              disabled={isPending}
              aria-busy={isPending}
              className="inline-flex items-center gap-2 rounded bg-sky-800 px-6 py-3 text-sm font-bold text-white hover:bg-sky-900 disabled:opacity-60"
            >
              {isPending && <Loader2 className="size-4 animate-spin" aria-hidden />}
              {isPending ? "Submitting…" : "Accept and submit"}
            </button>
          </section>
        </div>

        {/* Draft status (mounted only) */}
        {mounted && view !== "hub" && (
          <p className="mt-6 text-xs text-stone-400" aria-live="polite">
            {draftStatus === "saving" ? "Saving…" : draftStatus === "saved" ? "Draft saved" : ""}
          </p>
        )}
      </form>
    </div>
  );
}
