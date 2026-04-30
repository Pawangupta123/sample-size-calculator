import type { Metadata } from 'next'
import { ProtocolGeneratorClient } from './ProtocolGeneratorClient'

export const metadata: Metadata = {
  title: 'Thesis Protocol Generator',
  description:
    'Generate a complete ICMR-format thesis/dissertation protocol with real PubMed references, methodology templates, data collection form, and consent forms in English & Hindi. Download as Word .docx.',
  keywords: [
    'thesis protocol', 'research protocol', 'ICMR guidelines', 'MD thesis',
    'dissertation protocol', 'medical research', 'protocol template India',
    'informed consent Hindi', 'Vancouver references',
  ],
}

export default function Page() {
  return <ProtocolGeneratorClient />
}
