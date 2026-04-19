# SampleCalc

> Free, open-source clinical sample size calculator for modern researchers.

A step-by-step Next.js calculator that helps clinicians and medical researchers determine the required sample size for their studies — with full formula breakdowns, example presets, shareable results, and PDF export. No signup, no tracking, zero friction.

## Features

- **6 study designs** — RCT, cohort, case-control, cross-sectional, diagnostic accuracy, survival / time-to-event
- **Step-by-step wizard** — 5 guided steps from study design → results
- **Full formula trace** — every step visible, ethics-committee ready
- **Preset scenarios** — one-click realistic examples (hypertension RCT, diagnostic validation, vaccine trial, etc.)
- **Local history** — last 10 calculations saved in browser (never on any server)
- **Shareable URL** — encode state into URL and share the exact calculation
- **PDF export** — branded, ready-to-print report including methods paragraph
- **Methods paragraph** — copy-ready citation text for your protocol
- **What-if scenarios** — see N at 80/90/95% power + interactive effect-size curve
- **Dark mode** — system-aware with manual override

## Supported formulas

| Outcome | Formula | Reference |
|---|---|---|
| Continuous | `N = 2 × [(Zα + Zβ) / (Δ/σ)]²` | Standard t-test |
| Binary | Pooled proportion | Fleiss |
| Survival / Time-to-event | `events = (Zα+Zβ)² / (lnHR)²` | Schoenfeld |
| Prevalence | `N = Z²×P(1−P) / e²` | Wald |
| Diagnostic Sensitivity / Specificity | `N = Z²α × p(1−p) / precision²` | Buderer (1996) |
| AUC / ROC | Variance-weighted normal approximation | Hanley-McNeil |

Adjustments applied as appropriate: dropout inflation, cluster Design Effect (DEFF), multiple endpoints, interim analyses, allocation ratio.

## Tech stack

- [Next.js 16](https://nextjs.org) (App Router + Turbopack)
- [React 19](https://react.dev)
- [TypeScript 5](https://typescriptlang.org)
- [Tailwind CSS v4](https://tailwindcss.com)
- [next-themes](https://github.com/pacocoursey/next-themes) — dark mode
- [Recharts](https://recharts.org) — effect-size curves
- [jsPDF](https://github.com/parallax/jsPDF) — client-side PDF export
- [Lucide React](https://lucide.dev) — icons

## Quick start

```bash
git clone https://github.com/YOUR_USERNAME/sample-size-calculator.git
cd sample-size-calculator

npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deploy

One-click deploy to Vercel:

```bash
npm i -g vercel
vercel
```

Or push to GitHub and import in the [Vercel dashboard](https://vercel.com/new).

## Project structure

```
src/
├── app/
│   ├── layout.tsx                    # Root layout with ThemeProvider
│   ├── page.tsx                      # Landing page
│   ├── calculator/page.tsx           # Calculator wizard page
│   └── globals.css                   # Design tokens (CSS vars)
├── components/
│   ├── theme-provider.tsx
│   ├── theme-toggle.tsx              # Light/System/Dark toggle
│   ├── site-header.tsx
│   ├── ui/                           # Button, Card, PillGroup, TypeCard, NumberField, Tooltip, Callout, SectionLabel
│   └── calculator/
│       ├── CalculatorWizard.tsx      # Step orchestrator
│       ├── PresetsPanel.tsx          # Example study presets
│       ├── HistoryPanel.tsx          # Past 10 calculations
│       ├── ScenarioExplorer.tsx      # Power table + effect-size chart
│       ├── stepper/                  # StepperNav + ProgressBar
│       ├── steps/                    # 5 step components
│       └── param-cards/              # 6 conditional parameter cards
└── lib/
    ├── utils.ts
    └── calculator/
        ├── types/
        ├── constants/
        ├── utils/
        │   ├── formulas/             # 5 outcome-specific pure functions
        │   ├── zValues.ts
        │   ├── adjustments.ts
        │   ├── calculate.ts          # Main orchestrator
        │   ├── citations.ts          # Methods paragraph
        │   ├── pdfExport.ts
        │   ├── shareLink.ts
        │   └── scenarios.ts
        ├── hooks/
        └── context/
```

## Design philosophy

- **Zero server state** — Everything runs in the browser. Your study assumptions never leave your device.
- **Pure functions** — All statistical calculations live in `src/lib/calculator/utils/` as framework-agnostic TypeScript. You could drop them into any JS project.
- **Formula transparency** — The result always shows the exact formula, substituted values, and intermediate steps.
- **Separation of concerns** — UI components only render JSX. Logic lives in hooks and pure utils. Types are isolated.

## Disclaimer

> SampleCalc is a decision-support tool, not a substitute for biostatistical expertise. Always have a qualified statistician review your sample size justification before submission to an ethics committee or journal.

## Contributing

PRs welcome. Especially for:
- Additional formulas (Fleiss kappa, McNemar for matched pairs, Fisher exact for small N)
- More preset scenarios
- Locale translations
- Accessibility improvements

## License

MIT
