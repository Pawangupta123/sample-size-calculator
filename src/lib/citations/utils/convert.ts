import type { ConvertedCitation } from '../types'
import { detectSource, type DetectedSource } from './detectType'
import { fetchCrossRef } from './fetchCrossRef'
import { fetchPubMed } from './fetchPubMed'
import { formatVancouver } from './formatVancouver'
import { parseRawCitation } from './parseRaw'

function makeId(): string {
  return `c-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`
}

export async function convertOne(input: string): Promise<ConvertedCitation> {
  const id = makeId()
  const detected: DetectedSource = detectSource(input)
  const base: ConvertedCitation = {
    id,
    input: detected.original,
    sourceType: detected.type,
    metadata: null,
    vancouver: '',
    status: 'pending',
  }

  try {
    if (detected.type === 'doi') {
      const meta = await fetchCrossRef(detected.value)
      return {
        ...base,
        metadata: meta,
        vancouver: formatVancouver(meta),
        status: 'success',
      }
    }
    if (detected.type === 'pmid') {
      const meta = await fetchPubMed(detected.value)
      return {
        ...base,
        metadata: meta,
        vancouver: formatVancouver(meta),
        status: 'success',
      }
    }
    if (detected.type === 'raw') {
      const meta = parseRawCitation(detected.value)
      const hasMinimum = meta.title !== 'Untitled reference' && meta.authors.length > 0
      return {
        ...base,
        metadata: meta,
        vancouver: formatVancouver(meta),
        status: hasMinimum ? 'warning' : 'error',
        message: hasMinimum
          ? 'Parsed from raw text — verify output. For perfect accuracy paste the DOI or PMID.'
          : 'Could not parse this entry. Try pasting the DOI or PMID instead.',
      }
    }
    return {
      ...base,
      status: 'error',
      message: 'Unrecognised input. Paste a DOI, PMID, PubMed URL, or a full citation.',
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Lookup failed'
    return { ...base, status: 'error', message: msg }
  }
}

export async function convertBatch(inputs: string[]): Promise<ConvertedCitation[]> {
  const results: ConvertedCitation[] = []
  for (const input of inputs) {
    // sequential to stay friendly to PubMed rate limits
    results.push(await convertOne(input))
  }
  return results
}
