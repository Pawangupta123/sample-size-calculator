import type { Metadata } from 'next'
import { CitationConverterClient } from './CitationConverterClient'

export const metadata: Metadata = {
  title: 'Vancouver Citation Converter',
  description:
    'Convert DOIs, PMIDs, PubMed URLs, and raw citations into proper Vancouver style. Free, batch processing, metadata from CrossRef and PubMed.',
  keywords: [
    'vancouver citation',
    'citation converter',
    'DOI to vancouver',
    'PMID citation',
    'medical citation',
    'reference formatter',
  ],
  openGraph: {
    title: 'Vancouver Citation Converter — SampleCalc',
    description:
      'Batch-convert DOIs and PMIDs to Vancouver citations — free, no signup.',
  },
}

export default function Page() {
  return <CitationConverterClient />
}
