import { formatVancouver } from '@/lib/citations/utils/formatVancouver'
import type { Article } from '@/lib/literature/types'
import type { ProtocolDocument, ProtocolFormData, ProtocolSection } from './types'
import {
  getConsentFormEnglish,
  getConsentFormHindi,
  getDataCollectionForm,
  getIntroductionTemplate,
  getSampleSizeTemplate,
  getStatisticsTemplate,
  getStudyDesignTemplate,
  STUDY_TYPE_LABELS,
} from './templates'

function articleToVancouver(article: Article, index: number): string {
  const formatted = formatVancouver({
    authors: article.authors.map((name) => {
      const parts = name.trim().split(/\s+/)
      return { family: parts[0] ?? name, given: parts.slice(1).join(' ') || undefined }
    }),
    title: article.title,
    journal: article.journal,
    journalAbbr: article.journal,
    year: article.year,
    doi: article.doi,
    pmid: article.pmid,
  })
  const pubmedLink = article.pubmedUrl ?? (article.pmid ? `https://pubmed.ncbi.nlm.nih.gov/${article.pmid}/` : '')
  return `${index + 1}. ${formatted}${pubmedLink ? ` Available from: ${pubmedLink}` : ''}`
}

function buildRolSection(articles: Article[]): string[] {
  if (articles.length === 0) {
    return [
      '[No references selected. Please search and select references from the References tab.]',
      '',
      'The Review of Literature should include at least 10 studies arranged in chronological order, covering both Indian and international research on the topic.',
    ]
  }

  const sorted = [...articles].sort((a, b) => (a.year ?? 0) - (b.year ?? 0))
  const lines: string[] = []

  lines.push(`The following studies have been reviewed in relation to the present study on "${articles[0]?.title?.slice(0, 50) ?? 'the topic'}":`)
  lines.push('')

  sorted.forEach((a, i) => {
    const num = i + 1
    const authorStr = a.authors.length > 0
      ? a.authors.slice(0, 2).join(', ') + (a.authors.length > 2 ? ' et al.' : '')
      : 'Author et al.'
    const year = a.year ? `(${a.year})` : ''
    const abstract = a.abstract
      ? a.abstract.slice(0, 300).replace(/\s+/g, ' ') + (a.abstract.length > 300 ? '…' : '')
      : '[Abstract not available. Please summarise the key findings of this study here.]'

    lines.push(`${num}. ${authorStr} ${year} conducted a study titled "${a.title}". ${abstract} [${num}]`)
    lines.push('')
  })

  return lines
}

export function buildProtocol(
  formData: ProtocolFormData,
  references: Article[]
): ProtocolDocument {
  const sections: ProtocolSection[] = []

  // 1. Introduction
  sections.push({
    heading: '2. INTRODUCTION',
    level: 1,
    content: getIntroductionTemplate(formData),
  })

  // 3. Review of Literature
  sections.push({
    heading: '3. REVIEW OF LITERATURE',
    level: 1,
    content: buildRolSection(references),
  })

  // 4. Objectives
  const primaryObj = formData.primaryOutcome
    ? `To evaluate ${formData.primaryOutcome} in ${formData.population || 'the study population'} with ${formData.condition}.`
    : `[State the primary objective of the study]`

  const secondaryObjs = formData.secondaryOutcomes
    ? formData.secondaryOutcomes.split('\n').filter(Boolean).map((o, i) => `  ${i + 1}. ${o.trim()}`)
    : [
        '  1. To assess the safety and tolerability of the intervention.',
        '  2. To identify potential risk factors associated with the outcome.',
        '  3. To describe the demographic and clinical profile of the study population.',
      ]

  sections.push({
    heading: '4. OBJECTIVES',
    level: 1,
    content: [
      '4.1 Primary Objective',
      primaryObj,
      '',
      '4.2 Secondary Objectives',
      ...secondaryObjs,
    ],
  })

  // 5. Methodology
  const inclCriteria = formData.inclusionCriteria
    ? formData.inclusionCriteria.split('\n').filter(Boolean).map((c, i) => `  ${i + 1}. ${c.trim()}`)
    : [
        `  1. Age: [specify age group]`,
        `  2. Patients diagnosed with ${formData.condition || '[condition]'} based on [specify diagnostic criteria].`,
        `  3. Patients willing to give written informed consent.`,
        `  4. Patients admitted/attending ${formData.setting || formData.institution || 'the study site'}.`,
      ]

  const exclCriteria = formData.exclusionCriteria
    ? formData.exclusionCriteria.split('\n').filter(Boolean).map((c, i) => `  ${i + 1}. ${c.trim()}`)
    : [
        `  1. Patients with known hypersensitivity or contraindication to ${formData.intervention || 'the intervention'}.`,
        `  2. Patients with severe co-morbidities that may confound the study outcomes.`,
        `  3. Pregnant or lactating women (if applicable).`,
        `  4. Patients who have received related treatment in the past [specify duration].`,
        `  5. Patients unable or unwilling to give informed consent.`,
      ]

  sections.push({
    heading: '5. METHODOLOGY',
    level: 1,
    content: [
      '5.1 Study Design',
      ...getStudyDesignTemplate(formData),
      '',
      '5.2 Study Setting',
      `The study will be conducted at the Department of ${formData.department}, ${formData.institution || '[Name of Institution]'}. [Brief description of the institution and patient load].`,
      '',
      '5.3 Study Duration',
      `The study will be conducted over a period of ${formData.duration || '[specify duration, e.g., 18 months]'} from the date of approval by the Institutional Ethics Committee.`,
      '',
      '5.4 Sample Size Calculation',
      ...getSampleSizeTemplate(formData),
      '',
      '5.5 Inclusion Criteria',
      ...inclCriteria,
      '',
      '5.6 Exclusion Criteria',
      ...exclCriteria,
      '',
      '5.7 Data Collection',
      `Data will be collected using a pre-designed, structured data collection form (Annexure I). After obtaining written informed consent, eligible participants will be enrolled. A detailed history will be taken and clinical examination performed. Relevant investigations will be ordered as per the protocol. Data will be recorded at enrolment${formData.studyType !== 'cross_sectional' && formData.studyType !== 'descriptive' ? ' and at defined follow-up intervals' : ''}.`,
      `All data will be entered in a password-protected electronic database (Microsoft Excel). Data quality will be ensured by double data entry and regular audit.`,
      '',
      '5.8 Statistical Analysis Plan',
      ...getStatisticsTemplate(formData),
    ],
  })

  // 6. Data Collection Form
  sections.push({
    heading: '6. DATA COLLECTION FORM (Annexure I)',
    level: 1,
    content: getDataCollectionForm(formData),
  })

  // 7. Consent Forms
  sections.push({
    heading: '7. PATIENT CONSENT FORM (Annexure II)',
    level: 1,
    content: [
      '7.1 English Version',
      '─────────────────────────────────────────────────',
      ...getConsentFormEnglish(formData),
      '',
      '',
      '7.2 Hindi Version (हिंदी)',
      '─────────────────────────────────────────────────',
      ...getConsentFormHindi(formData),
    ],
  })

  // 8. References
  sections.push({
    heading: '8. REFERENCES',
    level: 1,
    content:
      references.length > 0
        ? references.map((a, i) => articleToVancouver(a, i))
        : ['[No references added. Please select references from the References tab.]'],
  })

  return {
    title: formData.title,
    sections,
    references,
    formData,
  }
}
