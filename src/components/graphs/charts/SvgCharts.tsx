'use client'

import type { ChartConfig, TableData } from '@/lib/graphs/types'

// ─── Box Plot ─────────────────────────────────────────────────────────────────

// Single box+whiskers unit — eliminates repeated SVG per row (DRY)
function BoxGroup({ x, bw, color, vmin, q1, median, q3, vmax, label, fontSize, innerH, yScale, showLabel }: {
  x: number; bw: number; color: string
  vmin: number; q1: number; median: number; q3: number; vmax: number
  label: string; fontSize: number; innerH: number
  yScale: (v: number) => number; showLabel: boolean
}) {
  const half = bw / 2
  const cap = bw * 0.35
  const WHISKER = '#374151'  // dark gray whiskers
  const MEDIAN  = '#111827'  // near-black median — always visible

  return (
    <g>
      {/* Upper whisker + cap */}
      <line x1={x} y1={yScale(vmax)} x2={x} y2={yScale(q3)} stroke={WHISKER} strokeWidth={1.5} />
      <line x1={x - cap} y1={yScale(vmax)} x2={x + cap} y2={yScale(vmax)} stroke={WHISKER} strokeWidth={1.5} />
      {/* Lower whisker + cap */}
      <line x1={x} y1={yScale(q1)} x2={x} y2={yScale(vmin)} stroke={WHISKER} strokeWidth={1.5} />
      <line x1={x - cap} y1={yScale(vmin)} x2={x + cap} y2={yScale(vmin)} stroke={WHISKER} strokeWidth={1.5} />
      {/* Box: light fill, full-color border */}
      <rect x={x - half} y={yScale(q3)} width={bw} height={Math.max(1, yScale(q1) - yScale(q3))}
        fill={color + '55'} stroke={color} strokeWidth={2} rx={3} />
      {/* Median: near-black, same weight as whiskers */}
      <line x1={x - half} y1={yScale(median)} x2={x + half} y2={yScale(median)} stroke={MEDIAN} strokeWidth={1.5} />
      {/* Category label below x-axis */}
      <text x={x} y={innerH + 18} textAnchor="middle" fontSize={fontSize - 2} fill="#374151">{label}</text>
      {/* Median (Q1–Q3) above upper whisker */}
      {showLabel && (
        <>
          <text x={x} y={yScale(vmax) - 16} textAnchor="middle" fontSize={fontSize - 2} fontWeight={700} fill="#111827">
            {median.toFixed(1)}
          </text>
          <text x={x} y={yScale(vmax) - 4} textAnchor="middle" fontSize={fontSize - 3} fill="#6b7280">
            ({q1.toFixed(1)}–{q3.toFixed(1)})
          </text>
        </>
      )}
    </g>
  )
}

export function BoxPlot({ data, config, colors }: {
  data: TableData; config: ChartConfig; colors: string[]
}) {
  const PAD = { top: 36, right: 24, bottom: 52, left: 55 }
  const W = 480, H = 300
  const innerW = W - PAD.left - PAD.right
  const innerH = H - PAD.top - PAD.bottom

  const allVals = data.rows.flatMap((r) => r.values.filter((v): v is number => v !== null && !isNaN(v)))
  if (allVals.length === 0)
    return (
      <svg width="100%" viewBox="0 0 480 300">
        <text x="240" y="150" textAnchor="middle" fontSize={13} fill="#9ca3af">
          No data — use Min / Q1 / Median / Q3 / Max columns
        </text>
      </svg>
    )

  const lo = Math.min(...allVals) * 0.9
  const hi = Math.max(...allVals) * 1.05
  const yScale = (v: number) => innerH - ((v - lo) / ((hi - lo) || 1)) * innerH
  const autoBw = Math.min(70, innerW / data.rows.length / 1.8)
  const bw = config.barSize > 0 ? config.barSize : autoBw
  const xStep = innerW / data.rows.length
  const xPos = (i: number) => i * xStep + xStep / 2
  const yTicks = Array.from({ length: 6 }, (_, i) => lo + (i / 5) * (hi - lo))

  // Legend (top-right, shown only when showLegend)
  const legendX = innerW - data.rows.length * 70
  const LEGEND_COL_W = 68

  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ overflow: 'visible' }}>
      <g transform={`translate(${PAD.left},${PAD.top})`}>
        {/* Grid lines */}
        {config.showGrid && yTicks.map((t) => (
          <line key={t} x1={0} y1={yScale(t)} x2={innerW} y2={yScale(t)} stroke="#e5e7eb" strokeDasharray="3 3" />
        ))}
        {/* Y axis + ticks */}
        <line x1={0} y1={0} x2={0} y2={innerH} stroke="#9ca3af" />
        {yTicks.map((t) => (
          <g key={t}>
            <line x1={-4} y1={yScale(t)} x2={0} y2={yScale(t)} stroke="#9ca3af" />
            <text x={-8} y={yScale(t) + 4} textAnchor="end" fontSize={config.fontSize - 3} fill="#6b7280">
              {t.toFixed(1)}
            </text>
          </g>
        ))}
        {/* Boxes */}
        {data.rows.map((row, i) => {
          const get = (idx: number) => row.values[idx] ?? 0
          return (
            <BoxGroup key={i}
              x={xPos(i)} bw={bw} color={colors[i % colors.length]}
              vmin={get(0)} q1={get(1)} median={get(2)} q3={get(3)} vmax={get(4)}
              label={row.label} fontSize={config.fontSize}
              innerH={innerH} yScale={yScale} showLabel={config.showDataLabels} />
          )
        })}
        {/* X axis */}
        <line x1={0} y1={innerH} x2={innerW} y2={innerH} stroke="#9ca3af" />
        {/* Axis labels */}
        {config.xLabel && <text x={innerW / 2} y={innerH + 40} textAnchor="middle" fontSize={config.fontSize} fill="#374151">{config.xLabel}</text>}
        {config.yLabel && <text x={-innerH / 2} y={-42} textAnchor="middle" fontSize={config.fontSize} fill="#374151" transform="rotate(-90)">{config.yLabel}</text>}
        {/* Legend */}
        {config.showLegend && data.rows.map((row, i) => (
          <g key={i} transform={`translate(${legendX + i * LEGEND_COL_W}, -28)`}>
            <rect width={12} height={12} fill={colors[i % colors.length] + '55'} stroke={colors[i % colors.length]} strokeWidth={1.5} rx={2} />
            <text x={16} y={10} fontSize={config.fontSize - 3} fill="#374151">{row.label}</text>
          </g>
        ))}
      </g>
    </svg>
  )
}

