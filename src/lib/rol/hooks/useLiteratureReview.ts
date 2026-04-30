'use client'

import { useCallback, useState } from 'react'
import { toastError, toastSuccess, toastWarning } from '@/lib/toast'
import type { Article } from '@/lib/literature/types'
import type {
  CitationStyle,
  GeneratedReview,
  ManualArticleInput,
  ReviewStyle,
  Theme,
  WordTarget,
} from '../types'
import { fetchCrossRef } from '@/lib/citations/utils/fetchCrossRef'
import { buildReview } from '../utils/buildReview'
import { downloadBlob, exportReviewAsDocx } from '../utils/exportDocx'
import { buildArticleFromPdf, extractPdf } from '../utils/extractPdf'
import { fetchArticlesFromInput } from '../utils/fetchArticles'
import { suggestThemes } from '../utils/classifyByTheme'

export interface UseLiteratureReviewResult {
  articles: Article[]
  topic: string
  style: ReviewStyle
  wordTarget: WordTarget
  citationStyle: CitationStyle
  themes: Theme[]
  review: GeneratedReview | null
  isFetching: boolean
  isGenerating: boolean
  isExporting: boolean

  setTopic: (topic: string) => void
  setStyle: (style: ReviewStyle) => void
  setWordTarget: (target: WordTarget) => void
  setCitationStyle: (s: CitationStyle) => void
  setThemes: (themes: Theme[]) => void
  addArticles: (raw: string) => Promise<void>
  addManualArticle: (input: ManualArticleInput) => boolean
  addPdfArticles: (files: FileList | File[]) => Promise<void>
  importArticles: (articles: Article[]) => void
  removeArticle: (id: string) => void
  clearArticles: () => void
  generate: () => void
  exportDocx: () => Promise<void>
  autoSuggestThemes: () => void
}

function slug(text: string): string {
  return (
    text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 60) || 'review'
  )
}

function makeManualId(): string {
  return `manual-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`
}

