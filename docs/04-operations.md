# 04. Operations

## Running

| Command | Does |
|---|---|
| `npm run dev` | Development server on port 3000 |
| `npm run build` then `npm start` | Production build and server |
| `npm run check` | Type-check, lint (zero warnings), tests |
| `npm run ci` | `check` plus the build |
| `npm run test:coverage` | Tests with a coverage report |

Node 24 or newer (`.nvmrc` says 26).

## Deploying

The site is static apart from the response headers, so any host for a Next.js app works (it was set up for Vercel; the metadata points
at `ttstt.vercel.app`). **No environment variable is needed.**

## Updating the data

Edit `src/data/providers.ts`. `npm test` checks the shape (unique id, `https:` links, non-negative prices, benchmark scores from 1 to 5,
a price tier or a note for every active provider). Two rules to remember:

- **A provider that does both jobs** (`type: 'BOTH'`) should list a `char` tier for text-to-speech and a `min` or `sec` tier for
  speech-to-text, or it will be missing from the chart that has no matching tier.
- **A provider with no `benchmarks`** is listed in the comparison matrix but is neither ranked on the leaderboard nor recommended.

## CI

`.github/workflows/ci.yml` runs on every push and pull request to `main`, on Node 24 and 26: install, type-check, lint, tests with
coverage, build, `npm audit`. The repository's `.gitignore` used to ignore the whole `.github` folder; that line was removed so the
workflow is tracked.
