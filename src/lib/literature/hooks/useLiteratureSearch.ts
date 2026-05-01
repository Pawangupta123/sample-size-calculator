"use client";

import { toastError, toastInfo, toastWarning } from "@/lib/toast";
import { useCallback, useRef, useState } from "react";
import type { Article, SearchFilters } from "../types";
import { mergeArticles } from "../utils/mergeResults";
import { searchLiterature } from "../utils/search";

const PAGE_SIZE = 25;

interface UseLiteratureSearchResult {
  articles: Article[];
  total: number;
  errors: string[];
  isSearching: boolean;
  isLoadingMore: boolean;
  hasSearched: boolean;
  canLoadMore: boolean;
  fromCache: boolean;
  search: (filters: SearchFilters) => Promise<void>;
  loadMore: () => Promise<void>;
  reset: () => void;
}

export function useLiteratureSearch(): UseLiteratureSearchResult {
  const [articles, setArticles] = useState<Article[]>([]);
  const [total, setTotal] = useState(0);
  const [errors, setErrors] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [fromCache, setFromCache] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const currentFiltersRef = useRef<SearchFilters | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const search = useCallback(async (filters: SearchFilters) => {
    if (!filters.query.trim()) {
      toastError("Enter a search term first");
      return;
    }
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    currentFiltersRef.current = filters;

    setIsSearching(true);
    setErrors([]);
    setHasSearched(true);
    setCurrentPage(1);
    try {
      const result = await searchLiterature({
        filters,
        signal: controller.signal,
        pageSize: PAGE_SIZE,
        page: 1,
      });
      setArticles(result.articles);
      setTotal(result.total);
      setErrors(result.errors);
      setFromCache(result.fromCache);

      if (result.errors.length > 0 && result.articles.length > 0) {
        toastWarning(
          "Partial results",
          `${result.errors.length} source returned an error. Showing what we got.`,
        );
      } else if (result.errors.length > 0 && result.articles.length === 0) {
        toastError("Search failed", result.errors.join("\n"));
      } else if (result.articles.length === 0) {
        toastInfo("No articles found", "Try broader terms or adjust filters.");
      }
    } catch (err) {
      if ((err as Error).name === "AbortError") return;
      const message = (err as Error).message;
      setErrors([`Search failed: ${message}`]);
      toastError("Search failed", message);
    } finally {
      setIsSearching(false);
    }
  }, []);

  const loadMore = useCallback(async () => {
    const filters = currentFiltersRef.current;
    if (!filters || isSearching || isLoadingMore) return;
    const nextPage = currentPage + 1;
    setIsLoadingMore(true);
    try {
      const result = await searchLiterature({
        filters,
        pageSize: PAGE_SIZE,
        page: nextPage,
      });
      setArticles((prev) => mergeArticles([prev, result.articles]));
      setCurrentPage(nextPage);
      if (result.errors.length > 0) {
        toastWarning("Partial load", "Some sources failed while loading more.");
      }
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        toastError("Load more failed", (err as Error).message);
      }
    } finally {
      setIsLoadingMore(false);
    }
  }, [currentPage, isSearching, isLoadingMore]);

  const reset = useCallback(() => {
    abortRef.current?.abort();
    currentFiltersRef.current = null;
    setArticles([]);
    setTotal(0);
    setErrors([]);
    setHasSearched(false);
    setCurrentPage(1);
    setFromCache(false);
  }, []);

  const canLoadMore =
    hasSearched &&
    !isSearching &&
    articles.length < total &&
    articles.length > 0;

  return {
    articles,
    total,
    errors,
    isSearching,
    isLoadingMore,
    hasSearched,
    canLoadMore,
    fromCache,
    search,
    loadMore,
    reset,
  };
}
