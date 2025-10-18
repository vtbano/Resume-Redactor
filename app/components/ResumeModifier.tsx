import {
  PDFDocument,
  rgb,
  StandardFonts,
  PDFForm,
  PDFPage,
  PDFFont,
} from 'pdf-lib'
import { useState } from 'react'
import { parseResumeFromPdf } from 'lib/parse-resume-from-pdf'
import Button from 'components/Button'
// import {
//   getHasUsedAppBefore,
//   saveStateToLocalStorage,
// } from 'lib/redux/local-storage'
// import { type ShowForm, initialSettings } from 'lib/redux/settingsSlice'
// import { deepClone } from 'lib/utils/deep-clone'

export const ResumeModifier = ({ pdfURL = '' }: { pdfURL?: string }) => {
  const [modifiedDoc, setModifiedDoc] = useState('')

  async function modifyPdf() {
    const url = pdfURL
    const resume = await parseResumeFromPdf(pdfURL)
    console.log('Parsed resume from resume modifier:', resume.profile)
    const existingPdfBytes = await fetch(url).then((res) => res.arrayBuffer())

    const pdfDoc = await PDFDocument.load(existingPdfBytes)
    const helveticaFont = await pdfDoc.embedFont(
      StandardFonts.CourierBoldOblique
    )

    const form = pdfDoc.getForm()

    const pages = pdfDoc.getPages()
    console.log('PAGES', pages)
    const firstPage = pages[0]

    function addRedactedField({
      form,
      fieldName,
      page,
      fieldData,
      font,
      textBottomOffset = 0,
      heightOffset = 0,
    }: {
      form: PDFForm
      fieldName: string
      page: PDFPage
      fieldData: { x: number; y: number; width: number; height: number }
      font: PDFFont
      textBottomOffset: number
      heightOffset: number
    }) {
      const field = form.createTextField(fieldName)
      field.setText(`REDACTED ${fieldName.toLocaleUpperCase()}`)
      field.enableReadOnly()
      field.addToPage(page, {
        x: fieldData.x,
        y: fieldData.y + textBottomOffset,
        width: fieldData.width,
        height: fieldData.height + heightOffset,
        textColor: rgb(0, 0, 0),
        backgroundColor: rgb(1, 1, 1),
        borderColor: rgb(1, 0, 0),
        borderWidth: 0,
        font,
      })
    }

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
    setModifiedDoc(objectUrl)
  }

  return (
    <div>
      <div className="w-[800px] h-[900px]">
        {modifiedDoc ? (
          <iframe src={modifiedDoc} className="h-full w-full" />
        ) : (
          <div className="h-full w-full flex items-center justify-center">
            <p>No PDF loaded</p>
          </div>
        )}
      </div>
      <Button onClick={modifyPdf} className="mr-4">
        Modify PDF
      </Button>
      <Button onClick={() => setModifiedDoc('')}>Reset</Button>
    </div>
  )
}
