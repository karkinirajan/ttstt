# 03. Testing

```bash
npm test                 # 215 tests, about a second
npm run test:coverage    # the same, with a coverage report over src/lib and src/data
npm run check            # type-check, lint (zero warnings), tests
```

## Layout

```text
test/
  pricing.test.ts           the cost arithmetic, the tier rule, the rows, the outliers, the tooltip text, and the real data
  recommend.test.ts         the wizard's scoring and ranking, every combination of answers on the real data
  providers.test.ts         the data file itself: unique ids, https links, sane prices and scores, no discontinued provider recommended
  security-headers.test.ts  the policy and the headers
  mutation/                 the mutation driver and its list
```

All tests are plain Vitest in a Node environment: no browser, no network. The data tests run against the real `providers.ts`, so a bad
edit to the data (a negative price, a `http:` link, a duplicate id, a benchmark outside 1 to 5) fails the build.

## Coverage

Over `src/lib` (except the one-line `cn` helper) and `src/data`: statements 100%, branches 100%, functions 100%, lines 100%. The
components are **not** covered: there is no component or browser test in the repository. They were checked by hand in a real browser (below).

## Mutation checks

`test/mutation/mutants.py` holds 108 deliberate bugs, each `(name, file, old text, new text)`: a unit confused (minutes for seconds), a
threshold shifted (`>=` to `>`), a guard dropped, a header weakened. The driver applies one at a time and counts it **killed** if the
tests then fail. All 108 are killed. (The first run left 9 survivors: 5 missing assertions, which are now tests (the cutoff boundary in both directions, the
per-character tier when a per-minute one is listed first, an open-source provider with no tiers, the most expensive provider);
2 pieces of code that were redundant or fragile and were rewritten (a guard for "no tiers" that the next line already
covered, and the cheapest-provider search); and 2 true equivalents, listed at the top of the file.)

```bash
python3 test/mutation/mutate.py test/mutation/mutants.py -- npx vitest run
```

Rules: the suite must be green first (the driver checks); do not edit the tree while it runs; each pattern must occur exactly once.

## Checked in a real browser

`next start` on the built site, headless Chromium, with the operating system set to dark and to light, at 1280 px and 390 px:
the calculator in both modes (text-to-speech and speech-to-text, the volume slider, the summary line), the wizard through to its
result and back, the comparison page, no horizontal overflow on a phone, the first keyboard stop is the skip link, and no console errors
or CSP violations. Screenshots of both colour settings are what exposed the light-mode problem described in
[01 Architecture](01-architecture.md). Not checked: browsers other than Chromium; the tooltip on hover; the deployed site.
