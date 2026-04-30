import type { Article } from '../types'

function escapeCsv(val: string): string {
  if (/[",\n\r]/.test(val)) return `"${val.replace(/"/g, '""')}"`
  return val
}

const HEADERS = 'Title,Authors,Journal,Year,PMID,DOI,PubMed URL,DOI URL,Open Access,Cited By,Abstract'

function toRow(a: Article): string {
  return [
    escapeCsv(a.title),
    escapeCsv(a.authors.join('; ')),
    escapeCsv(a.journal ?? ''),
    escapeCsv(a.year?.toString() ?? ''),
    escapeCsv(a.pmid ?? ''),
    escapeCsv(a.doi ?? ''),
    escapeCsv(a.pubmedUrl ?? ''),
    escapeCsv(a.doiUrl ?? ''),
    escapeCsv(a.openAccess ? 'Yes' : 'No'),
    escapeCsv(typeof a.citedBy === 'number' ? String(a.citedBy) : ''),
    escapeCsv(a.abstract?.slice(0, 500) ?? ''),
  ].join(',')
}

export function exportArticlesToCsv(articles: Article[], filename = 'literature-search.csv'): void {
  const csv = [HEADERS, ...articles.map(toRow)].join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}
