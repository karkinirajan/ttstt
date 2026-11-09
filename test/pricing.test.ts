import { describe, expect, it } from "vitest";
import type { PricingTier, Provider } from "@/data/providers";
import { providers } from "@/data/providers";
import {
  CHARS_PER_HOUR,
  MINS_PER_HOUR,
  SECS_PER_HOUR,
  costRows,
  formatMonthlyCost,
  monthlyCost,
  outlierCutoff,
  summarizeCosts,
  tierFor,
  type CostRow,
} from "@/lib/pricing";

const tier = (over: Partial<PricingTier> = {}): PricingTier => ({ name: "t", price: 1, unit: 1, unitType: "min", description: "", ...over });
const provider = (over: Partial<Provider> = {}): Provider => ({
  id: "p", name: "P", type: "TTS", description: "", website: "https://example.com", pricing: [tier({ unitType: "char", unit: 1_000_000, price: 10 })],
  features: [], languages: 1, bestFor: [], ...over,
});
const row = (id: string, cost: number, over: Partial<CostRow> = {}): CostRow => ({ id, name: id, cost, openSource: false, isNew: false, ...over });

describe("the constants", () => {
  it("are what the page says", () => expect([CHARS_PER_HOUR, MINS_PER_HOUR, SECS_PER_HOUR]).toEqual([15000, 60, 3600]));
});

describe("monthlyCost: text-to-speech", () => {
  it("per million characters", () => expect(monthlyCost(tier({ unitType: "char", unit: 1_000_000, price: 15 }), "TTS", 10)).toBeCloseTo(2.25, 10)); // 150,000 chars
  it("per second", () => expect(monthlyCost(tier({ unitType: "sec", unit: 1, price: 0.001 }), "TTS", 2)).toBeCloseTo(7.2, 10)); // 7,200 s
  it("per minute", () => expect(monthlyCost(tier({ unitType: "min", unit: 1, price: 0.02 }), "TTS", 3)).toBeCloseTo(3.6, 10)); // 180 min
  it("a tier priced per token cannot be priced", () => expect(monthlyCost(tier({ unitType: "token" }), "TTS", 10)).toBe(0));
});

describe("monthlyCost: speech-to-text", () => {
  it("per minute", () => expect(monthlyCost(tier({ unitType: "min", unit: 1, price: 0.0025 }), "STT", 10)).toBeCloseTo(1.5, 10)); // 600 min
  it("per second", () => expect(monthlyCost(tier({ unitType: "sec", unit: 1, price: 0.0001 }), "STT", 1)).toBeCloseTo(0.36, 10)); // 3,600 s
  it("a per-character tier cannot price transcription", () => expect(monthlyCost(tier({ unitType: "char", unit: 1000, price: 1 }), "STT", 10)).toBe(0));
  it("a per-token tier cannot either", () => expect(monthlyCost(tier({ unitType: "token" }), "STT", 10)).toBe(0));
  it("a unit larger than one divides", () => expect(monthlyCost(tier({ unitType: "min", unit: 60, price: 0.36 }), "STT", 10)).toBeCloseTo(3.6, 10));
});

describe("monthlyCost: bad input", () => {
  it.each([0, -5, NaN, Infinity, -Infinity])("%s hours cost nothing", (hours) => {
    expect(monthlyCost(tier(), "STT", hours)).toBe(0);
    expect(monthlyCost(tier({ unitType: "char", unit: 1000 }), "TTS", hours)).toBe(0);
  });
  it.each([0, -1])("a unit of %s cannot price anything (no division by zero)", (unit) => {
    expect(monthlyCost(tier({ unit }), "STT", 10)).toBe(0);
    expect(monthlyCost(tier({ unit, unitType: "char" }), "TTS", 10)).toBe(0);
  });
  it("a free tier costs nothing", () => expect(monthlyCost(tier({ price: 0 }), "STT", 100)).toBe(0));
  it("scales linearly with hours", () => expect(monthlyCost(tier({ price: 0.01 }), "STT", 20)).toBeCloseTo(2 * monthlyCost(tier({ price: 0.01 }), "STT", 10), 10));
});

