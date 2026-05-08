'use client'

// Uses html-to-image instead of html2canvas — handles modern CSS (oklch/lab)
// without errors because it never parses stylesheets directly.

async function renderPngBlob(element: HTMLElement): Promise<Blob> {
  const { toBlob } = await import('html-to-image')
  const blob = await toBlob(element, {
    pixelRatio: 3,          // 3× = ~300 DPI
    backgroundColor: '#ffffff',
    skipFonts: false,
  })
  if (!blob) throw new Error('Failed to render chart image')
  return blob
}

async function renderPngDataUrl(element: HTMLElement): Promise<string> {
  const { toPng } = await import('html-to-image')
  return toPng(element, {
    pixelRatio: 3,
    backgroundColor: '#ffffff',
    skipFonts: false,
  })
}

// ─── Public API ───────────────────────────────────────────────────────────────

export async function copyChartToClipboard(element: HTMLElement): Promise<void> {
  const blob = await renderPngBlob(element)
  if (typeof ClipboardItem !== 'undefined' && navigator.clipboard?.write) {
    await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })])
  } else {
    // Fallback: download instead of copy
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'chart.png'
    a.click()
    URL.revokeObjectURL(url)
  }
}

export async function exportPNG(element: HTMLElement, filename = 'graph'): Promise<void> {
  const url = await renderPngDataUrl(element)
  const link = document.createElement('a')
  link.download = `${filename}.png`
  link.href = url
  link.click()
}

export async function exportPDF(element: HTMLElement, filename = 'graph'): Promise<void> {
  const [url, { default: jsPDF }] = await Promise.all([
    renderPngDataUrl(element),
    import('jspdf'),
  ])
  const img = new Image()
  img.src = url
  await new Promise((r) => { img.onload = r })
  const isLandscape = img.width > img.height
  const pdf = new jsPDF({ orientation: isLandscape ? 'landscape' : 'portrait', unit: 'mm', format: 'a4' })
  const pageW = pdf.internal.pageSize.getWidth()
  const pageH = (img.height * pageW) / img.width
  pdf.addImage(url, 'PNG', 0, 0, pageW, pageH)
  pdf.save(`${filename}.pdf`)
}

export function exportSVG(element: HTMLElement, filename = 'graph'): void {
  const svg = element.querySelector('svg')
  if (!svg) return
  svg.style.backgroundColor = '#ffffff'
  const blob = new Blob([new XMLSerializer().serializeToString(svg)], { type: 'image/svg+xml;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.download = `${filename}.svg`
  link.href = url
  link.click()
  URL.revokeObjectURL(url)
}
