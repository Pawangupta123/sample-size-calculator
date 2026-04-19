const PRIORITY_SECTIONS = [
  'conclusions',
  'conclusion',
  'results',
  'findings',
  'interpretation',
  'objective',
  'objectives',
  'background',
  'introduction',
]

function stripTags(text: string): string {
  return text
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, ' ')
    .trim()
}

interface ParsedAbstract {
  sections: Map<string, string>
  plain: string
}

function parseStructured(abstract: string): ParsedAbstract {
  const sections = new Map<string, string>()
  // Matches <h4>Heading</h4>text_before_next_heading_or_end
  const regex = /<h[1-6][^>]*>([^<]+)<\/h[1-6]>([\s\S]*?)(?=<h[1-6]|$)/gi
  let match: RegExpExecArray | null
  while ((match = regex.exec(abstract)) !== null) {
    const heading = match[1].toLowerCase().trim().replace(/:$/, '')
    const content = stripTags(match[2])
    if (content.length > 20) {
      sections.set(heading, content)
    }
  }
  return { sections, plain: stripTags(abstract) }
}

export function cleanAbstract(abstract: string | undefined): string | undefined {
  if (!abstract) return undefined
  const hasStructure = /<h[1-6]/i.test(abstract)
  if (!hasStructure) return stripTags(abstract) || undefined

  const { sections, plain } = parseStructured(abstract)

  for (const key of PRIORITY_SECTIONS) {
    const text = sections.get(key)
    if (text && text.length > 40) return text
  }
  const first = Array.from(sections.values())[0]
  if (first) return first
  return plain || undefined
}

export function pickKeyFinding(abstract: string | undefined): string | undefined {
  if (!abstract) return undefined
  const hasStructure = /<h[1-6]/i.test(abstract)
  if (!hasStructure) return cleanAbstract(abstract)

  const { sections } = parseStructured(abstract)
  const findingsKey = ['conclusions', 'conclusion', 'results', 'findings', 'interpretation']
  for (const key of findingsKey) {
    const text = sections.get(key)
    if (text && text.length > 40) return text
  }
  return cleanAbstract(abstract)
}

export function pickMethodsContext(abstract: string | undefined): string | undefined {
  if (!abstract) return undefined
  const hasStructure = /<h[1-6]/i.test(abstract)
  if (!hasStructure) return undefined

  const { sections } = parseStructured(abstract)
  const methodsKey = ['methods', 'design', 'study design', 'materials and methods']
  for (const key of methodsKey) {
    const text = sections.get(key)
    if (text && text.length > 30) return text
  }
  return undefined
}
