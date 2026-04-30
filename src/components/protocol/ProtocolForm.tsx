'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import type { Department, ProtocolFormData, StudyType } from '@/lib/protocol/types'
import { STUDY_TYPE_LABELS } from '@/lib/protocol/templates'
import { cn } from '@/lib/utils'

const DEPARTMENTS: Department[] = [
  'Medicine', 'Pediatrics', 'Surgery', 'Obstetrics & Gynaecology',
  'Orthopaedics', 'Psychiatry', 'Radiology', 'Pathology',
  'Pharmacology', 'Anaesthesia', 'ENT', 'Ophthalmology',
  'Community Medicine', 'Dermatology', 'Cardiology', 'Pulmonology',
  'Nephrology', 'Neurology', 'Oncology', 'Emergency Medicine',
]

const EMPTY_FORM: ProtocolFormData = {
  title: '', studyType: 'cross_sectional', department: 'Medicine',
  institution: '', setting: '', investigatorName: '', guideName: '',
  population: '', condition: '', intervention: '', primaryOutcome: '',
  secondaryOutcomes: '', duration: '', sampleSize: '',
  inclusionCriteria: '', exclusionCriteria: '', additionalInfo: '',
}

interface ProtocolFormProps {
  onSubmit: (data: ProtocolFormData) => void
  isBuilding: boolean
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}{required && <span className="ml-1 text-destructive">*</span>}
      </label>
      {children}
    </div>
  )
}

const inputCls = 'h-9 w-full rounded-lg border border-input bg-card px-3 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20'
const textareaCls = 'w-full rounded-xl border border-input bg-card p-3 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 resize-y'

