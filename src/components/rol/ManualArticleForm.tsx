'use client'

import { useState, type FormEvent } from 'react'
import { Check, Pencil, X } from 'lucide-react'
import type { ManualArticleInput } from '@/lib/rol/types'
import { cn } from '@/lib/utils'

interface ManualArticleFormProps {
  onSubmit: (input: ManualArticleInput) => boolean
}

const currentYear = new Date().getFullYear()

export function ManualArticleForm({ onSubmit }: ManualArticleFormProps) {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [authors, setAuthors] = useState('')
  const [journal, setJournal] = useState('')
  const [year, setYear] = useState<string>('')
  const [abstract, setAbstract] = useState('')

  const reset = () => {
    setTitle('')
    setAuthors('')
    setJournal('')
    setYear('')
    setAbstract('')
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    const ok = onSubmit({
      title,
      authors,
      journal: journal || undefined,
      year: year ? parseInt(year, 10) : undefined,
      abstract: abstract || undefined,
    })
    if (ok) {
      reset()
      setOpen(false)
    }
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-2 inline-flex items-center gap-1 rounded-full border border-dashed border-border bg-transparent px-3 py-1.5 text-[11px] font-medium text-muted-foreground transition-colors hover:border-primary hover:text-primary"
      >
        <Pencil className="h-3 w-3" />
        Enter an article manually
      </button>
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-3 space-y-2.5 rounded-lg border border-dashed border-border bg-muted/30 p-3"
    >
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Manual article
        </p>
        <button
          type="button"
          onClick={() => {
            setOpen(false)
            reset()
          }}
          aria-label="Close"
          className="flex h-5 w-5 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <X className="h-3 w-3" />
        </button>
      </div>

      <Field label="Title *">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          placeholder="Full article title"
          className={inputClass}
        />
      </Field>

      <Field label="Authors * (comma-separated)">
        <input
          type="text"
          value={authors}
          onChange={(e) => setAuthors(e.target.value)}
          required
          placeholder="e.g., Smith JA, Jones BC, Kumar R"
          className={inputClass}
        />
      </Field>

      <div className="grid grid-cols-[1fr_96px] gap-2">
        <Field label="Journal">
          <input
            type="text"
            value={journal}
            onChange={(e) => setJournal(e.target.value)}
            placeholder="e.g., N Engl J Med"
            className={inputClass}
          />
        </Field>
        <Field label="Year">
          <input
            type="number"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            min={1900}
            max={currentYear + 1}
            placeholder={String(currentYear)}
            className={inputClass}
          />
        </Field>
      </div>

      <Field label="Abstract / key findings (optional)">
        <textarea
          value={abstract}
          onChange={(e) => setAbstract(e.target.value)}
          rows={3}
          placeholder="Paste the abstract or a brief summary…"
          className={cn(inputClass, 'h-auto resize-y py-2 leading-relaxed')}
        />
      </Field>

      <div className="flex items-center justify-end gap-2 pt-1">
        <button
          type="button"
          onClick={() => {
            setOpen(false)
            reset()
          }}
          className="inline-flex h-8 items-center rounded-full px-3 text-[11px] font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="inline-flex h-8 items-center gap-1 rounded-full bg-primary px-3 text-[11px] font-semibold text-primary-foreground hover:bg-[var(--primary-hover)]"
        >
          <Check className="h-3 w-3" />
          Add article
        </button>
      </div>
    </form>
  )
}

const inputClass =
  'h-8 w-full rounded-md border border-input bg-card px-2.5 text-xs text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20'

function Field({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[10px] font-medium text-muted-foreground">
        {label}
      </span>
      {children}
    </label>
  )
}
