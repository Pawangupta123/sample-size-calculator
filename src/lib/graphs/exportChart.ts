'use client'

export async function exportPNG(element: HTMLElement, filename = 'graph'): Promise<void> {
  const { default: html2canvas } = await import('html2canvas')
  const canvas = await html2canvas(element, {
    scale: 3,
    backgroundColor: '#ffffff',
    useCORS: true,
    logging: false,
  })
  const link = document.createElement('a')
  link.download = `${filename}.png`
  link.href = canvas.toDataURL('image/png')
  link.click()
}

export async function exportPDF(element: HTMLElement, filename = 'graph'): Promise<void> {
  const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
    import('html2canvas'),
    import('jspdf'),
  ])
  const canvas = await html2canvas(element, {
    scale: 3,
    backgroundColor: '#ffffff',
    useCORS: true,
    logging: false,
  })
  const imgData = canvas.toDataURL('image/png')
  const isLandscape = canvas.width > canvas.height
  const pdf = new jsPDF({
    orientation: isLandscape ? 'landscape' : 'portrait',
    unit: 'mm',
    format: 'a4',
  })
  const pageW = pdf.internal.pageSize.getWidth()
  const pageH = (canvas.height * pageW) / canvas.width
  pdf.addImage(imgData, 'PNG', 0, 0, pageW, pageH)
  pdf.save(`${filename}.pdf`)
}

export function exportSVG(element: HTMLElement, filename = 'graph'): void {
  const svg = element.querySelector('svg')
  if (!svg) return
  // Add white background
  svg.style.backgroundColor = '#ffffff'
  const data = new XMLSerializer().serializeToString(svg)
  const blob = new Blob([data], { type: 'image/svg+xml;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.download = `${filename}.svg`
  link.href = url
  link.click()
  URL.revokeObjectURL(url)
}
