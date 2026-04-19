import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from '@/components/toaster'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: {
    default: 'SampleCalc — Clinical Sample Size Calculator',
    template: '%s | SampleCalc',
  },
  description:
    'Free open-source sample size calculator for clinical research. Supports RCTs, cohort, case-control, diagnostic accuracy (Buderer 1996), survival, and prevalence studies. Step-by-step wizard with full formula breakdown.',
  keywords: [
    'sample size calculator',
    'clinical research',
    'RCT sample size',
    'diagnostic accuracy',
    'Buderer formula',
    'medical statistics',
    'biostatistics',
    'power analysis',
  ],
  authors: [{ name: 'SampleCalc' }],
  openGraph: {
    title: 'SampleCalc — Clinical Sample Size Calculator',
    description:
      'Free open-source sample size calculator for clinical research studies.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SampleCalc',
    description: 'Clinical sample size calculator with full formula breakdown.',
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#fafafa' },
    { media: '(prefers-color-scheme: dark)', color: '#09090b' },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen antialiased`}
      >
        <ThemeProvider>
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
