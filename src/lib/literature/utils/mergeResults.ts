import type { Article } from '../types'

function key(a: Article): string {
  if (a.doi) return `doi:${a.doi.toLowerCase()}`
  if (a.pmid) return `pmid:${a.pmid}`
  return `title:${a.title.toLowerCase().slice(0, 80)}`
}

export function mergeArticles(lists: Article[][]): Article[] {
  const byKey = new Map<string, Article>()

  for (const list of lists) {
    for (const article of list) {
      const k = key(article)
      const existing = byKey.get(k)
      if (!existing) {
        byKey.set(k, { ...article })
        continue
      }
      byKey.set(k, {
        ...existing,
        abstract: existing.abstract ?? article.abstract,
        europePmcUrl: existing.europePmcUrl ?? article.europePmcUrl,
        pubmedUrl: existing.pubmedUrl ?? article.pubmedUrl,
        doiUrl: existing.doiUrl ?? article.doiUrl,
        pdfUrl: existing.pdfUrl ?? article.pdfUrl,
        openAlexId: existing.openAlexId ?? article.openAlexId,
        citedBy: existing.citedBy ?? article.citedBy,
        openAccess: existing.openAccess ?? article.openAccess,
        concepts: existing.concepts ?? article.concepts,
        trialStatus: existing.trialStatus ?? article.trialStatus,
        sources: Array.from(new Set([...existing.sources, ...article.sources])),
      })
    }
  }

  return Array.from(byKey.values()).sort((a, b) => (b.year ?? 0) - (a.year ?? 0))
}
