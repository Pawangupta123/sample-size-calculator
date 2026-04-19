'use client'

import { useCallback, useRef, useState } from 'react'
import { toastError, toastInfo, toastWarning } from '@/lib/toast'
import type { Article, SearchFilters } from '../types'
import { searchLiterature } from '../utils/search'

interface UseLiteratureSearchResult {
  articles: Article[]
  total: number
  errors: string[]
  isSearching: boolean
  hasSearched: boolean
  search: (filters: SearchFilters) => Promise<void>
  reset: () => void
}

export function useLiteratureSearch(): UseLiteratureSearchResult {
  const [articles, setArticles] = useState<Article[]>([])
  const [total, setTotal] = useState(0)
  const [errors, setErrors] = useState<string[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const abortRef = useRef<AbortController | null>(null)

  const search = useCallback(async (filters: SearchFilters) => {
    if (!filters.query.trim()) {
      toastError('Enter a search term first')
      return
    }
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    setIsSearching(true)
    setErrors([])
    setHasSearched(true)
    try {
      const result = await searchLiterature({
        filters,
        signal: controller.signal,
        pageSize: 25,
      })
      setArticles(result.articles)
      setTotal(result.total)
      setErrors(result.errors)

      if (result.errors.length > 0 && result.articles.length > 0) {
        toastWarning(
          'Partial results',
          `${result.errors.length} source returned an error. Showing what we got.`
        )
      } else if (result.errors.length > 0 && result.articles.length === 0) {
        toastError('Search failed', result.errors.join('\n'))
      } else if (result.articles.length === 0) {
        toastInfo('No articles found', 'Try broader terms or adjust filters.')
      }
    } catch (err) {
      if ((err as Error).name === 'AbortError') return
      const message = (err as Error).message
      setErrors([`Search failed: ${message}`])
      toastError('Search failed', message)
    } finally {
      setIsSearching(false)
    }
  }, [])

  const reset = useCallback(() => {
    abortRef.current?.abort()
    setArticles([])
    setTotal(0)
    setErrors([])
    setHasSearched(false)
  }, [])

  return { articles, total, errors, isSearching, hasSearched, search, reset }
}
