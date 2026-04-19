'use client'

import { useCallback, useEffect, useState } from 'react'
import { INITIAL_STATE } from '../constants/defaults'
import type {
  CalculatorState,
  StepIndex,
} from '../types/calculator.types'
import type { CalculationOutcome } from '../types/results.types'
import { loadPersistedState } from './useCalculatorPersistence'

export interface UseCalculatorStateResult {
  state: CalculatorState
  step: StepIndex
  result: CalculationOutcome | null
  update: <K extends keyof CalculatorState>(key: K, value: CalculatorState[K]) => void
  patch: (partial: Partial<CalculatorState>) => void
  goToStep: (step: StepIndex) => void
  setResult: (outcome: CalculationOutcome | null) => void
  reset: () => void
  loadState: (next: Partial<CalculatorState>) => void
}

export function useCalculatorState(): UseCalculatorStateResult {
  const [state, setState] = useState<CalculatorState>(INITIAL_STATE)
  const [step, setStep] = useState<StepIndex>(0)
  const [result, setResult] = useState<CalculationOutcome | null>(null)

  useEffect(() => {
    const saved = loadPersistedState()
    if (saved) setState((prev) => ({ ...prev, ...saved }))
  }, [])

  const update = useCallback(
    <K extends keyof CalculatorState>(key: K, value: CalculatorState[K]) => {
      setState((prev) => ({ ...prev, [key]: value }))
    },
    []
  )

  const patch = useCallback((partial: Partial<CalculatorState>) => {
    setState((prev) => ({ ...prev, ...partial }))
  }, [])

  const goToStep = useCallback((next: StepIndex) => setStep(next), [])

  const reset = useCallback(() => {
    setState(INITIAL_STATE)
    setStep(0)
    setResult(null)
  }, [])

  const loadState = useCallback((next: Partial<CalculatorState>) => {
    setState({ ...INITIAL_STATE, ...next })
    setStep(0)
    setResult(null)
  }, [])

  return { state, step, result, update, patch, goToStep, setResult, reset, loadState }
}
