import type { PricingTier, Provider } from "@/data/providers";

export type CostUseCase = "TTS" | "STT";

/** About 15,000 characters of text make an hour of synthesized speech. */
export const CHARS_PER_HOUR = 15000;
export const MINS_PER_HOUR = 60;
export const SECS_PER_HOUR = 3600;

export interface CostRow {
    id: string;
    name: string;
    cost: number;
    openSource: boolean;
    isNew: boolean;
}

/**
 * The price tier the calculator uses for a provider.
 *
 * A provider that does only one of the two jobs is priced by its first tier (none, when it lists none). A provider that does BOTH lists tiers for both (a per-character
 * text-to-speech tier, a per-minute speech-to-text tier), and the calculator used to take the first tier for either job: a per-character
 * tier cannot price speech-to-text (the cost came out as zero and the provider silently dropped off the chart), and a per-minute
 * transcription price was read as a synthesis price. For BOTH, text-to-speech now prefers a per-character tier and speech-to-text a
 * per-minute or per-second tier.
 */
export function tierFor(provider: Provider, useCase: CostUseCase): PricingTier | undefined {
    if (provider.type !== "BOTH") return provider.pricing[0];
    if (useCase === "TTS") return provider.pricing.find((t) => t.unitType === "char") ?? provider.pricing[0];
    return provider.pricing.find((t) => t.unitType === "min" || t.unitType === "sec");
}

/** Monthly cost in dollars of `hours` of audio a month on one tier; 0 when the tier's unit cannot price the job. */
export function monthlyCost(tier: PricingTier, useCase: CostUseCase, hours: number): number {
    if (!(hours > 0) || !Number.isFinite(hours) || !(tier.unit > 0)) return 0;
    if (useCase === "TTS") {
        if (tier.unitType === "char") return ((hours * CHARS_PER_HOUR) / tier.unit) * tier.price;
        if (tier.unitType === "sec") return ((hours * SECS_PER_HOUR) / tier.unit) * tier.price;
        if (tier.unitType === "min") return ((hours * MINS_PER_HOUR) / tier.unit) * tier.price;
        return 0;
    }
    if (tier.unitType === "min") return ((hours * MINS_PER_HOUR) / tier.unit) * tier.price;
    if (tier.unitType === "sec") return ((hours * SECS_PER_HOUR) / tier.unit) * tier.price;
    return 0;
}

/** One row per provider that can be priced for this job, cheapest first. Free open-source options are kept at $0. */
export function costRows(providers: readonly Provider[], useCase: CostUseCase, hours: number): CostRow[] {
    return providers
        .filter((p) => (p.type === useCase || p.type === "BOTH") && p.status !== "discontinued" && p.pricing.length > 0)
        .map((p): CostRow => {
            const tier = tierFor(p, useCase);
            const cost = tier ? monthlyCost(tier, useCase, hours) : 0;
            return { id: p.id, name: p.name, cost: Math.round(cost * 100) / 100, openSource: p.openSource ?? false, isNew: p.isNew ?? false };
        })
        .filter((row) => row.cost > 0 || row.openSource)
        .sort((a, b) => a.cost - b.cost);
}

/** Rows costing more than three times the 90th-percentile price are shown separately so one outlier does not flatten the chart. */
export function outlierCutoff(rows: readonly CostRow[]): number {
    const costs = rows.map((r) => r.cost).filter((c) => c > 0).sort((a, b) => a - b);
    if (costs.length === 0) return Infinity;
    return (costs[Math.floor(costs.length * 0.9)] as number) * 3;
}

export interface CostSummary {
    standard: CostRow[];
    outliers: CostRow[];
    cheapest: CostRow | undefined;
    mostExpensive: CostRow | undefined;
}

export function summarizeCosts(rows: readonly CostRow[]): CostSummary {
    const cutoff = outlierCutoff(rows);
    const standard = rows.filter((r) => r.cost <= cutoff);
    const outliers = rows.filter((r) => r.cost > cutoff);
    // The cheapest provider that actually charges: a free self-hosted option is not "the cheapest" to call out. Ties keep the first.
    const cheapest = standard.reduce<CostRow | undefined>(
        (best, r) => (r.cost > 0 && (best === undefined || r.cost < best.cost) ? r : best),
        undefined
    );
    return { standard, outliers, cheapest, mostExpensive: standard[standard.length - 1] };
}

/** The tooltip text for a bar: "N/A" when the value is not a number, "Free (self-hosted)" for zero, otherwise dollars a month. */
export function formatMonthlyCost(value: unknown): string {
    if (typeof value !== "number" || !Number.isFinite(value)) return "N/A";
    return value === 0 ? "Free (self-hosted)" : `$${value.toFixed(2)}/month`;
}

