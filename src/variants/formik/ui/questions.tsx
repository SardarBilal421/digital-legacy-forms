"use client";

import * as React from "react";
import { Plus, X } from "lucide-react";
import { FkText, FkTextarea, FkChoice, FkMulti, FkSubInput } from "./fields";
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

export interface Question {
  id: string;
  title: string;
  subtitle?: string;
  paths: string[];
  /** Render the control. `next` advances the flow (used by auto-advancing choices). */
  render: (api: FormApi, next: () => void) => React.ReactNode;
}

interface SubField {
  key: string;
  label: string;
  type?: React.HTMLInputTypeAttribute;
  autoComplete?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
}

const executorFields: SubField[] = [
  { key: "fullName", label: labels.execFullName, autoComplete: "name" },
  { key: "email", label: labels.execEmail, type: "email", autoComplete: "email", inputMode: "email" },
  { key: "phone", label: labels.execPhone, type: "tel", autoComplete: "tel", inputMode: "tel" },
  { key: "relationship", label: labels.execRelationship, autoComplete: "off" },
];
const contactFields: SubField[] = [
  { key: "name", label: labels.contactName, autoComplete: "name" },
  { key: "email", label: labels.contactEmail, type: "email", autoComplete: "email", inputMode: "email" },
  { key: "relationship", label: labels.contactRelationship, autoComplete: "off" },
  { key: "phone", label: labels.contactPhone, type: "tel", autoComplete: "tel", inputMode: "tel" },
];

function Group({
  api,
  prefix,
  fields,
  next,
}: {
  api: FormApi;
  prefix: string;
  fields: SubField[];
  next: () => void;
}) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {fields.map((f) => {
        const b = api.text(`${prefix}.${f.key}`);
        return (
          <FkSubInput
            key={f.key}
            id={`${prefix}.${f.key}`}
            label={f.label}
            type={f.type}
            autoComplete={f.autoComplete}
            inputMode={f.inputMode}
            value={b.value}
            error={b.error}
            onChange={b.onChange}
            onBlur={b.onBlur}
            onEnter={next}
          />
        );
      })}
    </div>
  );
}

