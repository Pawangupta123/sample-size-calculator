'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { Clock, Loader2, Search, Sliders, Trash2, X, Zap } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import type { SearchFilters, StudyTypeFilter } from '@/lib/literature/types'
import { useSearchHistory } from '@/lib/literature/hooks/useSearchHistory'
import { cn } from '@/lib/utils'
import { MeshTermPicker } from './MeshTermPicker'

type InputMode = 'keyword' | 'pico'

interface SearchPanelProps {
  onSearch: (filters: SearchFilters) => void
  onReset: () => void
  isSearching: boolean
  hasResults: boolean
}

const STUDY_TYPE_LABELS: ReadonlyArray<{ value: StudyTypeFilter; label: string }> = [
  { value: 'any', label: 'Any study type' },
  { value: 'rct', label: 'Randomised trials' },
  { value: 'meta', label: 'Meta-analyses' },
  { value: 'review', label: 'Reviews' },
  { value: 'cohort', label: 'Cohort' },
  { value: 'casecontrol', label: 'Case-control' },
]

const PICO_FIELDS = [
  { key: 'population' as const, label: 'P — Population', placeholder: 'e.g., adults with type 2 diabetes' },
  { key: 'intervention' as const, label: 'I — Intervention', placeholder: 'e.g., metformin 1000 mg' },
  { key: 'comparison' as const, label: 'C — Comparison (optional)', placeholder: 'e.g., placebo or usual care' },
  { key: 'outcome' as const, label: 'O — Outcome', placeholder: 'e.g., HbA1c reduction at 6 months' },
]

type PicoFields = Record<'population' | 'intervention' | 'comparison' | 'outcome', string>

const CURRENT_YEAR = new Date().getFullYear()

// ─── Slash commands ───────────────────────────────────────────────────────────

interface SlashCommand {
  trigger: string
  label: string
  description: string
  icon: string
}

const SLASH_COMMANDS: SlashCommand[] = [
  { trigger: '/pico',    label: 'PICO Builder',        description: 'Switch to structured P·I·C·O query mode',    icon: '🧱' },
  { trigger: '/rct',     label: 'Randomised trials',   description: 'Filter to randomised controlled trials',      icon: '🎲' },
  { trigger: '/meta',    label: 'Meta-analyses',       description: 'Filter to meta-analyses only',                icon: '📊' },
  { trigger: '/review',  label: 'Systematic reviews',  description: 'Filter to systematic reviews',                icon: '🔍' },
  { trigger: '/cohort',  label: 'Cohort studies',      description: 'Filter to cohort studies',                    icon: '👥' },
  { trigger: '/oa',      label: 'Open access only',    description: 'Show only open access articles',              icon: '🔓' },
  { trigger: '/trials',  label: 'ClinicalTrials.gov',  description: 'Include clinical trials in results',          icon: '🏥' },
  { trigger: '/filters', label: 'Open filters',        description: 'Open the filters panel',                      icon: '⚙️' },
]

function buildPicoQuery(fields: PicoFields): string {
  return [
    fields.population.trim() && `(${fields.population.trim()})`,
    fields.intervention.trim() && `(${fields.intervention.trim()})`,
    fields.comparison.trim() && `(${fields.comparison.trim()})`,
    fields.outcome.trim() && `(${fields.outcome.trim()})`,
  ].filter(Boolean).join(' AND ')
}

