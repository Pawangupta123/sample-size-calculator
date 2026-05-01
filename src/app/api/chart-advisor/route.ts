import { NextRequest, NextResponse } from 'next/server'
import type { ChartType } from '@/lib/graphs/types'

interface AdvisorRequest {
  chartType: ChartType
  headers: string[]
  rows: { label: string; values: (number | null)[] }[]
  currentTitle: string
  currentXLabel: string
  currentYLabel: string
}

export interface AdvisorResult {
  title: string
  xLabel: string
  yLabel: string
  caption: string
  tip: string | null
  betterChart: ChartType | null
}

const CHART_LABELS: Record<ChartType, string> = {
  bar: 'Grouped Bar Chart', stacked_bar: 'Stacked Bar Chart',
  horizontal_bar: 'Horizontal Bar Chart', line: 'Line Chart',
  area: 'Area Chart', scatter: 'Scatter Plot', pie: 'Pie Chart',
  donut: 'Donut Chart', histogram: 'Histogram', box: 'Box Plot',
  error_bar: 'Error Bar Chart', kaplan_meier: 'Kaplan-Meier Survival Curve',
  forest: 'Forest Plot', roc: 'ROC Curve',
}

const VALID_CHART_TYPES = new Set<string>([
  'bar','stacked_bar','horizontal_bar','line','area','scatter',
  'pie','donut','histogram','box','error_bar','kaplan_meier','forest','roc',
])

function buildPrompt(req: AdvisorRequest): string {
  const { chartType, headers, rows, currentTitle, currentXLabel, currentYLabel } = req
  const tablePreview = [
    headers.join('\t'),
    ...rows.slice(0, 6).map(r => [r.label, ...r.values.map(v => v ?? '')].join('\t')),
  ].join('\n')

  return `You are a medical statistics expert. A researcher needs help polishing a chart for publication.

Chart type: ${CHART_LABELS[chartType]}
Current title: "${currentTitle || '(none)'}"
Current X label: "${currentXLabel || '(none)'}"
Current Y label: "${currentYLabel || '(none)'}"

Data:
${tablePreview}

Reply with ONLY a JSON object. No text before or after. No markdown fences.

Generate:
- title: concise professional title, max 12 words
- xLabel: short X-axis label with unit if applicable
- yLabel: short Y-axis label with unit if applicable
- caption: 2-sentence figure caption for journal paper, passive voice, start with "Figure X."
- tip: data/design warning string if any issue found, else null
- betterChart: better chart type if applicable from [bar,stacked_bar,horizontal_bar,line,area,scatter,pie,donut,histogram,box,error_bar,kaplan_meier,forest,roc], else null

JSON:`
}

function parseJsonSafe(raw: string): AdvisorResult | null {
  if (!raw?.trim()) return null
  const cleaned = raw.replace(/^```(?:json)?\n?/i, '').replace(/\n?```$/, '').trim()
  const start = cleaned.indexOf('{')
  const end = cleaned.lastIndexOf('}')
  if (start === -1 || end === -1) return null
  try {
    const obj = JSON.parse(cleaned.slice(start, end + 1))
    if (typeof obj.title !== 'string') return null
    if (obj.betterChart && !VALID_CHART_TYPES.has(obj.betterChart)) obj.betterChart = null
    return obj as AdvisorResult
  } catch { return null }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as AdvisorRequest
    const apiKey = process.env.OPENROUTER_API_KEY
    const model = process.env.OPENROUTER_MODEL || 'google/gemini-flash-1.5'
    if (!apiKey) return NextResponse.json({ error: 'OPENROUTER_API_KEY not set in .env' }, { status: 500 })

    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://easemyresearch.com',
        'X-Title': 'EaseMyResearch Graph Designer',
      },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: buildPrompt(body) }],
        max_tokens: 500,
        temperature: 0.2,
      }),
    })

    if (res.status === 429) return NextResponse.json({ error: 'Rate limited — wait a moment and try again' }, { status: 429 })
    if (!res.ok) {
      const t = await res.text()
      return NextResponse.json({ error: `Model error (${res.status}): ${t.slice(0, 200)}` }, { status: 502 })
    }

    const data = await res.json()
    const raw: string = data.choices?.[0]?.message?.content ?? ''
    const result = parseJsonSafe(raw)

    if (!result) return NextResponse.json({ error: `Could not parse AI response: ${raw.slice(0, 100)}` }, { status: 502 })

    return NextResponse.json({ ...result, model })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
