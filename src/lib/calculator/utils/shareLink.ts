import type { CalculatorState } from '../types/calculator.types'

export function encodeStateToUrl(state: CalculatorState): string {
  try {
    const json = JSON.stringify(state)
    const b64 =
      typeof window === 'undefined'
        ? Buffer.from(json, 'utf-8').toString('base64')
        : window.btoa(unescape(encodeURIComponent(json)))
    return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
  } catch {
    return ''
  }
}

export function decodeStateFromUrl(encoded: string): Partial<CalculatorState> | null {
  try {
    const b64 = encoded.replace(/-/g, '+').replace(/_/g, '/')
    const padded = b64 + '==='.slice(0, (4 - (b64.length % 4)) % 4)
    const json =
      typeof window === 'undefined'
        ? Buffer.from(padded, 'base64').toString('utf-8')
        : decodeURIComponent(escape(window.atob(padded)))
    return JSON.parse(json) as Partial<CalculatorState>
  } catch {
    return null
  }
}

export function buildShareUrl(state: CalculatorState): string {
  if (typeof window === 'undefined') return ''
  const encoded = encodeStateToUrl(state)
  const url = new URL(window.location.href)
  url.searchParams.set('s', encoded)
  return url.toString()
}
