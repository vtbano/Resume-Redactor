import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'
import { useState } from 'react'
import { parseResumeFromPdf } from 'lib/parse-resume-from-pdf'
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
    // const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica)

    const form = pdfDoc.getForm()

    const pages = pdfDoc.getPages()
    const firstPage = pages[0]

    const nameField = form.createTextField('nameField')
    nameField.setText('REDACTED')
    nameField.addToPage(firstPage, {
      x: resume.profile.name.x || 0,
      y: resume.profile.name.y - 3 || 0,
      width: resume.profile.name.width || 100,
      height: resume.profile.name.height || 20,
      textColor: rgb(0, 0, 0),
      backgroundColor: rgb(1, 1, 1),
      borderColor: rgb(1, 0, 0),
      borderWidth: 0,
    })

    const emailField = form.createTextField('emailField')
    emailField.setText('REDACTED')
    emailField.addToPage(firstPage, {
      x: resume.profile.email.x || 0,
      y: resume.profile.email.y - 3 || 0,
      width: resume.profile.email.width || 100,
      height: resume.profile.email.height + 1 || 20,
      textColor: rgb(0, 0, 0),
      backgroundColor: rgb(0.98, 0.98, 0.98),
      borderColor: rgb(1, 0, 0),
      borderWidth: 0,
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
      <button className="btn" onClick={modifyPdf}>
        Modify PDF
      </button>
      <button className="btn" onClick={() => setModifiedDoc('')}>
        Reset
      </button>
    </div>
  )
}
