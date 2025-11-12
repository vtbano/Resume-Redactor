export type RedactionFields = {
  name: boolean
  email: boolean
  phone: boolean
  location: boolean
  url: boolean
}
export type FieldData = { x: number; y: number; width: number; height: number }

export type RedactionFieldConfig = {
  key: keyof RedactionFields
  data: FieldData
}
