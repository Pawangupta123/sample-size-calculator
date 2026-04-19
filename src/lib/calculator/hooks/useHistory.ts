'use client'

import { useCallback, useEffect, useState } from 'react'
import type { CalculatorState } from '../types/calculator.types'
import type { CalculationResult } from '../types/results.types'

const HISTORY_STORAGE_KEY = 'samplecalc_history'
const MAX_HISTORY = 10

export interface HistoryEntry {
  id: string
  timestamp: number
  label: string
  designLabel: string
  finalN: number
  state: CalculatorState
  result: CalculationResult
}

function read(): HistoryEntry[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(HISTORY_STORAGE_KEY)
    if (!raw) return []
    return JSON.parse(raw) as HistoryEntry[]
  } catch {
    return []
  }
}

function write(entries: HistoryEntry[]): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(entries))
  } catch {
    /* ignore */
  }
}

export interface UseHistoryResult {
  entries: HistoryEntry[]
  add: (state: CalculatorState, result: CalculationResult) => void
  remove: (id: string) => void
  clear: () => void
}

export function useHistory(): UseHistoryResult {
  const [entries, setEntries] = useState<HistoryEntry[]>([])

  useEffect(() => {
    setEntries(read())
  }, [])

  const add = useCallback(
    (state: CalculatorState, result: CalculationResult) => {
      const entry: HistoryEntry = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        timestamp: Date.now(),
        label: buildLabel(state, result),
        designLabel: state.design ?? 'Unknown',
        finalN: result.finalN,
        state,
        result,
      }
      setEntries((prev) => {
        const next = [entry, ...prev].slice(0, MAX_HISTORY)
        write(next)
        return next
      })
    },
    []
  )

  const remove = useCallback((id: string) => {
    setEntries((prev) => {
      const next = prev.filter((e) => e.id !== id)
      write(next)
      return next
    })
  }, [])

  const clear = useCallback(() => {
    write([])
    setEntries([])
  }, [])

  return { entries, add, remove, clear }
}

function buildLabel(state: CalculatorState, result: CalculationResult): string {
  const design = state.design ?? 'study'
  const outcome = state.outcome ?? ''
  return `${design}${outcome ? ` · ${outcome}` : ''} · N = ${result.finalN}`
}