// ─── Forest Plot ──────────────────────────────────────────────────────────────

export function ForestPlot({ data, config, colors }: {
  data: TableData; config: ChartConfig; colors: string[]
}) {
  const rows = data.rows
  const W = 580, LW = 160, RW = 100, PAD_TOP = 36, ROW_H = 36
  const H = 40 + rows.length * ROW_H + 60
  const plotW = W - LW - RW - 20

  const allVals = rows.flatMap((r) => [r.values[1] ?? 1, r.values[2] ?? 1, r.values[3] ?? 1])
  const xMin = Math.min(...allVals) * 0.8
  const xMax = Math.max(...allVals) * 1.2
  const xScale = (v: number) => ((v - xMin) / (xMax - xMin)) * plotW
  const nullX = xScale(config.forestNull)

  let wSum = 0, wEffSum = 0
  rows.forEach((r) => {
    const lo = r.values[1] ?? 0, hi = r.values[2] ?? 0
    const se = (Math.log(hi) - Math.log(lo)) / (2 * 1.96)
    const w = se > 0 ? 1 / (se * se) : 0
    wSum += w; wEffSum += w * (r.values[0] ?? 1)
  })
  const pooledEff = wSum > 0 ? wEffSum / wSum : 1

  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`}>
      <text x={LW / 2} y={20} textAnchor="middle" fontSize={11} fontWeight="600" fill="#111827">Study</text>
      <text x={LW + plotW / 2} y={20} textAnchor="middle" fontSize={11} fontWeight="600" fill="#111827">{config.forestEffectLabel}</text>
      <text x={W - RW / 2} y={20} textAnchor="middle" fontSize={11} fontWeight="600" fill="#111827">{config.forestEffectLabel} (95% CI)</text>
      <line x1={LW + nullX} y1={PAD_TOP} x2={LW + nullX} y2={PAD_TOP + rows.length * ROW_H + 10}
        stroke="#9ca3af" strokeDasharray="4 3" strokeWidth={1} />
      {rows.map((row, i) => {
        const eff = row.values[0] ?? 1
        const lo = row.values[1] ?? eff * 0.8
        const hi = row.values[2] ?? eff * 1.2
        const wt = row.values[3] ?? 10
        const y = PAD_TOP + i * ROW_H + ROW_H / 2
        const cx = LW + xScale(eff), lx = LW + xScale(lo), rx = LW + xScale(hi)
        const bSize = 3 + (wt / 30) * 5
        return (
          <g key={i}>
            <text x={LW - 8} y={y + 4} textAnchor="end" fontSize={10} fill="#374151">{row.label}</text>
            <line x1={lx} y1={y} x2={rx} y2={y} stroke={colors[0]} strokeWidth={1.5} />
            <line x1={lx} y1={y - 4} x2={lx} y2={y + 4} stroke={colors[0]} strokeWidth={1.5} />
            <line x1={rx} y1={y - 4} x2={rx} y2={y + 4} stroke={colors[0]} strokeWidth={1.5} />
            <rect x={cx - bSize / 2} y={y - bSize / 2} width={bSize} height={bSize}
              fill={colors[0]} transform={`rotate(45 ${cx} ${y})`} />
            <text x={W - RW / 2} y={y + 4} textAnchor="middle" fontSize={9} fill="#374151">
              {eff.toFixed(2)} ({lo.toFixed(2)}–{hi.toFixed(2)})
            </text>
          </g>
        )
      })}
      {wSum > 0 && (() => {
        const y = PAD_TOP + rows.length * ROW_H + 20
        const cx = LW + xScale(pooledEff), dx = 14
        return (
          <g>
            <line x1={LW} y1={y - 4} x2={LW + plotW} y2={y - 4} stroke="#e5e7eb" />
            <polygon points={`${cx - dx},${y} ${cx},${y - 8} ${cx + dx},${y} ${cx},${y + 8}`} fill={colors[0]} opacity={0.85} />
            <text x={LW - 8} y={y + 4} textAnchor="end" fontSize={10} fontWeight="600" fill="#374151">Overall</text>
            <text x={W - RW / 2} y={y + 4} textAnchor="middle" fontSize={9} fontWeight="600" fill="#374151">{pooledEff.toFixed(2)}</text>
          </g>
        )
      })()}
      {[xMin, config.forestNull, xMax].map((v) => (
        <g key={v}>
          <line x1={LW + xScale(v)} y1={PAD_TOP + rows.length * ROW_H + 40} x2={LW + xScale(v)} y2={PAD_TOP + rows.length * ROW_H + 46} stroke="#9ca3af" />
          <text x={LW + xScale(v)} y={PAD_TOP + rows.length * ROW_H + 56} textAnchor="middle" fontSize={9} fill="#6b7280">{v.toFixed(2)}</text>
        </g>
      ))}
    </svg>
  )
}
