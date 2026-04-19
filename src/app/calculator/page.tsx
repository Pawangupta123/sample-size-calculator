import { Suspense } from 'react'
import type { Metadata } from 'next'
import { SiteHeader } from '@/components/site-header'
import { CalculatorProvider } from '@/lib/calculator/context/CalculatorContext'
import { CalculatorWizard } from '@/components/calculator/CalculatorWizard'
import { PresetsPanel } from '@/components/calculator/PresetsPanel'
import { HistoryPanel } from '@/components/calculator/HistoryPanel'

export const metadata: Metadata = {
  title: 'Calculator',
  description:
    'Step-by-step sample size calculator for clinical research. Supports RCTs, diagnostic accuracy, survival, and more.',
}

export default function CalculatorPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">
            Sample Size Calculator
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Answer the questions below to get a justified sample size with full
            formula breakdown.
          </p>
        </div>

        <Suspense fallback={<div className="h-96" />}>
          <CalculatorProvider>
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_280px]">
              <div>
                <CalculatorWizard />
              </div>
              <aside className="flex flex-col gap-4">
                <PresetsPanel />
                <HistoryPanel />
              </aside>
            </div>
          </CalculatorProvider>
        </Suspense>
      </main>
    </>
  )
}
