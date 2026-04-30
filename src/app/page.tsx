import Link from 'next/link'
import {
  ArrowRight,
  BookOpenCheck,
  Calculator,
  FileEdit,
  FlaskConical,
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
  { value: '5', label: 'Free tools' },
  { value: '250M+', label: 'Indexed articles' },
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
              Five browser-only tools for clinical researchers — calculate sample
              size, search articles, draft literature reviews, generate thesis
              protocols, and format citations. No signup, no upload.
            </p>

            <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/calculator"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:bg-[var(--primary-hover)] hover:shadow-primary/35"
              >
                <Calculator className="h-4 w-4" />
                Calculate Sample Size
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/tools/literature-search"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-border bg-card/80 px-6 text-sm font-medium text-foreground backdrop-blur transition-all hover:bg-muted"
              >
                <Library className="h-4 w-4" />
                Search Articles
              </Link>
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
                The research workflow
              </p>
              <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
                From protocol to paper, in four tools.
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground">
                Start with sample size. Search the literature. Generate your protocol.
                Draft your Review of Literature. Format citations. Everything talks to each other.
              </p>
            </div>

            {/* Steps 1–4 */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              <ToolCard
                href="/calculator"
                icon={Calculator}
                title="Calculate Sample Size"
                desc="Get the right N for RCTs, cohort, diagnostic, survival & prevalence studies — with full formula trace."
                accent="from-indigo-500 to-blue-500"
                chip="Step 1"
                ctaLabel="Open calculator"
              />
              <ToolCard
                href="/tools/literature-search"
                icon={Library}
                title="Search Research Articles"
                desc="Search 250M+ articles across PubMed, Europe PMC & OpenAlex. PICO builder, MeSH terms, free PDFs."
                accent="from-violet-500 to-purple-500"
                chip="Step 2"
                ctaLabel="Search articles"
              />
              <ToolCard
                href="/tools/literature-review"
                icon={FileEdit}
                title="Draft Review of Literature"
                desc="Turn your saved articles into a ready-to-edit Review of Literature — 3 styles, Word .docx export."
                accent="from-fuchsia-500 to-pink-500"
                chip="Step 3"
                ctaLabel="Draft review"
              />
              <ToolCard
                href="/tools/citation-converter"
                icon={BookOpenCheck}
                title="Format Citations"
                desc="Paste DOIs, PMIDs, or raw references — get numbered Vancouver-style citations. Batch-ready."
                accent="from-emerald-500 to-teal-500"
                chip="Step 4"
                ctaLabel="Format citations"
              />
            </div>

            {/* Protocol Generator — featured card */}
            <div className="mt-5 overflow-hidden rounded-2xl border border-violet-200 bg-gradient-to-r from-violet-50 to-purple-50 p-1 dark:border-violet-800/40 dark:from-violet-900/20 dark:to-purple-900/20">
              <Link href="/tools/protocol-generator"
                className="group flex flex-col items-start gap-4 rounded-xl p-5 transition-colors hover:bg-white/50 dark:hover:bg-white/5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-4">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-lg">
                    <FlaskConical className="h-6 w-6" />
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-foreground">Thesis Protocol Generator</h3>
                      <span className="rounded-full bg-accent px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-accent-foreground">
                        New
                      </span>
                    </div>
                    <p className="mt-1 max-w-lg text-sm text-muted-foreground">
                      Generate a complete ICMR-format thesis protocol — real PubMed references,
                      methodology templates, data collection form, and consent forms in{' '}
                      <strong className="font-semibold text-foreground">English &amp; Hindi</strong>.
                      Download as Word .docx. No AI required.
                    </p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {['RCT · Cohort · Cross-sectional', 'Sample size formula', 'Vancouver references + PubMed links', 'Hindi consent form', 'ICMR format'].map((tag) => (
                        <span key={tag} className="rounded-full border border-violet-200 bg-white px-2 py-0.5 text-[10px] font-medium text-violet-700 dark:border-violet-700 dark:bg-violet-900/30 dark:text-violet-300">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow transition-all group-hover:bg-violet-700 group-hover:shadow-lg">
                  Generate Protocol
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </span>
              </Link>
            </div>

            <div className="mt-8 rounded-2xl border border-dashed border-border bg-muted/30 p-5">
              <p className="text-center text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                Tools that talk to each other
              </p>
              <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs">
                <span className="rounded-full border border-border bg-card px-3 py-1 font-medium">1. Calculate N</span>
                <ArrowRight className="h-3 w-3 text-muted-foreground" />
                <span className="rounded-full border border-border bg-card px-3 py-1 font-medium">2. Save articles</span>
                <ArrowRight className="h-3 w-3 text-muted-foreground" />
                <span className="rounded-full border border-border bg-card px-3 py-1 font-medium">3. Generate protocol</span>
                <ArrowRight className="h-3 w-3 text-muted-foreground" />
                <span className="rounded-full border border-border bg-card px-3 py-1 font-medium">4. Draft RoL</span>
                <ArrowRight className="h-3 w-3 text-muted-foreground" />
                <span className="rounded-full border border-border bg-card px-3 py-1 font-medium">5. Vancouver cite</span>
              </div>
              <p className="mt-4 text-center text-[11px] leading-relaxed text-muted-foreground">
                Search articles → bulk select → import directly to Protocol Generator or RoL Draft.
                &ldquo;Cite this&rdquo; buttons jump to Citations with IDs pre-filled.
              </p>
            </div>
          </div>
        </section>

        <section className="border-t border-border bg-muted/30 px-4 py-16 sm:px-6 sm:py-20">
          <div className="mx-auto max-w-5xl">
            <div className="mb-10 text-center">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                What you get across every tool
              </p>
              <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
                Built for speed and protocol submissions
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
  ctaLabel?: string
}

function ToolCard({
  href,
  icon: Icon,
  title,
  desc,
  accent,
  chip,
  ctaLabel = 'Open tool',
}: ToolCardProps) {
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
        {ctaLabel}
        <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
      </span>
    </Link>
  )
}
