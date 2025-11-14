export type RedactionFields = {
  name: boolean
  email: boolean
  phone: boolean
  address: boolean
  url: boolean
  graduation_date: boolean
  degree: boolean
  gpa: boolean
  school: boolean
}
export type FieldData = {
  x: number
  y: number
  width: number
  height: number
  pageNumber: number
}

export type RedactionFieldConfig = {
  key: keyof RedactionFields
  data: FieldData
}