export function buildQuestions(api: FormApi): Question[] {
  const v = api.values;
  const q: Question[] = [];

  // Step 1
  q.push({
    id: "fullName",
    title: labels.fullName,
    paths: ["fullName"],
    render: (a, next) => <FkText id="fullName" autoComplete="name" onEnter={next} {...a.text("fullName")} />,
  });
  q.push({
    id: "previousSurname",
    title: labels.previousSurname,
    subtitle: hints.previousSurname,
    paths: ["previousSurname"],
    render: (a, next) => <FkText id="previousSurname" autoComplete="family-name" onEnter={next} {...a.text("previousSurname")} />,
  });
  q.push({
    id: "dob",
    title: labels.dob,
    subtitle: hints.dob,
    paths: ["dob"],
    render: (a, next) => <FkText id="dob" type="date" autoComplete="bday" onEnter={next} {...a.text("dob")} />,
  });
  q.push({
    id: "isOver18",
    title: labels.isOver18,
    paths: ["isOver18"],
    render: (a, next) => <FkChoice<YesNo> id="isOver18" options={yesNoOptions} onPick={next} {...a.choice<YesNo>("isOver18")} />,
  });
  if (v.isOver18 === "no") {
    q.push({
      id: "guardianPrimary",
      title: labels.guardianPrimary,
      paths: ["guardianPrimary"],
      render: (a, next) => <FkText id="guardianPrimary" autoComplete="name" onEnter={next} {...a.text("guardianPrimary")} />,
    });
    q.push({
      id: "guardianSecond",
      title: labels.guardianSecond,
      paths: ["guardianSecond"],
      render: (a, next) => <FkText id="guardianSecond" autoComplete="name" onEnter={next} {...a.text("guardianSecond")} />,
    });
  }

  // Step 2
  q.push({
    id: "execPrimary",
    title: labels.execPrimary,
    subtitle: infoText.executors,
    paths: ["execPrimary"],
    render: (a, next) => <Group api={a} prefix="execPrimary" fields={executorFields} next={next} />,
  });
  q.push({
    id: "execSecond",
    title: labels.execSecond,
    subtitle: "Optional — leave blank to skip, or fill in one field and the rest become required.",
    paths: ["execSecond"],
    render: (a, next) => <Group api={a} prefix="execSecond" fields={executorFields} next={next} />,
  });
  if (secondExecutorStarted(v.execSecond)) {
    q.push({
      id: "execSecondEqualAccess",
      title: labels.execSecondEqualAccess,
      paths: ["execSecondEqualAccess"],
      render: (a, next) => <FkChoice<YesNo> id="execSecondEqualAccess" options={yesNoOptions} onPick={next} {...a.choice<YesNo>("execSecondEqualAccess")} />,
    });
    if (v.execSecondEqualAccess === "no") {
      q.push({
        id: "execSecondAccessExplain",
        title: labels.execSecondAccessExplain,
        paths: ["execSecondAccessExplain"],
        render: (a, next) => <FkTextarea id="execSecondAccessExplain" onEnter={next} {...a.text("execSecondAccessExplain")} />,
      });
    }
  }

  // Step 3
  q.push({
    id: "services",
    title: labels.services,
    subtitle: "Pick all that apply.",
    paths: ["services"],
    render: (a) => <FkMulti<ServiceId> id="services" options={serviceOptions} {...a.multi("services")} />,
  });
  if (v.services.includes("other")) {
    q.push({
      id: "servicesOther",
      title: labels.servicesOther,
      paths: ["servicesOther"],
      render: (a, next) => <FkText id="servicesOther" onEnter={next} {...a.text("servicesOther")} />,
    });
  }
  if (v.services.includes("googlePhotos")) {
    q.push({
      id: "photosBackedUp",
      title: labels.photosBackedUp,
      paths: ["photosBackedUp"],
      render: (a, next) => <FkChoice<YesNoNotSure> id="photosBackedUp" options={yesNoNotSureOptions} onPick={next} {...a.choice<YesNoNotSure>("photosBackedUp")} />,
    });
    if (v.photosBackedUp === "yes") {
      q.push({
        id: "photosCopyWho",
        title: labels.photosCopyWho,
        paths: ["photosCopyWho"],
        render: (a, next) => <FkText id="photosCopyWho" onEnter={next} {...a.text("photosCopyWho")} />,
      });
    }
  }
  if (v.services.includes("drive")) {
    q.push({
      id: "driveBackedUp",
      title: labels.driveBackedUp,
      paths: ["driveBackedUp"],
      render: (a, next) => <FkChoice<YesNoNotSure> id="driveBackedUp" options={yesNoNotSureOptions} onPick={next} {...a.choice<YesNoNotSure>("driveBackedUp")} />,
    });
    if (v.driveBackedUp === "yes") {
      q.push({
        id: "driveCopyWho",
        title: labels.driveCopyWho,
        paths: ["driveCopyWho"],
        render: (a, next) => <FkText id="driveCopyWho" onEnter={next} {...a.text("driveCopyWho")} />,
      });
    }
  }
  if (v.services.includes("youtube")) {
    q.push({
      id: "youtubeUrl",
      title: labels.youtubeUrl,
      subtitle: hints.youtubeUrl,
      paths: ["youtubeUrl"],
      render: (a, next) => <FkText id="youtubeUrl" type="url" inputMode="url" onEnter={next} {...a.text("youtubeUrl")} />,
    });
    q.push({
      id: "youtubeManager",
      title: labels.youtubeManager,
      paths: ["youtubeManager"],
      render: (a, next) => <FkText id="youtubeManager" onEnter={next} {...a.text("youtubeManager")} />,
    });
  }

  // Step 4
  q.push({
    id: "iamSetup",
    title: labels.iamSetup,
    paths: ["iamSetup"],
    render: (a, next) => <FkChoice<YesNoNotSure> id="iamSetup" options={yesNoNotSureOptions} onPick={next} {...a.choice<YesNoNotSure>("iamSetup")} />,
  });
  q.push({
    id: "iamSupport",
    title: labels.iamSupport,
    paths: ["iamSupport"],
    render: (a, next) => <FkChoice<SupportSetup> id="iamSupport" options={supportSetupOptions} onPick={next} {...a.choice<SupportSetup>("iamSupport")} />,
  });
  if (iamContactsRequired(v)) {
    q.push({
      id: "iamContacts",
      title: labels.iamContacts,
      subtitle: "Add between one and three people.",
      paths: ["iamContacts"],
      render: (a, next) => (
        <div className="space-y-5 text-left">
          {a.contacts.items.map((_, i) => (
            <div key={i} className="rounded-2xl border-2 border-rose-200 bg-white/70 p-4">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm font-bold text-rose-900">{iamContactOrdinals[i] ?? `#${i + 1}`} manager</p>
                {a.contacts.items.length > 1 && (
                  <button type="button" aria-label={`Remove contact ${i + 1}`} onClick={() => a.contacts.remove(i)} className="rounded-md p-1 text-rose-400 hover:bg-rose-100 hover:text-rose-700">
                    <X className="size-4" />
                  </button>
                )}
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {contactFields.map((f) => {
                  const b = a.text(`iamContacts.${i}.${f.key}`);
                  return (
                    <FkSubInput
                      key={f.key}
                      id={`iamContacts.${i}.${f.key}`}
                      label={f.label}
                      type={"type" in f ? f.type : undefined}
                      autoComplete={f.autoComplete}
                      inputMode={"inputMode" in f ? f.inputMode : undefined}
                      value={b.value}
                      error={b.error}
                      onChange={b.onChange}
                      onBlur={b.onBlur}
                      onEnter={next}
                    />
                  );
                })}
              </div>
            </div>
          ))}
          {a.contacts.items.length < 3 && (
            <button type="button" onClick={a.contacts.add} className="inline-flex items-center gap-1.5 rounded-full border-2 border-rose-300 bg-white px-4 py-2 text-sm font-bold text-rose-600 hover:bg-rose-50">
              <Plus className="size-4" /> Add another
            </button>
          )}
        </div>
      ),
    });
  }
  q.push({
    id: "iamBypass",
    title: labels.iamBypass,
    paths: ["iamBypass"],
    render: (a, next) => <FkChoice<YesNoNotSure> id="iamBypass" options={yesNoNotSureOptions} onPick={next} {...a.choice<YesNoNotSure>("iamBypass")} />,
  });

  // Step 5 — Facebook
  q.push({
    id: "fbHas",
    title: labels.fbHas,
    paths: ["fbHas"],
    render: (a, next) => <FkChoice<YesNoNotSure> id="fbHas" options={yesNoNotSureOptions} onPick={next} {...a.choice<YesNoNotSure>("fbHas")} />,
  });
  if (v.fbHas === "yes") {
    q.push({ id: "fbEmail", title: labels.fbEmail, paths: ["fbEmail"], render: (a, next) => <FkText id="fbEmail" type="email" inputMode="email" autoComplete="email" onEnter={next} {...a.text("fbEmail")} /> });
    q.push({ id: "fbPhone", title: labels.fbPhone, subtitle: hints.execPhone, paths: ["fbPhone"], render: (a, next) => <FkText id="fbPhone" type="tel" inputMode="tel" autoComplete="tel" onEnter={next} {...a.text("fbPhone")} /> });
    q.push({ id: "fbLegacyContact", title: labels.fbLegacyContact, paths: ["fbLegacyContact"], render: (a, next) => <FkChoice<YesNoNotSure> id="fbLegacyContact" options={yesNoNotSureOptions} onPick={next} {...a.choice<YesNoNotSure>("fbLegacyContact")} /> });
    q.push({ id: "fbMediaDownloaded", title: labels.fbMediaDownloaded, paths: ["fbMediaDownloaded"], render: (a, next) => <FkChoice<YesNoNotSure> id="fbMediaDownloaded" options={yesNoNotSureOptions} onPick={next} {...a.choice<YesNoNotSure>("fbMediaDownloaded")} /> });
    if (v.fbMediaDownloaded === "yes") {
      q.push({ id: "fbBackupLocation", title: labels.fbBackupLocation, paths: ["fbBackupLocation"], render: (a, next) => <FkText id="fbBackupLocation" onEnter={next} {...a.text("fbBackupLocation")} /> });
      q.push({ id: "fbBackupWho", title: labels.fbBackupWho, paths: ["fbBackupWho"], render: (a, next) => <FkText id="fbBackupWho" onEnter={next} {...a.text("fbBackupWho")} /> });
    }
    q.push({ id: "fbAccountAction", title: labels.fbAccountAction, paths: ["fbAccountAction"], render: (a, next) => <FkChoice<AccountAction> id="fbAccountAction" options={accountActionOptions} onPick={next} {...a.choice<AccountAction>("fbAccountAction")} /> });
    q.push({ id: "fbPrivateMessagesAccess", title: labels.fbPrivateMessagesAccess, paths: ["fbPrivateMessagesAccess"], render: (a, next) => <FkChoice<YesNo> id="fbPrivateMessagesAccess" options={yesNoOptions} onPick={next} {...a.choice<YesNo>("fbPrivateMessagesAccess")} /> });
    if (v.fbPrivateMessagesAccess === "yes") {
      q.push({ id: "fbPrivateMessagesWho", title: labels.fbPrivateMessagesWho, paths: ["fbPrivateMessagesWho"], render: (a, next) => <FkText id="fbPrivateMessagesWho" autoComplete="name" onEnter={next} {...a.text("fbPrivateMessagesWho")} /> });
    }
    q.push({ id: "fbMediaAccess", title: labels.fbMediaAccess, paths: ["fbMediaAccess"], render: (a, next) => <FkChoice<YesNo> id="fbMediaAccess" options={yesNoOptions} onPick={next} {...a.choice<YesNo>("fbMediaAccess")} /> });
    q.push({ id: "fbSupport", title: labels.fbSupport, subtitle: infoText.support, paths: ["fbSupport"], render: (a, next) => <FkChoice<YesNo> id="fbSupport" options={yesNoOptions} onPick={next} {...a.choice<YesNo>("fbSupport")} /> });
    q.push({
      id: "fbManager",
      title: labels.fbManager,
      subtitle: "Optional — fill in one field and the rest become required.",
      paths: ["fbManager"],
      render: (a, next) => <Group api={a} prefix="fbManager" fields={contactFields} next={next} />,
    });
  }

  // Step 6 — Instagram
  q.push({
    id: "igHas",
    title: labels.igHas,
    paths: ["igHas"],
    render: (a, next) => <FkChoice<YesNoNotSure> id="igHas" options={yesNoNotSureOptions} onPick={next} {...a.choice<YesNoNotSure>("igHas")} />,
  });
  if (v.igHas === "yes") {
    q.push({ id: "igEmail", title: labels.igEmail, paths: ["igEmail"], render: (a, next) => <FkText id="igEmail" type="email" inputMode="email" autoComplete="email" onEnter={next} {...a.text("igEmail")} /> });
    q.push({ id: "igPhone", title: labels.igPhone, subtitle: hints.execPhone, paths: ["igPhone"], render: (a, next) => <FkText id="igPhone" type="tel" inputMode="tel" autoComplete="tel" onEnter={next} {...a.text("igPhone")} /> });
    q.push({ id: "igPlans", title: labels.igPlans, paths: ["igPlans"], render: (a, next) => <FkChoice<YesNoNotSure> id="igPlans" options={yesNoNotSureOptions} onPick={next} {...a.choice<YesNoNotSure>("igPlans")} /> });
    q.push({ id: "igMediaDownloaded", title: labels.igMediaDownloaded, paths: ["igMediaDownloaded"], render: (a, next) => <FkChoice<YesNoNotSure> id="igMediaDownloaded" options={yesNoNotSureOptions} onPick={next} {...a.choice<YesNoNotSure>("igMediaDownloaded")} /> });
    q.push({ id: "igAccountAction", title: labels.igAccountAction, paths: ["igAccountAction"], render: (a, next) => <FkChoice<AccountAction> id="igAccountAction" options={accountActionOptions} onPick={next} {...a.choice<AccountAction>("igAccountAction")} /> });
    q.push({ id: "igFullAccess", title: labels.igFullAccess, paths: ["igFullAccess"], render: (a, next) => <FkChoice<YesNo> id="igFullAccess" options={yesNoOptions} onPick={next} {...a.choice<YesNo>("igFullAccess")} /> });
    if (v.igFullAccess === "yes") {
      q.push({ id: "igFullAccessWho", title: labels.igFullAccessWho, paths: ["igFullAccessWho"], render: (a, next) => <FkText id="igFullAccessWho" autoComplete="name" onEnter={next} {...a.text("igFullAccessWho")} /> });
    }
    q.push({ id: "igSupport", title: labels.igSupport, subtitle: infoText.support, paths: ["igSupport"], render: (a, next) => <FkChoice<YesNo> id="igSupport" options={yesNoOptions} onPick={next} {...a.choice<YesNo>("igSupport")} /> });
  }

  return q;
}
