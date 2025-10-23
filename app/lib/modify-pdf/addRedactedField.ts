import { rgb, PDFForm, PDFPage, PDFFont } from 'pdf-lib'

export const addRedactedField = ({
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
}) => {
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
