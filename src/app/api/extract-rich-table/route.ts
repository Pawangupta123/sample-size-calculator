import { NextRequest, NextResponse } from "next/server";

const PROMPT = `You extract data tables from medical/scientific images.

PRESERVE the original cell formatting exactly. Do NOT simplify or split values.

OUTPUT RULES:
1. Tab-separated values, one row per line.
2. First row = column headers (clean, no n=… suffixes).
3. Keep "Mean ± SD" cells as-is, e.g. "22.07 ± 4.66".
4. Keep "n (%)" cells as-is, e.g. "6 (12.0%)".
5. Keep "Median (IQR a–b)" or "Median [a, b]" cells as-is.
6. For empty / dash / NA cells, output an empty tab.
7. Do NOT drop section-header rows (e.g. "HGS Classification") — keep them with empty value columns so structure is preserved.
8. Return ONLY the table. No prose, no markdown, no code fences.

Example output:
HGS Parameter\tGroup I\tGroup II\tP-Value
Mean HGS (kg), Mean±SD\t22.07 ± 4.66\t18.18 ± 3.76\t<0.001*
Median HGS (kg)\t21.85\t17.60\t
Low HGS (<18 kg), n (%)\t6 (12.0%)\t25 (50.0%)\t<0.001*
Normal HGS (≥18 kg), n (%)\t44 (88.0%)\t25 (50.0%)\t`;

export async function POST(req: NextRequest) {
  try {
    const { imageBase64, mimeType } = (await req.json()) as {
      imageBase64: string;
      mimeType: string;
    };
    if (!imageBase64)
      return NextResponse.json({ error: "No image provided" }, { status: 400 });

    const apiKey = process.env.OPENROUTER_API_KEY;
    const model = process.env.OPENROUTER_MODEL || "google/gemini-flash-1.5";
    if (!apiKey)
      return NextResponse.json(
        { error: "OPENROUTER_API_KEY not set in .env" },
        { status: 500 },
      );

    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://easemyresearch.com",
        "X-Title": "EaseMyResearch Graph Generator",
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: "user",
            content: [
              { type: "image_url", image_url: { url: `data:${mimeType};base64,${imageBase64}` } },
              { type: "text", text: PROMPT },
            ],
          },
        ],
        max_tokens: 2500,
        temperature: 0,
      }),
    });

    if (res.status === 429)
      return NextResponse.json({ error: "Rate limited — wait a moment and try again" }, { status: 429 });
    if (!res.ok) {
      const t = await res.text();
      return NextResponse.json({ error: `Model error (${res.status}): ${t.slice(0, 200)}` }, { status: 502 });
    }

    const data = await res.json();
    const text: string = data.choices?.[0]?.message?.content ?? "";
    if (!text) return NextResponse.json({ error: "AI returned empty response — try again" }, { status: 502 });

    const clean = text.replace(/^```[^\n]*\n?/m, "").replace(/\n?```$/m, "").trim();
    return NextResponse.json({ text: clean, model });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
