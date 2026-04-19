'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  type ReactNode,
} from 'react'
import { useSearchParams } from 'next/navigation'
import { useCalculatorState } from '../hooks/useCalculatorState'
import { useCalculatorPersistence } from '../hooks/useCalculatorPersistence'
import { useHistory, type HistoryEntry } from '../hooks/useHistory'
import { calculate } from '../utils/calculate'
import { decodeStateFromUrl } from '../utils/shareLink'
import type { CalculatorState, StepIndex } from '../types/calculator.types'
import type { CalculationOutcome } from '../types/results.types'

interface CalculatorContextValue {
  state: CalculatorState
  step: StepIndex
  result: CalculationOutcome | null
  update: <K extends keyof CalculatorState>(key: K, value: CalculatorState[K]) => void
  patch: (partial: Partial<CalculatorState>) => void
  goToStep: (step: StepIndex) => void
  runCalculation: () => CalculationOutcome
  reset: () => void
  loadState: (next: Partial<CalculatorState>) => void
  history: HistoryEntry[]
  removeFromHistory: (id: string) => void
  clearHistory: () => void
}

const CalculatorContext = createContext<CalculatorContextValue | null>(null)

export function CalculatorProvider({ children }: { children: ReactNode }) {
  const {
    state, step, result,
    update, patch, goToStep, setResult, reset, loadState,
  } = useCalculatorState()
  useCalculatorPersistence(state)
  const { entries: history, add, remove, clear } = useHistory()

  const searchParams = useSearchParams()

  useEffect(() => {
    const encoded = searchParams.get('s')
    if (!encoded) return
    const decoded = decodeStateFromUrl(encoded)
    if (decoded) loadState(decoded)
  }, [searchParams, loadState])

  const runCalculation = useCallback((): CalculationOutcome => {
    const outcome = calculate(state)
    setResult(outcome)
    if (outcome.ok) {
      add(state, outcome.result)
      goToStep(4)
    } else {
      goToStep(2)
    }
    return outcome
  }, [state, setResult, add, goToStep])

  const value = useMemo<CalculatorContextValue>(
    () => ({
      state, step, result,
      update, patch, goToStep, runCalculation, reset, loadState,
      history, removeFromHistory: remove, clearHistory: clear,
    }),
    [state, step, result, update, patch, goToStep, runCalculation, reset, loadState, history, remove, clear]
  )

  return (
    <CalculatorContext.Provider value={value}>
      {children}
    </CalculatorContext.Provider>
  )
}

export function useCalculator(): CalculatorContextValue {
  const ctx = useContext(CalculatorContext)
  if (!ctx) throw new Error('useCalculator must be used within CalculatorProvider')
  return ctx
}
