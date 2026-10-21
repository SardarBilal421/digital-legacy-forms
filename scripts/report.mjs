// Per-variant report: lines of code, number of files, and First Load JS.
//
// First Load JS is computed from the prerendered HTML Next.js emits for each
// route: we collect every /_next/static/*.js chunk the page loads and sum their
// gzipped sizes (the same convention Next uses for "First Load JS"). Run after a
// production build — `pnpm report` does `next build` first.

import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join, extname } from "node:path";
import { gzipSync } from "node:zlib";

const ROOT = process.cwd();

const VARIANTS = [
  { name: "React Hook Form", slug: "rhf" },
  { name: "TanStack Form", slug: "tanstack" },
  { name: "Formik", slug: "formik" },
  { name: "Conform", slug: "conform" },
  { name: "Baseline", slug: "baseline" },
];

const CODE_EXT = new Set([".ts", ".tsx"]);

function walk(dir) {
  if (!existsSync(dir)) return [];
  const out = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) out.push(...walk(full));
    else out.push(full);
  }
  return out;
}

function codeStats(slug) {
  const files = [
    ...walk(join(ROOT, "src", "variants", slug)),
    join(ROOT, "src", "app", slug, "page.tsx"),
  ].filter((f) => existsSync(f) && CODE_EXT.has(extname(f)));

  let loc = 0;
  for (const f of files) {
    loc += readFileSync(f, "utf8")
      .split("\n")
      .filter((l) => l.trim().length > 0).length;
  }
  return { fileCount: files.length, loc };
}

function firstLoadJs(route) {
  // Static HTML path: "/" -> index.html, "/rhf" -> rhf.html
  const htmlName = route === "" ? "index.html" : `${route}.html`;
  const htmlPath = join(ROOT, ".next", "server", "app", htmlName);
  if (!existsSync(htmlPath)) return null;

  const html = readFileSync(htmlPath, "utf8");
  const srcs = new Set();
  const re = /\/_next\/static\/[^"']+?\.js/g;
  let m;
  while ((m = re.exec(html)) !== null) srcs.add(m[0]);

  let gz = 0;
  for (const src of srcs) {
    const path = join(ROOT, ".next", src.slice("/_next/".length));
    if (existsSync(path)) gz += gzipSync(readFileSync(path)).length;
  }
  return { chunks: srcs.size, gzip: gz };
}

function kb(bytes) {
  return `${(bytes / 1024).toFixed(1)} kB`;
}

function pad(s, n) {
  return String(s).padEnd(n);
}

console.log("\nDigital Legacy Forms — variant report");
console.log("=".repeat(64));
console.log(`${pad("Variant", 18)}${pad("Files", 8)}${pad("LOC", 8)}${pad("Chunks", 9)}First Load JS`);
console.log("-".repeat(64));

let missingBuild = false;
for (const v of VARIANTS) {
  const { fileCount, loc } = codeStats(v.slug);
  const fl = firstLoadJs(v.slug);
  if (!fl) missingBuild = true;
  const size = fl ? kb(fl.gzip) : "run build";
  const chunks = fl ? fl.chunks : "-";
  console.log(`${pad(v.name, 18)}${pad(fileCount, 8)}${pad(loc, 8)}${pad(chunks, 9)}${size}`);
}

const landing = firstLoadJs("");
if (landing) {
  console.log("-".repeat(64));
  console.log(
    `${pad("(landing /)", 18)}${pad("-", 8)}${pad("-", 8)}${pad(landing.chunks, 9)}${kb(landing.gzip)}`,
  );
}

console.log("=".repeat(64));
console.log("LOC = non-blank lines in src/variants/<slug> + its route page (.ts/.tsx).");
console.log("First Load JS = gzipped total of the route's /_next/static chunks.\n");

if (missingBuild) {
  console.log("Some routes had no prerendered HTML — run `pnpm build` first.\n");
  process.exitCode = 1;
}