describe("tierFor", () => {
  const char = tier({ name: "char", unitType: "char" });
  const min = tier({ name: "min", unitType: "min" });
  const sec = tier({ name: "sec", unitType: "sec" });

  it("a provider with no tiers has none", () => expect(tierFor(provider({ pricing: [] }), "TTS")).toBeUndefined());
  it("a single-purpose provider is priced by its first tier, whatever it is", () => {
    expect(tierFor(provider({ type: "TTS", pricing: [min, char] }), "TTS")).toBe(min);
    expect(tierFor(provider({ type: "STT", pricing: [sec, min] }), "STT")).toBe(sec);
  });
  describe("a provider that does BOTH", () => {
    const both = provider({ type: "BOTH", pricing: [char, min] });
    it("text-to-speech takes the per-character tier", () => expect(tierFor(both, "TTS")).toBe(char));
    it("text-to-speech takes the per-character tier even when a per-minute one is listed first", () => {
      expect(tierFor(provider({ type: "BOTH", pricing: [min, char] }), "TTS")).toBe(char);
    });
    it("a BOTH provider with no tiers has none, for either job", () => {
      expect(tierFor(provider({ type: "BOTH", pricing: [] }), "TTS")).toBeUndefined();
      expect(tierFor(provider({ type: "BOTH", pricing: [] }), "STT")).toBeUndefined();
    });
    it("speech-to-text takes the per-minute tier, not the per-character one listed first", () => expect(tierFor(both, "STT")).toBe(min));
    it("speech-to-text also accepts a per-second tier", () => expect(tierFor(provider({ type: "BOTH", pricing: [char, sec] }), "STT")).toBe(sec));
    it("with only per-character tiers there is nothing to price transcription with", () => expect(tierFor(provider({ type: "BOTH", pricing: [char] }), "STT")).toBeUndefined());
    it("with no per-character tier, text-to-speech falls back to the first tier", () => expect(tierFor(provider({ type: "BOTH", pricing: [min, sec] }), "TTS")).toBe(min));
    it("the first matching tier wins", () => {
      const a = tier({ name: "a", unitType: "min" });
      const b = tier({ name: "b", unitType: "min" });
      expect(tierFor(provider({ type: "BOTH", pricing: [char, a, b] }), "STT")).toBe(a);
    });
  });
});

describe("costRows", () => {
  const tts = provider({ id: "tts", type: "TTS", pricing: [tier({ unitType: "char", unit: 1_000_000, price: 100 })] });
  const stt = provider({ id: "stt", type: "STT", pricing: [tier({ unitType: "min", unit: 1, price: 0.01 })] });
  const both = provider({ id: "both", type: "BOTH", pricing: [tier({ unitType: "char", unit: 1_000_000, price: 20 }), tier({ unitType: "min", unit: 1, price: 0.02 })] });

  it("keeps the providers that do the job, cheapest first", () => {
    expect(costRows([tts, stt, both], "TTS", 10).map((r) => r.id)).toEqual(["both", "tts"]);
    expect(costRows([tts, stt, both], "STT", 10).map((r) => r.id)).toEqual(["stt", "both"]);
  });
  it("prices a BOTH provider with the tier that fits each job", () => {
    expect(costRows([both], "TTS", 10)[0]?.cost).toBe(3); // 150,000 chars at $20 per million
    expect(costRows([both], "STT", 10)[0]?.cost).toBe(12); // 600 minutes at $0.02
  });
  it("rounds to cents", () => expect(costRows([provider({ pricing: [tier({ unitType: "char", unit: 1_000_000, price: 1 })] })], "TTS", 7)[0]?.cost).toBe(0.11)); // 0.105
  it("drops discontinued providers, providers with no tiers, and providers whose tier cannot price the job", () => {
    const dead = provider({ id: "dead", status: "discontinued" });
    const none = provider({ id: "none", pricing: [] });
    const tokens = provider({ id: "tok", pricing: [tier({ unitType: "token" })] });
    expect(costRows([dead, none, tokens, tts], "TTS", 10).map((r) => r.id)).toEqual(["tts"]);
  });
  it("does not chart an open-source provider that lists no tiers at all", () => {
    expect(costRows([provider({ id: "none", openSource: true, pricing: [] })], "TTS", 10)).toEqual([]);
  });
  it("keeps a free open-source provider at zero, and drops a free closed one", () => {
    const free = provider({ id: "free", openSource: true, pricing: [tier({ price: 0, unitType: "char", unit: 1000 })] });
    const closedFree = provider({ id: "closed", pricing: [tier({ price: 0, unitType: "char", unit: 1000 })] });
    const rows = costRows([tts, free, closedFree], "TTS", 10);
    expect(rows.map((r) => [r.id, r.cost, r.openSource])).toEqual([["free", 0, true], ["tts", 15, false]]);
  });
  it("carries the new flag", () => expect(costRows([provider({ isNew: true })], "TTS", 10)[0]?.isNew).toBe(true));
  it("nothing to chart at zero hours, except free open-source options", () => {
    const free = provider({ id: "free", openSource: true });
    expect(costRows([tts, free], "TTS", 0).map((r) => r.id)).toEqual(["free"]);
  });
});

