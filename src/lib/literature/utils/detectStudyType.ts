export type StudyTag =
  | 'RCT'
  | 'Meta-analysis'
  | 'Systematic review'
  | 'Cohort'
  | 'Case-control'
  | 'Cross-sectional'
  | 'Double-blind'
  | 'Placebo-controlled'
  | 'Multi-center'
  | 'Prospective'
  | 'Retrospective'

const PATTERNS: Array<{ tag: StudyTag; pattern: RegExp }> = [
  { tag: 'RCT',                 pattern: /\b(randomized|randomised|randomization|randomisation|rct|randomized controlled trial)\b/i },
  { tag: 'Meta-analysis',       pattern: /\bmeta.?analysis\b/i },
  { tag: 'Systematic review',   pattern: /\bsystematic\s+review\b/i },
  { tag: 'Cohort',              pattern: /\bcohort\s*(study|studies|trial)?\b/i },
  { tag: 'Case-control',        pattern: /\bcase.control\b/i },
  { tag: 'Cross-sectional',     pattern: /\bcross.?sectional\b/i },
  { tag: 'Double-blind',        pattern: /\bdouble.blind(ed)?\b/i },
  { tag: 'Placebo-controlled',  pattern: /\bplacebo.controlled\b/i },
  { tag: 'Multi-center',        pattern: /\bmulti.?cent(er|re)\b/i },
  { tag: 'Prospective',         pattern: /\bprospective\b/i },
  { tag: 'Retrospective',       pattern: /\bretrospective\b/i },
]

const PREPRINT_MARKERS = [
  'biorxiv', 'medrxiv', 'ssrn', 'research square', 'preprint',
  'arxiv', 'chemrxiv', 'psyarxiv', 'eartharxiv',
]

export function detectStudyTags(title?: string, abstract?: string): StudyTag[] {
  const text = `${title ?? ''} ${abstract ?? ''}`.toLowerCase()
  if (!text.trim()) return []

  const tags: StudyTag[] = []
  for (const { tag, pattern } of PATTERNS) {
    if (pattern.test(text)) tags.push(tag)
  }

  // RCT implies prospective — no need to double-show
  if (tags.includes('RCT') && tags.includes('Prospective')) {
    const idx = tags.indexOf('Prospective')
    tags.splice(idx, 1)
  }

  return tags.slice(0, 4)
}

export function detectPreprint(journal?: string, sourceUrl?: string): boolean {
  const text = `${journal ?? ''} ${sourceUrl ?? ''}`.toLowerCase()
  return PREPRINT_MARKERS.some((m) => text.includes(m))
}
