import type { ScoredProvider } from "@/data/providers";

export type UseCase = "voice-agent" | "content-creation" | "transcription" | "accessibility" | "budget";
export type Priority = "quality" | "speed" | "price";
export type Volume = "low" | "medium" | "high";

export interface Answers {
    useCase: UseCase | null;
    priority: Priority | null;
    volume: Volume | null;
}

export type Recommendation = ScoredProvider & { score: number };

/**
 * How well a provider fits the answers: +10 when it lists the use case, a bonus for what that use case needs most, and twice the
 * benchmark the visitor said matters most. The monthly volume is asked for but not used in the score.
 */
export function scoreProvider(provider: ScoredProvider, answers: Answers): number {
    let score = 0;
    if (answers.useCase && provider.bestFor.includes(answers.useCase)) score += 10;
    if (answers.useCase === "voice-agent" && provider.benchmarks.speed >= 4) score += 5;
    if (answers.useCase === "content-creation" && provider.benchmarks.quality >= 4.5) score += 5;
    if (answers.useCase === "budget" && provider.benchmarks.priceScore >= 4) score += 10;
    if (answers.priority === "quality") score += provider.benchmarks.quality * 2;
    if (answers.priority === "speed") score += provider.benchmarks.speed * 2;
    if (answers.priority === "price") score += provider.benchmarks.priceScore * 2;
    return score;
}

/** The best three providers that are still available, best first. */
export function recommend(providers: readonly ScoredProvider[], answers: Answers, limit = 3): Recommendation[] {
    return providers
        .filter((p) => p.status !== "discontinued")
        .map((p): Recommendation => ({ ...p, score: scoreProvider(p, answers) }))
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);
}
