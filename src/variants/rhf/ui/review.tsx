"use client";

import { labels } from "@/shared/copy";
import { labelFor, iamContactOrdinals } from "@/shared/options";
import {
  contactStarted,
  iamContactsRequired,
  secondExecutorStarted,
  type ContactValues,
  type ExecutorValues,
  type FormValues,
} from "@/shared/schema";
import { STEPS } from "@/shared/steps";

interface Row {
  label: string;
  value: React.ReactNode;
}
interface Section {
  step: number;
  title: string;
  rows: Row[];
}

function L(value: string): string {
  return labelFor[value] ?? value;
}

function execLine(e: ExecutorValues) {
  return `${e.fullName} · ${e.email} · ${e.phone} · ${e.relationship}`;
}
function contactLine(c: ContactValues) {
  return `${c.name} · ${c.email} · ${c.relationship} · ${c.phone}`;
}

function buildSections(v: FormValues): Section[] {
  const sections: Section[] = [];

  const s1: Row[] = [{ label: labels.fullName, value: v.fullName }];
  if (v.previousSurname) s1.push({ label: labels.previousSurname, value: v.previousSurname });
  s1.push({ label: labels.dob, value: v.dob });
  s1.push({ label: labels.isOver18, value: L(v.isOver18) });
  if (v.isOver18 === "no") {
    s1.push({ label: labels.guardianPrimary, value: v.guardianPrimary });
    if (v.guardianSecond) s1.push({ label: labels.guardianSecond, value: v.guardianSecond });
  }
  sections.push({ step: 0, title: STEPS[0].title, rows: s1 });

  const s2: Row[] = [{ label: labels.execPrimary, value: execLine(v.execPrimary) }];
  if (secondExecutorStarted(v.execSecond)) {
    s2.push({ label: labels.execSecond, value: execLine(v.execSecond) });
    s2.push({ label: labels.execSecondEqualAccess, value: L(v.execSecondEqualAccess) });
    if (v.execSecondEqualAccess === "no") s2.push({ label: labels.execSecondAccessExplain, value: v.execSecondAccessExplain });
  }
  sections.push({ step: 1, title: STEPS[1].title, rows: s2 });

  const s3: Row[] = [{ label: labels.services, value: v.services.map(L).join(", ") }];
  if (v.services.includes("other")) s3.push({ label: labels.servicesOther, value: v.servicesOther });
  if (v.services.includes("googlePhotos")) {
    s3.push({ label: labels.photosBackedUp, value: L(v.photosBackedUp) });
    if (v.photosBackedUp === "yes") s3.push({ label: labels.photosCopyWho, value: v.photosCopyWho });
  }
  if (v.services.includes("drive")) {
    s3.push({ label: labels.driveBackedUp, value: L(v.driveBackedUp) });
    if (v.driveBackedUp === "yes") s3.push({ label: labels.driveCopyWho, value: v.driveCopyWho });
  }
  if (v.services.includes("youtube")) {
    s3.push({ label: labels.youtubeUrl, value: v.youtubeUrl });
    s3.push({ label: labels.youtubeManager, value: v.youtubeManager });
  }
  sections.push({ step: 2, title: STEPS[2].title, rows: s3 });

  const s4: Row[] = [
    { label: labels.iamSetup, value: L(v.iamSetup) },
    { label: labels.iamSupport, value: L(v.iamSupport) },
  ];
  if (iamContactsRequired(v)) {
    v.iamContacts.forEach((c, i) => {
      s4.push({ label: `${iamContactOrdinals[i] ?? i + 1} assigned manager`, value: contactLine(c) });
    });
  }
  s4.push({ label: labels.iamBypass, value: L(v.iamBypass) });
  sections.push({ step: 3, title: STEPS[3].title, rows: s4 });

  const s5: Row[] = [{ label: labels.fbHas, value: L(v.fbHas) }];
  if (v.fbHas === "yes") {
    s5.push({ label: labels.fbEmail, value: v.fbEmail });
    s5.push({ label: labels.fbPhone, value: v.fbPhone });
    s5.push({ label: labels.fbLegacyContact, value: L(v.fbLegacyContact) });
    s5.push({ label: labels.fbMediaDownloaded, value: L(v.fbMediaDownloaded) });
    if (v.fbMediaDownloaded === "yes") {
      s5.push({ label: labels.fbBackupLocation, value: v.fbBackupLocation });
      s5.push({ label: labels.fbBackupWho, value: v.fbBackupWho });
    }
    s5.push({ label: labels.fbAccountAction, value: L(v.fbAccountAction) });
    s5.push({ label: labels.fbPrivateMessagesAccess, value: L(v.fbPrivateMessagesAccess) });
    if (v.fbPrivateMessagesAccess === "yes") s5.push({ label: labels.fbPrivateMessagesWho, value: v.fbPrivateMessagesWho });
    s5.push({ label: labels.fbMediaAccess, value: L(v.fbMediaAccess) });
    s5.push({ label: labels.fbSupport, value: L(v.fbSupport) });
    if (contactStarted(v.fbManager)) s5.push({ label: labels.fbManager, value: contactLine(v.fbManager) });
  }
  sections.push({ step: 4, title: STEPS[4].title, rows: s5 });

  const s6: Row[] = [{ label: labels.igHas, value: L(v.igHas) }];
  if (v.igHas === "yes") {
    s6.push({ label: labels.igEmail, value: v.igEmail });
    s6.push({ label: labels.igPhone, value: v.igPhone });
    s6.push({ label: labels.igPlans, value: L(v.igPlans) });
    s6.push({ label: labels.igMediaDownloaded, value: L(v.igMediaDownloaded) });
    s6.push({ label: labels.igAccountAction, value: L(v.igAccountAction) });
    s6.push({ label: labels.igFullAccess, value: L(v.igFullAccess) });
    if (v.igFullAccess === "yes") s6.push({ label: labels.igFullAccessWho, value: v.igFullAccessWho });
    s6.push({ label: labels.igSupport, value: L(v.igSupport) });
  }
  sections.push({ step: 5, title: STEPS[5].title, rows: s6 });

  return sections;
}

export function RhfReview({ values, onEdit }: { values: FormValues; onEdit: (step: number) => void }) {
  const sections = buildSections(values);
  return (
    <div className="space-y-4 text-left">
      {sections.map((section) => (
        <div key={section.step} className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <div className="flex items-center justify-between gap-2 border-b border-slate-100 bg-slate-50 px-4 py-2.5">
            <h3 className="text-sm font-bold text-slate-800">{section.title}</h3>
            <button
              type="button"
              onClick={() => onEdit(section.step)}
              className="text-sm font-semibold text-blue-600 hover:text-blue-700 hover:underline"
            >
              Change
            </button>
          </div>
          <dl className="divide-y divide-slate-100">
            {section.rows.map((row, i) => (
              <div key={i} className="grid grid-cols-1 gap-0.5 px-4 py-2.5 sm:grid-cols-[14rem_1fr] sm:gap-4">
                <dt className="text-[13px] text-slate-500">{row.label}</dt>
                <dd className="break-words text-sm text-slate-900">
                  {row.value || <span className="text-slate-400">—</span>}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      ))}
    </div>
  );
}
