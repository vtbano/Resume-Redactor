import type { TextItem } from 'lib/parse-resume-from-pdf/types'

/**
 * Generic function to fix coordinates of extracted TextItems that are part of longer text
 * @param textItems - Array of all text items to search through
 * @param extractedFields - Object containing extracted TextItem fields to fix
 */
export function fixExtractedItemCoordinates(
  textItems: TextItem[],
  extractedFields: Record<string, TextItem | null | undefined>
) {
  textItems.forEach((item) => {
    const fieldsToFix = Object.entries(extractedFields)
      .filter(([_, textItem]) => textItem && item.text.includes(textItem.text))
      .map(([key, textItem]) => ({ key, textItem: textItem! }))

    if (fieldsToFix.length > 0) {
      const actualCharWidth = item.width / item.text.length

      fieldsToFix.forEach((field) => {
        if (item.text !== field.textItem.text) {
          const textIndex = item.text.indexOf(field.textItem.text)
          if (textIndex !== -1) {
            const calculatedPosition = item.x + textIndex * actualCharWidth
            const positionCorrection = actualCharWidth // Account for font rendering differences
            const newX = calculatedPosition - positionCorrection

            const paddingBuffer = 1.2 // Extra padding for better coverage
            const bulletPadding = actualCharWidth * paddingBuffer
            const newWidth =
              field.textItem.text.length * actualCharWidth + bulletPadding

            field.textItem.x = newX
            field.textItem.width = newWidth
          }
        }
      })
    }
  })
}
