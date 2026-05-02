'use client'

import { Area, AreaChart, CartesianGrid, LabelList, Legend, Line, LineChart, Tooltip, XAxis, YAxis } from 'recharts'
import type { ChartConfig } from '@/lib/graphs/types'
import { axisStyle, TOOLTIP_STYLE, yDomain } from '@/lib/graphs/chartHelpers'

interface Props {
  data: Record<string, string | number>[]
  config: ChartConfig
  series: string[]
  colors: string[]
}

export function LineChartView({ data, config, series, colors }: Props) {
  return (
    <LineChart data={data}>
      {config.showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />}
      <XAxis dataKey="name" {...axisStyle(config.fontSize)}
        label={config.xLabel ? { value: config.xLabel, position: 'insideBottom', offset: -5 } : undefined} />
      <YAxis domain={yDomain(config)} {...axisStyle(config.fontSize)}
        label={config.yLabel ? { value: config.yLabel, angle: -90, position: 'insideLeft' } : undefined} />
      <Tooltip contentStyle={TOOLTIP_STYLE} />
      {config.showLegend && <Legend wrapperStyle={{ fontSize: config.fontSize - 2 }} />}
      {series.map((s, i) => (
        <Line key={s} type={config.smooth ? 'monotone' : 'linear'} dataKey={s}
          stroke={colors[i]} strokeWidth={2.5}
          dot={config.showDots ? { r: 4, fill: colors[i] } : false}
          activeDot={{ r: 6 }}>
          {config.showDataLabels && (
            <LabelList dataKey={s} position="top"
              style={{ fontSize: config.fontSize - 3, fill: '#111827', fontWeight: 600 }} />
          )}
        </Line>
      ))}
    </LineChart>
  )
}

export function AreaChartView({ data, config, series, colors }: Props) {
  return (
    <AreaChart data={data}>
      {config.showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />}
      <XAxis dataKey="name" {...axisStyle(config.fontSize)}
        label={config.xLabel ? { value: config.xLabel, position: 'insideBottom', offset: -5 } : undefined} />
      <YAxis domain={yDomain(config)} {...axisStyle(config.fontSize)}
        label={config.yLabel ? { value: config.yLabel, angle: -90, position: 'insideLeft' } : undefined} />
      <Tooltip contentStyle={TOOLTIP_STYLE} />
      {config.showLegend && <Legend wrapperStyle={{ fontSize: config.fontSize - 2 }} />}
      {series.map((s, i) => (
        <Area key={s} type={config.smooth ? 'monotone' : 'linear'} dataKey={s}
          stroke={colors[i]} fill={colors[i] + '33'} strokeWidth={2}>
          {config.showDataLabels && (
            <LabelList dataKey={s} position="top"
              style={{ fontSize: config.fontSize - 3, fill: '#111827', fontWeight: 600 }} />
          )}
        </Area>
      ))}
    </AreaChart>
  )
}

export function KaplanMeier({ data, config, series, colors }: Props) {
  return (
    <LineChart data={data}>
      {config.showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />}
      <XAxis dataKey="name" {...axisStyle(config.fontSize)}
        label={{ value: config.xLabel || 'Time', position: 'insideBottom', offset: -5, fontSize: config.fontSize - 1 }} />
      <YAxis domain={[0, 1]} tickFormatter={(v: number) => `${(v * 100).toFixed(0)}%`}
        {...axisStyle(config.fontSize)}
        label={{ value: config.yLabel || 'Survival probability', angle: -90, position: 'insideLeft', fontSize: config.fontSize - 1 }} />
      <Tooltip contentStyle={TOOLTIP_STYLE}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        formatter={(v: any) => [`${(Number(v) * 100).toFixed(1)}%`, 'Survival']} />
      {config.showLegend && <Legend wrapperStyle={{ fontSize: config.fontSize - 2 }} />}
      {series.map((s, i) => (
        <Line key={s} type="stepAfter" dataKey={s}
          stroke={colors[i]} strokeWidth={2.5} dot={false} activeDot={{ r: 4 }} />
      ))}
    </LineChart>
  )
}
