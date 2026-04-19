'use client'

import { useRef, useState } from 'react'
import { Download, FileUp, Loader2, Trash2, X } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import type { Article } from '@/lib/literature/types'
import type { ManualArticleInput } from '@/lib/rol/types'
import { cn } from '@/lib/utils'
import { ManualArticleForm } from './ManualArticleForm'

interface ArticlesInputProps {
  articles: Article[]
  isFetching: boolean
  onAdd: (raw: string) => Promise<void> | void
  onAddManual: (input: ManualArticleInput) => boolean
  onAddPdfs: (files: FileList | File[]) => Promise<void> | void
  onImport: () => void
  onRemove: (id: string) => void
  onClear: () => void
  savedCount: number
}

const PLACEHOLDER = [
  'Paste one identifier per line:',
  '',
  '10.1056/NEJMoa2034577',
  '33301246',
  'https://pubmed.ncbi.nlm.nih.gov/32182409/',
].join('\n')

export function ArticlesInput({
  articles,
  isFetching,
  onAdd,
  onAddManual,
  onAddPdfs,
  onImport,
  onRemove,
  onClear,
  savedCount,
}: ArticlesInputProps) {
  const [text, setText] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleAdd = async () => {
    const value = text.trim()
    if (!value) return
    await onAdd(value)
    setText('')
  }

  const handlePdfPick = () => fileInputRef.current?.click()

  const handlePdfChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return
    await onAddPdfs(files)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center justify-between pb-3">
          <p className="text-sm font-semibold">Articles to review</p>
          <button
            type="button"
            onClick={onImport}
            disabled={savedCount === 0}
            className="inline-flex items-center gap-1 rounded-full border border-border bg-card px-2.5 py-1 text-[11px] font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50"
          >
            <Download className="h-3 w-3" />
            Import from Literature Search ({savedCount})
          </button>
        </div>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={PLACEHOLDER}
          spellCheck={false}
          className={cn(
            'h-32 w-full resize-y rounded-xl border border-input bg-card p-3 font-mono text-xs leading-relaxed text-foreground',
            'focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20'
          )}
        />
        <div className="mt-2 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={handlePdfPick}
            disabled={isFetching}
            className="inline-flex h-9 items-center gap-1.5 rounded-full border border-dashed border-border bg-transparent px-3 text-[11px] font-medium text-muted-foreground transition-colors hover:border-primary hover:text-primary disabled:opacity-50"
          >
            <FileUp className="h-3 w-3" />
            Upload PDFs
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf,.pdf"
            multiple
            className="hidden"
            onChange={handlePdfChange}
          />
          <button
            type="button"
            onClick={handleAdd}
            disabled={isFetching || !text.trim()}
            className="inline-flex h-9 items-center gap-1.5 rounded-full bg-primary px-4 text-xs font-semibold text-primary-foreground transition-colors hover:bg-[var(--primary-hover)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isFetching ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Processing…
              </>
            ) : (
              'Add articles'
            )}
          </button>
        </div>

        <ManualArticleForm onSubmit={onAddManual} />

        {articles.length > 0 && (
          <div className="mt-5 border-t border-border pt-4">
            <div className="flex items-center justify-between pb-2">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                {articles.length} article{articles.length === 1 ? '' : 's'} added
              </p>
              <button
                type="button"
                onClick={onClear}
                className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <Trash2 className="h-3 w-3" /> Clear
              </button>
            </div>
            <ul className="flex flex-col gap-1.5">
              {articles.map((a, i) => (
                <li
                  key={a.id}
                  className="group flex items-center gap-2 rounded-lg border border-border bg-card p-2.5"
                >
                  <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-muted text-[10px] font-semibold">
                    {i + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-semibold">
                      {a.title}
                      {a.sources.includes('pdf') && (
                        <span className="ml-1.5 rounded-full bg-[var(--primary-muted)] px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-primary">
                          PDF
                        </span>
                      )}
                      {a.sources.includes('manual') && (
                        <span className="ml-1.5 rounded-full bg-muted px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
                          Manual
                        </span>
                      )}
                    </p>
                    <p className="truncate text-[10px] text-muted-foreground">
                      {a.authors[0] ?? 'Unknown'}
                      {a.authors.length > 1 ? ', et al.' : ''}
                      {a.year && ` · ${a.year}`}
                      {a.journal && ` · ${a.journal}`}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onRemove(a.id)}
                    aria-label="Remove"
                    className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full text-muted-foreground opacity-0 transition-opacity hover:bg-muted hover:text-foreground group-hover:opacity-100"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