export function useLiteratureReview(): UseLiteratureReviewResult {
  const [articles, setArticles] = useState<Article[]>([])
  const [topic, setTopic] = useState('')
  const [style, setStyle] = useState<ReviewStyle>('narrative')
  const [wordTarget, setWordTarget] = useState<WordTarget>('standard')
  const [citationStyle, setCitationStyle] = useState<CitationStyle>('vancouver')
  const [themes, setThemes] = useState<Theme[]>([])
  const [review, setReview] = useState<GeneratedReview | null>(null)
  const [isFetching, setIsFetching] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isExporting, setIsExporting] = useState(false)

  const addArticles = useCallback(async (raw: string) => {
    const lines = raw.split(/\r?\n/).map((l) => l.trim()).filter(Boolean)
    if (lines.length === 0) {
      toastError('Paste at least one DOI or PMID.')
      return
    }
    setIsFetching(true)
    try {
      const { articles: fetched, failures } = await fetchArticlesFromInput(lines)
      if (fetched.length === 0) {
        toastError('Could not fetch any articles', 'Check your DOIs / PMIDs.')
        return
      }
      setArticles((prev) => {
        const seen = new Set(prev.map((a) => a.pmid ?? a.doi ?? a.id))
        const merged = [...prev]
        for (const article of fetched) {
          const key = article.pmid ?? article.doi ?? article.id
          if (!seen.has(key)) merged.push(article)
        }
        return merged
      })
      if (failures.length > 0) {
        toastWarning(
          `${fetched.length} fetched, ${failures.length} failed`,
          'Some inputs could not be resolved — consider adding those manually.'
        )
      } else {
        toastSuccess(
          `${fetched.length} article${fetched.length === 1 ? '' : 's'} added`
        )
      }
    } catch (err) {
      toastError(
        'Fetch failed',
        err instanceof Error ? err.message : 'Unexpected error.'
      )
    } finally {
      setIsFetching(false)
    }
  }, [])

  const addManualArticle = useCallback((input: ManualArticleInput): boolean => {
    const title = input.title.trim()
    if (!title) {
      toastError('Title is required for manual entry.')
      return false
    }
    const authors = input.authors
      .split(/,\s*|\s*;\s*|\s+and\s+/i)
      .map((a) => a.trim())
      .filter(Boolean)
    if (authors.length === 0) {
      toastError('At least one author is required.')
      return false
    }
    const article: Article = {
      id: makeManualId(),
      title,
      authors,
      journal: input.journal?.trim() || undefined,
      year: input.year,
      abstract: input.abstract?.trim() || undefined,
      sources: ['manual'],
    }
    setArticles((prev) => [...prev, article])
    toastSuccess('Manual article added')
    return true
  }, [])

  const addPdfArticles = useCallback(async (files: FileList | File[]) => {
    const list = Array.from(files).filter((f) =>
      f.type === 'application/pdf' || /\.pdf$/i.test(f.name)
    )
    if (list.length === 0) {
      toastError('No PDF files selected', 'Choose one or more .pdf files.')
      return
    }
    setIsFetching(true)
    let ok = 0
    let enrichedWithDoi = 0
    const failures: string[] = []
    for (const file of list) {
      try {
        const extraction = await extractPdf(file)
        const base = buildArticleFromPdf(file, extraction)
        let article = base
        if (extraction.doi) {
          try {
            const meta = await fetchCrossRef(extraction.doi)
            article = {
              ...base,
              doi: meta.doi,
              title: meta.title || base.title,
              authors: meta.authors.length > 0
                ? meta.authors.map((a) =>
                    a.given ? `${a.family} ${a.given}` : a.family
                  )
                : base.authors,
              journal: meta.journal || base.journal,
              year: meta.year ?? base.year,
              doiUrl: meta.doi ? `https://doi.org/${meta.doi}` : undefined,
              pmid: meta.pmid,
              pubmedUrl: meta.pmid
                ? `https://pubmed.ncbi.nlm.nih.gov/${meta.pmid}/`
                : undefined,
            }
            enrichedWithDoi += 1
          } catch {
            // CrossRef failed — keep heuristic fallback
          }
        }
        setArticles((prev) => [...prev, article])
        ok += 1
      } catch (err) {
        failures.push(file.name)
        console.error('PDF extract failed for', file.name, err)
      }
    }
    setIsFetching(false)
    if (ok > 0 && failures.length === 0) {
      const suffix =
        enrichedWithDoi > 0
          ? ` · ${enrichedWithDoi} enriched via DOI`
          : ''
      toastSuccess(`${ok} PDF${ok === 1 ? '' : 's'} added${suffix}`)
    } else if (ok > 0 && failures.length > 0) {
      toastWarning(
        `${ok} added, ${failures.length} failed`,
        failures.join(', ')
      )
    } else {
      toastError(
        'Could not extract any PDF',
        'These files may be scanned images or encrypted.'
      )
    }
  }, [])

  const importArticles = useCallback((list: Article[]) => {
    if (list.length === 0) {
      toastError('No saved articles to import')
      return
    }
    setArticles((prev) => {
      const seen = new Set(prev.map((a) => a.pmid ?? a.doi ?? a.id))
      const merged = [...prev]
      for (const article of list) {
        const key = article.pmid ?? article.doi ?? article.id
        if (!seen.has(key)) merged.push(article)
      }
      toastSuccess(
        `Imported ${list.length} article${list.length === 1 ? '' : 's'}`
      )
      return merged
    })
  }, [])

  const removeArticle = useCallback((id: string) => {
    setArticles((prev) => prev.filter((a) => a.id !== id))
  }, [])

  const clearArticles = useCallback(() => {
    setArticles([])
    setReview(null)
  }, [])

  const generate = useCallback(() => {
    if (!topic.trim()) {
      toastError('Enter your topic or research question first.')
      return
    }
    if (articles.length === 0) {
      toastError('Add at least one article to review.')
      return
    }
    if (style === 'thematic' && themes.length === 0) {
      toastWarning('No themes set', 'Using auto-grouped fallback.')
    }
    setIsGenerating(true)
    try {
      const generated = buildReview({
        topic,
        style,
        wordTarget,
        citationStyle,
        articles,
        themes,
      })
      setReview(generated)
      toastSuccess(`Review generated (${generated.wordCount} words)`)
    } catch (err) {
      toastError(
        'Could not generate review',
        err instanceof Error ? err.message : 'Unexpected error.'
      )
    } finally {
      setIsGenerating(false)
    }
  }, [topic, style, wordTarget, citationStyle, articles, themes])

  const exportDocx = useCallback(async () => {
    if (!review) {
      toastError('Generate a review first.')
      return
    }
    setIsExporting(true)
    try {
      const blob = await exportReviewAsDocx(review)
      downloadBlob(blob, `rol-${slug(topic)}-${Date.now()}.docx`)
      toastSuccess('Review downloaded as .docx')
    } catch (err) {
      toastError(
        'Export failed',
        err instanceof Error ? err.message : 'Unexpected error.'
      )
    } finally {
      setIsExporting(false)
    }
  }, [review, topic])

  const autoSuggestThemes = useCallback(() => {
    if (articles.length === 0) {
      toastError('Add articles first so we can suggest themes.')
      return
    }
    const suggested = suggestThemes(articles)
    if (suggested.length === 0) {
      toastWarning('Not enough content to auto-suggest themes yet.')
      return
    }
    setThemes(suggested)
    toastSuccess(`Suggested ${suggested.length} themes`)
  }, [articles])

  return {
    articles,
    topic,
    style,
    wordTarget,
    citationStyle,
    themes,
    review,
    isFetching,
    isGenerating,
    isExporting,
    setTopic,
    setStyle,
    setWordTarget,
    setCitationStyle,
    setThemes,
    addArticles,
    addManualArticle,
    addPdfArticles,
    importArticles,
    removeArticle,
    clearArticles,
    generate,
    exportDocx,
    autoSuggestThemes,
  }
}
