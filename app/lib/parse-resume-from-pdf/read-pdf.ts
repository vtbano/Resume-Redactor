/*
 * This file is adapted from OpenResume (https://github.com/xitanggg/open-resume)
 * © 2024 xitanggg (or original authors), licensed under AGPL-3.0
 */
import * as pdfjs from 'pdfjs-dist/legacy/build/pdf.mjs'

// Use the worker you copied into /public
pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js'

import type { TextItem as PdfjsTextItem } from 'pdfjs-dist/types/src/display/api'
import type { TextItem, TextItems } from 'lib/parse-resume-from-pdf/types'

/*
 *  readPdf function modified by Resume Redactor Author
 *  to send over the page number as part of the TextItem object
 */

export const readPdf = async (fileUrl: string): Promise<TextItems> => {
  const pdfFile = await pdfjs.getDocument(fileUrl).promise
  let textItems: TextItems = []

  for (let pageNumber = 1; pageNumber <= pdfFile.numPages; pageNumber++) {
    const page = await pdfFile.getPage(pageNumber)
    const textContent = await page.getTextContent()
    await page.getOperatorList()

    const commonObjs = page.commonObjs

    const pageTextItems = textContent.items.map((item) => {
      const {
        str: text,
        transform,
        fontName: pdfFontName,
        ...otherProps
      } = item as PdfjsTextItem

      const x = transform[4]
      const y = transform[5]

      const fontObj = commonObjs.get(pdfFontName)
      const fontName = fontObj?.name ?? 'Unknown'

      const newText = text.replace(/-­‐/g, '-')

      return {
        ...otherProps,
        fontName,
        text: newText,
        x,
        y,
        pageNumber,
      }
    })

    textItems.push(...pageTextItems)
  }

  const isEmptySpace = (textItem: TextItem) =>
    !textItem.hasEOL && textItem.text.trim() === ''
  textItems = textItems.filter((textItem) => !isEmptySpace(textItem))

  return textItems
}
