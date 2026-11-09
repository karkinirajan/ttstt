# Work done

What this repository was, what was changed, and what still needs a person. Branch: `chore/modernize` (local, nothing pushed).
Start point: `fd54725`.

## At a glance

- **Was:** a small static Next.js 16 site that compares text-to-speech and speech-to-text providers (a leaderboard, a recommendation
  wizard, a monthly-cost calculator, a comparison matrix). It had no tests, no CI, no security headers and no `engines`, and a README that
  no longer matched the code. It had no secrets and no server code, so the problems were of correctness and presentation rather than
  exposure: **the calculator silently left OpenAI, Google and Azure off its speech-to-text chart** (it priced every provider by its *first*
  pricing tier, which for those three is per character, and a per-character tier cannot price transcription, so the cost came out as zero
  and the row was dropped); **on a light operating-system setting every panel was unreadable** (light text on translucent grey, because the
  colour tokens followed the OS while the panels are drawn for a dark page); the wizard set React state from inside a state updater; and an
  unused dependency (`framer-motion`) was still installed.
- **Now:** the pricing arithmetic and the wizard's scoring are plain functions with tests; the speech-to-text chart lists all the providers
  that can be priced; the site renders the same readable dark design on any OS setting; a CSP and the other security headers are sent;
  215 tests, 108 deliberate bugs that the suite fails for, 100% coverage of the logic and data; every dependency on its latest release
  (TypeScript held at 6.0.3, see [VERSIONS.md](VERSIONS.md)) with `npm audit` at 0; CI; README corrected and extended, `VERSIONS.md` and
  four docs chapters added.
