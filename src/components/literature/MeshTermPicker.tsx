'use client'

import { useEffect, useRef, useState } from 'react'
import { X } from 'lucide-react'
import { lookupMeshTerms, type MeshTerm } from '@/lib/literature/utils/searchMesh'
import { cn } from '@/lib/utils'

interface MeshTermPickerProps {
  selected: string[]
  onChange: (terms: string[]) => void
}

export function MeshTermPicker({ selected, onChange }: MeshTermPickerProps) {
  const [inputValue, setInputValue] = useState('')
  const [suggestions, setSuggestions] = useState<MeshTerm[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const abortRef = useRef<AbortController | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const fetchSuggestions = (value: string) => {
    if (timerRef.current) clearTimeout(timerRef.current)
    if (abortRef.current) abortRef.current.abort()
    if (value.trim().length < 2) {
      setSuggestions([])
      setOpen(false)
      return
    }
    timerRef.current = setTimeout(async () => {
      abortRef.current = new AbortController()
      setIsLoading(true)
      try {
        const terms = await lookupMeshTerms(value, 8, abortRef.current.signal)
        setSuggestions(terms)
        setOpen(terms.length > 0)
      } finally {
        setIsLoading(false)
      }
    }, 300)
  }

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value)
    fetchSuggestions(e.target.value)
  }

  const addTerm = (label: string) => {
    if (!selected.includes(label)) onChange([...selected, label])
    setInputValue('')
    setSuggestions([])
    setOpen(false)
  }

  const removeTerm = (label: string) => {
    onChange(selected.filter((t) => t !== label))
  }

  return (
    <div ref={containerRef} className="relative">
      <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        MeSH Terms
      </label>

      {selected.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-1.5">
          {selected.map((term) => (
            <span
              key={term}
              className="inline-flex items-center gap-1 rounded-full border border-primary/30 bg-[var(--primary-muted)] px-2 py-0.5 text-[11px] font-medium text-primary"
            >
              {term}
              <button
                type="button"
                onClick={() => removeTerm(term)}
                aria-label={`Remove ${term}`}
                className="rounded-full hover:bg-primary/20"
              >
                <X className="h-2.5 w-2.5" />
              </button>
            </span>
          ))}
        </div>
      )}

      <div className="relative">
        <input
          type="text"
          value={inputValue}
          onChange={handleInput}
          onFocus={() => suggestions.length > 0 && setOpen(true)}
          placeholder="Type to search MeSH terms…"
          className={cn(
            'h-8 w-full rounded-lg border border-input bg-card px-3 text-xs',
            'focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20'
          )}
        />
        {isLoading && (
          <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground">
            …
          </span>
        )}
      </div>

      {open && suggestions.length > 0 && (
        <ul className="absolute z-50 mt-1 max-h-48 w-full overflow-y-auto rounded-xl border border-border bg-card shadow-lg">
          {suggestions.map((term) => (
            <li key={term.id || term.label}>
              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault()
                  addTerm(term.label)
                }}
                className={cn(
                  'w-full px-3 py-2 text-left text-xs transition-colors hover:bg-muted',
                  selected.includes(term.label) && 'opacity-40'
                )}
              >
                <span className="font-medium">{term.label}</span>
                {term.id && (
                  <span className="ml-2 text-[10px] text-muted-foreground">{term.id}</span>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
