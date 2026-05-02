'use client'

import { ResponsiveContainer } from 'recharts'
import { getPaletteColors } from '@/lib/graphs/colorPalettes'
import type { ChartConfig, ChartType, TableData } from '@/lib/graphs/types'
import { toBarData, toPieData } from '@/lib/graphs/chartHelpers'
import { BarChartView, HistogramView } from './charts/BarCharts'
import { LineChartView, AreaChartView, KaplanMeier } from './charts/LineCharts'
import { PieChartView, ScatterChartView, ErrorBarView, ROCCurve } from './charts/OtherCharts'
import { BoxPlot, ForestPlot } from './charts/SvgCharts'

type BarClickFn = (rowIdx: number, colName: string, value: number, x: number, y: number) => void

interface ChartRendererProps {
  chartType: ChartType
  data: TableData
  config: ChartConfig
  onBarClick?: BarClickFn
  onConfigChange?: (patch: Partial<ChartConfig>) => void
}

function ChartTitle({ config }: { config: ChartConfig }) {
  return (
    <>
      {config.title && (
        <p className="text-center font-semibold text-gray-900" style={{ fontSize: config.fontSize + 2 }}>
          {config.title}
        </p>
      )}
      {config.subtitle && (
        <p className="text-center text-gray-500" style={{ fontSize: config.fontSize - 1 }}>
          {config.subtitle}
        </p>
      )}
    </>
  )
}

export function ChartRenderer({ chartType, data, config, onBarClick, onConfigChange }: ChartRendererProps) {
  const allSeries = data.headers.slice(1)
  const hidden = config.hiddenSeries ?? []
  const series = allSeries.filter(s => !hidden.includes(s))
  const seriesIndices = allSeries.map((s, i) => ({ s, i })).filter(({ s }) => !hidden.includes(s)).map(({ i }) => i)
  const allColors = getPaletteColors(config.palette, config.customColors, allSeries.length || 1)
  const colors = seriesIndices.map(i => allColors[i])

  const visibleData: TableData = {
    ...data,
    headers: [data.headers[0], ...series],
    rows: data.rows.map(r => ({ ...r, values: seriesIndices.map(i => r.values[i] ?? null) })),
  }
  const barData = toBarData(visibleData)
  const pieData = toPieData(visibleData)

  const renderChart = () => {
    switch (chartType) {
      case 'bar':            return <BarChartView data={barData} config={config} series={series} colors={colors} onBarClick={onBarClick} />
      case 'stacked_bar':    return <BarChartView data={barData} config={{ ...config, barGrouped: false, barOrientation: 'vertical' }} series={series} colors={colors} onBarClick={onBarClick} />
      case 'horizontal_bar': return <BarChartView data={barData} config={{ ...config, barOrientation: 'horizontal' }} series={series} colors={colors} onBarClick={onBarClick} />
      case 'histogram':      return <HistogramView data={barData} config={config} series={series} colors={colors} />
      case 'line':           return <LineChartView data={barData} config={config} series={series} colors={colors} />
      case 'area':           return <AreaChartView data={barData} config={config} series={series} colors={colors} />
      case 'kaplan_meier':   return <KaplanMeier data={barData} config={config} series={series} colors={colors} />
      case 'pie':
      case 'donut': {
        const sliceColors = getPaletteColors(config.palette, config.customColors, visibleData.rows.length || 1)
        return <PieChartView data={pieData} config={config} colors={sliceColors} donut={chartType === 'donut'} />
      }
      case 'scatter':   return <ScatterChartView data={visibleData} config={config} colors={colors} />
      case 'error_bar': return <ErrorBarView data={visibleData} config={config} colors={colors} />
      case 'box':       return <BoxPlot data={visibleData} config={config} colors={colors} />
      case 'forest':    return <ForestPlot data={visibleData} config={config} colors={colors} />
      case 'roc': {
        const rocData = data.rows.map(r => ({ x: r.values[0] ?? 0, y: r.values[1] ?? 0, name: r.label }))
        return <ROCCurve data={rocData} config={config} colors={colors} />
      }
      default: return <BarChartView data={barData} config={config} series={series} colors={colors} />
    }
  }

  // Drag handler factory
  const makeDragHandler = (
    axis: 'height' | 'width',
    startValue: number,
    min: number, max: number, step: number
  ) => (e: React.MouseEvent) => {
    if (!onConfigChange) return
    e.preventDefault()
    const startPos = axis === 'height' ? e.clientY : e.clientX

    const onMove = (ev: MouseEvent) => {
      const delta = axis === 'height' ? ev.clientY - startPos : ev.clientX - startPos
      const raw = axis === 'height' ? startValue + delta : startValue + (delta / window.innerWidth) * 100
      const clamped = Math.max(min, Math.min(max, raw))
      const snapped = Math.round(clamped / step) * step
      onConfigChange(axis === 'height' ? { chartHeight: snapped } : { chartWidth: snapped })
    }
    const onUp = () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }

  const chartHeight = config.chartHeight ?? 320
  const chartWidth = config.chartWidth ?? 100
  const isSvgChart = chartType === 'box' || chartType === 'forest'

  return (
    <div className="flex flex-col items-center gap-1">
      {/* Width-constrained wrapper */}
      <div className="relative w-full" style={{ maxWidth: `${chartWidth}%` }}>

        <ChartTitle config={config} />

        {isSvgChart ? (
          renderChart()
        ) : (
          <ResponsiveContainer width="100%" height={chartHeight}>
            {renderChart() as React.ReactElement}
          </ResponsiveContainer>
        )}

        {/* Right drag handle — width */}
        {onConfigChange && (
          <div
            onMouseDown={makeDragHandler('width', chartWidth, 30, 100, 5)}
            title={`Width: ${chartWidth}%`}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 flex h-10 w-3 cursor-col-resize select-none items-center justify-center rounded-full group"
          >
            <div className="h-6 w-1 rounded-full bg-gray-200 transition-colors group-hover:bg-primary/60" />
          </div>
        )}
      </div>

      {/* Bottom drag handle — height */}
      {onConfigChange && !isSvgChart && (
        <div
          onMouseDown={makeDragHandler('height', chartHeight, 180, 700, 10)}
          title={`Height: ${chartHeight}px`}
          className="flex h-4 w-20 cursor-row-resize select-none items-center justify-center rounded-full group"
        >
          <div className="h-1 w-10 rounded-full bg-gray-200 transition-colors group-hover:bg-primary/60" />
        </div>
      )}
    </div>
  )
}
