import { PDFDocument, StandardFonts } from 'pdf-lib'
import { readPdf } from 'lib/parse-resume-from-pdf/read-pdf'
import { addRedactedField } from 'lib/modify-pdf/addRedactedField'
import type { TextItem } from 'lib/parse-resume-from-pdf/types'
import {
  CHAR_WIDTH_LEFT_CORRECTION_MULTIPLIER,
  CHAR_WIDTH_PADDING_BUFFER_MULTIPLIER,
  TEXT_BOTTOM_OFFSET,
  HEIGHT_OFFSET,
} from 'lib/constants/pdf-constants'

export async function modifyPdfWithCustomWords(
  pdfBytes: Uint8Array,
  customWords: string[]
) {
  // Load PDF from bytes
  const pdfDoc = await PDFDocument.load(pdfBytes)
  const helveticaFont = await pdfDoc.embedFont(StandardFonts.CourierBoldOblique)
  const form = pdfDoc.getForm()
  const pages = pdfDoc.getPages()

  // Create blob URL from bytes to pass to readPdf()
  const arrayBuffer =
    pdfBytes.buffer instanceof ArrayBuffer
      ? pdfBytes.buffer
      : new Uint8Array(pdfBytes).buffer
  const blob = new Blob([arrayBuffer], { type: 'application/pdf' })
  const tempUrl = URL.createObjectURL(blob)

  // Extract raw TextItems with coordinates
  const textItems = await readPdf(tempUrl)

  // Clean up temp URL that is no longer used
  URL.revokeObjectURL(tempUrl)

  // Helper to escape regex special characters
  const escapeRegex = (str: string) =>
    str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

  // Find all word matches and calculate coordinates for each occurrence
  const fixedMatches: TextItem[] = []

  textItems.forEach((item) => {
    const trimmed = item.text.trim()
    customWords.forEach((word) => {
      // Create regex with word boundaries to match whole words within text (case-sensitive)
      const wordRegex = new RegExp(`\\b${escapeRegex(word)}\\b`)
      if (wordRegex.test(trimmed)) {
        // Check if this is an exact match or substring match
        if (trimmed === word) {
          // Exact match - use coordinates as-is
          fixedMatches.push({
            ...item,
            text: word,
          })
        } else {
          // Substring match - calculate word position within the text
          const idx = trimmed.indexOf(word)
          if (idx !== -1) {
            const charWidth = item.width / trimmed.length
            const calculatedX = item.x + idx * charWidth
            const leftCorrection = Math.max(
              charWidth * CHAR_WIDTH_LEFT_CORRECTION_MULTIPLIER,
              0
            )
            const paddingBuffer = Math.max(
              charWidth * CHAR_WIDTH_PADDING_BUFFER_MULTIPLIER,
              0
            )

            const newX = calculatedX - leftCorrection
            const newWidth = Math.max(
              word.length * charWidth + paddingBuffer,
              0
            )

            fixedMatches.push({
              ...item,
              text: word,
              x: newX,
              width: newWidth,
            })
          }
        }
      }
    })
  })

  // Add redaction for each fixed match
  fixedMatches.forEach((match, index) => {
    addRedactedField({
      form,
      fieldName: `custom_word_${index}`,
      page: pages[match.pageNumber - 1],
      fieldData: match,
      font: helveticaFont,
      textBottomOffset: TEXT_BOTTOM_OFFSET,
      heightOffset: HEIGHT_OFFSET,
    })
  })

  // Save and return URL (same pattern as modifyPdf)
  const modifiedPdfBytes = await pdfDoc.save()
  const outputArrayBuffer =
    modifiedPdfBytes.buffer instanceof ArrayBuffer
      ? modifiedPdfBytes.buffer
      : new Uint8Array(modifiedPdfBytes).buffer
  const outputBlob = new Blob([outputArrayBuffer], { type: 'application/pdf' })
  const objectUrl = URL.createObjectURL(outputBlob)

  return objectUrl
}
