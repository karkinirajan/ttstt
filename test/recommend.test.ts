import { describe, expect, it } from "vitest";
import { scoredProviders, type ScoredProvider } from "@/data/providers";
import { recommend, scoreProvider, type Answers } from "@/lib/recommend";

const bench = (over: Partial<ScoredProvider["benchmarks"]> = {}) => ({ quality: 3, speed: 3, priceScore: 3, features: 3, ...over });
const p = (id: string, over: Partial<ScoredProvider> = {}): ScoredProvider => ({
  id, name: id, type: "TTS", description: "", website: "https://example.com", pricing: [], features: [], languages: 1, bestFor: [], benchmarks: bench(), ...over,
});
const answers = (over: Partial<Answers> = {}): Answers => ({ useCase: null, priority: null, volume: null, ...over });

describe("scoreProvider", () => {
  it("is zero with no answers", () => expect(scoreProvider(p("a"), answers())).toBe(0));
  it("adds 10 when the provider lists the use case", () => {
    expect(scoreProvider(p("a", { bestFor: ["transcription"] }), answers({ useCase: "transcription" }))).toBe(10);
    expect(scoreProvider(p("a", { bestFor: ["audiobook"] }), answers({ useCase: "transcription" }))).toBe(0);
  });
  it("adds twice the benchmark the visitor cares about most", () => {
    const x = p("a", { benchmarks: bench({ quality: 4, speed: 5, priceScore: 1 }) });
    expect(scoreProvider(x, answers({ priority: "quality" }))).toBe(8);
    expect(scoreProvider(x, answers({ priority: "speed" }))).toBe(10);
    expect(scoreProvider(x, answers({ priority: "price" }))).toBe(2);
  });
  it("gives a voice agent +5 for speed of at least 4", () => {
    const answersVA = answers({ useCase: "voice-agent" });
    expect(scoreProvider(p("a", { benchmarks: bench({ speed: 4 }) }), answersVA)).toBe(5);
    expect(scoreProvider(p("a", { benchmarks: bench({ speed: 3.9 }) }), answersVA)).toBe(0);
  });
  it("gives content creation +5 for quality of at least 4.5", () => {
    const answersCC = answers({ useCase: "content-creation" });
    expect(scoreProvider(p("a", { benchmarks: bench({ quality: 4.5 }) }), answersCC)).toBe(5);
    expect(scoreProvider(p("a", { benchmarks: bench({ quality: 4.4 }) }), answersCC)).toBe(0);
  });
  it("gives a budget project +10 for a price score of at least 4", () => {
    const answersB = answers({ useCase: "budget" });
    expect(scoreProvider(p("a", { benchmarks: bench({ priceScore: 4 }) }), answersB)).toBe(10);
    expect(scoreProvider(p("a", { benchmarks: bench({ priceScore: 3.9 }) }), answersB)).toBe(0);
  });
  it("adds everything that applies", () => {
    const x = p("a", { bestFor: ["voice-agent"], benchmarks: bench({ speed: 5 }) });
    expect(scoreProvider(x, answers({ useCase: "voice-agent", priority: "speed" }))).toBe(10 + 5 + 10);
  });
  it("does not use the monthly volume (it is asked for but not scored)", () => {
    const x = p("a", { bestFor: ["budget"] });
    expect(scoreProvider(x, answers({ useCase: "budget", volume: "low" }))).toBe(scoreProvider(x, answers({ useCase: "budget", volume: "high" })));
  });
});

describe("recommend", () => {
  const list = [p("low", { benchmarks: bench({ quality: 1 }) }), p("mid", { benchmarks: bench({ quality: 3 }) }), p("high", { benchmarks: bench({ quality: 5 }) }), p("top", { benchmarks: bench({ quality: 5 }), bestFor: ["content-creation"] })];

  it("returns the best three, best first, with their scores", () => {
    const result = recommend(list, answers({ useCase: "content-creation", priority: "quality" }));
    expect(result.map((r) => r.id)).toEqual(["top", "high", "mid"]);
    // top: +10 lists the use case, +5 quality >= 4.5, +10 for 2 x 5. high: +5 and +10 (no use case). mid: 2 x 3.
    expect(result.map((r) => r.score)).toEqual([10 + 5 + 10, 5 + 10, 6]);
  });
  it("honours the limit", () => {
    expect(recommend(list, answers({ priority: "quality" }), 2)).toHaveLength(2);
    expect(recommend(list, answers({ priority: "quality" }), 10)).toHaveLength(4);
    expect(recommend(list, answers({ priority: "quality" }), 0)).toEqual([]);
  });
  it("never recommends a discontinued provider", () => {
    const withDead = [...list, p("dead", { status: "discontinued", bestFor: ["content-creation"], benchmarks: bench({ quality: 5, speed: 5, priceScore: 5 }) })];
    expect(recommend(withDead, answers({ useCase: "content-creation", priority: "quality" })).map((r) => r.id)).not.toContain("dead");
  });
  it("does not change the list it is given", () => {
    const copy = [...list];
    recommend(list, answers({ priority: "quality" }));
    expect(list).toEqual(copy);
  });
  it("returns nothing for no providers", () => expect(recommend([], answers())).toEqual([]));
  it("on the real data returns three available providers for every combination of answers", () => {
    for (const useCase of ["voice-agent", "content-creation", "transcription", "accessibility", "budget"] as const) {
      for (const priority of ["quality", "speed", "price"] as const) {
        const result = recommend(scoredProviders, answers({ useCase, priority, volume: "medium" }));
        expect(result).toHaveLength(3);
        for (const r of result) expect(r.status).not.toBe("discontinued");
        expect(result.map((r) => r.score)).toEqual([...result.map((r) => r.score)].sort((a, b) => b - a));
      }
    }
  });
});
