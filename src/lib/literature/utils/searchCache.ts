import type { SearchFilters, SearchResponse } from '../types'

type CachedResult = SearchResponse & { errors: string[] }

const cache = new Map<string, { result: CachedResult; ts: number }>()
const TTL = 5 * 60 * 1000
const MAX = 20

export function makeCacheKey(filters: SearchFilters, pageSize: number, page: number): string {
  return JSON.stringify({ f: filters, ps: pageSize, p: page })
}

export function getCached(key: string): (CachedResult & { fromCache: true }) | null {
  const entry = cache.get(key)
  if (!entry) return null
  if (Date.now() - entry.ts > TTL) { cache.delete(key); return null }
  return { ...entry.result, fromCache: true }
}

export function setCached(key: string, result: CachedResult): void {
  if (cache.size >= MAX) {
    const oldest = cache.keys().next().value
    if (oldest) cache.delete(oldest)
  }
  cache.set(key, { result, ts: Date.now() })
}
