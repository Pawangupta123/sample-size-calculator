import type { Metadata } from 'next'
import { LiteratureSearchClient } from './LiteratureSearchClient'

export const metadata: Metadata = {
  title: 'Literature Search (PubMed + Europe PMC)',
  description:
    'Search PubMed and Europe PMC in one go. Paste your study protocol or research question, get relevant articles with direct links to verify. Free, no signup.',
  keywords: [
    'pubmed search',
    'literature search',
    'europe pmc',
    'medical literature',
    'research protocol search',
    'clinical trial search',
  ],
  openGraph: {
    title: 'Literature Search — SampleCalc',
    description:
      'Find articles from PubMed and Europe PMC in one search. Perfect for lit reviews and protocol writing.',
  },
}

export default function Page() {
  return <LiteratureSearchClient />
}
