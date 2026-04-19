'use client'

import { useEffect, useRef } from 'react'
import { STATE_STORAGE_KEY } from '../constants/defaults'
import type { CalculatorState } from '../types/calculator.types'

export function loadPersistedState(): Partial<CalculatorState> | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(STATE_STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as Partial<CalculatorState>
  } catch {
    return null
  }
}

export function useCalculatorPersistence(state: CalculatorState): void {
  const hydrated = useRef(false)
  useEffect(() => {
    if (!hydrated.current) {
      hydrated.current = true
      return
    }
    try {
      window.localStorage.setItem(STATE_STORAGE_KEY, JSON.stringify(state))
    } catch {
      /* quota exceeded or private mode */
    }
  }, [state])
}

export function clearPersistedState(): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.removeItem(STATE_STORAGE_KEY)
  } catch {
    /* ignore */
  }
}
