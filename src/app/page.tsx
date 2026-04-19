import Link from 'next/link'
import { ArrowRight, Calculator, Share2, FileText, Moon, History, BarChart3 } from 'lucide-react'
import { SiteHeader } from '@/components/site-header'

const FEATURES = [
  {
    Icon: Calculator,
    title: '6 Study Designs',
    desc: 'RCT, cohort, case-control, cross-sectional, diagnostic accuracy, survival',
  },
  {
    Icon: FileText,
    title: 'Full Formula Trace',
    desc: 'Ethics-committee ready with step-by-step calculation breakdown',
  },
  {
    Icon: Share2,
    title: 'Shareable Results',
    desc: 'Send a link — recipient sees the exact same calculation',
  },
  {
    Icon: History,
    title: 'Local History',
    desc: 'Past 10 calculations saved in your browser, never on our servers',
  },
  {
    Icon: BarChart3,
    title: 'Power Curves',
    desc: 'Interactive charts — see how N changes with effect size and power',
  },
  {
    Icon: Moon,
    title: 'Dark Mode',
    desc: 'Easy on the eyes for late-night protocol writing',
  },
]

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main>
        <section className="relative overflow-hidden px-4 pt-16 pb-20 sm:px-6 sm:pt-24 sm:pb-28">
          <div
            aria-hidden
            className="absolute -top-40 left-1/2 -z-10 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-[var(--primary-muted)] opacity-60 blur-3xl"
          />
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1 text-[11px] font-medium uppercase tracking-[0.15em] text-muted-foreground">
              <span className="flex h-1.5 w-1.5 rounded-full bg-accent" />
              Free · Open Source · No Signup
            </span>
            <h1 className="mt-6 text-4xl font-bold leading-[1.1] tracking-tight sm:text-6xl">
              Clinical sample size,{' '}
              <span className="bg-gradient-to-r from-primary to-[var(--primary-hover)] bg-clip-text text-transparent">
                calculated right.
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              A step-by-step calculator for clinical researchers. Get a
              justified sample size with full formula breakdown — ready for
              your protocol or journal submission.
            </p>
            <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/calculator"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-primary px-6 text-base font-medium text-primary-foreground shadow-sm shadow-primary/20 transition-all hover:bg-[var(--primary-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                <Calculator className="h-4 w-4" />
                Start Calculating
                <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href="https://github.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-border bg-card px-6 text-base font-medium text-foreground transition-all hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                <svg viewBox="0 0 24 24" aria-hidden className="h-4 w-4" fill="currentColor">
                  <path d="M12 .297a12 12 0 00-3.79 23.388c.6.113.82-.26.82-.577 0-.285-.012-1.24-.017-2.25-3.338.725-4.042-1.415-4.042-1.415-.546-1.385-1.333-1.755-1.333-1.755-1.09-.745.083-.73.083-.73 1.205.085 1.84 1.24 1.84 1.24 1.07 1.835 2.807 1.305 3.492.998.108-.775.418-1.305.76-1.605-2.665-.305-5.467-1.335-5.467-5.93 0-1.31.468-2.38 1.235-3.22-.135-.305-.54-1.525.105-3.18 0 0 1.005-.325 3.3 1.23a11.5 11.5 0 016.005 0c2.29-1.555 3.295-1.23 3.295-1.23.65 1.655.24 2.875.12 3.18.77.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.43.37.815 1.105.815 2.22 0 1.605-.015 2.895-.015 3.285 0 .315.21.69.825.57A12 12 0 0012 .297z" />
                </svg>
                View on GitHub
              </a>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              Supports Buderer (1996), Fleiss, log-rank, and more
            </p>
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
              {FEATURES.map(({ Icon, title, desc }) => (
                <div
                  key={title}
                  className="rounded-2xl border border-border bg-card p-5"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--primary-muted)] text-primary">
                    <Icon className="h-4 w-4" />
                  </span>
                  <h3 className="mt-4 text-sm font-semibold">{title}</h3>
                  <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                    {desc}
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-10 flex justify-center">
              <Link
                href="/calculator"
                className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-accent px-5 text-sm font-medium text-accent-foreground shadow-sm shadow-accent/20 transition-all hover:opacity-90"
              >
                Try the calculator now
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>

        <footer className="border-t border-border px-4 py-8 text-center text-xs text-muted-foreground sm:px-6">
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
