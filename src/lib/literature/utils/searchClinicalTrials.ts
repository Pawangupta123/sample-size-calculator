import type { Article } from '../types'

interface CTStudy {
  protocolSection?: {
    identificationModule?: { nctId?: string; briefTitle?: string }
    statusModule?: { overallStatus?: string; startDateStruct?: { date?: string } }
    descriptionModule?: { briefSummary?: string }
    conditionsModule?: { conditions?: string[] }
    designModule?: { phases?: string[]; studyType?: string }
    sponsorCollaboratorsModule?: { leadSponsor?: { name?: string } }
  }
}

interface CTResponse {
  studies?: CTStudy[]
  totalCount?: number
}

const ENDPOINT = 'https://clinicaltrials.gov/api/v2/studies'

function parseYear(dateStr?: string): number | undefined {
  if (!dateStr) return undefined
  const m = dateStr.match(/\b(19|20)\d{2}\b/)
  return m ? parseInt(m[0], 10) : undefined
}

function toArticle(study: CTStudy): Article | null {
  const id = study.protocolSection?.identificationModule
  const status = study.protocolSection?.statusModule
  const desc = study.protocolSection?.descriptionModule
  const design = study.protocolSection?.designModule
  const sponsor = study.protocolSection?.sponsorCollaboratorsModule

  const nctId = id?.nctId
  if (!nctId || !id?.briefTitle) return null

  const phases = (design?.phases ?? [])
    .map((p) => p.replace('PHASE', 'Phase '))
    .join(', ')

  const conditions = (study.protocolSection?.conditionsModule?.conditions ?? [])
    .slice(0, 3)
    .join(', ')

  return {
    id: `ct-${nctId}`,
    title: id.briefTitle,
    authors: [sponsor?.leadSponsor?.name ?? 'Unknown sponsor'],
    journal: [
      'ClinicalTrials.gov',
      phases && `Phase: ${phases}`,
      conditions && conditions,
    ].filter(Boolean).join(' · '),
    year: parseYear(status?.startDateStruct?.date),
    abstract: desc?.briefSummary,
    pubmedUrl: `https://clinicaltrials.gov/study/${nctId}`,
    sources: ['clinicaltrials'],
    trialStatus: status?.overallStatus,
  }
}

export interface ClinicalTrialsSearchArgs {
  query: string
  pageSize?: number
  signal?: AbortSignal
}

export async function searchClinicalTrials({
  query,
  pageSize = 10,
  signal,
}: ClinicalTrialsSearchArgs): Promise<{ articles: Article[]; total: number }> {
  const url = new URL(ENDPOINT)
  url.searchParams.set('query.term', query)
  url.searchParams.set('pageSize', String(pageSize))
  url.searchParams.set('format', 'json')

  const res = await fetch(url.toString(), { signal })
  if (!res.ok) throw new Error(`ClinicalTrials search failed (HTTP ${res.status})`)

  const data = (await res.json()) as CTResponse
  const articles = (data.studies ?? []).map(toArticle).filter((a): a is Article => a !== null)

  return { articles, total: data.totalCount ?? 0 }
}
