import type { Article } from '@/lib/literature/types'
import type { Theme } from '../types'

export interface ThemedArticles {
  theme: Theme
  articles: Article[]
}

function tokenise(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/\s+/)
    .filter((t) => t.length > 2)
}

function scoreArticleAgainstTheme(article: Article, theme: Theme): number {
  const haystack = [article.title, article.abstract ?? '']
    .join(' ')
    .toLowerCase()
  const tokens = theme.keywords.flatMap((kw) =>
    kw.toLowerCase().split(/\s*,\s*|\s+/).filter(Boolean)
  )
  let score = 0
  for (const token of tokens) {
    if (token.length < 3) continue
    const hits = haystack.split(token).length - 1
    score += hits
  }
  return score
}

export function classifyByTheme(articles: Article[], themes: Theme[]): ThemedArticles[] {
  if (themes.length === 0) {
    return [{ theme: { id: 'default', name: 'General', keywords: [] }, articles }]
  }
  const buckets: ThemedArticles[] = themes.map((t) => ({ theme: t, articles: [] }))
  const fallback: Article[] = []

  for (const article of articles) {
    const scores = themes.map((t) => ({
      theme: t,
      score: scoreArticleAgainstTheme(article, t),
    }))
    const best = scores.reduce((a, b) => (b.score > a.score ? b : a), { theme: themes[0], score: 0 })
    if (best.score === 0) {
      fallback.push(article)
      continue
    }
    const bucket = buckets.find((b) => b.theme.id === best.theme.id)
    bucket?.articles.push(article)
  }

  if (fallback.length > 0) {
    buckets.push({
      theme: { id: 'other', name: 'Other findings', keywords: [] },
      articles: fallback,
    })
  }

  return buckets.filter((b) => b.articles.length > 0)
}

export function suggestThemes(articles: Article[]): Theme[] {
  const counts = new Map<string, number>()
  for (const article of articles) {
    const tokens = tokenise(`${article.title} ${article.abstract ?? ''}`)
    const uniq = Array.from(new Set(tokens))
    for (const token of uniq) {
      counts.set(token, (counts.get(token) ?? 0) + 1)
    }
  }
  const stopwords = new Set([
    'the', 'and', 'with', 'for', 'are', 'was', 'were', 'this', 'that', 'study', 'patients',
    'between', 'among', 'results', 'conclusion', 'objective', 'methods', 'using', 'used',
  ])
  const top = Array.from(counts.entries())
    .filter(([token]) => !stopwords.has(token))
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)

  return top.map(([token], idx) => ({
    id: `suggested-${idx}`,
    name: token.charAt(0).toUpperCase() + token.slice(1),
    keywords: [token],
  }))
}
