"use client";

import { useCallback, useEffect, useState } from "react";
import type { Article } from "../types";

const STORAGE_KEY = "samplecalc_saved_articles";

function read(): Article[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Article[]) : [];
  } catch {
    return [];
  }
}

function write(list: Article[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch {
    /* ignore */
  }
}

export interface UseSavedArticlesResult {
  saved: Article[];
  isSaved: (id: string) => boolean;
  toggle: (article: Article) => void;
  remove: (id: string) => void;
  clearAll: () => void;
}

export function useSavedArticles(): UseSavedArticlesResult {
  const [saved, setSaved] = useState<Article[]>([]);

  useEffect(() => {
    setSaved(read());
  }, []);

  const isSaved = useCallback(
    (id: string) => saved.some((a) => a.id === id),
    [saved],
  );

  const toggle = useCallback((article: Article) => {
    setSaved((prev) => {
      const exists = prev.some((a) => a.id === article.id);
      const next = exists
        ? prev.filter((a) => a.id !== article.id)
        : [article, ...prev];
      write(next);
      return next;
    });
  }, []);

  const remove = useCallback((id: string) => {
    setSaved((prev) => {
      const next = prev.filter((a) => a.id !== id);
      write(next);
      return next;
    });
  }, []);

  const clearAll = useCallback(() => {
    write([]);
    setSaved([]);
  }, []);

  return { saved, isSaved, toggle, remove, clearAll };
}
