import type { TextItem } from 'lib/parse-resume-from-pdf/types'

/**
 * Generic function to fix coordinates of extracted TextItems that are part of longer text
 * @param textItems - Array of all text items to search through
 * @param extractedFields - Object containing extracted TextItem fields to fix
 */

export function fixExtractedItemCoordinates(
  textItems: TextItem[],
  extractedFields: Record<string, TextItem | null | undefined>
): Record<string, TextItem> {
  // start with only the present fields (filter out null/undefined)
  const updated: Record<string, TextItem> = {}
  for (const [key, field] of Object.entries(extractedFields)) {
    if (field && field.text) {
      updated[key] = { ...field }
    }
  }

  for (const item of textItems) {
    if (!item.text) {
      // skip empty items
    } else {
      const charWidth = item.text.length ? item.width / item.text.length : 0

      for (const [key, field] of Object.entries(updated)) {
        // only attempt correction when the candidate is a substring of a larger item
        if (item.text !== field.text) {
          const idx = item.text.indexOf(field.text)
          if (idx !== -1) {
            const calculatedPosition = item.x + idx * charWidth
            const leftCorrection = Math.max(charWidth * 0.5, 0)
            const paddingBuffer = Math.max(charWidth * 1.2, 0)

            const newX = calculatedPosition - leftCorrection
            const newWidth = Math.max(
              field.text.length * charWidth + paddingBuffer,
              0
            )

            updated[key] = { ...field, x: newX, width: newWidth }
          }
        }
      }
    }
  }

  return updated
}
