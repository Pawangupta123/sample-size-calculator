'use client'

import { useCallback, useEffect, useState } from 'react'

const KEY = 'samplecalc_search_history'
const MAX = 10

export function useSearchHistory() {
  const [history, setHistory] = useState<string[]>([])

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY)
      if (raw) setHistory(JSON.parse(raw) as string[])
    } catch {}
  }, [])

  const add = useCallback((query: string) => {
    const q = query.trim()
    if (!q) return
    setHistory((prev) => {
      const next = [q, ...prev.filter((h) => h !== q)].slice(0, MAX)
      try { localStorage.setItem(KEY, JSON.stringify(next)) } catch {}
      return next
    })
  }, [])

  const clear = useCallback(() => {
    setHistory([])
    try { localStorage.removeItem(KEY) } catch {}
  }, [])

  return { history, add, clear }
}
