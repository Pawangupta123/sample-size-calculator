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
}

function ChartTitle({ config }: { config: ChartConfig }) {
  return (
    <>
      {config.title && <p className="text-center font-semibold" style={{ fontSize: config.fontSize + 2 }}>{config.title}</p>}
      {config.subtitle && <p className="text-center text-muted-foreground" style={{ fontSize: config.fontSize - 1 }}>{config.subtitle}</p>}
    </>
  )
}

export function ChartRenderer({ chartType, data, config, onBarClick }: ChartRendererProps) {
  const allSeries = data.headers.slice(1)
  const hidden = config.hiddenSeries ?? []
  const series = allSeries.filter((s) => !hidden.includes(s))
  const seriesIndices = allSeries.map((s, i) => ({ s, i })).filter(({ s }) => !hidden.includes(s)).map(({ i }) => i)
  const allColors = getPaletteColors(config.palette, config.customColors, allSeries.length || 1)
  const colors = seriesIndices.map((i) => allColors[i])

  const visibleData: TableData = {
    ...data,
    headers: [data.headers[0], ...series],
    rows: data.rows.map((r) => ({ ...r, values: seriesIndices.map((i) => r.values[i] ?? null) })),
  }
  const barData = toBarData(visibleData)
  const pieData = toPieData(visibleData)

  const renderChart = () => {
    switch (chartType) {
      case 'bar':           return <BarChartView data={barData} config={config} series={series} colors={colors} onBarClick={onBarClick} />
      case 'stacked_bar':   return <BarChartView data={barData} config={{ ...config, barGrouped: false, barOrientation: 'vertical' }} series={series} colors={colors} onBarClick={onBarClick} />
      case 'horizontal_bar':return <BarChartView data={barData} config={{ ...config, barOrientation: 'horizontal' }} series={series} colors={colors} onBarClick={onBarClick} />
      case 'histogram':     return <HistogramView data={barData} config={config} series={series} colors={colors} />
      case 'line':          return <LineChartView data={barData} config={config} series={series} colors={colors} />
      case 'area':          return <AreaChartView data={barData} config={config} series={series} colors={colors} />
      case 'kaplan_meier':  return <KaplanMeier data={barData} config={config} series={series} colors={colors} />
      case 'pie':
      case 'donut': {
        // Pie slices need one color per row, not per series
        const sliceColors = getPaletteColors(config.palette, config.customColors, visibleData.rows.length || 1)
        return <PieChartView data={pieData} config={config} colors={sliceColors} donut={chartType === 'donut'} />
      }
      case 'scatter':       return <ScatterChartView data={visibleData} config={config} colors={colors} />
      case 'error_bar':     return <ErrorBarView data={visibleData} config={config} colors={colors} />
      case 'box':           return <BoxPlot data={visibleData} config={config} colors={colors} />
      case 'forest':        return <ForestPlot data={visibleData} config={config} colors={colors} />
      case 'roc': {
        const rocData = data.rows.map((r) => ({ x: r.values[0] ?? 0, y: r.values[1] ?? 0, name: r.label }))
        return <ROCCurve data={rocData} config={config} colors={colors} />
      }
      default: return <BarChartView data={barData} config={config} series={series} colors={colors} />
    }
  }

  const isSvgChart = chartType === 'box' || chartType === 'forest'

  if (isSvgChart) {
    return <div className="flex flex-col items-center gap-2"><ChartTitle config={config} />{renderChart()}</div>
  }

  return (
    <div className="flex flex-col gap-1">
      <ChartTitle config={config} />
      <ResponsiveContainer width="100%" height={320}>
        {renderChart() as React.ReactElement}
      </ResponsiveContainer>
    </div>
  )
}
