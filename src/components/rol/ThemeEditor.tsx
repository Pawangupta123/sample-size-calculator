'use client'

import { useState } from 'react'
import { Plus, Sparkles, X } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import type { Theme } from '@/lib/rol/types'

interface ThemeEditorProps {
  themes: Theme[]
  onChange: (themes: Theme[]) => void
  onAutoSuggest: () => void
}

function newTheme(name: string): Theme {
  return {
    id: `theme-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
    name: name.trim() || 'Untitled theme',
    keywords: [],
  }
}

export function ThemeEditor({ themes, onChange, onAutoSuggest }: ThemeEditorProps) {
  const [draft, setDraft] = useState('')
  const [keywordDrafts, setKeywordDrafts] = useState<Record<string, string>>({})

  const addTheme = () => {
    if (!draft.trim()) return
    onChange([...themes, newTheme(draft)])
    setDraft('')
  }

  const removeTheme = (id: string) => {
    onChange(themes.filter((t) => t.id !== id))
  }

  const addKeyword = (themeId: string) => {
    const keyword = keywordDrafts[themeId]?.trim()
    if (!keyword) return
    onChange(
      themes.map((t) =>
        t.id === themeId
          ? { ...t, keywords: [...t.keywords, keyword] }
          : t
      )
    )
    setKeywordDrafts((prev) => ({ ...prev, [themeId]: '' }))
  }

  const removeKeyword = (themeId: string, keyword: string) => {
    onChange(
      themes.map((t) =>
        t.id === themeId
          ? { ...t, keywords: t.keywords.filter((k) => k !== keyword) }
          : t
      )
    )
  }

  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center justify-between pb-3">
          <div>
            <p className="text-sm font-semibold">Themes</p>
            <p className="text-[11px] text-muted-foreground">
              Articles will be grouped under the theme whose keywords best match their abstract.
            </p>
          </div>
          <button
            type="button"
            onClick={onAutoSuggest}
            className="inline-flex items-center gap-1 rounded-full border border-border bg-card px-2.5 py-1 text-[11px] font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <Sparkles className="h-3 w-3" />
            Auto-suggest
          </button>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addTheme()}
            placeholder="New theme (e.g., Efficacy, Safety, Mechanism)"
            className="h-9 w-full rounded-lg border border-input bg-card px-3 text-xs focus:border-primary focus:outline-none"
          />
          <button
            type="button"
            onClick={addTheme}
            disabled={!draft.trim()}
            className="inline-flex h-9 items-center gap-1 rounded-full bg-primary px-3 text-xs font-semibold text-primary-foreground hover:bg-[var(--primary-hover)] disabled:opacity-50"
          >
            <Plus className="h-3 w-3" />
            Add
          </button>
        </div>

        {themes.length > 0 && (
          <ul className="mt-4 flex flex-col gap-2">
            {themes.map((theme) => (
              <li
                key={theme.id}
                className="rounded-lg border border-border bg-card p-3"
              >
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold">{theme.name}</p>
                  <button
                    type="button"
                    onClick={() => removeTheme(theme.id)}
                    className="flex h-5 w-5 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
                    aria-label="Remove theme"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-1">
                  {theme.keywords.map((kw) => (
                    <span
                      key={kw}
                      className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground"
                    >
                      {kw}
                      <button
                        type="button"
                        onClick={() => removeKeyword(theme.id, kw)}
                        aria-label={`Remove keyword ${kw}`}
                        className="flex h-3 w-3 items-center justify-center rounded-full hover:bg-foreground/10"
                      >
                        <X className="h-2.5 w-2.5" />
                      </button>
                    </span>
                  ))}
                  <input
                    type="text"
                    value={keywordDrafts[theme.id] ?? ''}
                    onChange={(e) =>
                      setKeywordDrafts((prev) => ({
                        ...prev,
                        [theme.id]: e.target.value,
                      }))
                    }
                    onKeyDown={(e) => e.key === 'Enter' && addKeyword(theme.id)}
                    placeholder="+ keyword"
                    className="inline-flex h-6 w-24 rounded-full border border-input bg-card px-2 text-[11px] focus:border-primary focus:outline-none"
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
