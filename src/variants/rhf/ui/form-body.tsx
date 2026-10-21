"use client";

import * as React from "react";
import { Plus, X } from "lucide-react";
import { RhfText, RhfTextarea, RhfRadio, RhfSelect, RhfCheckboxGroup, RhfCheckbox } from "./fields";
import { RhfReview } from "./review";
import { labels, hints, infoText } from "@/shared/copy";
import {
  serviceOptions,
  yesNoOptions,
  yesNoNotSureOptions,
  supportSetupOptions,
  accountActionOptions,
  iamContactOrdinals,
} from "@/shared/options";
import {
  iamContactsRequired,
  secondExecutorStarted,
  type AccountAction,
  type ServiceId,
  type SupportSetup,
  type YesNo,
  type YesNoNotSure,
} from "@/shared/schema";
import type { FormApi } from "@/shared/form-api";

function SubSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-5 rounded-xl border border-slate-200 bg-slate-50/70 p-5">
      <div className="space-y-0.5 text-left">
        <h3 className="text-sm font-bold text-slate-800">{title}</h3>
        {description && <p className="text-[13px] text-slate-500">{description}</p>}
      </div>
      {children}
    </section>
  );
}

interface SubField {
  key: string;
  label: string;
  type?: React.HTMLInputTypeAttribute;
  autoComplete?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  hint?: string;
}

const executorFields: SubField[] = [
  { key: "fullName", label: labels.execFullName, autoComplete: "name" },
  { key: "email", label: labels.execEmail, type: "email", autoComplete: "email", inputMode: "email" },
  { key: "phone", label: labels.execPhone, type: "tel", autoComplete: "tel", inputMode: "tel", hint: hints.execPhone },
  { key: "relationship", label: labels.execRelationship, autoComplete: "off" },
];

const contactFields: SubField[] = [
  { key: "name", label: labels.contactName, autoComplete: "name" },
  { key: "email", label: labels.contactEmail, type: "email", autoComplete: "email", inputMode: "email" },
  { key: "relationship", label: labels.contactRelationship, autoComplete: "off" },
  { key: "phone", label: labels.contactPhone, type: "tel", autoComplete: "tel", inputMode: "tel", hint: hints.execPhone },
];

function ContactGrid({
  api,
  prefix,
  fields,
  required,
}: {
  api: FormApi;
  prefix: string;
  fields: SubField[];
  required?: boolean;
}) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {fields.map((f) => {
        const b = api.text(`${prefix}.${f.key}`);
        return (
          <RhfText
            key={f.key}
            id={`${prefix}.${f.key}`}
            label={f.label}
            hint={f.hint}
            type={f.type}
            autoComplete={f.autoComplete}
            inputMode={f.inputMode}
            required={required}
            value={b.value}
            error={b.error}
            onChange={b.onChange}
            onBlur={b.onBlur}
          />
        );
      })}
    </div>
  );
}

