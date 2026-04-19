import type { Alpha, Power, Tail } from '../types/calculator.types'

const Z_ALPHA_TWO_TAILED: Record<Alpha, number> = {
  '0.05': 1.96,
  '0.01': 2.576,
  '0.025': 2.241,
}

const Z_ALPHA_ONE_TAILED: Record<Alpha, number> = {
  '0.05': 1.645,
  '0.01': 2.326,
  '0.025': 1.96,
}

const Z_BETA: Record<Power, number> = {
  '0.80': 0.842,
  '0.90': 1.282,
  '0.95': 1.645,
}

export function zAlpha(alpha: Alpha, tail: Tail): number {
  return tail === '1' ? Z_ALPHA_ONE_TAILED[alpha] : Z_ALPHA_TWO_TAILED[alpha]
}

export function zBeta(power: Power): number {
  return Z_BETA[power]
}

export function confidenceLevelPercent(alpha: Alpha): number {
  return Math.round((1 - parseFloat(alpha)) * 100)
}
