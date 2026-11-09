# Versions

What this project runs on, and why, as of 2026-11-10. Everything below was read from the lockfile, `node_modules` or the npm
registry on that day; nothing is quoted from memory.

## Runtime

| | Version | Notes |
|---|---|---|
| Node.js | **26** (`.nvmrc`); `engines.node >=24` | 26 is the current LTS, 24 the oldest supported. The README said "18+". CI runs 24 and 26. |

## Application

| Package | Installed | Was | Range now |
|---|---|---|---|
| next | 16.4.5 | 16.2.3 | `^16.4.5` |
| react / react-dom | 19.3.1 | 19.2.3 (exact) | `^19.3.1` |
| recharts | 3.10.1 | 3.7.0 | `^3.10.1`. Its tooltip formatter types are stricter now; see [docs/01-architecture.md](docs/01-architecture.md). |
| lucide-react | 1.70.0 | 0.563.0 | `^1.70.0` (the icons used are generic ones that 1.x keeps) |
| tailwindcss, @tailwindcss/postcss | 4.3.5 | 4.1.18 | `^4.3.5` |
| tailwind-merge | 3.7.0 | 3.4.0 | `^3.7.0` |
| clsx | 2.1.1 | 2.1.1 | latest |
| ~~framer-motion~~ | removed | 12.33.0 | Nothing in the code, the config or the styles imported it (the animations are CSS keyframes in `globals.css`). |

## Tooling

| Package | Installed | Was | Why |
|---|---|---|---|
| typescript | **6.0.3** | 5.9.3 | `~6.0.3`. 7.0.2 exists, but `typescript-eslint` (inside `eslint-config-next`) supports `<6.1`. |
| eslint | **10.14.0** | 9.39.2 | Latest. |
| eslint-config-next | 16.4.5 | 16.1.4 | Matches Next. |
| @types/node | 24.x | 20.x | The oldest supported Node (24). |
| @types/react, @types/react-dom | 19.3.0 | 19.2.x | Latest. |
| **vitest**, **@vitest/coverage-v8** | 5.1.0 | (new) | Tests. The two must match each other. |

## Changes made in this pass

- Every package moved to its latest release except TypeScript (see above); `npm audit` was already clean at the start and is at 0.
  The `overrides` entry `minimatch ^11.0.5` keeps it there (the same override the other projects in this series needed).
- `engines.node >=24` and `.nvmrc` (`26`); scripts `type-check`, `test`, `test:watch`, `test:coverage`, `check`, `ci` added; `lint` now
  runs with `--max-warnings 0`.
- `framer-motion` removed (unused). The README still listed it; the line now says what the animations really are.

## Left alone

Nothing the registry offered was held back, except TypeScript 7. Re-check with `npm outdated` when touching dependencies. The provider
data (prices, scores) is the owner's own research and was **not** re-verified against the providers' sites.