export function RhfFormBody({
  step,
  api,
  onEditSection,
}: {
  step: number;
  api: FormApi;
  onEditSection: (step: number) => void;
}) {
  const v = api.values;

  switch (step) {
    case 0:
      return (
        <div className="space-y-6">
          <RhfText id="fullName" label={labels.fullName} required autoComplete="name" {...api.text("fullName")} />
          <RhfText
            id="previousSurname"
            label={labels.previousSurname}
            hint={hints.previousSurname}
            autoComplete="family-name"
            {...api.text("previousSurname")}
          />
          <RhfText id="dob" label={labels.dob} type="date" required hint={hints.dob} autoComplete="bday" {...api.text("dob")} />
          <RhfRadio<YesNo> id="isOver18" label={labels.isOver18} required options={yesNoOptions} {...api.choice<YesNo>("isOver18")} />
          {v.isOver18 === "no" && (
            <SubSection title="Legal guardian">
              <RhfText id="guardianPrimary" label={labels.guardianPrimary} required autoComplete="name" {...api.text("guardianPrimary")} />
              <RhfText id="guardianSecond" label={labels.guardianSecond} autoComplete="name" {...api.text("guardianSecond")} />
            </SubSection>
          )}
        </div>
      );

    case 1:
      return (
        <div className="space-y-6">
          <SubSection title={labels.execPrimary}>
            <ContactGrid api={api} prefix="execPrimary" fields={executorFields} required />
          </SubSection>
          <SubSection title={labels.execSecond} description="Optional — but if you fill in one field, all become required.">
            <ContactGrid api={api} prefix="execSecond" fields={executorFields} />
            {secondExecutorStarted(v.execSecond) && (
              <div className="space-y-6 pt-1">
                <RhfRadio<YesNo>
                  id="execSecondEqualAccess"
                  label={labels.execSecondEqualAccess}
                  required
                  options={yesNoOptions}
                  {...api.choice<YesNo>("execSecondEqualAccess")}
                />
                {v.execSecondEqualAccess === "no" && (
                  <RhfTextarea id="execSecondAccessExplain" label={labels.execSecondAccessExplain} required {...api.text("execSecondAccessExplain")} />
                )}
              </div>
            )}
          </SubSection>
        </div>
      );

    case 2:
      return (
        <div className="space-y-6">
          <RhfCheckboxGroup<ServiceId> id="services" label={labels.services} required options={serviceOptions} {...api.multi("services")} />
          {v.services.includes("other") && (
            <RhfText id="servicesOther" label={labels.servicesOther} required {...api.text("servicesOther")} />
          )}
          {v.services.includes("googlePhotos") && (
            <SubSection title="Google Photos">
              <RhfRadio<YesNoNotSure> id="photosBackedUp" label={labels.photosBackedUp} required options={yesNoNotSureOptions} {...api.choice<YesNoNotSure>("photosBackedUp")} />
              {v.photosBackedUp === "yes" && <RhfText id="photosCopyWho" label={labels.photosCopyWho} required {...api.text("photosCopyWho")} />}
            </SubSection>
          )}
          {v.services.includes("drive") && (
            <SubSection title="Drive">
              <RhfRadio<YesNoNotSure> id="driveBackedUp" label={labels.driveBackedUp} required options={yesNoNotSureOptions} {...api.choice<YesNoNotSure>("driveBackedUp")} />
              {v.driveBackedUp === "yes" && <RhfText id="driveCopyWho" label={labels.driveCopyWho} required {...api.text("driveCopyWho")} />}
            </SubSection>
          )}
          {v.services.includes("youtube") && (
            <SubSection title="YouTube">
              <RhfText id="youtubeUrl" label={labels.youtubeUrl} type="url" required hint={hints.youtubeUrl} inputMode="url" {...api.text("youtubeUrl")} />
              <RhfText id="youtubeManager" label={labels.youtubeManager} required {...api.text("youtubeManager")} />
            </SubSection>
          )}
        </div>
      );

    case 3:
      return (
        <div className="space-y-6">
          <RhfRadio<YesNoNotSure> id="iamSetup" label={labels.iamSetup} required options={yesNoNotSureOptions} {...api.choice<YesNoNotSure>("iamSetup")} />
          <RhfRadio<SupportSetup> id="iamSupport" label={labels.iamSupport} required options={supportSetupOptions} {...api.choice<SupportSetup>("iamSupport")} />
          {iamContactsRequired(v) && (
            <SubSection title={labels.iamContacts} description="Add between one and three people.">
              <div className="space-y-4">
                {api.contacts.items.map((_, i) => (
                  <div key={i} className="space-y-3 rounded-lg border border-slate-200 bg-white p-4">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-slate-700">
                        {iamContactOrdinals[i] ?? `#${i + 1}`} assigned manager
                      </p>
                      {api.contacts.items.length > 1 && (
                        <button
                          type="button"
                          aria-label={`Remove contact ${i + 1}`}
                          onClick={() => api.contacts.remove(i)}
                          className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                        >
                          <X className="size-4" />
                        </button>
                      )}
                    </div>
                    <ContactGrid api={api} prefix={`iamContacts.${i}`} fields={contactFields} required />
                  </div>
                ))}
                {api.contacts.items.length < 3 && (
                  <button
                    type="button"
                    onClick={api.contacts.add}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-blue-200 bg-white px-3.5 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-50"
                  >
                    <Plus className="size-4" /> Add another contact
                  </button>
                )}
              </div>
            </SubSection>
          )}
          <RhfRadio<YesNoNotSure> id="iamBypass" label={labels.iamBypass} required options={yesNoNotSureOptions} {...api.choice<YesNoNotSure>("iamBypass")} />
        </div>
      );

    case 4:
      return (
        <div className="space-y-6">
          <RhfRadio<YesNoNotSure> id="fbHas" label={labels.fbHas} required options={yesNoNotSureOptions} {...api.choice<YesNoNotSure>("fbHas")} />
          {v.fbHas === "yes" && (
            <div className="space-y-6">
              <RhfText id="fbEmail" label={labels.fbEmail} type="email" inputMode="email" required autoComplete="email" {...api.text("fbEmail")} />
              <RhfText id="fbPhone" label={labels.fbPhone} type="tel" inputMode="tel" required autoComplete="tel" hint={hints.execPhone} {...api.text("fbPhone")} />
              <RhfRadio<YesNoNotSure> id="fbLegacyContact" label={labels.fbLegacyContact} required options={yesNoNotSureOptions} {...api.choice<YesNoNotSure>("fbLegacyContact")} />
              <RhfRadio<YesNoNotSure> id="fbMediaDownloaded" label={labels.fbMediaDownloaded} required options={yesNoNotSureOptions} {...api.choice<YesNoNotSure>("fbMediaDownloaded")} />
              {v.fbMediaDownloaded === "yes" && (
                <SubSection title="Facebook media backup">
                  <RhfText id="fbBackupLocation" label={labels.fbBackupLocation} required {...api.text("fbBackupLocation")} />
                  <RhfText id="fbBackupWho" label={labels.fbBackupWho} required {...api.text("fbBackupWho")} />
                </SubSection>
              )}
              <RhfSelect<AccountAction> id="fbAccountAction" label={labels.fbAccountAction} required options={accountActionOptions} placeholder={labels.accountActionPlaceholder} {...api.choice<AccountAction>("fbAccountAction")} />
              <RhfRadio<YesNo> id="fbPrivateMessagesAccess" label={labels.fbPrivateMessagesAccess} required options={yesNoOptions} {...api.choice<YesNo>("fbPrivateMessagesAccess")} />
              {v.fbPrivateMessagesAccess === "yes" && (
                <RhfText id="fbPrivateMessagesWho" label={labels.fbPrivateMessagesWho} required autoComplete="name" {...api.text("fbPrivateMessagesWho")} />
              )}
              <RhfRadio<YesNo> id="fbMediaAccess" label={labels.fbMediaAccess} required options={yesNoOptions} {...api.choice<YesNo>("fbMediaAccess")} />
              <RhfRadio<YesNo> id="fbSupport" label={labels.fbSupport} required hint={infoText.support} options={yesNoOptions} {...api.choice<YesNo>("fbSupport")} />
              <SubSection title={labels.fbManager} description="Optional — fill in one field and the rest become required.">
                <ContactGrid api={api} prefix="fbManager" fields={contactFields} />
              </SubSection>
            </div>
          )}
        </div>
      );

    case 5:
      return (
        <div className="space-y-6">
          <RhfRadio<YesNoNotSure> id="igHas" label={labels.igHas} required options={yesNoNotSureOptions} {...api.choice<YesNoNotSure>("igHas")} />
          {v.igHas === "yes" && (
            <div className="space-y-6">
              <RhfText id="igEmail" label={labels.igEmail} type="email" inputMode="email" required autoComplete="email" {...api.text("igEmail")} />
              <RhfText id="igPhone" label={labels.igPhone} type="tel" inputMode="tel" required autoComplete="tel" hint={hints.execPhone} {...api.text("igPhone")} />
              <RhfRadio<YesNoNotSure> id="igPlans" label={labels.igPlans} required options={yesNoNotSureOptions} {...api.choice<YesNoNotSure>("igPlans")} />
              <RhfRadio<YesNoNotSure> id="igMediaDownloaded" label={labels.igMediaDownloaded} required options={yesNoNotSureOptions} {...api.choice<YesNoNotSure>("igMediaDownloaded")} />
              <RhfSelect<AccountAction> id="igAccountAction" label={labels.igAccountAction} required options={accountActionOptions} placeholder={labels.accountActionPlaceholder} {...api.choice<AccountAction>("igAccountAction")} />
              <RhfRadio<YesNo> id="igFullAccess" label={labels.igFullAccess} required options={yesNoOptions} {...api.choice<YesNo>("igFullAccess")} />
              {v.igFullAccess === "yes" && <RhfText id="igFullAccessWho" label={labels.igFullAccessWho} required autoComplete="name" {...api.text("igFullAccessWho")} />}
              <RhfRadio<YesNo> id="igSupport" label={labels.igSupport} required hint={infoText.support} options={yesNoOptions} {...api.choice<YesNo>("igSupport")} />
            </div>
          )}
        </div>
      );

    case 6:
      return (
        <div className="space-y-6">
          <RhfReview values={v} onEdit={onEditSection} />
          <RhfCheckbox id="consent" label={labels.consent} required {...api.bool("consent")} />
        </div>
      );

    default:
      return null;
  }
}
