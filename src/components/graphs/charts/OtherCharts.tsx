'use client'

import {
  Bar, CartesianGrid, Cell, ComposedChart, ErrorBar, LabelList,
  Legend, Pie, PieChart, ReferenceLine, Scatter, ScatterChart,
  Line, LineChart, Tooltip, XAxis, YAxis,
} from 'recharts'
import type { ChartConfig, TableData } from '@/lib/graphs/types'
import { toErrorBarData, toScatterData, axisStyle, TOOLTIP_STYLE, yDomain } from '@/lib/graphs/chartHelpers'

// ─── Pie / Donut ──────────────────────────────────────────────────────────────

export function PieChartView({ data, config, colors, donut }: {
  data: { name: string; value: number }[]
  config: ChartConfig
  colors: string[]
  donut: boolean
}) {
  return (
    <PieChart>
      <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%"
        outerRadius="70%" innerRadius={donut ? '35%' : 0}
        label={config.showDataLabels ? ({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%` : undefined}
        labelLine={config.showDataLabels}>
        {data.map((_, i) => <Cell key={i} fill={colors[i % colors.length]} />)}
      </Pie>
      <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(val: number) => [val, '']} />
      {config.showLegend && <Legend wrapperStyle={{ fontSize: config.fontSize - 2 }} />}
    </PieChart>
  )
}

// ─── Scatter ──────────────────────────────────────────────────────────────────

export function ScatterChartView({ data: td, config, colors }: {
  data: TableData; config: ChartConfig; colors: string[]
}) {
  const sd = toScatterData(td)
  return (
    <ScatterChart>
      {config.showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />}
      <XAxis dataKey="x" type="number" name={td.headers[1] ?? 'X'} domain={['auto', 'auto']}
        {...axisStyle(config.fontSize)}
        label={config.xLabel ? { value: config.xLabel, position: 'insideBottom', offset: -5 } : undefined} />
      <YAxis dataKey="y" type="number" name={td.headers[2] ?? 'Y'} domain={yDomain(config)}
        {...axisStyle(config.fontSize)}
        label={config.yLabel ? { value: config.yLabel, angle: -90, position: 'insideLeft' } : undefined} />
      <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ strokeDasharray: '3 3' }} />
      <Scatter data={sd} fill={colors[0]} opacity={0.8} />
    </ScatterChart>
  )
}

// ─── Error Bar ────────────────────────────────────────────────────────────────

type LabelProps = { x?: number; y?: number; width?: number; index?: number }

export function ErrorBarView({ data: td, config, colors }: {
  data: TableData; config: ChartConfig; colors: string[]
}) {
  const ed = toErrorBarData(td)
  const minWhisker = Math.min(...ed.map((d) => d.value - d.error))
  const maxWhisker = Math.max(...ed.map((d) => d.value + d.error))
  const range = maxWhisker - minWhisker || 1
  const domainMin = config.yMin ? parseFloat(config.yMin) : Math.max(0, minWhisker - range * 0.15)
  const domainMax = config.yMax ? parseFloat(config.yMax) : maxWhisker + range * 0.15
  const pxPerUnit = 260 / (domainMax - domainMin || 1)

  function MeanSDLabel({ x = 0, y = 0, width = 0, index = 0 }: LabelProps) {
    const d = ed[index]
    if (!d) return null
    const topY = y - d.error * pxPerUnit - 26
    return (
      <g>
        <text x={x + width / 2} y={topY} textAnchor="middle" fontSize={config.fontSize - 2} fontWeight={700} fill="#111827">
          {d.value.toFixed(2)}
        </text>
        <text x={x + width / 2} y={topY + 14} textAnchor="middle" fontSize={config.fontSize - 3} fill="#6b7280">
          ±{d.error.toFixed(2)}
        </text>
      </g>
    )
  }

  return (
    <ComposedChart data={ed}>
      {config.showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />}
      <XAxis dataKey="name" {...axisStyle(config.fontSize)}
        label={config.xLabel ? { value: config.xLabel, position: 'insideBottom', offset: -5 } : undefined} />
      <YAxis domain={[domainMin, domainMax]} {...axisStyle(config.fontSize)}
        label={config.yLabel ? { value: config.yLabel, angle: -90, position: 'insideLeft' } : undefined} />
      <Tooltip contentStyle={TOOLTIP_STYLE}
        formatter={(val: number, _: string, { payload }: { payload: { error: number } }) =>
          [`${val.toFixed(2)} ± ${payload.error.toFixed(2)}`, 'Mean ± SD']} />
      <Bar dataKey="value" radius={[3, 3, 0, 0]} maxBarSize={config.barSize > 0 ? config.barSize : 60}>
        {ed.map((_, i) => <Cell key={i} fill={colors[i % colors.length]} />)}
        <ErrorBar dataKey="error" width={8} strokeWidth={2} stroke="#1f2937" />
        {config.showDataLabels && <LabelList content={MeanSDLabel} />}
      </Bar>
    </ComposedChart>
  )
}

// ─── ROC Curve ────────────────────────────────────────────────────────────────

export function ROCCurve({ data, config, colors }: {
  data: { x: number; y: number; name: string }[]
  config: ChartConfig
  colors: string[]
}) {
  return (
    <LineChart data={data} margin={{ top: 10, right: 20, bottom: 30, left: 10 }}>
      {config.showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />}
      <XAxis dataKey="x" type="number" domain={[0, 1]} tickFormatter={(v) => v.toFixed(1)}
        {...axisStyle(config.fontSize)}
        label={{ value: config.xLabel || '1 - Specificity', position: 'insideBottom', offset: -15, fontSize: config.fontSize - 1 }} />
      <YAxis dataKey="y" type="number" domain={[0, 1]} tickFormatter={(v) => v.toFixed(1)}
        {...axisStyle(config.fontSize)}
        label={{ value: config.yLabel || 'Sensitivity', angle: -90, position: 'insideLeft', fontSize: config.fontSize - 1 }} />
      <Tooltip contentStyle={TOOLTIP_STYLE} />
      <ReferenceLine segment={[{ x: 0, y: 0 }, { x: 1, y: 1 }]} stroke="#9ca3af" strokeDasharray="4 3" />
      <Line type="monotone" dataKey="y" stroke={colors[0]} strokeWidth={2.5} dot={false} name="ROC" />
    </LineChart>
  )
}
