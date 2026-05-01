'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Calculator, Menu, X } from 'lucide-react'
import { useState } from 'react'
import { ThemeToggle } from './theme-toggle'
import { cn } from '@/lib/utils'

const ALL_TOOLS = [
  { href: '/calculator',                  label: 'Sample Size Calculator', sub: 'RCT, cohort, diagnostic & more' },
  { href: '/tools/literature-search',     label: 'Article Search',         sub: 'PubMed · Europe PMC · OpenAlex' },
  { href: '/tools/literature-review',     label: 'Review of Literature',   sub: 'Draft & export .docx' },
  { href: '/tools/citation-converter',    label: 'Citation Converter',     sub: 'Vancouver format, bulk' },
  { href: '/tools/protocol-generator',   label: 'Protocol Generator',     sub: 'ICMR thesis protocol template', isNew: true },
  { href: '/tools/graph-designer',       label: 'Graph Designer',          sub: 'Bar, KM, Forest, ROC & more', isNew: true },
]

const NAV_LINKS: ReadonlyArray<{
  href: string
  label: string
  match?: RegExp
  hidden: string
  isNew?: boolean
}> = [
  {
    href: '/calculator',
    label: 'Sample Size',
    match: /^\/calculator/,
    hidden: 'hidden sm:inline-flex',
  },
  {
    href: '/tools/literature-search',
    label: 'Article Search',
    hidden: 'hidden md:inline-flex',
  },
  {
    href: '/tools/literature-review',
    label: 'RoL Draft',
    hidden: 'hidden md:inline-flex',
  },
  {
    href: '/tools/citation-converter',
    label: 'Citations',
    hidden: 'hidden lg:inline-flex',
  },
  {
    href: '/tools/protocol-generator',
    label: 'Protocol',
    hidden: 'hidden lg:inline-flex',
    isNew: true,
  },
  {
    href: '/tools/graph-designer',
    label: 'Graphs',
    hidden: 'hidden xl:inline-flex',
    isNew: true,
  },
]

export function SiteHeader() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 text-sm font-semibold tracking-tight">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Calculator className="h-4 w-4" />
          </span>
          <span>SampleCalc</span>
        </Link>

        {/* Desktop nav */}
        <nav className="flex items-center gap-0.5 sm:gap-1">
          {NAV_LINKS.map((link) => {
            const isActive = link.match
              ? link.match.test(pathname)
              : pathname.startsWith(link.href)
            return (
              <Link key={link.href} href={link.href}
                className={cn(
                  link.hidden,
                  'relative rounded-full px-3 py-1.5 text-xs font-medium transition-colors',
                  isActive ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
                )}>
                {link.label}
                {link.isNew && (
                  <span className="ml-1 rounded-full bg-accent px-1 py-0.5 text-[8px] font-bold uppercase text-accent-foreground">
                    New
                  </span>
                )}
                {isActive && (
                  <span aria-hidden className="absolute inset-x-3 -bottom-[9px] h-0.5 rounded-full bg-primary" />
                )}
              </Link>
            )
          })}

          {/* Mobile menu button */}
          <button type="button" onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle menu"
            className="ml-1 inline-flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground lg:hidden">
            {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>

          <ThemeToggle />
        </nav>
      </div>

      {/* Mobile dropdown menu */}
      {mobileOpen && (
        <div className="border-t border-border bg-background/95 backdrop-blur lg:hidden">
          <nav className="mx-auto max-w-6xl px-4 py-3 sm:px-6">
            <ul className="space-y-1">
              {ALL_TOOLS.map((tool) => {
                const isActive = pathname.startsWith(tool.href)
                return (
                  <li key={tool.href}>
                    <Link href={tool.href} onClick={() => setMobileOpen(false)}
                      className={cn(
                        'flex items-center justify-between rounded-xl px-3 py-2.5 transition-colors',
                        isActive ? 'bg-primary/10 text-primary' : 'hover:bg-muted text-foreground'
                      )}>
                      <div>
                        <div className="flex items-center gap-2 text-sm font-medium">
                          {tool.label}
                          {tool.isNew && (
                            <span className="rounded-full bg-accent px-1.5 py-0.5 text-[9px] font-bold uppercase text-accent-foreground">
                              New
                            </span>
                          )}
                        </div>
                        <p className="mt-0.5 text-[11px] text-muted-foreground">{tool.sub}</p>
                      </div>
                      {isActive && <span className="h-1.5 w-1.5 rounded-full bg-primary" />}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </nav>
        </div>
      )}
    </header>
  )
}
