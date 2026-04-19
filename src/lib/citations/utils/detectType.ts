import type { SourceType } from '../types'

const DOI_REGEX = /\b(10\.\d{4,9}\/[-._;()/:A-Z0-9]+)\b/i
const PMID_REGEX = /^\s*(\d{6,9})\s*$/
const PUBMED_URL_REGEX = /pubmed\.ncbi\.nlm\.nih\.gov\/(\d{6,9})/i
const DOI_URL_REGEX = /(?:doi\.org|dx\.doi\.org)\/([^\s]+)/i

export interface DetectedSource {
  type: SourceType
  value: string
  original: string
}

export function detectSource(input: string): DetectedSource {
  const trimmed = input.trim()
  if (!trimmed) return { type: 'unknown', value: '', original: input }

  const pmidUrlMatch = trimmed.match(PUBMED_URL_REGEX)
  if (pmidUrlMatch) {
    return { type: 'pmid', value: pmidUrlMatch[1], original: input }
  }

  const doiUrlMatch = trimmed.match(DOI_URL_REGEX)
  if (doiUrlMatch) {
    return { type: 'doi', value: doiUrlMatch[1].replace(/[).,;]+$/, ''), original: input }
  }

  if (PMID_REGEX.test(trimmed)) {
    return { type: 'pmid', value: trimmed.trim(), original: input }
  }

  const doiMatch = trimmed.match(DOI_REGEX)
  if (doiMatch) {
    return { type: 'doi', value: doiMatch[1].replace(/[).,;]+$/, ''), original: input }
  }

  if (trimmed.length > 20) {
    return { type: 'raw', value: trimmed, original: input }
  }

  return { type: 'unknown', value: trimmed, original: input }
}

export function splitBatch(text: string): string[] {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
}