describe("outlierCutoff and summarizeCosts", () => {
  it("is infinite when nothing is paid", () => {
    expect(outlierCutoff([])).toBe(Infinity);
    expect(outlierCutoff([row("a", 0), row("b", 0)])).toBe(Infinity);
  });
  it("is three times the 90th percentile of the paid costs", () => {
    const rows = Array.from({ length: 10 }, (_, i) => row(`r${i}`, i + 1)); // 1..10: index floor(10 * 0.9) = 9 -> 10
    expect(outlierCutoff(rows)).toBe(30);
    expect(outlierCutoff([row("a", 4)])).toBe(12);
    expect(outlierCutoff([row("a", 2), row("b", 5)])).toBe(15);
  });
  it("ignores zero-cost rows when finding the percentile", () => expect(outlierCutoff([row("a", 0), row("b", 0), row("c", 5)])).toBe(15));
  it("does not depend on the order of the rows", () => expect(outlierCutoff([row("a", 9), row("b", 1), row("c", 5)])).toBe(outlierCutoff([row("b", 1), row("c", 5), row("a", 9)])));
  it("separates the outliers", () => {
    const rows = [...Array.from({ length: 9 }, (_, i) => row(`r${i}`, 10)), row("edge", 30), row("far", 31), row("huge", 1000)].sort((x, y) => x.cost - y.cost);
    // costs: nine of 10, 30, 31, 1000 -> 12 rows, floor(12 * 0.9) = 10 -> 31 -> cutoff 93
    const summary = summarizeCosts(rows);
    expect(summary.outliers.map((r) => r.id)).toEqual(["huge"]);
    expect(summary.standard.map((r) => r.id)).toContain("far");
  });
  it("a cost exactly three times the 90th percentile stays in the main chart; one cent more is an outlier", () => {
    const base = Array.from({ length: 10 }, (_, i) => row(`r${i}`, 1)); // 11 rows: index 9 is a 1, so the cutoff is 3
    expect(summarizeCosts([...base, row("edge", 3)]).outliers).toEqual([]);
    expect(summarizeCosts([...base, row("edge", 3)]).standard.map((r) => r.id)).toContain("edge");
    expect(summarizeCosts([...base, row("edge", 3.01)]).outliers.map((r) => r.id)).toEqual(["edge"]);
  });
  it("the cheapest is the cheapest PAID provider, the most expensive the last in the main chart", () => {
    const summary = summarizeCosts([row("free", 0, { openSource: true }), row("a", 2), row("b", 5), row("c", 9)]);
    expect(summary.cheapest?.id).toBe("a");
    expect(summary.mostExpensive?.id).toBe("c");
  });
  it("on a tie the first of the cheapest rows is named", () => {
    expect(summarizeCosts([row("first", 2), row("second", 2), row("c", 9)]).cheapest?.id).toBe("first");
  });
  it("the most expensive is the last of the main chart, never an outlier", () => {
    const rows = [...Array.from({ length: 10 }, (_, i) => row(`r${i + 1}`, i + 1)), row("big", 500)];
    const summary = summarizeCosts(rows);
    expect(summary.outliers.map((r) => r.id)).toEqual(["big"]);
    expect(summary.mostExpensive?.id).toBe("r10");
  });
  it("has no cheapest when everything is free, and nothing at all for no rows", () => {
    expect(summarizeCosts([row("free", 0, { openSource: true })]).cheapest).toBeUndefined();
    expect(summarizeCosts([])).toEqual({ standard: [], outliers: [], cheapest: undefined, mostExpensive: undefined });
  });
  it("the outliers come out of the main chart: nothing is in both", () => {
    // 11 rows: the 90th-percentile index (9) is the tenth cost, so the largest one can fall beyond three times it
    const rows = [...Array.from({ length: 10 }, (_, i) => row(`r${i + 1}`, i + 1)), row("big", 500)];
    const { standard, outliers } = summarizeCosts(rows);
    expect(standard.length + outliers.length).toBe(rows.length);
    expect(outliers.map((r) => r.id)).toEqual(["big"]);
  });
});

describe("formatMonthlyCost", () => {
  it.each([
    [0, "Free (self-hosted)"],
    [2.5, "$2.50/month"],
    [1234.567, "$1234.57/month"],
    [0.004, "$0.00/month"],
  ])("%s -> %s", (value, text) => expect(formatMonthlyCost(value)).toBe(text));
  it.each([undefined, null, "3", NaN, Infinity, [1], {}])("%j is N/A", (value) => expect(formatMonthlyCost(value)).toBe("N/A"));
});

describe("the real data", () => {
  it("prices openai, google and azure for speech-to-text (their first tier is per character, which used to drop them from that chart)", () => {
    const ids = costRows(providers, "STT", 10).map((r) => r.id);
    for (const id of ["openai", "google", "azure"]) expect(ids, id).toContain(id);
  });
  it("every provider that is priced for speech-to-text really has a per-minute or per-second tier", () => {
    for (const r of costRows(providers, "STT", 10)) {
      const p = providers.find((x) => x.id === r.id)!;
      expect(p.pricing.some((t) => t.unitType === "min" || t.unitType === "sec"), r.id).toBe(true);
    }
  });
  it("at a normal volume both charts have providers, sorted by price", () => {
    for (const use of ["TTS", "STT"] as const) {
      const rows = costRows(providers, use, 10);
      expect(rows.length).toBeGreaterThan(3);
      expect(rows.map((r) => r.cost)).toEqual([...rows.map((r) => r.cost)].sort((a, b) => a - b));
    }
  });
  it("no discontinued provider is ever priced", () => {
    const dead = new Set(providers.filter((p) => p.status === "discontinued").map((p) => p.id));
    for (const use of ["TTS", "STT"] as const) for (const r of costRows(providers, use, 50)) expect(dead.has(r.id)).toBe(false);
  });
});
