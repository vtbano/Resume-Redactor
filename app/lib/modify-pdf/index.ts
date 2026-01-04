import { PDFDocument, StandardFonts } from 'pdf-lib'

import { parseResumeFromPdf } from 'lib/parse-resume-from-pdf'

import { addRedactedField } from 'lib/modify-pdf/addRedactedField'

import { RedactionFields, RedactionFieldConfig } from 'lib/modify-pdf/types'

export async function modifyPdf(
  pdfURL: string,
  redactionFieldsRequested: RedactionFields
) {
  const url = pdfURL
  const resume = await parseResumeFromPdf(pdfURL)
  const existingPdfBytes = await fetch(url).then((res) => res.arrayBuffer())

  const pdfDoc = await PDFDocument.load(existingPdfBytes)
  const helveticaFont = await pdfDoc.embedFont(StandardFonts.CourierBoldOblique)

  const form = pdfDoc.getForm()

  const pages = pdfDoc.getPages()

  const fields: RedactionFieldConfig[] = [
    { key: 'name', data: resume.profile.name },
    { key: 'email', data: resume.profile.email },
    { key: 'phone', data: resume.profile.phone },
    { key: 'address', data: resume.profile.location },
    { key: 'url', data: resume.profile.url },
  ]

  fields.forEach((field) => {
    if (redactionFieldsRequested[field.key as keyof RedactionFields]) {
      addRedactedField({
        form,
        fieldName: field.key,
        page: pages[field.data.pageNumber - 1],
        fieldData: field.data,
        font: helveticaFont,
        textBottomOffset: -4,
        heightOffset: 2,
      })
    }
  })

  resume.educations.forEach((education, index) => {
    const educationFields: RedactionFieldConfig[] = [
      { key: 'graduation_date', data: education.date },
      { key: 'degree', data: education.degree },
      { key: 'gpa', data: education.gpa },
      { key: 'school', data: education.school },
    ]

    educationFields.forEach((field) => {
      if (redactionFieldsRequested[field.key as keyof RedactionFields]) {
        addRedactedField({
          form,
          fieldName: `${field.key}_${index}`,
          page: pages[field.data.pageNumber - 1],
          fieldData: field.data,
          font: helveticaFont,
          textBottomOffset: -4,
          heightOffset: 2,
        })
      }
    })
  })

  const pdfBytes = await pdfDoc.save()
  const arrayBuffer =
    pdfBytes.buffer instanceof ArrayBuffer
      ? pdfBytes.buffer
      : new Uint8Array(pdfBytes).buffer
  const blob = new Blob([arrayBuffer], { type: 'application/pdf' })
  const objectUrl = URL.createObjectURL(blob)
  return { objectUrl, pdfBytes }
}
