'use client'

import { useMemo, useRef, useState } from 'react'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import {
  BarChart3,
  Check,
  Copy,
  Download,
  Image as ImageIcon,
  LineChart as LineIcon,
  Table2,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { useCalculator } from '@/lib/calculator/context/CalculatorContext'
import {
  computeEffectCurve,
  computePowerComparison,
  effectLabel,
} from '@/lib/calculator/utils/scenarios'
import { cn } from '@/lib/utils'

type Tab = 'power' | 'curve'
type ChartType = 'line' | 'bar' | 'area'
type CopyState = null | 'image' | 'data' | 'power'

export function ScenarioExplorer() {
  const { state } = useCalculator()
  const [tab, setTab] = useState<Tab>('power')
  const [chartType, setChartType] = useState<ChartType>('line')
  const [copied, setCopied] = useState<CopyState>(null)
  const chartRef = useRef<HTMLDivElement>(null)

  const powerRows = useMemo(() => computePowerComparison(state), [state])
  const curve = useMemo(() => computeEffectCurve(state), [state])
  const label = useMemo(() => effectLabel(state), [state])

  if (state.design === 'diagnostic') return null

  const flash = (which: CopyState) => {
    setCopied(which)
    window.setTimeout(() => setCopied(null), 1800)
  }

  const copyPowerTable = async () => {
    const header = 'Power\tPer group\tTotal N'
    const rows = powerRows
      .map(
        (r) =>
          `${Math.round(parseFloat(r.power) * 100)}%\t${r.nFinal}\t${r.nTotal}`
      )
      .join('\n')
    await navigator.clipboard.writeText(`${header}\n${rows}`)
    flash('power')
  }

  const copyCurveData = async () => {
    const header = `${label}\tTotal N`
    const rows = curve.map((p) => `${p.effect}\t${p.n}`).join('\n')
    await navigator.clipboard.writeText(`${header}\n${rows}`)
    flash('data')
  }

  const captureChart = async () => {
    if (!chartRef.current) return null
    const { default: html2canvas } = await import('html2canvas')
    return html2canvas(chartRef.current, {
      backgroundColor: getComputedStyle(document.body).backgroundColor,
      scale: 2,
    })
  }

  const copyChartImage = async () => {
    try {
      const canvas = await captureChart()
      if (!canvas) return
      await new Promise<void>((resolve) => {
        canvas.toBlob(async (blob) => {
          if (!blob) return resolve()
          try {
            await navigator.clipboard.write([
              new ClipboardItem({ 'image/png': blob }),
            ])
            flash('image')
          } catch {
            // clipboard API unavailable — fall back to download
            downloadChartImage(canvas)
          }
          resolve()
        }, 'image/png')
      })
    } catch {
      /* ignore */
    }
  }

  const downloadChartImage = async (preMade?: HTMLCanvasElement) => {
    const canvas = preMade ?? (await captureChart())
    if (!canvas) return
    const url = canvas.toDataURL('image/png')
    const a = document.createElement('a')
    a.href = url
    a.download = `samplecalc-${chartType}-${Date.now()}.png`
    a.click()
  }

  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-sm font-semibold">What-if scenarios</h3>
          <div className="inline-flex rounded-full border border-border bg-muted p-0.5">
            <button
              type="button"
              onClick={() => setTab('power')}
              className={cn(
                'inline-flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-medium transition-colors',
                tab === 'power'
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Table2 className="h-3 w-3" />
              Power
            </button>
            <button
              type="button"
              onClick={() => setTab('curve')}
              className={cn(
                'inline-flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-medium transition-colors',
                tab === 'curve'
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <BarChart3 className="h-3 w-3" />
              Effect curve
            </button>
          </div>
        </div>

        {tab === 'power' ? (
          <div className="mt-4 space-y-2">
            <div className="overflow-hidden rounded-xl border border-border">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border bg-muted/60">
                    <th className="px-3 py-2 text-left font-medium text-muted-foreground">
                      Power
                    </th>
                    <th className="px-3 py-2 text-right font-medium text-muted-foreground">
                      Per group
                    </th>
                    <th className="px-3 py-2 text-right font-medium text-muted-foreground">
                      Total N
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {powerRows.map((row) => {
                    const active = row.power === state.power
                    return (
                      <tr
                        key={row.power}
                        className={cn(
                          'border-b border-border last:border-b-0',
                          active && 'bg-[var(--primary-muted)]'
                        )}
                      >
                        <td className="px-3 py-2 font-medium">
                          {Math.round(parseFloat(row.power) * 100)}%
                          {active && (
                            <span className="ml-1.5 text-[10px] font-normal uppercase tracking-wider text-primary">
                              current
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-2 text-right font-semibold">
                          {row.nFinal > 0 ? row.nFinal.toLocaleString() : '—'}
                        </td>
                        <td className="px-3 py-2 text-right font-semibold">
                          {row.nTotal > 0 ? row.nTotal.toLocaleString() : '—'}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-end">
              <button
                type="button"
                onClick={copyPowerTable}
                className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-[11px] font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                {copied === 'power' ? (
                  <>
                    <Check className="h-3 w-3 text-accent" />
                    Copied (paste into Excel)
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3" />
                    Copy table
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-[11px] text-muted-foreground">
                How total N changes with {label.toLowerCase()}
              </p>
              <div className="inline-flex rounded-full border border-border bg-muted p-0.5">
                {(
                  [
                    { type: 'line', Icon: LineIcon },
                    { type: 'bar', Icon: BarChart3 },
                    { type: 'area', Icon: ImageIcon },
                  ] as const
                ).map(({ type, Icon }) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setChartType(type)}
                    aria-label={`${type} chart`}
                    className={cn(
                      'inline-flex h-7 w-7 items-center justify-center rounded-full transition-colors',
                      chartType === type
                        ? 'bg-card text-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                    )}
                  >
                    <Icon className="h-3 w-3" />
                  </button>
                ))}
              </div>
            </div>

            <div ref={chartRef} className="h-56 w-full rounded-xl bg-card p-2">
              <ResponsiveContainer>
                {renderChart(chartType, curve, label)}
              </ResponsiveContainer>
            </div>

            <div className="flex flex-wrap items-center justify-end gap-2">
              <button
                type="button"
                onClick={copyChartImage}
                className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-[11px] font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                {copied === 'image' ? (
                  <>
                    <Check className="h-3 w-3 text-accent" /> Image copied
                  </>
                ) : (
                  <>
                    <ImageIcon className="h-3 w-3" /> Copy image
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={copyCurveData}
                className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-[11px] font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                {copied === 'data' ? (
                  <>
                    <Check className="h-3 w-3 text-accent" /> Data copied
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3" /> Copy data
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => downloadChartImage()}
                className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-[11px] font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <Download className="h-3 w-3" />
                Download PNG
              </button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function renderChart(type: ChartType, data: { effect: number; n: number }[], label: string) {
  const axisProps = {
    stroke: 'var(--muted-foreground)',
    fontSize: 10,
  }
  const tooltipStyle = {
    backgroundColor: 'var(--card)',
    border: '1px solid var(--border)',
    borderRadius: '8px',
    fontSize: '11px',
    color: 'var(--foreground)',
  }
  const common = (
    <>
      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
      <XAxis dataKey="effect" {...axisProps} />
      <YAxis {...axisProps} />
      <Tooltip
        contentStyle={tooltipStyle}
        labelFormatter={(v) => `${label}: ${v}`}
        formatter={(v) => [Number(v).toLocaleString(), 'Total N']}
      />
    </>
  )

  if (type === 'bar') {
    return (
      <BarChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
        {common}
        <Bar dataKey="n" fill="var(--primary)" radius={[4, 4, 0, 0]} />
      </BarChart>
    )
  }

  if (type === 'area') {
    return (
      <AreaChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
        <defs>
          <linearGradient id="nGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.4} />
            <stop offset="95%" stopColor="var(--primary)" stopOpacity={0.05} />
          </linearGradient>
        </defs>
        {common}
        <Area
          type="monotone"
          dataKey="n"
          stroke="var(--primary)"
          strokeWidth={2}
          fill="url(#nGradient)"
        />
      </AreaChart>
    )
  }

  return (
    <LineChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
      {common}
      <Line
        type="monotone"
        dataKey="n"
        stroke="var(--primary)"
        strokeWidth={2}
        dot={{ fill: 'var(--primary)', r: 3 }}
        activeDot={{ r: 5 }}
      />
    </LineChart>
  )
}
