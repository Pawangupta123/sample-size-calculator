import Link from 'next/link'
import {
  ArrowRight,
  BookOpenCheck,
  Calculator,
  Library,
  Share2,
  FileText,
  Moon,
  History,
  BarChart3,
  Check,
} from 'lucide-react'
import { SiteHeader } from '@/components/site-header'

const FEATURES: ReadonlyArray<{
  Icon: typeof Calculator
  title: string
  desc: string
  tone: 'primary' | 'violet' | 'accent'
}> = [
  {
    Icon: Calculator,
    title: '6 Study Designs',
    desc: 'RCT, cohort, case-control, cross-sectional, diagnostic, survival',
    tone: 'primary',
  },
  {
    Icon: FileText,
    title: 'Full Formula Trace',
    desc: 'Ethics-committee ready with step-by-step calculation breakdown',
    tone: 'primary',
  },
  {
    Icon: Share2,
    title: 'Shareable Results',
    desc: 'Send a link — recipient sees the exact same calculation',
    tone: 'accent',
  },
  {
    Icon: History,
    title: 'Local History',
    desc: 'Past 10 calculations saved in your browser, never on our servers',
    tone: 'violet',
  },
  {
    Icon: BarChart3,
    title: 'Power Curves',
    desc: 'Interactive charts — see how N changes with effect size and power',
    tone: 'accent',
  },
  {
    Icon: Moon,
    title: 'Dark Mode',
    desc: 'Easy on the eyes for late-night protocol writing',
    tone: 'violet',
  },
]

const TONE_CLASSES: Record<
  'primary' | 'violet' | 'accent',
  { wrap: string; icon: string }
> = {
  primary: {
    wrap: 'bg-[var(--primary-muted)]',
    icon: 'text-primary',
  },
  violet: {
    wrap: 'bg-violet-500/15 dark:bg-violet-400/10',
    icon: 'text-violet-500 dark:text-violet-300',
  },
  accent: {
    wrap: 'bg-[var(--accent-muted)]',
    icon: 'text-accent',
  },
}

