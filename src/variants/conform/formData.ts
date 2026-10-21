import { defaultValues, type FormValues, type ServiceId } from "@/shared/schema";

type Token = string | number;

/** Tokenise a Conform field name: "iamContacts[0].name" -> ["iamContacts", 0, "name"]. */
function tokenize(name: string): Token[] {
  const tokens: Token[] = [];
  for (const part of name.split(".")) {
    const m = part.match(/^([^[]+)((\[\d+\])*)$/);
    if (!m) {
      tokens.push(part);
      continue;
    }
    tokens.push(m[1]);
    const indices = m[2].match(/\d+/g);
    if (indices) indices.forEach((i) => tokens.push(Number(i)));
  }
  return tokens;
}

function setPath(target: Record<string, unknown> | unknown[], tokens: Token[], value: unknown): void {
  let node: Record<string, unknown> | unknown[] = target;
  for (let i = 0; i < tokens.length - 1; i += 1) {
    const key = tokens[i];
    const nextKey = tokens[i + 1];
    const container = typeof nextKey === "number" ? [] : {};
    if (Array.isArray(node)) {
      const idx = key as number;
      if (node[idx] === undefined) node[idx] = container;
      node = node[idx] as Record<string, unknown> | unknown[];
    } else {
      const obj = node as Record<string, unknown>;
      if (obj[key as string] === undefined) obj[key as string] = container;
      node = obj[key as string] as Record<string, unknown> | unknown[];
    }
  }
  const last = tokens[tokens.length - 1];
  if (Array.isArray(node)) node[last as number] = value;
  else (node as Record<string, unknown>)[last as string] = value;
}

const SERVICE_VALUES: ServiceId[] = ["gmail", "googlePhotos", "drive", "youtube", "other"];

/**
 * Convert a submitted FormData into the nested FormValues shape used by the
 * shared Zod schema. Starts from empty defaults so missing fields stay defined.
 */
export function formDataToValues(fd: FormData): FormValues {
  const values = structuredClone(defaultValues) as unknown as Record<string, unknown>;

  // Group repeated keys (checkbox groups) together.
  const groups = new Map<string, string[]>();
  for (const [key, raw] of fd.entries()) {
    if (typeof raw !== "string") continue;
    const arr = groups.get(key) ?? [];
    arr.push(raw);
    groups.set(key, arr);
  }

  for (const [name, arr] of groups) {
    if (name === "services") {
      values.services = arr.filter((v): v is ServiceId => (SERVICE_VALUES as string[]).includes(v));
      continue;
    }
    if (name === "consent") {
      values.consent = arr.includes("on") || arr.includes("true");
      continue;
    }
    setPath(values, tokenize(name), arr.length > 1 ? arr : arr[0]);
  }

  return values as unknown as FormValues;
}