export function SearchPanel({
  onSearch,
  onReset,
  isSearching,
  hasResults,
}: SearchPanelProps) {
  const [mode, setMode] = useState<InputMode>('keyword')
  const [query, setQuery] = useState('')
  const [pico, setPico] = useState<PicoFields>({ population: '', intervention: '', comparison: '', outcome: '' })
  const [studyType, setStudyType] = useState<StudyTypeFilter>('any')
  const [yearFrom, setYearFrom] = useState<number | ''>(CURRENT_YEAR - 10)
  const [yearTo, setYearTo] = useState<number | ''>(CURRENT_YEAR)
  const [openAccessOnly, setOpenAccessOnly] = useState(false)
  const [includeClinicalTrials, setIncludeClinicalTrials] = useState(false)
  const [journal, setJournal] = useState('')
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [meshTerms, setMeshTerms] = useState<string[]>([])
  const [historyOpen, setHistoryOpen] = useState(false)
  const [slashOpen, setSlashOpen] = useState(false)
  const [slashIndex, setSlashIndex] = useState(0)
  const historyRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const { history, add: addHistory, clear: clearHistory } = useSearchHistory()

  // Slash command matching
  const slashMatches = useMemo(() => {
    if (!query.startsWith('/')) return []
    const term = query.toLowerCase()
    return SLASH_COMMANDS.filter(
      (c) => c.trigger.startsWith(term) || c.label.toLowerCase().includes(term.slice(1))
    )
  }, [query])

  const executeSlashCommand = (cmd: SlashCommand) => {
    setQuery('')
    setSlashOpen(false)
    if (cmd.trigger === '/pico')    { setMode('pico'); return }
    if (cmd.trigger === '/rct')     { setStudyType('rct');         setFiltersOpen(true); return }
    if (cmd.trigger === '/meta')    { setStudyType('meta');        setFiltersOpen(true); return }
    if (cmd.trigger === '/review')  { setStudyType('review');      setFiltersOpen(true); return }
    if (cmd.trigger === '/cohort')  { setStudyType('cohort');      setFiltersOpen(true); return }
    if (cmd.trigger === '/oa')      { setOpenAccessOnly(true);     setFiltersOpen(true); return }
    if (cmd.trigger === '/trials')  { setIncludeClinicalTrials(true); setFiltersOpen(true); return }
    if (cmd.trigger === '/filters') { setFiltersOpen(true); return }
  }

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (historyRef.current && !historyRef.current.contains(e.target as Node)) {
        setHistoryOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  // '/' keyboard shortcut to focus search
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === '/' && !(e.target instanceof HTMLInputElement) && !(e.target instanceof HTMLTextAreaElement)) {
        e.preventDefault()
        textareaRef.current?.focus()
      }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [])

  const activeQuery = mode === 'pico' ? buildPicoQuery(pico) : query.trim()
  const canSubmit = Boolean(activeQuery) && !isSearching

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSubmit) return
    addHistory(activeQuery)
    onSearch({
      query: activeQuery,
      studyType,
      yearFrom: yearFrom === '' ? undefined : yearFrom,
      yearTo: yearTo === '' ? undefined : yearTo,
      openAccessOnly,
      includeClinicalTrials,
      journal: journal.trim() || undefined,
      meshTerms: meshTerms.length > 0 ? meshTerms : undefined,
    })
    setHistoryOpen(false)
  }

  const handleReset = () => {
    setQuery('')
    setPico({ population: '', intervention: '', comparison: '', outcome: '' })
    onReset()
  }

  const restoreHistory = (q: string) => {
    setQuery(q)
    setMode('keyword')
    setHistoryOpen(false)
  }

  const activeFilters = meshTerms.length > 0 || openAccessOnly || studyType !== 'any' || !!journal.trim() || includeClinicalTrials

  return (
    <Card>
      <CardContent className="p-5">
        <form onSubmit={handleSubmit}>

          {/* Mode toggle */}
          <div className="mb-4 flex items-center justify-between">
            <div className="flex rounded-lg border border-border bg-muted p-0.5">
              {(['keyword', 'pico'] as InputMode[]).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMode(m)}
                  className={cn(
                    'rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
                    mode === m
                      ? 'bg-card text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  {m === 'keyword' ? 'Keywords / Protocol' : 'PICO Builder'}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setFiltersOpen((v) => !v)}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors',
                activeFilters
                  ? 'border-primary/40 bg-primary/10 text-primary'
                  : 'border-border text-muted-foreground hover:border-primary/40 hover:text-foreground',
                filtersOpen && 'border-primary/40 bg-primary/10 text-primary'
              )}
            >
              <Sliders className="h-3 w-3" />
              Filters
              {activeFilters && (
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground">
                  {(meshTerms.length > 0 ? 1 : 0) + (openAccessOnly ? 1 : 0) + (studyType !== 'any' ? 1 : 0)}
                </span>
              )}
            </button>
          </div>

          {/* Keyword mode */}
          {mode === 'keyword' && (
            <div ref={historyRef} className="relative">
              <textarea
                ref={textareaRef}
                value={query}
                onChange={(e) => {
                  const val = e.target.value
                  setQuery(val)
                  setSlashOpen(val.startsWith('/'))
                  setSlashIndex(0)
                  if (!val.startsWith('/') && history.length > 0) setHistoryOpen(true)
                  else setHistoryOpen(false)
                }}
                onFocus={() => {
                  if (query.startsWith('/')) setSlashOpen(true)
                  else if (history.length > 0) setHistoryOpen(true)
                }}
                onKeyDown={(e) => {
                  if (!slashOpen || slashMatches.length === 0) return
                  if (e.key === 'ArrowDown') { e.preventDefault(); setSlashIndex((i) => (i + 1) % slashMatches.length) }
                  if (e.key === 'ArrowUp')   { e.preventDefault(); setSlashIndex((i) => (i - 1 + slashMatches.length) % slashMatches.length) }
                  if (e.key === 'Enter' || e.key === 'Tab') {
                    const cmd = slashMatches[slashIndex]
                    if (cmd) { e.preventDefault(); executeSlashCommand(cmd) }
                  }
                  if (e.key === 'Escape') { setSlashOpen(false) }
                }}
                placeholder={'Type keywords or / for commands…'}
                spellCheck={false}
                className={cn(
                  'h-32 w-full resize-y rounded-xl border border-input bg-card p-3 text-xs leading-relaxed text-foreground',
                  'focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20'
                )}
              />
              {/* Slash command palette */}
            {slashOpen && slashMatches.length > 0 && (
              <div className="absolute z-50 mt-1 w-full rounded-xl border border-border bg-card shadow-xl">
                <div className="flex items-center gap-1.5 border-b border-border px-3 py-2">
                  <Zap className="h-3 w-3 text-primary" />
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Commands
                  </span>
                  <span className="ml-auto text-[9px] text-muted-foreground">↑↓ navigate · Enter select · Esc close</span>
                </div>
                <ul className="py-1">
                  {slashMatches.map((cmd, i) => (
                    <li key={cmd.trigger}>
                      <button
                        type="button"
                        onMouseDown={(e) => { e.preventDefault(); executeSlashCommand(cmd) }}
                        className={cn(
                          'flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors',
                          i === slashIndex ? 'bg-muted' : 'hover:bg-muted/60'
                        )}
                      >
                        <span className="text-base leading-none">{cmd.icon}</span>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-foreground">{cmd.label}</span>
                            <span className="rounded bg-muted px-1 font-mono text-[9px] text-muted-foreground">{cmd.trigger}</span>
                          </div>
                          <p className="mt-0.5 text-[10px] text-muted-foreground">{cmd.description}</p>
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {historyOpen && !slashOpen && history.length > 0 && (
                <div className="absolute z-50 mt-1 w-full rounded-xl border border-border bg-card shadow-lg">
                  <div className="flex items-center justify-between px-3 py-2 border-b border-border">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Recent searches
                    </span>
                    <button
                      type="button"
                      onClick={clearHistory}
                      className="inline-flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground"
                    >
                      <Trash2 className="h-2.5 w-2.5" /> Clear all
                    </button>
                  </div>
                  <ul className="max-h-48 overflow-y-auto py-1">
                    {history.map((h, i) => (
                      <li key={i}>
                        <button
                          type="button"
                          onMouseDown={(e) => { e.preventDefault(); restoreHistory(h) }}
                          className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-foreground hover:bg-muted"
                        >
                          <Clock className="h-3 w-3 shrink-0 text-muted-foreground" />
                          <span className="line-clamp-1">{h}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* PICO mode */}
          {mode === 'pico' && (
            <div className="space-y-3 rounded-xl border border-border bg-muted/30 p-4">
              <p className="text-[11px] text-muted-foreground">
                Fill <strong className="text-foreground">P</strong> and <strong className="text-foreground">I</strong> at minimum — C is optional.
              </p>
              {PICO_FIELDS.map(({ key, label, placeholder }) => (
                <div key={key} className="grid grid-cols-[80px_1fr] items-center gap-3">
                  <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    {label.split(' — ')[0]}
                    <span className="block font-normal normal-case tracking-normal text-muted-foreground/70">
                      {label.split(' — ')[1]}
                    </span>
                  </label>
                  <input
                    type="text"
                    value={pico[key]}
                    onChange={(e) => setPico((prev) => ({ ...prev, [key]: e.target.value }))}
                    placeholder={placeholder}
                    className="h-9 w-full rounded-lg border border-input bg-card px-3 text-xs focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              ))}
              {activeQuery && (
                <div className="rounded-lg bg-muted px-3 py-2">
                  <p className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground mb-0.5">Generated query</p>
                  <p className="font-mono text-[10px] text-foreground break-all">{activeQuery}</p>
                </div>
              )}
            </div>
          )}

          {/* Filters panel */}
          {filtersOpen && (
            <div className="mt-3 space-y-3 rounded-xl border border-dashed border-border p-3">
              <div>
                <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Study type
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {STUDY_TYPE_LABELS.map(({ value, label }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setStudyType(value)}
                      className={cn(
                        'rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors',
                        studyType === value
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-border bg-card text-muted-foreground hover:border-primary hover:text-foreground'
                      )}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Year from
                  </label>
                  <input
                    type="number"
                    value={yearFrom}
                    min={1900}
                    max={CURRENT_YEAR}
                    onChange={(e) =>
                      setYearFrom(e.target.value === '' ? '' : parseInt(e.target.value, 10))
                    }
                    className="h-9 w-full rounded-lg border border-input bg-card px-3 text-xs focus:border-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Year to
                  </label>
                  <input
                    type="number"
                    value={yearTo}
                    min={1900}
                    max={CURRENT_YEAR}
                    onChange={(e) =>
                      setYearTo(e.target.value === '' ? '' : parseInt(e.target.value, 10))
                    }
                    className="h-9 w-full rounded-lg border border-input bg-card px-3 text-xs focus:border-primary focus:outline-none"
                  />
                </div>
              </div>
              <label className="flex items-center gap-2 text-xs text-foreground">
                <input
                  type="checkbox"
                  checked={openAccessOnly}
                  onChange={(e) => setOpenAccessOnly(e.target.checked)}
                  className="h-3.5 w-3.5 accent-primary"
                />
                Open access only
              </label>
              <MeshTermPicker selected={meshTerms} onChange={setMeshTerms} />
              <div>
                <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Journal
                </label>
                <input
                  type="text"
                  value={journal}
                  onChange={(e) => setJournal(e.target.value)}
                  placeholder="e.g., NEJM, Lancet, BMJ…"
                  className="h-8 w-full rounded-lg border border-input bg-card px-3 text-xs focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <label className="flex items-center gap-2 text-xs text-foreground">
                <input
                  type="checkbox"
                  checked={includeClinicalTrials}
                  onChange={(e) => setIncludeClinicalTrials(e.target.checked)}
                  className="h-3.5 w-3.5 accent-primary"
                />
                Include ClinicalTrials.gov
              </label>
            </div>
          )}

          {/* Actions */}
          <div className="mt-3 flex items-center justify-end gap-2">
            {hasResults && (
              <button
                type="button"
                onClick={handleReset}
                disabled={isSearching}
                className="inline-flex h-9 items-center gap-1.5 rounded-full border border-border bg-card px-3.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50"
              >
                <X className="h-3 w-3" />
                Clear
              </button>
            )}
            <button
              type="submit"
              disabled={!canSubmit}
              className="inline-flex h-9 items-center gap-1.5 rounded-full bg-primary px-5 text-xs font-semibold text-primary-foreground transition-colors hover:bg-[var(--primary-hover)] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSearching ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Searching PubMed · Europe PMC · OpenAlex…
                </>
              ) : (
                <>
                  <Search className="h-3.5 w-3.5" />
                  Search articles
                </>
              )}
            </button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
