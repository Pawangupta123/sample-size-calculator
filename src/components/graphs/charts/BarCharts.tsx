'use client'

import { Bar, BarChart, CartesianGrid, ComposedChart, LabelList, Legend, Line, ReferenceLine, Tooltip, XAxis, YAxis } from 'recharts'
import type { ChartConfig } from '@/lib/graphs/types'
import { axisStyle, TOOLTIP_STYLE, yDomain } from '@/lib/graphs/chartHelpers'

// Gaussian kernel smooth — produces density curve shape from frequency values
function gaussianSmooth(vals: number[], bw = 1.2): number[] {
  return vals.map((_, i) => {
    let sum = 0, w = 0
    vals.forEach((v, j) => { const weight = Math.exp(-0.5 * ((i - j) / bw) ** 2); sum += v * weight; w += weight })
    return w > 0 ? sum / w : 0
  })
}

// Extract numeric center from bin label: "20-30" → 25, "45" → 45
function binCenter(label: string): number {
  const parts = label.split(/[-–]/)
  if (parts.length === 2) return (parseFloat(parts[0]) + parseFloat(parts[1])) / 2
  return parseFloat(label) || 0
}

// Compute weighted mean and find closest bin labels for mean / median
function computeStats(data: Record<string, string | number>[], key: string) {
  const items = data.map((d) => ({ label: String(d.name), center: binCenter(String(d.name)), freq: Number(d[key] ?? 0) }))
  const total = items.reduce((s, x) => s + x.freq, 0)
  if (total === 0) return null

  const mean = items.reduce((s, x) => s + x.center * x.freq, 0) / total
  const meanLabel = items.reduce((best, x) =>
    Math.abs(x.center - mean) < Math.abs(binCenter(best) - mean) ? x.label : best, items[0].label)

  let cum = 0
  let medianLabel = items[0].label
  for (const x of items) { cum += x.freq; if (cum >= total / 2) { medianLabel = x.label; break } }

  return { meanLabel, medianLabel }
}

type BarClickFn = (rowIdx: number, col: string, val: number, x: number, y: number) => void

interface BarProps {
  data: Record<string, string | number>[]
  config: ChartConfig
  series: string[]
  colors: string[]
  onBarClick?: BarClickFn
}

export function BarChartView({ data, config, series, colors, onBarClick }: BarProps) {
  const isStacked = config.barGrouped === false
  const horizontal = config.barOrientation === 'horizontal'
  return (
    <BarChart data={data} layout={horizontal ? 'vertical' : 'horizontal'}>
      {config.showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />}
      {horizontal ? (
        <>
          <YAxis dataKey="name" type="category" width={90} {...axisStyle(config.fontSize)}
            label={config.xLabel ? { value: config.xLabel, angle: 0, position: 'insideLeft' } : undefined} />
          <XAxis type="number" domain={yDomain(config)} {...axisStyle(config.fontSize)}
            label={config.yLabel ? { value: config.yLabel, position: 'insideBottom', offset: -5 } : undefined} />
        </>
      ) : (
        <>
          <XAxis dataKey="name" {...axisStyle(config.fontSize)}
            label={config.xLabel ? { value: config.xLabel, position: 'insideBottom', offset: -5 } : undefined} />
          <YAxis domain={yDomain(config)} {...axisStyle(config.fontSize)}
            label={config.yLabel ? { value: config.yLabel, angle: -90, position: 'insideLeft' } : undefined} />
        </>
      )}
      <Tooltip contentStyle={TOOLTIP_STYLE} />
      {config.showLegend && (
        <Legend wrapperStyle={{ fontSize: config.fontSize - 2 }}
          verticalAlign={config.legendPosition === 'top' ? 'top' : 'bottom'} />
      )}
      {series.map((s, i) => (
        <Bar key={s} dataKey={s} fill={colors[i]}
          stackId={isStacked ? 'stack' : undefined}
          radius={isStacked || horizontal ? 0 : [2, 2, 0, 0]}
          maxBarSize={config.barSize > 0 ? config.barSize : undefined}
          cursor={onBarClick ? 'pointer' : undefined}
          onClick={(d, idx, e) => onBarClick?.(idx, s, Number(d[s] ?? 0), e.clientX, e.clientY)}>
          {config.showDataLabels && (
            <LabelList dataKey={s} position={horizontal ? 'insideRight' : 'top'}
              style={{ fontSize: config.fontSize - 3, fill: horizontal ? '#fff' : 'currentColor', fontWeight: 600 }} />
          )}
        </Bar>
      ))}
    </BarChart>
  )
}

const CURVE_KEY = '__density__'

export function HistogramView({ data, config, series, colors }: Omit<BarProps, 'onBarClick'>) {
  const s0 = series[0]
  const freqs = data.map((d) => Number(d[s0] ?? 0))
  const smoothed = gaussianSmooth(freqs)
  // Curve same color as bars but always full opacity; bars get slight transparency
  const barColor = colors[0] ?? '#64b5f6'
  const stats = config.showDensityCurve ? computeStats(data, s0) : null
  const plotData = config.showDensityCurve
    ? data.map((d, i) => ({ ...d, [CURVE_KEY]: smoothed[i] }))
    : data

  return (
    <ComposedChart data={plotData} barCategoryGap={1} barGap={0}>
      {config.showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />}
      <XAxis dataKey="name" {...axisStyle(config.fontSize)}
        label={config.xLabel ? { value: config.xLabel, position: 'insideBottom', offset: -5 } : undefined} />
      <YAxis domain={yDomain(config)} {...axisStyle(config.fontSize)}
        label={config.yLabel ? { value: config.yLabel, angle: -90, position: 'insideLeft' } : undefined} />
      <Tooltip contentStyle={TOOLTIP_STYLE} />
      {config.showLegend && series.length > 1 && <Legend wrapperStyle={{ fontSize: config.fontSize - 2 }} />}
      {series.map((s, i) => (
        <Bar key={s} dataKey={s} fill={colors[i]} fillOpacity={0.72} radius={0}
          stroke="white" strokeWidth={1}
          maxBarSize={config.barSize > 0 ? config.barSize : undefined}>
          {config.showDataLabels && (
            <LabelList dataKey={s} position="top" style={{ fontSize: config.fontSize - 3 }} />
          )}
        </Bar>
      ))}
      {/* Density curve — same hue as bars, full opacity so it appears darker */}
      {config.showDensityCurve && (
        <Line type="monotone" dataKey={CURVE_KEY} stroke={barColor}
          strokeWidth={2.5} dot={false} legendType="none" />
      )}
      {/* Mean & Median reference lines */}
      {stats?.medianLabel && (
        <ReferenceLine x={stats.medianLabel} stroke="#374151" strokeWidth={1.5} strokeDasharray="4 3"
          label={{ value: 'Median', position: 'insideTopLeft', fontSize: config.fontSize - 3, fill: '#374151' }} />
      )}
      {stats?.meanLabel && (
        <ReferenceLine x={stats.meanLabel} stroke="#374151" strokeWidth={1.5} strokeDasharray="4 3"
          label={{ value: 'Mean', position: 'insideTopRight', fontSize: config.fontSize - 3, fill: '#374151' }} />
      )}
    </ComposedChart>
  )
}
