'use client'

import Link from 'next/link'
import { Calculator } from 'lucide-react'
import { ThemeToggle } from './theme-toggle'

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link
          href="/"
          className="flex items-center gap-2 text-sm font-semibold tracking-tight"
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Calculator className="h-4 w-4" />
          </span>
          <span>SampleCalc</span>
        </Link>

        <nav className="flex items-center gap-1 sm:gap-3">
          <Link
            href="/calculator"
            className="hidden rounded-full px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground sm:inline-flex"
          >
            Calculator
          </Link>
          <Link
            href="/about"
            className="hidden rounded-full px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground sm:inline-flex"
          >
            About
          </Link>
          <a
            href="https://github.com/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub repository"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-foreground"
          >
            <svg
              role="img"
              viewBox="0 0 24 24"
              aria-hidden
              className="h-4 w-4"
              fill="currentColor"
            >
              <path d="M12 .297a12 12 0 00-3.79 23.388c.6.113.82-.26.82-.577 0-.285-.012-1.24-.017-2.25-3.338.725-4.042-1.415-4.042-1.415-.546-1.385-1.333-1.755-1.333-1.755-1.09-.745.083-.73.083-.73 1.205.085 1.84 1.24 1.84 1.24 1.07 1.835 2.807 1.305 3.492.998.108-.775.418-1.305.76-1.605-2.665-.305-5.467-1.335-5.467-5.93 0-1.31.468-2.38 1.235-3.22-.135-.305-.54-1.525.105-3.18 0 0 1.005-.325 3.3 1.23a11.5 11.5 0 016.005 0c2.29-1.555 3.295-1.23 3.295-1.23.65 1.655.24 2.875.12 3.18.77.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.43.37.815 1.105.815 2.22 0 1.605-.015 2.895-.015 3.285 0 .315.21.69.825.57A12 12 0 0012 .297z" />
            </svg>
          </a>
          <ThemeToggle />
        </nav>
      </div>
    </header>
  )
}
