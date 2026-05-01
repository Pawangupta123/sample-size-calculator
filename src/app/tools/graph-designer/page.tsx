import type { Metadata } from 'next'
import { GraphDesignerClient } from './GraphDesignerClient'

export const metadata: Metadata = {
  title: 'Medical Graph Designer',
  description:
    'Create publication-quality medical graphs from your data. Paste tables from Word, SPSS, or Excel. Bar, line, scatter, pie, box plot, Kaplan-Meier, Forest plot, ROC curve. Export PNG 300 DPI, PDF, SVG.',
  keywords: [
    'medical graph', 'research graph', 'SPSS graph', 'publication graph',
    'forest plot', 'kaplan meier', 'ROC curve', 'box plot', 'bar chart medical',
  ],
}

export default function Page() {
  return <GraphDesignerClient />
}
