import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { VARIANTS } from "@/shared/variants";
import { APP_TITLE, PRIVACY_NOTE } from "@/shared/copy";

/** A tiny stylised mock of each variant's look, shown on its landing card. */
function Preview({ slug }: { slug: string }) {
  switch (slug) {
    case "rhf":
      return (
        <div className="flex h-full flex-col gap-2 bg-slate-100 p-4">
          <div className="h-1 w-full rounded-full bg-slate-200">
            <div className="h-1 w-1/3 rounded-full bg-blue-600" />
          </div>
          <div className="mx-auto mt-1 w-full max-w-[12rem] space-y-2 rounded-lg bg-white p-3 shadow-sm">
            <div className="h-2 w-14 rounded bg-slate-300" />
            <div className="h-6 rounded-md border border-slate-300" />
            <div className="h-6 w-20 rounded-md bg-blue-600" />
          </div>
        </div>
      );
    case "tanstack":
      return (
        <div className="flex h-full bg-zinc-950 p-0">
          <div className="w-1/3 space-y-1.5 border-r border-zinc-800 bg-zinc-900/60 p-2.5">
            <div className="h-1.5 w-full rounded bg-violet-500/60" />
            <div className="h-1.5 w-4/5 rounded bg-zinc-700" />
            <div className="h-1.5 w-3/5 rounded bg-zinc-700" />
          </div>
          <div className="flex-1 space-y-2 p-3">
            <div className="h-2 w-16 rounded bg-zinc-600" />
            <div className="h-6 rounded-md border border-zinc-700 bg-zinc-900" />
            <div className="h-5 w-16 rounded-md bg-violet-600" />
          </div>
        </div>
      );
    case "formik":
      return (
        <div className="flex h-full flex-col items-center justify-center gap-3 bg-gradient-to-br from-amber-50 via-rose-50 to-orange-100 p-4 text-center">
          <div className="h-2 w-28 rounded bg-rose-300" />
          <div className="h-8 w-40 rounded-full border-2 border-rose-200 bg-white/70" />
          <div className="h-8 w-24 rounded-full bg-rose-500" />
        </div>
      );
    case "conform":
      return (
        <div className="h-full space-y-2.5 bg-stone-50 p-4">
          <div className="h-2.5 w-28 rounded bg-stone-700" />
          <div className="flex items-center justify-between border-t border-stone-200 pt-2">
            <div className="h-2 w-16 rounded bg-sky-800/70" />
            <div className="h-4 w-14 rounded bg-green-200" />
          </div>
          <div className="flex items-center justify-between border-t border-stone-200 pt-2">
            <div className="h-2 w-20 rounded bg-sky-800/70" />
            <div className="h-4 w-14 rounded bg-sky-200" />
          </div>
          <div className="flex items-center justify-between border-t border-stone-200 pt-2">
            <div className="h-2 w-12 rounded bg-sky-800/70" />
            <div className="h-4 w-14 rounded bg-stone-200" />
          </div>
        </div>
      );
    case "baseline":
      return (
        <div className="flex h-full gap-2 bg-teal-50/60 p-3">
          <div className="flex-1 space-y-2 rounded-xl border border-teal-100 bg-white/70 p-2.5">
            <div className="h-1.5 w-10 rounded bg-slate-300" />
            <div className="h-5 rounded-md border border-slate-300" />
            <div className="h-5 w-16 rounded-md bg-teal-700" />
          </div>
          <div className="w-2/5 space-y-1.5 rounded-xl bg-gradient-to-br from-teal-700 to-teal-900 p-2.5">
            <div className="h-1.5 w-full rounded bg-teal-200/70" />
            <div className="h-1.5 w-3/4 rounded bg-teal-100/50" />
            <div className="h-1.5 w-2/3 rounded bg-teal-100/50" />
          </div>
        </div>
      );
    default:
      return null;
  }
}

export default function Home() {
  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:py-16">
      <div className="mb-10 max-w-2xl space-y-3">
        <span className="inline-block rounded-full bg-foreground/5 px-3 py-1 text-xs font-semibold text-muted-foreground">
          Form library showdown — 5 designs
        </span>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">One big form, five distinct designs</h1>
        <p className="text-muted-foreground">
          The same “{APP_TITLE}” form — identical fields, copy and validation — built five different ways, each
          with its <em>own</em> look so you can compare the experience, not just the tech. Open any variant.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {VARIANTS.map((v) => (
          <Link
            key={v.slug}
            href={v.route}
            className="group flex flex-col overflow-hidden rounded-2xl border bg-card shadow-sm transition hover:shadow-md"
          >
            <div className="h-36 overflow-hidden border-b">
              <Preview slug={v.slug} />
            </div>
            <div className="flex flex-1 flex-col gap-2 p-5">
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-lg font-bold tracking-tight">{v.design}</h2>
                <span className="rounded-full bg-foreground/5 px-2 py-0.5 font-mono text-[10px] text-muted-foreground">
                  {v.name}
                </span>
              </div>
              <p className="flex-1 text-sm text-muted-foreground">{v.designTagline}</p>
              <span className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-foreground">
                Open demo{" "}
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </span>
            </div>
          </Link>
        ))}
      </div>

      <p className="mx-auto mt-10 max-w-2xl text-center text-sm text-muted-foreground">{PRIVACY_NOTE}</p>
    </main>
  );
}
