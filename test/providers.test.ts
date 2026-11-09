import { describe, expect, it } from "vitest";
import { providers, scoredProviders } from "@/data/providers";

const UNIT_TYPES = new Set(["char", "min", "sec", "token"]);
const TYPES = new Set(["TTS", "STT", "BOTH"]);
const STATUSES = new Set(["active", "discontinued", "new", undefined]);

describe("the provider data", () => {
  it("is not empty", () => expect(providers.length).toBeGreaterThan(10));

  it("has unique, lower-case, hyphenated ids", () => {
    const ids = providers.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) expect(id).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
  });

  it("has unique names", () => {
    const names = providers.map((p) => p.name);
    expect(new Set(names).size).toBe(names.length);
  });

  it.each(providers.map((p) => [p.id, p] as const))("%s: has the fields the pages show", (_id, p) => {
    expect(p.name.trim()).not.toBe("");
    expect(p.description.trim().length).toBeGreaterThan(20);
    expect(TYPES.has(p.type)).toBe(true);
    expect(STATUSES.has(p.status)).toBe(true);
    expect(Number.isInteger(p.languages) && p.languages >= 0).toBe(true);
    expect(Array.isArray(p.features) && p.features.every((f) => typeof f === "string" && f.trim() !== "")).toBe(true);
    expect(Array.isArray(p.bestFor) && p.bestFor.every((f) => /^[a-z]+(-[a-z]+)*$/.test(f))).toBe(true);
  });

  it.each(providers.map((p) => [p.id, p] as const))("%s: links are https URLs (they are rendered as links)", (_id, p) => {
    for (const url of [p.website, p.pricingUrl].filter((u): u is string => u !== undefined)) {
      const parsed = new URL(url);
      expect(parsed.protocol, url).toBe("https:");
      expect(parsed.username + parsed.password, url).toBe("");
    }
  });

  it.each(providers.map((p) => [p.id, p] as const))("%s: pricing tiers are sane", (_id, p) => {
    for (const t of p.pricing) {
      expect(t.name.trim()).not.toBe("");
      expect(UNIT_TYPES.has(t.unitType)).toBe(true);
      expect(Number.isFinite(t.price) && t.price >= 0).toBe(true);
      expect(Number.isFinite(t.unit) && t.unit > 0).toBe(true);
    }
  });

  it.each(providers.map((p) => [p.id, p] as const))("%s: benchmark scores are within 1 to 5", (_id, p) => {
    if (!p.benchmarks) return;
    for (const value of Object.values(p.benchmarks)) {
      expect(Number.isFinite(value) && value >= 1 && value <= 5).toBe(true);
    }
  });

  it.each(providers.map((p) => [p.id, p] as const))("%s: optional measurements are positive when present", (_id, p) => {
    for (const value of [p.eloScore, p.latencyMs, p.wer]) if (value !== undefined) expect(Number.isFinite(value) && value > 0).toBe(true);
    if (p.compliance) expect(p.compliance.every((c) => c.trim() !== "")).toBe(true);
  });

  it("every provider that is still offered has pricing, or a note that says why not", () => {
    for (const p of providers.filter((x) => x.status !== "discontinued")) {
      expect(p.pricing.length > 0 || Boolean(p.pricingNote?.trim()), p.id).toBe(true);
    }
  });

  it("discontinued providers are never recommended: they list no use case", () => {
    for (const p of providers.filter((x) => x.status === "discontinued")) expect(p.bestFor, p.id).toEqual([]);
  });

  it("scoredProviders is exactly the providers that have benchmarks, in order", () => {
    expect(scoredProviders.map((p) => p.id)).toEqual(providers.filter((p) => p.benchmarks !== undefined).map((p) => p.id));
    expect(scoredProviders.length).toBeGreaterThan(5);
  });

  it("a provider flagged new says so in one place only (status or flag, not neither when the other is set)", () => {
    for (const p of providers.filter((x) => x.status === "new")) expect(p.isNew === true || p.isNew === undefined, p.id).toBe(true);
  });
});
