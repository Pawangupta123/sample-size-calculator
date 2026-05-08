import { NextRequest, NextResponse } from 'next/server'

// Server-side proxy — avoids CORS when the graph designer fetches from the user's backend
export async function POST(req: NextRequest) {
  try {
    const { url, token } = await req.json() as { url: string; token?: string }

    if (!url) return NextResponse.json({ error: 'url is required' }, { status: 400 })
    if (!url.startsWith('http')) return NextResponse.json({ error: 'Invalid URL — must start with http' }, { status: 400 })

    const headers: Record<string, string> = { 'Accept': 'application/json' }
    if (token) headers['Authorization'] = `Bearer ${token}`

    const res = await fetch(url, { headers, cache: 'no-store' })

    // Always try to read the body — even on error — so we can show the actual message
    const bodyText = await res.text()
    let bodyJson: unknown = null
    try { bodyJson = JSON.parse(bodyText) } catch { /* not JSON */ }

    if (!res.ok) {
      const detail = bodyJson
        ? JSON.stringify(bodyJson).slice(0, 300)
        : bodyText.slice(0, 300)
      return NextResponse.json(
        { error: `Backend ${res.status} ${res.statusText}: ${detail}` },
        { status: 502 }
      )
    }

    // Return parsed JSON if available, otherwise raw text
    return bodyJson !== null
      ? NextResponse.json(bodyJson)
      : new NextResponse(bodyText, { headers: { 'Content-Type': 'text/plain' } })

  } catch (e) {
    return NextResponse.json({ error: `Network error: ${String(e)}` }, { status: 500 })
  }
}
