import type { Article } from '../types'

function articleToRis(a: Article): string {
  const lines: string[] = ['TY  - JOUR']
  for (const author of a.authors) {
    lines.push(`AU  - ${author}`)
  }
  lines.push(`TI  - ${a.title}`)
  if (a.journal) lines.push(`JO  - ${a.journal}`)
  if (a.year) lines.push(`PY  - ${a.year}`)
  if (a.doi) lines.push(`DO  - ${a.doi}`)
  if (a.pmid) lines.push(`AN  - ${a.pmid}`)
  if (a.pubmedUrl) lines.push(`UR  - ${a.pubmedUrl}`)
  else if (a.doiUrl) lines.push(`UR  - ${a.doiUrl}`)
  if (a.abstract) lines.push(`AB  - ${a.abstract.replace(/\n/g, ' ')}`)
  lines.push('ER  - ')
  return lines.join('\n')
}

export function exportArticlesToRis(articles: Article[], filename = 'literature.ris'): void {
  const content = articles.map(articleToRis).join('\n\n')
  const blob = new Blob([content], { type: 'application/x-research-info-systems;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}
