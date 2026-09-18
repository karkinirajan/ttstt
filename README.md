# VoiceTech 2026 | Intelligence Radar

**Stop Guessing. Start Building with the Right Voice Tech.**

The only independent comparison platform for Text-to-Speech (TTS) and Speech-to-Text (STT). Real benchmarks, transparent pricing, and guided decision paths for your specific use case.

## 🚀 Features

-   **Interactive Leaderboard**: Visualize market leaders in Quality, Speed, Features, and Price using a comprehensive **Stacked Area Chart**.
-   **Recommendation Wizard**: Answer 3 simple questions (UseCase, Priority, Volume) to get a tailored tech stack recommendation.
-   **TCO Calculator**: Estimate your monthly costs with precision, handling complex pricing tiers (characters vs seconds) and high-cost providers.
-   **Comparison Matrix**: Deep-dive into feature-by-feature comparisons (Diarization, Cloning, Websockets, etc.) with sorting and filtering.
-   **Premium Aesthetic**: Built with a "dark mode first" design system using **Tailwind CSS v4** and **Geist Mono** typography for a technical, data-driven look.

## 🛠️ Tech Stack

-   **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
-   **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
-   **Icons**: [Lucide React](https://lucide.dev/)
-   **Charts**: [Recharts](https://recharts.org/)
-   **Animations**: [Framer Motion](https://www.framer.com/motion/)
-   **Font**: [Geist Mono](https://vercel.com/font)
-   **Language**: TypeScript

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
│   ├── layout/          # Header, Footer
│   ├── leaderboard/     # Stacked Area Chart
│   ├── matrix/          # Comparison Table
│   └── wizard/          # Recommendation Engine
├── data/
│   └── providers.ts     # Static Benchmark Data
└── lib/
    └── utils.ts         # Helper Functions
```

## ⚡ Getting Started

### Prerequisites

-   Node.js 18+
-   npm or pnpm

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

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is open-source and available under the MIT License.

---

**Developed by [Kneeraazon](https://kneeraazon.com)**
