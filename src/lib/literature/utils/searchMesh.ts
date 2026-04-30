export interface MeshTerm {
  label: string
  id: string
}

const LOOKUP_ENDPOINT = 'https://id.nlm.nih.gov/mesh/lookup/label'

export async function lookupMeshTerms(
  query: string,
  limit = 8,
  signal?: AbortSignal
): Promise<MeshTerm[]> {
  const q = query.trim()
  if (q.length < 2) return []
  const url = `${LOOKUP_ENDPOINT}?label=${encodeURIComponent(q)}&limit=${limit}&match=contains`
  try {
    const res = await fetch(url, {
      headers: { Accept: 'application/json' },
      signal,
    })
    if (!res.ok) return []
    const data = (await res.json()) as Array<{ label: string; resource: string }>
    if (!Array.isArray(data)) return []
    return data.map((item) => ({
      label: item.label,
      id: item.resource?.split('/').pop() ?? '',
    }))
  } catch {
    return []
  }
}
