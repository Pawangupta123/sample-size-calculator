'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp, Download, Loader2 } from 'lucide-react'
import type { ProtocolDocument } from '@/lib/protocol/types'
import { downloadBlob, exportProtocolDocx } from '@/lib/protocol/exportProtocolDocx'
import { cn } from '@/lib/utils'

interface ProtocolPreviewProps {
  protocol: ProtocolDocument
}

function Section({ heading, content }: { heading: string; content: string[] }) {
  const [open, setOpen] = useState(true)

  return (
    <div className="border-b border-border last:border-none">
      <button type="button" onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between py-3 text-left">
        <h2 className="text-sm font-bold text-foreground">{heading}</h2>
        {open ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
      </button>
      {open && (
        <div className="space-y-1 pb-4">
          {content.map((line, i) => {
            if (!line.trim()) return <div key={i} className="h-2" />

            if (/^\d+\.\d+\s/.test(line)) {
              return (
                <p key={i} className="mt-3 text-xs font-bold text-foreground">{line}</p>
              )
            }
            if (line.startsWith('  ') || line.startsWith('•') || line.startsWith('─')) {
              return (
                <p key={i} className="pl-4 text-xs leading-relaxed text-muted-foreground font-mono">
                  {line.trim()}
                </p>
              )
            }
            return (
              <p key={i} className="text-xs leading-relaxed text-foreground">{line}</p>
            )
          })}
        </div>
      )}
    </div>
  )
}

export function ProtocolPreview({ protocol }: ProtocolPreviewProps) {
  const [exporting, setExporting] = useState(false)

  const handleExport = async () => {
    setExporting(true)
    try {
      const blob = await exportProtocolDocx(protocol)
      const slug = protocol.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .slice(0, 50)
      downloadBlob(blob, `protocol-${slug}.docx`)
    } finally {
      setExporting(false)
    }
  }

  const d = protocol.formData

  return (
    <div className="space-y-4">
      {/* Action bar */}
      <div className="flex items-center justify-between rounded-xl border border-border bg-card p-4">
        <div>
          <p className="text-xs font-semibold text-foreground">Protocol ready</p>
          <p className="text-[11px] text-muted-foreground">
            {protocol.sections.length} sections · {protocol.references.length} references
          </p>
        </div>
        <button type="button" onClick={handleExport} disabled={exporting}
          className={cn(
            'inline-flex h-10 items-center gap-2 rounded-full px-5 text-sm font-semibold transition-colors',
            'bg-accent text-accent-foreground hover:opacity-90 disabled:opacity-50'
          )}>
          {exporting
            ? <><Loader2 className="h-4 w-4 animate-spin" /> Exporting…</>
            : <><Download className="h-4 w-4" /> Download .docx</>}
        </button>
      </div>

      {/* Title block */}
      <div className="rounded-xl border-2 border-border bg-card p-5">
        <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Title</p>
        <h1 className="text-base font-bold leading-snug text-foreground">{protocol.title}</h1>
        <div className="mt-3 flex flex-wrap gap-2">
          {[
            d.studyType.replace(/_/g, ' '),
            d.department,
            d.institution,
            d.duration && `Duration: ${d.duration}`,
            d.sampleSize && `n = ${d.sampleSize}`,
          ].filter(Boolean).map((tag) => (
            <span key={tag} className="rounded-full bg-muted px-2.5 py-1 text-[11px] font-medium text-muted-foreground capitalize">
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Sections */}
      <div className="rounded-xl border border-border bg-card px-5">
        {protocol.sections.map((section) => (
          <Section key={section.heading} heading={section.heading} content={section.content} />
        ))}
      </div>

      {/* Export reminder */}
      <div className="rounded-xl border border-dashed border-border bg-muted/30 p-4 text-center">
        <p className="text-xs text-muted-foreground">
          <span className="font-semibold text-foreground">Tip:</span> Download the .docx and open in Microsoft Word to add your
          Introduction narrative, customise the methodology, and fill in bracketed placeholders before submission.
        </p>
      </div>
    </div>
  )
}
