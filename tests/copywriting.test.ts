import { readFileSync } from "node:fs";
import { join, relative } from "node:path";
import { describe, expect, it } from "vitest";
import { rootDir, sourcesIn } from "./helpers";

/**
 * The same prose rules the docs site holds, over the only copy this repo has:
 * the strings and JSX text the playground puts on screen. Written out here
 * rather than imported, because each repo owns its own copy of the rule.
 */

/** Quoted strings and JSX text nodes that read as prose, with their file. */
function copy(): { file: string; text: string }[] {
  const out: { file: string; text: string }[] = [];

  for (const path of sourcesIn(join(rootDir, "src"))) {
    const source = readFileSync(path, "utf8");
    const file = relative(rootDir, path);
    const found = [
      ...[...source.matchAll(/"([^"\n]{4,})"|'([^'\n]{4,})'/g)].map(
        (match) => match[1] ?? match[2],
      ),
      ...[...source.matchAll(/>\s*([A-Za-z][^<>{}\n]{3,})\s*</g)].map(
        (match) => match[1],
      ),
    ];

    for (const text of found) {
      // Class strings, import paths and ids are not prose.
      if (!/[a-z]{3}/.test(text)) continue;
      if (/^[\w\-./@:*\s]+$/.test(text) && !/[A-Z]/.test(text)) continue;
      out.push({ file, text: text.trim() });
    }
  }

  return out;
}

const strings = copy();

function offenders(pattern: RegExp): string[] {
  return strings
    .filter(({ text }) => pattern.test(text))
    .map(({ file, text }) => `${file}: ${text}`);
}

describe("playground copy", () => {
  it("has copy to check", () => {
    expect(strings.length).toBeGreaterThan(20);
  });

  it("uses no em dashes", () => {
    expect(offenders(/—/)).toEqual([]);
  });

  it("uses no contractions", () => {
    expect(offenders(/\b\w+(?:n't|'re|'ll|'ve|'d)\b|\bit's\b/i)).toEqual([]);
  });

  it("spells `cannot` as one word", () => {
    expect(offenders(/\bcan not\b/)).toEqual([]);
  });

  it("uses US spelling", () => {
    expect(
      offenders(/\b\w*(?:behaviour|colour|recognis|normalis|centre)\w*/i),
    ).toEqual([]);
  });

  it("never mentions Tailwind", () => {
    expect(offenders(/\btailwind\b/i)).toEqual([]);
  });

  // A ring is a box-shadow standing in for an outline. Yumma has `os-`, `ow-`,
  // `oo-` and `oc-`, so the word for what focus draws is outline.
  it("calls the focus indicator an outline", () => {
    expect(offenders(/\brings?\b/i)).toEqual([]);
  });

  /** One ellipsis character, not three dots. `...spread` is not prose. */
  it("spells an ellipsis as one character", () => {
    expect(offenders(/[A-Za-z,)]\s*\.{3}(?![\w$])/)).toEqual([]);
  });
});
