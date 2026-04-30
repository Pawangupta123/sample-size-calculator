'use client'

import {
  AlignmentType,
  BorderStyle,
  Document,
  HeadingLevel,
  LevelFormat,
  PageNumber,
  NumberFormat,
  Packer,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
  Footer,
  Header,
} from 'docx'
import type { ProtocolDocument } from './types'

const FONT = 'Times New Roman'
const FONT_SIZE = 24  // 12pt in half-points
const HEADING1_SIZE = 28 // 14pt
const HEADING2_SIZE = 26 // 13pt

const NUMBERING_REF = 'references'

function makeText(text: string, opts?: { bold?: boolean; italic?: boolean; size?: number }): TextRun {
  return new TextRun({
    text,
    font: FONT,
    size: opts?.size ?? FONT_SIZE,
    bold: opts?.bold,
    italics: opts?.italic,
  })
}

function bodyParagraph(text: string): Paragraph {
  if (!text.trim()) {
    return new Paragraph({ spacing: { after: 100 } })
  }
  return new Paragraph({
    alignment: AlignmentType.JUSTIFIED,
    spacing: { after: 160, line: 360 },
    children: [makeText(text)],
  })
}

function headingOne(text: string): Paragraph {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 400, after: 200 },
    children: [new TextRun({ text, font: FONT, size: HEADING1_SIZE, bold: true })],
  })
}

function headingTwo(text: string): Paragraph {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 280, after: 120 },
    children: [new TextRun({ text, font: FONT, size: HEADING2_SIZE, bold: true })],
  })
}

function referencePara(text: string): Paragraph {
  return new Paragraph({
    numbering: { reference: NUMBERING_REF, level: 0 },
    spacing: { after: 100, line: 320 },
    children: [makeText(text, { size: 22 })],
  })
}

function titlePage(doc: ProtocolDocument): Paragraph[] {
  const d = doc.formData
  return [
    new Paragraph({ spacing: { before: 1440 } }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 280 },
      children: [makeText('THESIS PROTOCOL', { bold: true, size: 32 })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
      children: [makeText('Submitted in partial fulfilment of the requirements for the degree of', { size: 22, italic: true })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
      children: [makeText('MD / MS / DNB / MDS', { bold: true, size: 26 })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 600 },
      children: [makeText(d.department, { bold: true, size: 26 })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 80 },
      children: [makeText('TITLE', { bold: true, size: 24 })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 600 },
      children: [makeText(doc.title, { bold: true, size: 28 })],
    }),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 80 }, children: [makeText('SUBMITTED BY', { bold: true })] }),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 240 }, children: [makeText(d.investigatorName || '[Name of Candidate]', { bold: true })] }),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 80 }, children: [makeText('UNDER THE GUIDANCE OF', { bold: true })] }),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 480 }, children: [makeText(d.guideName || '[Name of Guide]', { bold: true })] }),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 80 }, children: [makeText(d.institution || '[Name of Institution]', { bold: true, size: 26 })] }),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 80 }, children: [makeText(d.department)] }),
    new Paragraph({ alignment: AlignmentType.CENTER, children: [makeText(new Date().getFullYear().toString())] }),
    new Paragraph({ pageBreakBefore: true }),
  ]
}

function sectionToParagraphs(content: string[]): Paragraph[] {
  return content.map((line) => {
    if (!line.trim()) return new Paragraph({ spacing: { after: 80 } })

    // Sub-heading detection (5.1, 5.2, 7.1, etc.)
    if (/^\d+\.\d+\s/.test(line)) return headingTwo(line)

    // Indented content (bullet-style)
    if (line.startsWith('  ')) {
      return new Paragraph({
        indent: { left: 720 },
        spacing: { after: 100, line: 320 },
        children: [makeText(line.trim())],
      })
    }

    // Separator lines
    if (line.startsWith('─')) {
      return new Paragraph({
        spacing: { after: 120 },
        children: [makeText(line, { size: 20 })],
      })
    }

    return bodyParagraph(line)
  })
}

