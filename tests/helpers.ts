import { readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

/** Repo root, resolved from this file rather than `process.cwd()`. */
export const rootDir = join(dirname(fileURLToPath(import.meta.url)), "..");

/** Absolute paths of every `.ts`/`.tsx` file below `dir`, recursively. */
export function sourcesIn(dir: string): string[] {
  const out: string[] = [];

  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...sourcesIn(full));
    else if (/\.tsx?$/.test(entry.name)) out.push(full);
  }

  return out;
}
