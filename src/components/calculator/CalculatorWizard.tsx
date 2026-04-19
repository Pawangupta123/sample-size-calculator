'use client'

import { Calculator } from 'lucide-react'
import { useCalculator } from '@/lib/calculator/context/CalculatorContext'
import type { StepIndex } from '@/lib/calculator/types/calculator.types'
import { ProgressBar } from './stepper/ProgressBar'
import { StepperNav } from './stepper/StepperNav'
import { Step1Design } from './steps/Step1Design'
import { Step2Outcome } from './steps/Step2Outcome'
import { Step3Parameters } from './steps/Step3Parameters'
import { Step4Attrition } from './steps/Step4Attrition'
import { Step5Results } from './steps/Step5Results'

const STEPS = [Step1Design, Step2Outcome, Step3Parameters, Step4Attrition, Step5Results] as const

function canAdvance(step: StepIndex, design: string | null, outcome: string | null): boolean {
  if (step === 0) return !!design
  if (step === 1) return design === 'diagnostic' || !!outcome
  return true
}

export function CalculatorWizard() {
  const { state, step, goToStep, runCalculation } = useCalculator()
  const StepComponent = STEPS[step]
  const atFirst = step === 0
  const atResults = step === 4
  const atAttrition = step === 3

  const handleNext = () => {
    if (atAttrition) {
      runCalculation()
      return
    }
    if (!canAdvance(step, state.design, state.outcome)) return
    goToStep((step + 1) as StepIndex)
  }

  const handleBack = () => {
    if (atFirst) return
    goToStep((step - 1) as StepIndex)
  }

  return (
    <div className="flex flex-col gap-4">
      <StepperNav current={step} onStepClick={goToStep} />
      <ProgressBar current={step} />

      <div className="min-h-[280px]">
        <StepComponent />
      </div>

      {!atResults && (
        <div className="flex items-center justify-between gap-3 pt-1 no-print">
          <button
            type="button"
            onClick={handleBack}
            disabled={atFirst}
            className="inline-flex h-10 items-center rounded-full border border-border bg-transparent px-4 text-xs font-medium text-muted-foreground transition-colors hover:border-foreground hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
          >
            ← Back
          </button>
          {atAttrition ? (
            <button
              type="button"
              onClick={handleNext}
              className="inline-flex h-11 items-center gap-2 rounded-full bg-accent px-5 text-sm font-semibold text-accent-foreground shadow-sm shadow-accent/30 transition-all hover:opacity-90"
            >
              <Calculator className="h-4 w-4" />
              Calculate sample size
            </button>
          ) : (
            <button
              type="button"
              onClick={handleNext}
              disabled={!canAdvance(step, state.design, state.outcome)}
              className="inline-flex h-10 items-center gap-1.5 rounded-full bg-primary px-5 text-xs font-semibold text-primary-foreground transition-colors hover:bg-[var(--primary-hover)] disabled:cursor-not-allowed disabled:opacity-50"
            >
              Continue →
            </button>
          )}
        </div>
      )}
    </div>
  )
}