export function ProtocolForm({ onSubmit, isBuilding }: ProtocolFormProps) {
  const [form, setForm] = useState<ProtocolFormData>(EMPTY_FORM)
  const [section, setSection] = useState<'basic' | 'study' | 'criteria'>('basic')

  const set = (key: keyof ProtocolFormData, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title.trim()) return
    onSubmit(form)
  }

  const tabs = [
    { id: 'basic' as const, label: '1. Basic Info' },
    { id: 'study' as const, label: '2. Study Details' },
    { id: 'criteria' as const, label: '3. Criteria & Outcomes' },
  ]

  return (
    <Card>
      <CardContent className="p-5">
        {/* Tab nav */}
        <div className="mb-5 flex rounded-xl border border-border bg-muted p-1">
          {tabs.map((t) => (
            <button key={t.id} type="button" onClick={() => setSection(t.id)}
              className={cn(
                'flex-1 rounded-lg py-2 text-xs font-semibold transition-colors',
                section === t.id ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
              )}>
              {t.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">

          {section === 'basic' && (
            <>
              <Field label="Study Title" required>
                <textarea
                  value={form.title}
                  onChange={(e) => set('title', e.target.value)}
                  placeholder="e.g., A Study to Evaluate the Efficacy of Azithromycin versus Amoxicillin in Children with Community-Acquired Pneumonia"
                  className={cn(textareaCls, 'h-20')}
                  required
                />
              </Field>

              <div className="grid grid-cols-2 gap-4">
                <Field label="Study Type" required>
                  <select value={form.studyType} onChange={(e) => set('studyType', e.target.value as StudyType)}
                    className="h-9 w-full rounded-lg border border-input bg-card px-3 text-sm focus:border-primary focus:outline-none">
                    {(Object.entries(STUDY_TYPE_LABELS) as [StudyType, string][]).map(([v, l]) => (
                      <option key={v} value={v}>{l}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Department" required>
                  <select value={form.department} onChange={(e) => set('department', e.target.value)}
                    className="h-9 w-full rounded-lg border border-input bg-card px-3 text-sm focus:border-primary focus:outline-none">
                    {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
                  </select>
                </Field>
              </div>

              <Field label="Institution Name">
                <input type="text" value={form.institution} onChange={(e) => set('institution', e.target.value)}
                  placeholder="e.g., AIIMS New Delhi / PGIMER Chandigarh / Grant Medical College Mumbai"
                  className={inputCls} />
              </Field>

              <Field label="Study Setting">
                <input type="text" value={form.setting} onChange={(e) => set('setting', e.target.value)}
                  placeholder="e.g., Inpatient ward, PICU, OPD, ICU, Community"
                  className={inputCls} />
              </Field>

              <div className="grid grid-cols-2 gap-4">
                <Field label="Principal Investigator">
                  <input type="text" value={form.investigatorName} onChange={(e) => set('investigatorName', e.target.value)}
                    placeholder="Dr. [Your Name]" className={inputCls} />
                </Field>
                <Field label="Guide / Supervisor">
                  <input type="text" value={form.guideName} onChange={(e) => set('guideName', e.target.value)}
                    placeholder="Dr. [Guide's Name]" className={inputCls} />
                </Field>
              </div>

              <div className="flex justify-end">
                <button type="button" onClick={() => setSection('study')}
                  className="inline-flex h-9 items-center gap-1.5 rounded-full bg-primary px-5 text-xs font-semibold text-primary-foreground hover:bg-[var(--primary-hover)]">
                  Next: Study Details →
                </button>
              </div>
            </>
          )}

          {section === 'study' && (
            <>
              <Field label="Target Population" required>
                <input type="text" value={form.population} onChange={(e) => set('population', e.target.value)}
                  placeholder="e.g., Children aged 6 months to 5 years with community-acquired pneumonia"
                  className={inputCls} required />
              </Field>

              <Field label="Condition / Disease Being Studied" required>
                <input type="text" value={form.condition} onChange={(e) => set('condition', e.target.value)}
                  placeholder="e.g., Community-acquired pneumonia, Type 2 diabetes mellitus, Dengue fever"
                  className={inputCls} required />
              </Field>

              <Field label="Intervention / Exposure (leave blank if descriptive)">
                <input type="text" value={form.intervention} onChange={(e) => set('intervention', e.target.value)}
                  placeholder="e.g., Azithromycin 10 mg/kg/day for 5 days, Laparoscopic vs open appendicectomy"
                  className={inputCls} />
              </Field>

              <div className="grid grid-cols-2 gap-4">
                <Field label="Study Duration">
                  <input type="text" value={form.duration} onChange={(e) => set('duration', e.target.value)}
                    placeholder="e.g., 18 months, 2 years" className={inputCls} />
                </Field>
                <Field label="Expected Sample Size">
                  <input type="text" value={form.sampleSize} onChange={(e) => set('sampleSize', e.target.value)}
                    placeholder="e.g., 60 (30 per group)" className={inputCls} />
                </Field>
              </div>

              <div className="flex justify-between">
                <button type="button" onClick={() => setSection('basic')}
                  className="inline-flex h-9 items-center gap-1.5 rounded-full border border-border px-5 text-xs font-medium text-muted-foreground hover:bg-muted">
                  ← Back
                </button>
                <button type="button" onClick={() => setSection('criteria')}
                  className="inline-flex h-9 items-center gap-1.5 rounded-full bg-primary px-5 text-xs font-semibold text-primary-foreground hover:bg-[var(--primary-hover)]">
                  Next: Criteria →
                </button>
              </div>
            </>
          )}

          {section === 'criteria' && (
            <>
              <Field label="Primary Outcome" required>
                <input type="text" value={form.primaryOutcome} onChange={(e) => set('primaryOutcome', e.target.value)}
                  placeholder="e.g., Clinical cure rate at day 10, Duration of hospital stay, Mortality at 28 days"
                  className={inputCls} required />
              </Field>

              <Field label="Secondary Outcomes (one per line)">
                <textarea value={form.secondaryOutcomes} onChange={(e) => set('secondaryOutcomes', e.target.value)}
                  placeholder={'e.g.,\nTime to clinical improvement\nLength of hospital stay\nAdverse events and tolerability\nCost of treatment'}
                  className={cn(textareaCls, 'h-24')} />
              </Field>

              <Field label="Inclusion Criteria (one per line — leave blank for template)">
                <textarea value={form.inclusionCriteria} onChange={(e) => set('inclusionCriteria', e.target.value)}
                  placeholder={'e.g.,\nAge 6 months to 5 years\nClinically diagnosed pneumonia\nWilling to give consent'}
                  className={cn(textareaCls, 'h-24')} />
              </Field>

              <Field label="Exclusion Criteria (one per line — leave blank for template)">
                <textarea value={form.exclusionCriteria} onChange={(e) => set('exclusionCriteria', e.target.value)}
                  placeholder={'e.g.,\nKnown allergy to macrolides\nSevere immunodeficiency\nHospital-acquired pneumonia'}
                  className={cn(textareaCls, 'h-24')} />
              </Field>

              <Field label="Additional Information">
                <textarea value={form.additionalInfo} onChange={(e) => set('additionalInfo', e.target.value)}
                  placeholder="Any other relevant details (e.g., double-blind, funding source, special considerations)"
                  className={cn(textareaCls, 'h-16')} />
              </Field>

              <div className="flex items-center justify-between">
                <button type="button" onClick={() => setSection('study')}
                  className="inline-flex h-9 items-center gap-1.5 rounded-full border border-border px-5 text-xs font-medium text-muted-foreground hover:bg-muted">
                  ← Back
                </button>
                <button type="submit" disabled={!form.title.trim() || isBuilding}
                  className="inline-flex h-10 items-center gap-2 rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground transition-colors hover:bg-[var(--primary-hover)] disabled:cursor-not-allowed disabled:opacity-50">
                  {isBuilding ? 'Building…' : '🏗️ Build Protocol →'}
                </button>
              </div>
            </>
          )}
        </form>
      </CardContent>
    </Card>
  )
}
