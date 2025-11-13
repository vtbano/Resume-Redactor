import { rgb, PDFForm, PDFPage, PDFFont } from 'pdf-lib'
import { FieldData } from './types'

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
  fieldData: FieldData
  font: PDFFont
  textBottomOffset: number
  heightOffset: number
}) => {
  const field = form.createTextField(fieldName)
  field.enableReadOnly()
  field.addToPage(page, {
    x: fieldData.x,
    y: fieldData.y + textBottomOffset,
    width: fieldData.width,
    height: fieldData.height + heightOffset,
    backgroundColor: rgb(0, 0, 0),
    borderWidth: 0,
    font,
  })
}
