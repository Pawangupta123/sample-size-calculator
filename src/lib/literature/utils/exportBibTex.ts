import type { Article } from '../types'

function bibtexKey(article: Article): string {
  const firstAuthor = article.authors[0]?.split(/\s+/)[0]?.toLowerCase().replace(/[^a-z]/g, '') ?? 'unknown'
  const year = article.year ?? 'nd'
  const titleWord = article.title.split(/\s+/)[0]?.toLowerCase().replace(/[^a-z]/g, '') ?? 'article'
  return `${firstAuthor}${year}${titleWord}`
}

function escapeBib(val: string): string {
  return val.replace(/[{}\\]/g, (c) => `\\${c}`)
}

function articleToBibTex(a: Article): string {
  const lines: string[] = [`@article{${bibtexKey(a)},`]
  lines.push(`  author    = {${escapeBib(a.authors.join(' and '))}},`)
  lines.push(`  title     = {${escapeBib(a.title)}},`)
  if (a.journal) lines.push(`  journal   = {${escapeBib(a.journal)}},`)
  if (a.year) lines.push(`  year      = {${a.year}},`)
  if (a.doi) lines.push(`  doi       = {${a.doi}},`)
  if (a.pmid) lines.push(`  note      = {PMID: ${a.pmid}},`)
  if (a.pubmedUrl) lines.push(`  url       = {${a.pubmedUrl}},`)
  lines.push('}')
  return lines.join('\n')
}

export function exportArticlesToBibTex(articles: Article[], filename = 'literature.bib'): void {
  const content = articles.map(articleToBibTex).join('\n\n')
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}