- **Needs a person:** push, and keep the provider data honest (prices and scores are the owner's research and were **not** re-verified).
  See [What a person might want to do](#what-a-person-might-want-to-do).

## Verified

Run on the final tree, 2026-11-10:

| Gate | Command | Result |
|---|---|---|
| Types | `npm run type-check` | pass |
| Lint | `npm run lint` | pass, 0 errors and 0 warnings (`--max-warnings 0`) |
| Tests | `npm test` | 215 passed, 4 files |
| Coverage | `npm run test:coverage` | over `src/lib` (except `utils.ts`) and `src/data`: statements, branches, functions and lines all 100%. The components have no unit tests |
| Mutation | `test/mutation/mutate.py` | 108 of 108 killed, on a green baseline (a first run left 9 survivors: 5 missing assertions added, 2 redundant or fragile pieces of code rewritten, 2 true equivalents listed) |
| Build | `npm run build` | pass |
| Audit | `npm audit` | 0 vulnerabilities (0 at the start) |
| Real server | `next start`, `curl` | all seven security headers present, no `X-Powered-By` |
| Real browser | Chromium on the built site, OS set to dark and to light, 1280 px and 390 px | calculator (both jobs, the slider, the summary): speech-to-text now charts OpenAI, Google Cloud Speech and Azure AI Speech; wizard through its result and back; comparison page; no horizontal overflow on a phone; first keyboard stop is the skip link; every `target="_blank"` link has `noopener`; **no console errors or CSP violations on any page; the only origin contacted was the site's own**; the light-setting screenshots exposed the light-mode defect and the final ones match the dark design |
| Secrets | pattern scan of the tree and all 10 commits | none found (a pattern scan, counts only; `.env*` files were not read, and none was ever tracked; not a guarantee) |
| Formatting | | no formatter is configured |

**Not verified:** the provider data itself (prices, benchmark scores, ELO and compliance claims) against the providers' sites; browsers other
than Chromium; chart tooltips on hover; the deployed site; the leaderboard chart and home page were loaded without errors but not
compared against a design.

## Findings and fixes

| Finding | Fix |
|---|---|
| **Calculator priced every provider by its first tier**: OpenAI, Google and Azure (first tier per character) came out at $0 for speech-to-text and vanished from the chart; a per-minute transcription price could be read as a synthesis price | `tierFor` picks a per-character tier for text-to-speech and a per-minute or per-second tier for speech-to-text (a `BOTH` provider); three providers are added to the speech-to-text chart; tests run on the real data |
| **Light OS setting: unreadable panels** (tokens followed `prefers-color-scheme`; the panels, header and `.glass` are dark; `<html class="dark">` was already set) | The dark tokens are the only set, `color-scheme: dark`, one `theme-color`; checked in the browser under both OS settings |
| Wizard computed its result and set a second piece of state inside the updater passed to `setState` (React may run updaters twice) | The result is derived from the answers with `useMemo`; the scoring is in `lib/recommend.ts` |
| No CSP, HSTS, framing or sniffing protection; `X-Powered-By` sent | `lib/security-headers.ts` and `next.config.ts` (see [docs/02-security.md](docs/02-security.md)); `poweredByHeader: false` |
| Unused `framer-motion` dependency; README listed it, "Geist Mono" (the fonts are Outfit, Plus Jakarta Sans and JetBrains Mono) and "Node 18+" | Dependency removed (nothing imported it); README corrected |
| `.gitignore` ignored the whole `.github` folder, so no workflow could be committed | The line was removed (restore it if that was deliberate) |
| `recharts` 3.10's stricter tooltip typing rejected the two inline formatters | One `formatMonthlyCost(value: unknown)` helper, tested |
| Lint would have warned about the generated `coverage/` folder | Ignored in `eslint.config.mjs` |

## Changes, file by file

### Source

| File | Was | Now |
|---|---|---|
| `src/lib/pricing.ts` (new) | cost arithmetic inside `TCOCalculator.tsx`, first tier for every job | `tierFor`, `monthlyCost`, `costRows`, `outlierCutoff`, `summarizeCosts`, `formatMonthlyCost` |
| `src/lib/recommend.ts` (new) | scoring inside `RecommendationWizard.tsx` | `scoreProvider`, `recommend` |
| `src/lib/security-headers.ts` (new) | none | The policy and the headers |
| `src/components/calculator/TCOCalculator.tsx` | arithmetic and constants inline | Calls `lib/pricing`; same markup |
| `src/components/wizard/RecommendationWizard.tsx` | result in state, set inside an updater | Result derived with `useMemo`; same markup |
| `src/app/globals.css`, `src/app/layout.tsx` | tokens switched on the OS setting; two `theme-color`s | Dark tokens only; `color-scheme: dark`; one `theme-color` |
| `next.config.ts` | empty | Headers, `poweredByHeader: false` |

### Configuration and tooling

| File | Was | Now |
|---|---|---|
| `package.json` | older ranges, exact React pin, no tests, no `engines`, `framer-motion` | See [VERSIONS.md](VERSIONS.md); `engines.node >=24`; scripts `type-check`, `test`, `test:watch`, `test:coverage`, `check`, `ci`; `lint` with `--max-warnings 0`; `minimatch` override |
| `package-lock.json` | | Regenerated |
| `.nvmrc` (new) | | `26` |
| `eslint.config.mjs` | | Also ignores `coverage/` |
| `.gitignore` | ignored `.github` | no longer does |
| `vitest.config.ts` (new) | | Node environment, `@` alias, coverage over `src/lib` and `src/data` |
| `.github/workflows/ci.yml` (new) | none | Node 24 and 26: type-check, lint, tests with coverage, build, `npm audit` |
| `test/` (new) | none | 4 test files and `test/mutation/` (driver, 108 mutants) |

### Docs

`README.md` extended (Node version, fonts, animations, structure, checks, a docs table; the rest of the owner's text is unchanged).
`VERSIONS.md`, `docs/01` to `04` and this file are new.

## What a person might want to do

1. **Push** when satisfied: `git push -u origin chore/modernize` (not done here).
2. **Re-check the provider data** before relying on it: prices, ELO, WER and compliance claims are the owner's research (several entries
   cite a check date) and nothing here verified them. The tests only check their shape.
3. **Add a `LICENSE` file** if the code is meant to be reused: the README says MIT but the repository has none.
4. **The site is now dark-only.** If a light theme is wanted, the panels (`.glass`, the header, the cards) need light variants first.
5. If ignoring `.github` was deliberate (for example a push token without the `workflow` scope), put the line back in `.gitignore` and add the
   workflow some other way.

## Known and left alone

- The CSP allows `'unsafe-inline'` scripts and styles (Next.js inline scripts have no nonce). There is no user input or stored content.
- The components, the leaderboard and the matrix have no unit tests; only the behaviour listed above was exercised in a browser.
- TypeScript 7 (the linter does not support it yet); Prettier is not configured, so no formatting was changed.
