import type { SearchFilters, StudyTypeFilter } from '../types'

// ─── shared ──────────────────────────────────────────────────────────────────

function sanitise(text: string): string {
  return text
    .replace(/[\r\n]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 1800)
}

const STUDY_TYPE_FILTERS: Record<StudyTypeFilter, string> = {
  any: '',
  rct: 'AND randomized controlled trial[pt]',
  meta: 'AND meta-analysis[pt]',
  review: 'AND (systematic review[pt] OR review[pt])',
  cohort: 'AND cohort studies[mh]',
  casecontrol: 'AND case-control studies[mh]',
}

// ─── per-source query builders ───────────────────────────────────────────────

export function buildPubmedQuery(filters: SearchFilters): string {
  const parts: string[] = [sanitise(filters.query)]

  if (filters.meshTerms && filters.meshTerms.length > 0) {
    for (const term of filters.meshTerms) {
      parts.push(`AND "${term}"[MeSH Terms]`)
    }
  }

  if (filters.yearFrom || filters.yearTo) {
    const from = filters.yearFrom ?? 1900
    const to = filters.yearTo ?? new Date().getFullYear()
    parts.push(`AND (${from}:${to}[dp])`)
  }

  const studyFilter = STUDY_TYPE_FILTERS[filters.studyType ?? 'any']
  if (studyFilter) parts.push(studyFilter)

  if (filters.journal) parts.push(`AND "${filters.journal}"[ta]`)

  if (filters.openAccessOnly) parts.push('AND free full text[sb]')

  return parts.filter(Boolean).join(' ')
}

export function buildEuropePmcQuery(filters: SearchFilters): string {
  const parts: string[] = [`(${sanitise(filters.query)})`]

  if (filters.meshTerms && filters.meshTerms.length > 0) {
    for (const term of filters.meshTerms) {
      parts.push(`AND MESH_TERM:"${term}"`)
    }
  }

  if (filters.yearFrom || filters.yearTo) {
    const from = filters.yearFrom ?? 1900
    const to = filters.yearTo ?? new Date().getFullYear()
    parts.push(`AND (PUB_YEAR:[${from} TO ${to}])`)
  }

  if (filters.studyType === 'rct') parts.push('AND PUB_TYPE:"Randomized Controlled Trial"')
  if (filters.studyType === 'meta') parts.push('AND PUB_TYPE:"Meta-Analysis"')
  if (filters.studyType === 'review') parts.push('AND PUB_TYPE:"Review"')

  if (filters.journal) parts.push(`AND JOURNAL:"${filters.journal}"`)

  if (filters.openAccessOnly) parts.push('AND OPEN_ACCESS:y')

  return parts.join(' ')
}

export function buildOpenAlexQuery(filters: SearchFilters): string {
  const parts = [sanitise(filters.query)]
  if (filters.meshTerms && filters.meshTerms.length > 0) {
    parts.push(filters.meshTerms.join(' '))
  }
  return parts.filter(Boolean).join(' ')
}
