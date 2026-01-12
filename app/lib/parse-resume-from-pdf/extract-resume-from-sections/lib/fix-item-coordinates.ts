import type { TextItem } from 'lib/parse-resume-from-pdf/types'
import {
  CHAR_WIDTH_LEFT_CORRECTION_MULTIPLIER,
  CHAR_WIDTH_PADDING_BUFFER_MULTIPLIER,
} from 'lib/constants/pdf-constants'


const filterValidFields = (
  extractedFields: Record<string, TextItem | null | undefined>
): Record<string, TextItem> => {
  return Object.entries(extractedFields).reduce(
    (acc, [key, field]) => {
      if (field?.text) {
        acc[key] = { ...field }
      }
      return acc
    },
    {} as Record<string, TextItem>
  )
}


const calculateCorrectedCoordinates = (
  field: TextItem,
  item: TextItem,
  substringIndex: number
): TextItem => {
  const charWidth = item.width / item.text.length
  const calculatedPosition = item.x + substringIndex * charWidth
  const leftCorrection = Math.max(
    charWidth * CHAR_WIDTH_LEFT_CORRECTION_MULTIPLIER,
    0
  )
  const paddingBuffer = Math.max(
    charWidth * CHAR_WIDTH_PADDING_BUFFER_MULTIPLIER,
    0
  )

  const newX = calculatedPosition - leftCorrection
  const newWidth = Math.max(field.text.length * charWidth + paddingBuffer, 0)

  return { ...field, x: newX, width: newWidth }
}


const findFieldInTextItems = (
  field: TextItem,
  textItems: TextItem[]
): TextItem => {
  for (const item of textItems) {
    if (!item.text || item.text === field.text) continue

    const substringIndex = item.text.indexOf(field.text)
    if (substringIndex !== -1) {
      return calculateCorrectedCoordinates(field, item, substringIndex)
    }
  }
  return field
}

/**
 * Generic function to fix coordinates of extracted TextItems that are part of longer text
 * @param textItems - Array of all text items to search through
 * @param extractedFields - Object containing extracted TextItem fields to fix
 */
export const fixExtractedItemCoordinates = (
  textItems: TextItem[],
  extractedFields: Record<string, TextItem | null | undefined>
): Record<string, TextItem> => {
  const validFields = filterValidFields(extractedFields)

  return Object.entries(validFields).reduce(
    (acc, [key, field]) => {
      acc[key] = findFieldInTextItems(field, textItems)
      return acc
    },
    {} as Record<string, TextItem>
  )
}
