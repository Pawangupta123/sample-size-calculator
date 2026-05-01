import { NextRequest, NextResponse } from 'next/server'

const PROMPT = `You are a data extraction assistant for medical research.

Look at this image carefully. It may contain a data table or a chart/graph.

Extract ALL numerical data into a clean tab-separated table.

FORMAT RULES:
1. First row = column headers, tab-separated
2. First column = row labels (groups, categories, time points)
3. Remaining columns = numerical values only (no units, no % sign)
4. For cells like "91 (89.2%)" write just 91
5. For missing/NA cells write empty (just a tab)
6. Do NOT include Total or p-value columns
7. Return ONLY the tab-separated table — no explanation, no markdown, no code blocks

Example output:
Group\tDrug A\tDrug B\tPlacebo
Week 2\t45\t38\t22
Week 4\t62\t55\t28`

export async function POST(req: NextRequest) {
  try {
    const { imageBase64, mimeType } = await req.json() as { imageBase64: string; mimeType: string }
    if (!imageBase64) return NextResponse.json({ error: 'No image provided' }, { status: 400 })

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
        messages: [
          {
            role: 'user',
            content: [
              { type: 'image_url', image_url: { url: `data:${mimeType};base64,${imageBase64}` } },
              { type: 'text', text: PROMPT },
            ],
          },
        ],
        max_tokens: 2000,
        temperature: 0,
      }),
    })

    if (res.status === 429) return NextResponse.json({ error: 'Rate limited — wait a moment and try again' }, { status: 429 })
    if (!res.ok) {
      const t = await res.text()
      return NextResponse.json({ error: `Model error (${res.status}): ${t.slice(0, 200)}` }, { status: 502 })
    }

    const data = await res.json()
    const text: string = data.choices?.[0]?.message?.content ?? ''
    if (!text) return NextResponse.json({ error: 'AI returned empty response — try again' }, { status: 502 })

    // Strip any accidental markdown fences
    const clean = text.replace(/^```[^\n]*\n?/m, '').replace(/\n?```$/m, '').trim()
    return NextResponse.json({ text: clean, model })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
