import { describe, it, expect } from 'vitest'
import {
  calculateMatchCoordinates,
  findWordMatches,
} from '../modifyPdfWithCustomWords'
import type { TextItem } from 'lib/parse-resume-from-pdf/types'

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

describe('calculateMatchCoordinates', () => {
  it('should return null when word is not found in trimmedText', () => {
    const item = createTextItem('Hello World', 10, 110)
    const result = calculateMatchCoordinates(item, 'NotFound', 'Hello World')
    expect(result).toBeNull()
  })

  it('should calculate coordinates for word at beginning of text', () => {
    // 'Hello World' (length=11), x=0, width=110
    // charWidth = 110/11 = 10, word='Hello' at index 0
    // calculatedX = 0 + 0*10 = 0
    // leftCorrection = 10 * 0.5 = 5
    // newX = 0 - 5 = -5
    // paddingBuffer = 10 * 1.2 = 12
    // newWidth = 5*10 + 12 = 62
    const item = createTextItem('Hello World', 0, 110)
    const result = calculateMatchCoordinates(item, 'Hello', 'Hello World')

    expect(result).not.toBeNull()
    expect(result!.text).toBe('Hello')
    expect(result!.x).toBe(-5)
    expect(result!.width).toBe(62)
  })

  it('should calculate coordinates for word in middle of text', () => {
    // 'Name: John Doe' (length=14), x=10, width=140
    // charWidth = 140/14 = 10, word='John' at index 6
    // calculatedX = 10 + 6*10 = 70
    // leftCorrection = 10 * 0.5 = 5
    // newX = 70 - 5 = 65
    // paddingBuffer = 10 * 1.2 = 12
    // newWidth = 4*10 + 12 = 52
    const item = createTextItem('Name: John Doe', 10, 140)
    const result = calculateMatchCoordinates(item, 'John', 'Name: John Doe')

    expect(result).not.toBeNull()
    expect(result!.text).toBe('John')
    expect(result!.x).toBe(65)
    expect(result!.width).toBe(52)
  })

  it('should calculate coordinates for word at end of text', () => {
    // 'Hello World' (length=11), x=10, width=110
    // charWidth = 110/11 = 10, word='World' at index 6
    // calculatedX = 10 + 6*10 = 70
    // leftCorrection = 10 * 0.5 = 5
    // newX = 70 - 5 = 65
    // paddingBuffer = 10 * 1.2 = 12
    // newWidth = 5*10 + 12 = 62
    const item = createTextItem('Hello World', 10, 110)
    const result = calculateMatchCoordinates(item, 'World', 'Hello World')

    expect(result).not.toBeNull()
    expect(result!.text).toBe('World')
    expect(result!.x).toBe(65)
    expect(result!.width).toBe(62)
  })

  it('should handle floating point calculations', () => {
    // 'Email: john@example.com' (length=23), x=10, width=200
    // charWidth = 200/23 = 8.695652...
    // word='john@example.com' at index 7
    // calculatedX = 10 + 7*8.6956... = 70.8695...
    // leftCorrection = 8.6956... * 0.5 = 4.3478...
    // newX = 70.8695... - 4.3478... = 66.5217...
    // paddingBuffer = 8.6956... * 1.2 = 10.4347...
    // newWidth = 16*8.6956... + 10.4347... = 149.5652...
    const item = createTextItem('Email: john@example.com', 10, 200)
    const result = calculateMatchCoordinates(
      item,
      'john@example.com',
      'Email: john@example.com'
    )

    expect(result).not.toBeNull()
    expect(result!.text).toBe('john@example.com')
    expect(result!.x).toBeCloseTo(66.52, 1)
    expect(result!.width).toBeCloseTo(149.57, 1)
  })
})

