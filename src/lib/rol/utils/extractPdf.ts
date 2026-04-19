'use client'

import type { Article } from '@/lib/literature/types'

interface PdfExtractResult {
  text: string
  title: string
  numPages: number
}

const MAX_PAGES_FOR_EXTRACTION = 3

let pdfJsPromise: Promise<typeof import('pdfjs-dist')> | null = null

async function loadPdfJs() {
  if (pdfJsPromise) return pdfJsPromise
  pdfJsPromise = import('pdfjs-dist').then((pdfjs) => {
    // Use same-version worker from CDN to avoid bundler quirks
    const version = pdfjs.version
    pdfjs.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${version}/build/pdf.worker.min.mjs`
    return pdfjs
  })
  return pdfJsPromise
}

function cleanText(raw: string): string {
  return raw.replace(/\s+/g, ' ').trim()
}

function guessTitle(firstPageText: string, fallback: string): string {
  const trimmed = firstPageText.trim()
  if (!trimmed) return fallback
  // Title is typically the first 4-20 word phrase before abstract/introduction keywords.
  const cutoffPattern = /\b(abstract|introduction|keywords|background|summary)\b/i
  const head = trimmed.split(cutoffPattern)[0] ?? trimmed
  const words = head.split(/\s+/).filter(Boolean)
  const titleWords = words.slice(0, 25)
  const candidate = titleWords.join(' ').trim().replace(/[\s.:,;]+$/, '')
  return candidate.length > 5 ? candidate : fallback
}

function filenameToTitle(filename: string): string {
  return filename
    .replace(/\.pdf$/i, '')
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export async function extractPdf(file: File): Promise<PdfExtractResult> {
  const pdfjs = await loadPdfJs()
  const buffer = await file.arrayBuffer()
  const pdf = await pdfjs.getDocument({ data: buffer }).promise
  const pages = Math.min(pdf.numPages, MAX_PAGES_FOR_EXTRACTION)

  let fullText = ''
  let firstPageText = ''
  for (let i = 1; i <= pages; i++) {
    const page = await pdf.getPage(i)
    const content = await page.getTextContent()
    const pageText = content.items
      .map((item) => ('str' in item ? (item as { str: string }).str : ''))
      .filter(Boolean)
      .join(' ')
    if (i === 1) firstPageText = pageText
    fullText += (fullText ? ' ' : '') + pageText
  }

  const cleaned = cleanText(fullText)
  const title = guessTitle(cleanText(firstPageText), filenameToTitle(file.name))

  return { text: cleaned, title, numPages: pdf.numPages }
}

export function buildArticleFromPdf(
  file: File,
  extraction: PdfExtractResult
): Article {
  const abstractLimit = 2500
  const abstract = extraction.text.length > abstractLimit
    ? extraction.text.slice(0, abstractLimit) + '…'
    : extraction.text

  return {
    id: `pdf-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
    title: extraction.title,
    authors: ['(from PDF)'],
    abstract,
    sources: ['pdf'],
  }
}
