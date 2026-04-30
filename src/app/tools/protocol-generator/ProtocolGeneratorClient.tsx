'use client'

import { useState } from 'react'
import { FileSearch, FlaskConical } from 'lucide-react'
import { SiteHeader } from '@/components/site-header'
import { ProtocolForm } from '@/components/protocol/ProtocolForm'
import { ProtocolPreview } from '@/components/protocol/ProtocolPreview'
import { ReferencePicker } from '@/components/protocol/ReferencePicker'
import { buildProtocol } from '@/lib/protocol/buildProtocol'
import type { ProtocolDocument, ProtocolFormData } from '@/lib/protocol/types'
import type { Article } from '@/lib/literature/types'
import { cn } from '@/lib/utils'

type Tab = 'form' | 'references' | 'preview'

export function ProtocolGeneratorClient() {
  const [activeTab, setActiveTab] = useState<Tab>('form')
  const [formData, setFormData] = useState<ProtocolFormData | null>(null)
  const [references, setReferences] = useState<Article[]>([])
  const [protocol, setProtocol] = useState<ProtocolDocument | null>(null)
  const [isBuilding, setIsBuilding] = useState(false)

  const handleFormSubmit = (data: ProtocolFormData) => {
    setFormData(data)
    setActiveTab('references')
  }

  const handleBuildProtocol = () => {
    if (!formData) return
    setIsBuilding(true)
    try {
      const built = buildProtocol(formData, references)
      setProtocol(built)
      setActiveTab('preview')
    } finally {
      setIsBuilding(false)
    }
  }

  const handleAddRef = (article: Article) => {
    setReferences((prev) => prev.some((a) => a.id === article.id) ? prev : [...prev, article])
  }
  const handleRemoveRef = (id: string) => setReferences((prev) => prev.filter((a) => a.id !== id))

  const tabs: { id: Tab; label: string; icon: React.ReactNode; disabled?: boolean }[] = [
    { id: 'form',       label: 'Study Details', icon: <FlaskConical className="h-3.5 w-3.5" /> },
    { id: 'references', label: `References (${references.length})`, icon: <FileSearch className="h-3.5 w-3.5" />, disabled: !formData },
    { id: 'preview',    label: 'Preview & Export', icon: null, disabled: !protocol },
  ]

  // Derive suggested search query from form data
  const suggestedQuery = formData
    ? [formData.condition, formData.intervention, formData.department].filter(Boolean).join(' ')
    : ''

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-10">

        {/* Header */}
        <div className="mb-8 flex items-start gap-4">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/15 text-violet-600 dark:text-violet-400">
            <FlaskConical className="h-5 w-5" />
          </span>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Protocol Generator</h1>
            <p className="mt-1.5 max-w-xl text-sm text-muted-foreground">
              Build a complete ICMR-format thesis protocol — structured template, real PubMed references,
              consent forms in English &amp; Hindi, data collection form. Download as .docx.
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6 flex rounded-xl border border-border bg-muted p-1">
          {tabs.map((t) => (
            <button key={t.id} type="button"
              onClick={() => !t.disabled && setActiveTab(t.id)}
              disabled={t.disabled}
              className={cn(
                'flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2.5 text-xs font-semibold transition-colors',
                activeTab === t.id ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground',
                t.disabled ? 'cursor-not-allowed opacity-40' : 'hover:text-foreground'
              )}>
              {t.icon}
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {activeTab === 'form' && (
          <ProtocolForm onSubmit={handleFormSubmit} isBuilding={isBuilding} />
        )}

        {activeTab === 'references' && formData && (
          <div className="space-y-4">
            <ReferencePicker
              selected={references}
              onAdd={handleAddRef}
              onRemove={handleRemoveRef}
              suggestedQuery={suggestedQuery}
            />
            <div className="flex items-center justify-between rounded-xl border border-border bg-card p-4">
              <p className="text-xs text-muted-foreground">
                {references.length === 0
                  ? 'Search and select references — or skip to build with template references.'
                  : `${references.length} reference${references.length === 1 ? '' : 's'} selected.`}
              </p>
              <button type="button" onClick={handleBuildProtocol} disabled={isBuilding}
                className="inline-flex h-10 items-center gap-2 rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground hover:bg-[var(--primary-hover)] disabled:opacity-50">
                {isBuilding ? 'Building…' : '🏗️ Build Protocol'}
              </button>
            </div>
          </div>
        )}

        {activeTab === 'preview' && protocol && (
          <ProtocolPreview protocol={protocol} />
        )}

        {/* How it works */}
        {activeTab === 'form' && (
          <section className="mt-8 rounded-2xl border border-dashed border-border bg-card p-5">
            <h2 className="text-sm font-semibold">How it works</h2>
            <ol className="mt-3 space-y-2 text-xs leading-relaxed text-muted-foreground">
              <li><strong className="text-foreground">1. Fill study details</strong> — title, study type, department, population, outcomes, criteria.</li>
              <li><strong className="text-foreground">2. Search & select references</strong> — search PubMed, Europe PMC, and OpenAlex. Pick up to 20 real papers for your Review of Literature.</li>
              <li><strong className="text-foreground">3. Build protocol</strong> — system generates all 8 sections including methodology, data collection form, and consent forms (English + Hindi).</li>
              <li><strong className="text-foreground">4. Download .docx</strong> — formatted with Times New Roman, page numbers, header, Vancouver references with PubMed links.</li>
              <li><strong className="text-foreground">5. Complete in Word</strong> — fill bracketed placeholders, add your Introduction narrative, and submit to your guide.</li>
            </ol>
          </section>
        )}
      </main>
    </>
  )
}