export async function exportProtocolDocx(protocol: ProtocolDocument): Promise<Blob> {
  const allChildren: Paragraph[] = [
    ...titlePage(protocol),
  ]

  // Table of contents placeholder
  allChildren.push(headingOne('TABLE OF CONTENTS'))
  allChildren.push(bodyParagraph('[Insert Table of Contents here in Microsoft Word: References → Table of Contents]'))
  allChildren.push(new Paragraph({ pageBreakBefore: true }))

  // Study info summary box
  allChildren.push(headingOne('1. TITLE OF THE STUDY'))
  allChildren.push(new Paragraph({
    spacing: { after: 200 },
    border: {
      top: { style: BorderStyle.SINGLE, size: 2, color: '000000' },
      bottom: { style: BorderStyle.SINGLE, size: 2, color: '000000' },
      left: { style: BorderStyle.SINGLE, size: 2, color: '000000' },
      right: { style: BorderStyle.SINGLE, size: 2, color: '000000' },
    },
    children: [makeText(protocol.title, { bold: true, size: 26 })],
  }))

  const d = protocol.formData
  const infoRows = [
    ['Study Type', protocol.formData.studyType.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())],
    ['Department', d.department],
    ['Institution', d.institution || '—'],
    ['Setting', d.setting || '—'],
    ['Principal Investigator', d.investigatorName || '—'],
    ['Guide/Supervisor', d.guideName || '—'],
    ['Study Duration', d.duration || '—'],
    ['Expected Sample Size', d.sampleSize || 'To be calculated'],
  ]

  allChildren.push(
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: infoRows.map(([label, value]) =>
        new TableRow({
          children: [
            new TableCell({
              width: { size: 35, type: WidthType.PERCENTAGE },
              children: [new Paragraph({ children: [makeText(label, { bold: true, size: 22 })] })],
            }),
            new TableCell({
              width: { size: 65, type: WidthType.PERCENTAGE },
              children: [new Paragraph({ children: [makeText(value, { size: 22 })] })],
            }),
          ],
        })
      ),
    })
  )
  allChildren.push(new Paragraph({ spacing: { after: 200 } }))

  // All sections
  for (const section of protocol.sections) {
    if (section.heading === '8. REFERENCES') {
      allChildren.push(new Paragraph({ pageBreakBefore: true }))
      allChildren.push(headingOne(section.heading))
      for (const ref of section.content) {
        if (ref.trim()) allChildren.push(referencePara(ref))
      }
    } else {
      allChildren.push(headingOne(section.heading))
      allChildren.push(...sectionToParagraphs(section.content))
    }
  }

  const doc = new Document({
    numbering: {
      config: [
        {
          reference: NUMBERING_REF,
          levels: [
            {
              level: 0,
              format: LevelFormat.DECIMAL,
              text: '%1.',
              alignment: AlignmentType.START,
              style: {
                paragraph: { indent: { left: 720, hanging: 360 } },
              },
            },
          ],
        },
      ],
    },
    styles: {
      default: {
        document: {
          run: { font: FONT, size: FONT_SIZE },
        },
      },
    },
    sections: [
      {
        properties: {
          page: {
            margin: { top: 1440, bottom: 1440, left: 1800, right: 1080 },
          },
        },
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [makeText(protocol.title.slice(0, 60) + (protocol.title.length > 60 ? '…' : ''), { size: 18, italic: true })],
              }),
            ],
          }),
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  makeText('Page ', { size: 20 }),
                  new TextRun({ children: [PageNumber.CURRENT], font: FONT, size: 20 }),
                  makeText(' of ', { size: 20 }),
                  new TextRun({ children: [PageNumber.TOTAL_PAGES], font: FONT, size: 20 }),
                ],
              }),
            ],
          }),
        },
        children: allChildren,
      },
    ],
  })

  return Packer.toBlob(doc)
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
