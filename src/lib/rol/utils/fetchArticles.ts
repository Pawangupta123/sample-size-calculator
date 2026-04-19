import type { Article } from '@/lib/literature/types'
import { detectSource } from '@/lib/citations/utils/detectType'
import { fetchCrossRef } from '@/lib/citations/utils/fetchCrossRef'
import { fetchPubMed } from '@/lib/citations/utils/fetchPubMed'
import { searchEuropePmc } from '@/lib/literature/utils/searchEuropePmc'

export interface FetchResult {
  articles: Article[]
  failures: string[]
}

function makeId(): string {
  return `rol-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`
}

async function enrichWithAbstract(pmid: string | undefined, doi: string | undefined): Promise<string | undefined> {
  const queryBits: string[] = []
  if (pmid) queryBits.push(`EXT_ID:${pmid} AND SRC:MED`)
  else if (doi) queryBits.push(`DOI:${doi}`)
  if (queryBits.length === 0) return undefined
  try {
    const result = await searchEuropePmc({ query: queryBits.join(' '), pageSize: 1 })
    return result.articles[0]?.abstract
  } catch {
    return undefined
  }
}

export async function fetchArticlesFromInput(rawLines: string[]): Promise<FetchResult> {
  const articles: Article[] = []
  const failures: string[] = []

  for (const raw of rawLines) {
    const detected = detectSource(raw)
    try {
      if (detected.type === 'pmid') {
        const meta = await fetchPubMed(detected.value)
        const abstract = await enrichWithAbstract(meta.pmid, meta.doi)
        articles.push({
          id: makeId(),
          pmid: meta.pmid,
          doi: meta.doi,
          title: meta.title,
          authors: meta.authors.map((a) => (a.given ? `${a.family} ${a.given}` : a.family)),
          journal: meta.journal,
          year: meta.year,
          abstract,
          pubmedUrl: meta.pmid ? `https://pubmed.ncbi.nlm.nih.gov/${meta.pmid}/` : undefined,
          doiUrl: meta.doi ? `https://doi.org/${meta.doi}` : undefined,
          sources: ['pubmed'],
        })
      } else if (detected.type === 'doi') {
        const meta = await fetchCrossRef(detected.value)
        const abstract = await enrichWithAbstract(meta.pmid, meta.doi)
        articles.push({
          id: makeId(),
          pmid: meta.pmid,
          doi: meta.doi,
          title: meta.title,
          authors: meta.authors.map((a) => (a.given ? `${a.family} ${a.given}` : a.family)),
          journal: meta.journal,
          year: meta.year,
          abstract,
          pubmedUrl: meta.pmid ? `https://pubmed.ncbi.nlm.nih.gov/${meta.pmid}/` : undefined,
          doiUrl: meta.doi ? `https://doi.org/${meta.doi}` : undefined,
          sources: ['europepmc'],
        })
      } else {
        failures.push(raw)
      }
    } catch {
      failures.push(raw)
    }
  }

  return { articles, failures }
}
