import type { Metadata } from 'next'
import { LiteratureReviewClient } from './LiteratureReviewClient'

export const metadata: Metadata = {
  title: 'Review of Literature Generator',
  description:
    'Generate a draft Review of Literature from DOIs and PMIDs. 3 styles — narrative, thematic, systematic-lite. Download as Word .docx.',
  keywords: [
    'review of literature',
    'literature review generator',
    'medical review',
    'residents',
    'thesis help',
    'dissertation',
  ],
  openGraph: {
    title: 'Review of Literature Generator — SampleCalc',
    description:
      'Generate draft literature reviews in 3 styles. Free, browser-based, no signup.',
  },
}

export default function Page() {
  return <LiteratureReviewClient />
}
