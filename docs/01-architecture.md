# 01. Architecture

A static comparison site: no database, no API routes, no server-side secrets. Every page is rendered from one data file.

```text
src/data/providers.ts   the facts: 23 providers, their pricing tiers, benchmark scores, links
        │
        ├── src/lib/pricing.ts       monthly cost of a tier (calculator)             ──► components/calculator
        ├── src/lib/recommend.ts     scoring for the wizard                          ──► components/wizard
        └── (read directly)          leaderboard chart, comparison matrix            ──► components/leaderboard, matrix
src/lib/security-headers.ts   the response headers   ──► next.config.ts
```

## Pages

| Route | Shows |
|---|---|
| `/` | Hero, the leaderboard (a stacked-area chart of the scored providers) and the recommendation wizard |
| `/calculator` | The monthly-cost chart for a chosen volume (text-to-speech or speech-to-text) |
| `/compare` | The comparison matrix |

## Where the logic lives

Before this pass the pricing arithmetic and the wizard's scoring were written inside the components and could be checked only by clicking.
They are plain functions in `src/lib` now, with tests; the components call them.

- **`pricing.ts`**: `tierFor(provider, job)` picks the price tier that can price the job; `monthlyCost(tier, job, hours)` does the
  arithmetic; `costRows` builds the chart's rows; `summarizeCosts` separates very expensive outliers (more than three times the 90th
  percentile) and names the cheapest paid and most expensive provider; `formatMonthlyCost` is the tooltip text.
- **`recommend.ts`**: `scoreProvider(provider, answers)` and `recommend(providers, answers)`; the wizard derives its result from its
  answers with `useMemo` instead of storing it in state from inside an updater.
- **`security-headers.ts`**: the Content-Security-Policy and the other headers; `next.config.ts` applies them to every route.

## The tier rule (a bug fixed here)

A provider that does both jobs lists tiers for both (a per-character text-to-speech tier, a per-minute transcription tier). The
calculator used the **first** tier for either job, so for OpenAI, Google and Azure (whose first tier is per character) speech-to-text cost
came out as zero and the provider silently dropped off the chart; a per-minute transcription price could also be read as a synthesis
price. `tierFor` now takes a per-character tier for text-to-speech and a per-minute or per-second tier for speech-to-text. On the real
data this adds three providers to the speech-to-text chart.

## Styling

Tailwind v4 with tokens in `globals.css`. The site is **dark-only**: `<html class="dark">` was already set and every panel (`.glass`,
the header, the cards) is drawn for a dark page. The tokens used to switch to a light set on a light operating-system setting, which
put light text on translucent grey panels (barely readable); the dark set is now the only one, and `color-scheme: dark` is declared.
