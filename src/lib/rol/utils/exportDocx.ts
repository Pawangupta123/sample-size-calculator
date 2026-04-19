'use client'

import {
  AlignmentType,
  Document,
  HeadingLevel,
  LevelFormat,
  Packer,
  Paragraph,
  TextRun,
} from 'docx'
import type { GeneratedReview } from '../types'

const NUMBERING_REF = 'refs'

function paragraphFromText(text: string): Paragraph {
  return new Paragraph({
    spacing: { after: 200, line: 360 },
    children: [new TextRun({ text, font: 'Times New Roman', size: 24 })],
  })
}

function headingParagraph(text: string, level: (typeof HeadingLevel)[keyof typeof HeadingLevel]): Paragraph {
  return new Paragraph({
    heading: level,
    spacing: { before: 240, after: 120 },
    children: [
      new TextRun({
        text,
        bold: true,
        font: 'Times New Roman',
        size: level === HeadingLevel.HEADING_1 ? 32 : 28,
      }),
    ],
  })
}

function referenceParagraph(text: string): Paragraph {
  return new Paragraph({
    numbering: { reference: NUMBERING_REF, level: 0 },
    spacing: { after: 120, line: 320 },
    children: [new TextRun({ text, font: 'Times New Roman', size: 22 })],
  })
}

export async function exportReviewAsDocx(review: GeneratedReview): Promise<Blob> {
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
    sections: [
      {
        properties: {},
        children: [
          headingParagraph(review.title, HeadingLevel.HEADING_1),
          paragraphFromText(review.introduction),
          ...review.sections.flatMap((section) => [
            headingParagraph(section.heading, HeadingLevel.HEADING_2),
            ...section.paragraphs.map(paragraphFromText),
          ]),
          headingParagraph('Conclusion', HeadingLevel.HEADING_2),
          paragraphFromText(review.conclusion),
          headingParagraph('References', HeadingLevel.HEADING_2),
          ...review.references.map(referenceParagraph),
        ],
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
