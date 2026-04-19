'use client'

import { useCallback, useState } from 'react'
import { toastError, toastSuccess, toastWarning } from '@/lib/toast'
import type { ConvertedCitation } from '../types'
import { convertBatch } from '../utils/convert'
import { splitBatch } from '../utils/detectType'

export interface UseBulkConvertResult {
  results: ConvertedCitation[]
  isConverting: boolean
  convert: (text: string) => Promise<void>
  clear: () => void
}

export function useBulkConvert(): UseBulkConvertResult {
  const [results, setResults] = useState<ConvertedCitation[]>([])
  const [isConverting, setIsConverting] = useState(false)

  const convert = useCallback(async (text: string) => {
    const lines = splitBatch(text)
    if (lines.length === 0) {
      setResults([])
      toastError('Nothing to convert', 'Paste at least one reference.')
      return
    }
    setIsConverting(true)
    try {
      const next = await convertBatch(lines)
      setResults(next)
      const ok = next.filter((r) => r.status === 'success').length
      const warnings = next.filter((r) => r.status === 'warning').length
      const errors = next.filter((r) => r.status === 'error').length
      if (errors === next.length) {
        toastError(
          'Nothing could be converted',
          'Check that the DOIs / PMIDs are valid.'
        )
      } else if (errors > 0) {
        toastWarning(
          `${ok} converted, ${errors} failed`,
          'Scroll down to see which references could not be parsed.'
        )
      } else if (warnings > 0) {
        toastWarning(
          `${ok + warnings} converted`,
          `${warnings} parsed from raw text — verify before using.`
        )
      } else {
        toastSuccess(`${ok} reference${ok === 1 ? '' : 's'} converted`)
      }
    } catch (err) {
      toastError(
        'Conversion failed',
        err instanceof Error ? err.message : 'Unexpected error.'
      )
    } finally {
      setIsConverting(false)
    }
  }, [])

  const clear = useCallback(() => setResults([]), [])

  return { results, isConverting, convert, clear }
}
