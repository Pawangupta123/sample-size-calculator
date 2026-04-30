import type { Article } from '../types'
import { openAlexToArticle } from './searchOpenAlex'

const MAILTO = 'pawankumar37060@gmail.com'
const BASE = 'https://api.openalex.org'
const SELECT = 'id,doi,title,authorships,primary_location,publication_year,open_access,cited_by_count,ids,concepts'

async function resolveOpenAlexId(doi: string): Promise<string | null> {
  try {
    const clean = doi.replace(/^https?:\/\/(dx\.)?doi\.org\//, '')
    const res = await fetch(
      `${BASE}/works/https://doi.org/${encodeURIComponent(clean)}?select=id&mailto=${MAILTO}`
    )
    if (!res.ok) return null
    const data = (await res.json()) as { id?: string }
    return data.id ?? null
  } catch {
    return null
  }
}

export async function fetchCitingPapers(
  article: Article,
  limit = 8
): Promise<Article[]> {
  const workId = article.openAlexId ?? (article.doi ? await resolveOpenAlexId(article.doi) : null)
  if (!workId) return []

  const url = new URL(`${BASE}/works`)
  url.searchParams.set('filter', `cites:${workId}`)
  url.searchParams.set('per-page', String(limit))
  url.searchParams.set('sort', 'cited_by_count:desc')
  url.searchParams.set('mailto', MAILTO)
  url.searchParams.set('select', SELECT)

  try {
    const res = await fetch(url.toString())
    if (!res.ok) return []
    const data = (await res.json()) as { results?: unknown[] }
    return (data.results ?? []).map(openAlexToArticle)
  } catch {
    return []
  }
}

export async function fetchRelatedWorks(
  article: Article,
  limit = 6
): Promise<Article[]> {
  const workId = article.openAlexId ?? (article.doi ? await resolveOpenAlexId(article.doi) : null)
  if (!workId) return []

  try {
    const workRes = await fetch(
      `${BASE}/works/${encodeURIComponent(workId)}?select=related_works&mailto=${MAILTO}`
    )
    if (!workRes.ok) return []
    const workData = (await workRes.json()) as { related_works?: string[] }
    const relatedIds = (workData.related_works ?? []).slice(0, limit)
    if (relatedIds.length === 0) return []

    const url = new URL(`${BASE}/works`)
    url.searchParams.set('filter', `openalex:${relatedIds.join('|')}`)
    url.searchParams.set('per-page', String(limit))
    url.searchParams.set('mailto', MAILTO)
    url.searchParams.set('select', SELECT)

    const res = await fetch(url.toString())
    if (!res.ok) return []
    const data = (await res.json()) as { results?: unknown[] }
    return (data.results ?? []).map(openAlexToArticle)
  } catch {
    return []
  }
}
