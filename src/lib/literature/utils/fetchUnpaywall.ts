const MAILTO = 'pawankumar37060@gmail.com'

interface UnpaywallResponse {
  best_oa_location?: {
    url?: string
    url_for_pdf?: string | null
  } | null
}

export async function fetchUnpaywallPdf(doi: string): Promise<string | null> {
  const clean = doi.replace(/^https?:\/\/(dx\.)?doi\.org\//, '').trim()
  if (!clean) return null
  try {
    const res = await fetch(
      `https://api.unpaywall.org/v2/${encodeURIComponent(clean)}?email=${MAILTO}`
    )
    if (!res.ok) return null
    const data = (await res.json()) as UnpaywallResponse
    return data.best_oa_location?.url_for_pdf ?? data.best_oa_location?.url ?? null
  } catch {
    return null
  }
}
