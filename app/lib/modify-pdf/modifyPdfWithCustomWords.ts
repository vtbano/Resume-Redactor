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

const escapeRegex = (str: string): string => {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

const calculateMatchCoordinates = (
  item: TextItem,
  word: string,
  trimmedText: string
): TextItem | null => {
  const idx = trimmedText.indexOf(word)
  if (idx === -1) return null

  const charWidth = item.width / trimmedText.length
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
  const newWidth = Math.max(word.length * charWidth + paddingBuffer, 0)

  return {
    ...item,
    text: word,
    x: newX,
    width: newWidth,
  }
}

const findWordMatches = (
  textItems: TextItem[],
  customWords: string[]
): TextItem[] => {
  return textItems.flatMap((item) => {
    const trimmed = item.text.trim()

    return customWords
      .map((word) => {
        // Create regex with word boundaries to match whole words (case-sensitive)
        const wordRegex = new RegExp(`\\b${escapeRegex(word)}\\b`)
        if (!wordRegex.test(trimmed)) return null

        // Exact match - use coordinates as-is
        if (trimmed === word) {
          return { ...item, text: word }
        }

        // Substring match - calculate word position
        return calculateMatchCoordinates(item, word, trimmed)
      })
      .filter((match): match is TextItem => match !== null)
  })
}

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

  // Find all word matches and calculate coordinates for each occurrence
  const fixedMatches = findWordMatches(textItems, customWords)

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
