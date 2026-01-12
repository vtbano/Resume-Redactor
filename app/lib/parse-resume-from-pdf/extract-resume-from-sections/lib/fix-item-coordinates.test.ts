import { describe, it, expect } from 'vitest'
import { fixExtractedItemCoordinates } from './fix-item-coordinates'
import type { TextItem } from 'lib/parse-resume-from-pdf/types'

describe('fixExtractedItemCoordinates', () => {
  const createTextItem = (
    text: string,
    x: number,
    width: number,
    y = 100,
    height = 12,
    pageNumber = 1
  ): TextItem => ({
    text,
    x,
    y,
    width,
    height,
    fontName: 'Arial',
    hasEOL: false,
    pageNumber,
  })

  describe('when extractedFields contains null and undefined values', () => {
    it('should filter out null and undefined fields', () => {
      const textItems: TextItem[] = [createTextItem('John Doe', 10, 100)]

      const extractedFields = {
        name: createTextItem('John', 10, 50),
        email: null,
        phone: undefined,
        address: createTextItem('Doe', 60, 50),
      }

      const result = fixExtractedItemCoordinates(textItems, extractedFields)

      expect(Object.keys(result)).toEqual(['name', 'address'])
      expect(result.email).toBeUndefined()
      expect(result.phone).toBeUndefined()
    })
  })

  describe('when extractedFields contain empty text', () => {
    it('should filter out fields with empty text', () => {
      const textItems: TextItem[] = [createTextItem('John Doe', 10, 100)]

      const extractedFields = {
        name: createTextItem('', 10, 50),
        email: createTextItem('john@example.com', 10, 150),
      }

      const result = fixExtractedItemCoordinates(textItems, extractedFields)

      expect(Object.keys(result)).toEqual(['email'])
      expect(result.name).toBeUndefined()
    })
  })

  describe('when field text matches a substring in textItems', () => {
    it('should calculate corrected coordinates for the field', () => {
      const textItems: TextItem[] = [
        createTextItem('Email: john@example.com', 10, 200),
      ]

      const extractedFields = {
        email: createTextItem('john@example.com', 10, 150),
      }

      const result = fixExtractedItemCoordinates(textItems, extractedFields)
      console.log('RESULT', result)

      expect(result.email).toBeDefined()
      // The email starts at index 7 in "Email: john@example.com"
      // CalculateCorrectedCoordinates functon
      // charWidth = 200 / 23 ≈ 8.7
      // calculatedPosition = 10 + 7 * 8.7 ≈ 70.9
      // leftCorrection = 8.7 * 0.5 ≈ 4.35
      // newX = 70.9 - 4.35 ≈ 66.55
      expect(result.email.x).toBeCloseTo(66.52, 1)
      // newWidth = 17 * 8.7 + 8.7 * 1.2 ≈ 158.34
      expect(result.email.width).toBeGreaterThan(0)
    })
  })

  describe('when field text matches exactly a textItem', () => {
    it('should return the field with original coordinates', () => {
      const textItems: TextItem[] = [
        createTextItem('john@example.com', 10, 150),
      ]

      const extractedFields = {
        email: createTextItem('john@example.com', 5, 100),
      }

      const result = fixExtractedItemCoordinates(textItems, extractedFields)

      expect(result.email).toBeDefined()
      // When exact match and item.text === field.text, skip in the loop
      // So it should return the original field
      expect(result.email.x).toBe(5)
      expect(result.email.width).toBe(100)
    })
  })

  describe('when field text is not found in any textItem', () => {
    it('should return the field unchanged', () => {
      const textItems: TextItem[] = [createTextItem('Some other text', 10, 100)]

      const extractedFields = {
        email: createTextItem('john@example.com', 50, 150),
      }

      const result = fixExtractedItemCoordinates(textItems, extractedFields)

      expect(result.email).toBeDefined()
      expect(result.email.x).toBe(50)
      expect(result.email.width).toBe(150)
    })
  })

  describe('with multiple fields and complex text items', () => {
    it('should correctly fix all field coordinates', () => {
      const textItems: TextItem[] = [
        createTextItem('Name: John Doe', 10, 140),
        createTextItem(
          'Email: john@example.com | Phone: 123-456-7890',
          10,
          400
        ),
        createTextItem('Location: San Francisco, CA', 10, 270),
      ]

      const extractedFields = {
        name: createTextItem('John Doe', 0, 80),
        email: createTextItem('john@example.com', 0, 150),
        phone: createTextItem('123-456-7890', 0, 120),
        location: createTextItem('San Francisco, CA', 0, 180),
      }

      const result = fixExtractedItemCoordinates(textItems, extractedFields)

      expect(Object.keys(result)).toHaveLength(4)

      // name: 'Name: John Doe' (length=14), x=10, width=140
      // charWidth = 140/14 = 10, substringIndex = 6
      // newX = 10 + 6*10 - 10*0.5 = 65
      // newWidth = 8*10 + 10*1.2 = 92
      expect(result.name.x).toBe(65)
      expect(result.name.width).toBe(92)

      // email: 'Email: john@example.com | Phone: 123-456-7890' (length=45), x=10, width=400
      // charWidth = 400/45 ≈ 8.889, substringIndex = 7
      // newX = 10 + 7*8.889 - 8.889*0.5 ≈ 67.78
      // newWidth = 16*8.889 + 8.889*1.2 ≈ 152.89
      expect(result.email.x).toBeCloseTo(67.78, 1)
      expect(result.email.width).toBeCloseTo(152.89, 1)

      // phone: same textItem as email, substringIndex = 33
      // newX = 10 + 33*8.889 - 8.889*0.5 ≈ 298.89
      // newWidth = 12*8.889 + 8.889*1.2 ≈ 117.33
      expect(result.phone.x).toBeCloseTo(298.89, 1)
      expect(result.phone.width).toBeCloseTo(117.33, 1)

      // location: 'Location: San Francisco, CA' (length=27), x=10, width=270
      // charWidth = 270/27 = 10, substringIndex = 10
      // newX = 10 + 10*10 - 10*0.5 = 105
      // newWidth = 17*10 + 10*1.2 = 182
      expect(result.location.x).toBe(105)
      expect(result.location.width).toBe(182)
    })
  })

  describe('edge cases', () => {
    it('should handle empty textItems array', () => {
      const textItems: TextItem[] = []

      const extractedFields = {
        email: createTextItem('john@example.com', 50, 150),
      }

      const result = fixExtractedItemCoordinates(textItems, extractedFields)

      expect(result.email).toBeDefined()
      // Should return unchanged since no textItems to search
      expect(result.email.x).toBe(50)
      expect(result.email.width).toBe(150)
    })

    it('should handle empty extractedFields', () => {
      const textItems: TextItem[] = [createTextItem('Some text', 10, 100)]

      const extractedFields = {}

      const result = fixExtractedItemCoordinates(textItems, extractedFields)

      expect(Object.keys(result)).toHaveLength(0)
    })

    it('should handle fields at the beginning of text', () => {
      const textItems: TextItem[] = [
        createTextItem('John Doe is here', 10, 160),
      ]

      const extractedFields = {
        name: createTextItem('John', 0, 40),
      }

      const result = fixExtractedItemCoordinates(textItems, extractedFields)

      // 'John Doe is here' (length=16), x=10, width=160
      // charWidth = 160/16 = 10, substringIndex = 0
      // newX = 10 + 0*10 - 10*0.5 = 5
      // newWidth = 4*10 + 10*1.2 = 52
      expect(result.name.x).toBe(5)
      expect(result.name.width).toBe(52)
    })

    it('should handle fields at the end of text', () => {
      const textItems: TextItem[] = [
        createTextItem('Location is California', 10, 220),
      ]

      const extractedFields = {
        location: createTextItem('California', 0, 100),
      }

      const result = fixExtractedItemCoordinates(textItems, extractedFields)

      // 'Location is California' (length=22), x=10, width=220
      // charWidth = 220/22 = 10, substringIndex = 12
      // newX = 10 + 12*10 - 10*0.5 = 125
      // newWidth = 10*10 + 10*1.2 = 112
      expect(result.location.x).toBe(125)
      expect(result.location.width).toBe(112)
    })
  })
})
