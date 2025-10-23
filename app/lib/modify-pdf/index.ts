import { PDFDocument, StandardFonts } from 'pdf-lib'

import { parseResumeFromPdf } from 'lib/parse-resume-from-pdf'

import { addRedactedField } from 'lib/modify-pdf/addRedactedField'

export async function modifyPdf(pdfURL: string) {
  const url = pdfURL
  const resume = await parseResumeFromPdf(pdfURL)
  console.log('Parsed resume from resume modifier:', resume.profile)
  const existingPdfBytes = await fetch(url).then((res) => res.arrayBuffer())

  const pdfDoc = await PDFDocument.load(existingPdfBytes)
  const helveticaFont = await pdfDoc.embedFont(StandardFonts.CourierBoldOblique)

  const form = pdfDoc.getForm()

  const pages = pdfDoc.getPages()
  console.log('PAGES', pages)
  const firstPage = pages[0]

  // executed addRedactedField for name and email only for demo purposes
  addRedactedField({
    form,
    fieldName: 'name',
    page: firstPage,
    fieldData: resume.profile.name,
    font: helveticaFont,
    textBottomOffset: -4,
    heightOffset: 2,
  })

  addRedactedField({
    form,
    fieldName: 'email',
    page: firstPage,
    fieldData: resume.profile.email,
    font: helveticaFont,
    textBottomOffset: -4,
    heightOffset: 2,
  })
  const pdfBytes = await pdfDoc.save()
  const arrayBuffer =
    pdfBytes.buffer instanceof ArrayBuffer
      ? pdfBytes.buffer
      : new Uint8Array(pdfBytes).buffer
  const blob = new Blob([arrayBuffer], { type: 'application/pdf' })
  const objectUrl = URL.createObjectURL(blob)
  return objectUrl
}
