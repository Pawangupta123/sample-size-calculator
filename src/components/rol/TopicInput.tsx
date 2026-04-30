'use client'

import { useEffect, useRef, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { lookupMeshTerms, type MeshTerm } from '@/lib/literature/utils/searchMesh'

interface TopicInputProps {
  value: string
  onChange: (value: string) => void
}

export function TopicInput({ value, onChange }: TopicInputProps) {
  const [suggestions, setSuggestions] = useState<MeshTerm[]>([])
  const abortRef = useRef<AbortController | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    if (abortRef.current) abortRef.current.abort()

    const words = value.trim().split(/\s+/).filter(Boolean)
    const lastWord = words[words.length - 1] ?? ''

    if (lastWord.length < 3) {
      setSuggestions([])
      return
    }

    timerRef.current = setTimeout(async () => {
      abortRef.current = new AbortController()
      try {
        const terms = await lookupMeshTerms(lastWord, 6, abortRef.current.signal)
        setSuggestions(terms)
      } catch {
        setSuggestions([])
      }
    }, 400)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [value])

  const appendTerm = (label: string) => {
    const trimmed = value.trimEnd()
    onChange(trimmed ? `${trimmed} ${label}` : label)
    setSuggestions([])
  }

  return (
    <Card>
      <CardContent className="p-4">
        <label className="block pb-2 text-xs font-semibold">
          Topic or research question
        </label>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="e.g., Efficacy of bariatric surgery in adolescents"
          className="h-10 w-full rounded-lg border border-input bg-card px-3 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
        {suggestions.length > 0 && (
          <div className="mt-2">
            <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              MeSH suggestions
            </p>
            <div className="flex flex-wrap gap-1.5">
              {suggestions.map((term) => (
                <button
                  key={term.id || term.label}
                  type="button"
                  onClick={() => appendTerm(term.label)}
                  className="rounded-full border border-primary/30 bg-primary-muted px-2.5 py-0.5 text-[11px] font-medium text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
                >
                  {term.label}
                </button>
              ))}
            </div>
          </div>
        )}
        <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
          Single line — will become the review title and frame the introduction.
        </p>
      </CardContent>
    </Card>
  )
}