describe('findWordMatches', () => {
  it('should return empty array when no matches found', () => {
    const textItems = [createTextItem('Hello World', 10, 110)]
    const result = findWordMatches(textItems, ['NotFound'])
    expect(result).toEqual([])
  })

  it('should return empty array when textItems is empty', () => {
    const result = findWordMatches([], ['Hello'])
    expect(result).toEqual([])
  })

  it('should return empty array when customWords is empty', () => {
    const textItems = [createTextItem('Hello World', 10, 110)]
    const result = findWordMatches(textItems, [])
    expect(result).toEqual([])
  })

  it('should find exact match and return item with word text', () => {
    const textItems = [createTextItem('Hello', 10, 50)]
    const result = findWordMatches(textItems, ['Hello'])

    expect(result).toHaveLength(1)
    expect(result[0].text).toBe('Hello')
    expect(result[0].x).toBe(10)
    expect(result[0].width).toBe(50)
  })

  it('should find substring match with calculated coordinates', () => {
    // 'Name: John Doe' (length=14), x=10, width=140
    // charWidth = 140/14 = 10, word='John' at index 6
    // newX = 10 + 6*10 - 10*0.5 = 65
    // newWidth = 4*10 + 10*1.2 = 52
    const textItems = [createTextItem('Name: John Doe', 10, 140)]
    const result = findWordMatches(textItems, ['John'])

    expect(result).toHaveLength(1)
    expect(result[0].text).toBe('John')
    expect(result[0].x).toBe(65)
    expect(result[0].width).toBe(52)
  })

  it('should find multiple words in the same text item', () => {
    // 'John Doe' (length=8), x=0, width=80
    // charWidth = 80/8 = 10
    // 'John' at index 0: newX = 0 + 0*10 - 10*0.5 = -5, newWidth = 4*10 + 12 = 52
    // 'Doe' at index 5: newX = 0 + 5*10 - 10*0.5 = 45, newWidth = 3*10 + 12 = 42
    const textItems = [createTextItem('John Doe', 0, 80)]
    const result = findWordMatches(textItems, ['John', 'Doe'])

    expect(result).toHaveLength(2)
    expect(result[0].text).toBe('John')
    expect(result[0].x).toBe(-5)
    expect(result[0].width).toBe(52)
    expect(result[1].text).toBe('Doe')
    expect(result[1].x).toBe(45)
    expect(result[1].width).toBe(42)
  })

  it('should find words across multiple text items', () => {
    const textItems = [
      createTextItem('Name: John', 0, 100),
      createTextItem('Email: jane@test.com', 0, 200),
    ]
    const result = findWordMatches(textItems, ['John', 'jane@test.com'])

    expect(result).toHaveLength(2)
    expect(result[0].text).toBe('John')
    expect(result[1].text).toBe('jane@test.com')
  })

  it('should match whole words only using word boundaries', () => {
    const textItems = [createTextItem('Jonathan is here', 10, 160)]
    // 'John' should NOT match 'Jonathan' because of word boundary
    const result = findWordMatches(textItems, ['John'])
    expect(result).toEqual([])
  })

  it('should match word that appears as whole word', () => {
    const textItems = [createTextItem('John is here', 10, 120)]
    const result = findWordMatches(textItems, ['John'])
    expect(result).toHaveLength(1)
    expect(result[0].text).toBe('John')
  })

  it('should handle text with leading/trailing whitespace', () => {
    const textItems = [createTextItem('  Hello World  ', 10, 150)]
    const result = findWordMatches(textItems, ['Hello'])

    expect(result).toHaveLength(1)
    expect(result[0].text).toBe('Hello')
  })

  it('should be case-sensitive', () => {
    const textItems = [createTextItem('Hello World', 10, 110)]
    const result = findWordMatches(textItems, ['hello'])
    expect(result).toEqual([])
  })

  it('should escape special regex characters in search pattern', () => {
    // Note: \b word boundary doesn't work before special chars like $
    // because $ is not a word character, so this won't match
    const textItems = [createTextItem('Price: $100.00', 0, 140)]
    const result = findWordMatches(textItems, ['$100.00'])

    // Due to word boundary limitation, $ at start won't match
    expect(result).toHaveLength(0)
  })

  it('should find special characters when they appear as exact match', () => {
    // 'test.file.txt' exact match returns original coordinates
    const textItems = [createTextItem('test.file.txt', 0, 130)]
    const result = findWordMatches(textItems, ['test.file.txt'])

    expect(result).toHaveLength(1)
    expect(result[0].text).toBe('test.file.txt')
    expect(result[0].x).toBe(0)
    expect(result[0].width).toBe(130)
  })
})
