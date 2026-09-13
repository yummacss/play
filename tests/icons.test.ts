import { readFileSync } from "node:fs";
import { join, relative } from "node:path";
import { describe, expect, it } from "vitest";
import { rootDir, sourcesIn } from "./helpers";

/**
 * `src/icons.ts` is the playground's single icon import, so changing icon
 * library is one edit. The docs site has the same rule and its own module;
 * this is not that one shared across repos.
 */

const DIRECT = /from\s+["']iconoir-react["']/;

describe("icons", () => {
  const src = join(rootDir, "src");
  const module = join(src, "icons.ts");
  const app = sourcesIn(src).filter((file) => file !== module);

  it("routes every import through the module", () => {
    const direct = app
      .filter((file) => DIRECT.test(readFileSync(file, "utf8")))
      .map((file) => relative(rootDir, file));

    expect(direct).toEqual([]);
  });

  it("re-exports every icon the app asks for", () => {
    const names = new Set(
      [
        ...readFileSync(module, "utf8")
          .replace(/\/\*[\s\S]*?\*\//, "")
          .matchAll(/^\s{2}([A-Z][A-Za-z0-9]*),$/gm),
      ].map((match) => match[1]),
    );

    const wanted = new Set<string>();
    for (const file of app) {
      const source = readFileSync(file, "utf8");
      for (const [, block] of source.matchAll(
        /import\s*\{([^}]*)\}\s*from\s*["']@\/icons["']/g,
      )) {
        for (const name of block.split(",")) {
          const trimmed = name.trim();
          if (trimmed) wanted.add(trimmed);
        }
      }
    }

    expect([...wanted].filter((name) => !names.has(name))).toEqual([]);
    expect(wanted.size).toBeGreaterThan(5);
  });

  // An icon re-exported and then dropped from the app is dead weight the next
  // person has to check before removing.
  it("re-exports nothing the app does not ask for", () => {
    const used = app.map((file) => readFileSync(file, "utf8")).join("\n");
    const exported = [
      ...readFileSync(module, "utf8")
        .replace(/\/\*[\s\S]*?\*\//, "")
        .matchAll(/^\s{2}([A-Z][A-Za-z0-9]*),$/gm),
    ].map((match) => match[1]);

    expect(
      exported.filter((name) => !new RegExp(`\\b${name}\\b`).test(used)),
    ).toEqual([]);
  });
});
