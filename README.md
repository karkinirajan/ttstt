# VoiceTech 2026 | Intelligence Radar

**Stop Guessing. Start Building with the Right Voice Tech.**

The only independent comparison platform for Text-to-Speech (TTS) and Speech-to-Text (STT). Real benchmarks, transparent pricing, and guided decision paths for your specific use case.

## 🚀 Features

-   **Interactive Leaderboard**: Visualize market leaders in Quality, Speed, Features, and Price using a comprehensive **Stacked Area Chart**.
-   **Recommendation Wizard**: Answer 3 simple questions (UseCase, Priority, Volume) to get a tailored tech stack recommendation.
-   **TCO Calculator**: Estimate your monthly costs with precision, handling complex pricing tiers (characters vs seconds) and high-cost providers.
-   **Comparison Matrix**: Deep-dive into feature-by-feature comparisons (Diarization, Cloning, Websockets, etc.) with sorting and filtering.
-   **Premium Aesthetic**: A dark-only design system built with **Tailwind CSS v4**, using Outfit, Plus Jakarta Sans and JetBrains Mono for a technical, data-driven look.

## 🛠️ Tech Stack

-   **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
-   **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
-   **Icons**: [Lucide React](https://lucide.dev/)
-   **Charts**: [Recharts](https://recharts.org/)
-   **Animations**: CSS keyframes (`globals.css`)
-   **Fonts**: Outfit, Plus Jakarta Sans, JetBrains Mono through `next/font`
-   **Language**: TypeScript 6
-   **Tests**: [Vitest](https://vitest.dev/) (215 tests, 108 mutation checks)

## 📂 Project Structure

```bash
src/
├── app/
│   ├── calculator/      # TCO Calculator Page
│   ├── compare/         # Comparison Matrix Page
│   ├── globals.css      # Global Styles (Tailwind @theme variables)
│   ├── layout.tsx       # Root Layout (Fonts, Metadata)
│   └── page.tsx         # Home Page (Hero, Leaderboard, Wizard)
├── components/
│   ├── calculator/      # TCO Chart & Logic
│   ├── icons/           # Brand icon
│   ├── layout/          # Header, Footer
│   ├── leaderboard/     # Stacked Area Chart
│   ├── matrix/          # Comparison Table
│   └── wizard/          # Recommendation Engine (UI)
├── data/
│   └── providers.ts     # Static Benchmark Data
├── hooks/               # useIsClient
└── lib/
    ├── pricing.ts       # Monthly-cost arithmetic and the calculator's rows
    ├── recommend.ts     # The wizard's scoring and ranking
    ├── security-headers.ts  # CSP and the other response headers
    └── utils.ts         # Helper Functions
test/                    # Vitest tests and test/mutation (the mutation driver and its list)
docs/                    # Architecture, security, testing, operations
```

## ⚡ Getting Started

### Prerequisites

-   Node.js 24 or newer (`.nvmrc` says 26)
-   npm

### Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/kneeraazon404/ttstt.git
    cd ttstt
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

3.  Run the development server:
    ```bash
    npm run dev
    ```

4.  Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🏗️ Build for Production

To create an optimized production build:

```bash
npm run build
npm start
```

## 🧪 Checks

```bash
npm run check           # type-check, lint (zero warnings), tests
npm run test:coverage   # tests with a coverage report
npm run ci              # check + build
```

## 📚 Documentation

| Chapter | Covers |
|---|---|
| [01 Architecture](docs/01-architecture.md) | How the data flows to the pages, where the logic lives, the pricing-tier fix, the dark-only theme |
| [02 Security](docs/02-security.md) | What was looked at, the response headers, what is left |
| [03 Testing](docs/03-testing.md) | The suites, coverage, the mutation checks, what was checked in a browser |
| [04 Operations](docs/04-operations.md) | Commands, deploying, how to edit the data |
| [VERSIONS.md](VERSIONS.md) | What it runs on and why |
| [work-done.md](work-done.md) | What was there and what changed, file by file |

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is open-source and available under the MIT License.

---

**Developed by [Kneeraazon](https://kneeraazon.com)**