const STATS: ReadonlyArray<{ label: string; value: string }> = [
  { value: '3', label: 'Free tools' },
  { value: '35M+', label: 'Indexed articles' },
  { value: '0', label: 'Signups required' },
]

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main>
        <section className="relative overflow-hidden px-4 pt-20 pb-24 sm:px-6 sm:pt-28 sm:pb-32">
          {/* Mesh gradient background */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
          >
            <div className="absolute -top-32 left-1/2 h-[620px] w-[620px] -translate-x-1/2 rounded-full bg-primary/25 opacity-50 blur-[100px] dark:opacity-40" />
            <div className="absolute -top-10 left-[10%] h-[380px] w-[380px] rounded-full bg-violet-400/30 opacity-40 blur-[90px] dark:bg-violet-500/30 dark:opacity-30" />
            <div className="absolute top-32 right-[10%] h-[360px] w-[360px] rounded-full bg-emerald-400/30 opacity-40 blur-[90px] dark:bg-emerald-500/25 dark:opacity-30" />
          </div>

          <div className="mx-auto max-w-4xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card/70 px-3.5 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground backdrop-blur">
              <span className="flex h-1.5 w-1.5 animate-pulse rounded-full bg-accent" />
              Free · Open Source · No Signup
            </span>

            <h1 className="mt-8 text-5xl font-bold leading-[1.02] tracking-tight sm:text-7xl">
              Research tools,
              <br />
              <span className="bg-gradient-to-r from-primary via-violet-500 to-emerald-500 bg-clip-text text-transparent">
                finally not boring.
              </span>
            </h1>

            <p className="mx-auto mt-7 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              Sample size calculator, literature search, and citation converter —
              built for clinical researchers. Everything runs in your browser.
              Nothing gets uploaded anywhere.
            </p>

            <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/calculator"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:bg-[var(--primary-hover)] hover:shadow-primary/35"
              >
                <Calculator className="h-4 w-4" />
                Start Calculating
                <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href="https://github.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-border bg-card/80 px-6 text-sm font-medium text-foreground backdrop-blur transition-all hover:bg-muted"
              >
                <svg viewBox="0 0 24 24" aria-hidden className="h-4 w-4" fill="currentColor">
                  <path d="M12 .297a12 12 0 00-3.79 23.388c.6.113.82-.26.82-.577 0-.285-.012-1.24-.017-2.25-3.338.725-4.042-1.415-4.042-1.415-.546-1.385-1.333-1.755-1.333-1.755-1.09-.745.083-.73.083-.73 1.205.085 1.84 1.24 1.84 1.24 1.07 1.835 2.807 1.305 3.492.998.108-.775.418-1.305.76-1.605-2.665-.305-5.467-1.335-5.467-5.93 0-1.31.468-2.38 1.235-3.22-.135-.305-.54-1.525.105-3.18 0 0 1.005-.325 3.3 1.23a11.5 11.5 0 016.005 0c2.29-1.555 3.295-1.23 3.295-1.23.65 1.655.24 2.875.12 3.18.77.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.43.37.815 1.105.815 2.22 0 1.605-.015 2.895-.015 3.285 0 .315.21.69.825.57A12 12 0 0012 .297z" />
                </svg>
                View on GitHub
              </a>
            </div>

            <div className="mx-auto mt-16 flex max-w-xl flex-wrap items-center justify-center divide-x divide-border">
              {STATS.map((s, i) => (
                <div key={s.label} className={i === 0 ? 'px-6' : 'px-6'}>
                  <p className="text-3xl font-bold tracking-tight sm:text-4xl">
                    {s.value}
                  </p>
                  <p className="mt-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                    {s.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t border-border px-4 py-16 sm:px-6 sm:py-20">
          <div className="mx-auto max-w-5xl">
            <div className="mb-10 text-center">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                The toolkit
              </p>
              <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
                Three tools. One workflow.
              </h2>
              <p className="mx-auto mt-3 max-w-lg text-sm text-muted-foreground">
                Calculate your sample size, find supporting literature, and
                format your references — without leaving the browser.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
              <ToolCard
                href="/calculator"
                icon={Calculator}
                title="Sample Size Calculator"
                desc="5-step wizard for RCTs, cohort, diagnostic, survival, and prevalence studies."
                accent="from-indigo-500 to-blue-500"
                chip="Core tool"
              />
              <ToolCard
                href="/tools/literature-search"
                icon={Library}
                title="Literature Search"
                desc="Search PubMed + Europe PMC together. Paste a protocol, get relevant articles."
                accent="from-violet-500 to-purple-500"
                chip="Research"
              />
              <ToolCard
                href="/tools/citation-converter"
                icon={BookOpenCheck}
                title="Citation Converter"
                desc="Paste DOIs, PMIDs, or raw references — get Vancouver-style citations."
                accent="from-emerald-500 to-teal-500"
                chip="Formatting"
              />
            </div>
          </div>
        </section>

        <section className="border-t border-border bg-muted/30 px-4 py-16 sm:px-6 sm:py-20">
          <div className="mx-auto max-w-5xl">
            <div className="mb-10 text-center">
              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
                Everything a clinical researcher needs
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                No signups, no paywalls, no tracking.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {FEATURES.map(({ Icon, title, desc, tone }) => {
                const { wrap, icon } = TONE_CLASSES[tone]
                return (
                  <div
                    key={title}
                    className="group rounded-2xl border border-border bg-card p-5 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
                  >
                    <span
                      className={`flex h-9 w-9 items-center justify-center rounded-lg ${wrap}`}
                    >
                      <Icon className={`h-4 w-4 ${icon}`} />
                    </span>
                    <h3 className="mt-4 text-sm font-semibold">{title}</h3>
                    <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                      {desc}
                    </p>
                  </div>
                )
              })}
            </div>

            <div className="mt-12 flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground">
              {['Open source', 'No tracking', 'Works offline after load', 'MIT license'].map(
                (item) => (
                  <span key={item} className="inline-flex items-center gap-1.5">
                    <Check className="h-3 w-3 text-accent" />
                    {item}
                  </span>
                )
              )}
            </div>
          </div>
        </section>

        <footer className="border-t border-border px-4 py-10 text-center text-xs text-muted-foreground sm:px-6">
          <p>
            SampleCalc is open source under the MIT license. Built for clinical
            researchers, by researchers.
          </p>
          <p className="mt-2">
            Not a substitute for biostatistical review. Always consult a
            qualified statistician before protocol submission.
          </p>
        </footer>
      </main>
    </>
  )
}

interface ToolCardProps {
  href: string
  icon: typeof Calculator
  title: string
  desc: string
  accent: string
  chip: string
}

function ToolCard({ href, icon: Icon, title, desc, accent, chip }: ToolCardProps) {
  return (
    <Link
      href={href}
      className="group relative flex flex-col gap-4 overflow-hidden rounded-2xl border border-border bg-card p-6 transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg"
    >
      <div
        aria-hidden
        className={`absolute -top-14 -right-14 h-32 w-32 rounded-full bg-gradient-to-br ${accent} opacity-10 blur-2xl transition-opacity group-hover:opacity-25`}
      />
      <div className="flex items-center justify-between">
        <span
          className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${accent} text-white shadow-lg`}
        >
          <Icon className="h-5 w-5" />
        </span>
        <span className="rounded-full border border-border bg-muted/60 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          {chip}
        </span>
      </div>
      <div>
        <h3 className="text-base font-semibold">{title}</h3>
        <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
          {desc}
        </p>
      </div>
      <span className="mt-auto inline-flex items-center gap-1 text-xs font-medium text-primary transition-[gap] group-hover:gap-2">
        Open tool
        <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
      </span>
    </Link>
  )
}
