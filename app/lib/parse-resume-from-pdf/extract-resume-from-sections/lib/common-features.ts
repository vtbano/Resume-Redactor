/*
 * This file is adapted from OpenResume (https://github.com/xitanggg/open-resume)
 * © 2024 xitanggg (or original authors), licensed under AGPL-3.0
 */
import type { TextItem, FeatureSet } from 'lib/parse-resume-from-pdf/types'

const isTextItemBold = (fontName: string) =>
  fontName.toLowerCase().includes('bold')
export const isBold = (item: TextItem) => isTextItemBold(item.fontName)
export const hasLetter = (item: TextItem) => /[a-zA-Z]/.test(item.text)
export const hasNumber = (item: TextItem) => /[0-9]/.test(item.text)
export const hasComma = (item: TextItem) => item.text.includes(',')
export const getHasText = (text: string) => (item: TextItem) =>
  item.text.includes(text)
export const hasOnlyLettersSpacesAmpersands = (item: TextItem) =>
  /^[A-Za-z\s&]+$/.test(item.text)
export const hasLetterAndIsAllUpperCase = (item: TextItem) =>
  hasLetter(item) && item.text.toUpperCase() === item.text

// Date Features
const hasYear = (item: TextItem) => /(?:19|20)\d{2}/.test(item.text)
// prettier-ignore
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const hasMonth = (item: TextItem) =>
  MONTHS.some(
    (month) =>
      item.text.includes(month) || item.text.includes(month.slice(0, 4))
  )
const SEASONS = ['Summer', 'Fall', 'Spring', 'Winter']
const hasSeason = (item: TextItem) =>
  SEASONS.some((season) => item.text.includes(season))
const hasPresent = (item: TextItem) => item.text.includes('Present')

/*
 *  hasGraduation & extractDatePatterns added by Resume Redactor Author
 *  to improve redaction of graduation date.
 */
const hasGraduation = (item: TextItem) =>
  item.text.includes('Graduation') || item.text.includes('Graduated')

const extractDatePatterns = (item: TextItem) => {
  const patterns = [
    // Month Year ranges
    /\b(January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\.?\s+\d{4}\s*[-–—]\s*(January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\.?\s+\d{4}/i,

    // Year ranges
    /\b\d{4}\s*[-–—]\s*\d{4}\b/,

    // Date to Present
    /\b(?:(January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\.?\s+)?\d{4}\s*[-–—]\s*Present\b/i,

    // Month Year
    /\b(January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\.?\s+\d{4}\b/i,

    // Just Present
    /\bPresent\b/i,

    // FIXED: Year only - return just the year, not "Graduated: YEAR"
    /(?:Graduated?:?\s*)?(\d{4})(?=[A-Z]|$|\s)/i,
  ]

  for (let i = 0; i < patterns.length; i++) {
    const match = item.text.match(patterns[i])
    if (match) {
      if (i === patterns.length - 1 && match[1]) {
        return [match[1]] as RegExpMatchArray
      } else {
        return [match[0]] as RegExpMatchArray
      }
    }
  }

  return null
}
export const DATE_FEATURE_SETS: FeatureSet[] = [
  [extractDatePatterns, 4, true],
  [hasGraduation, 2],
  [hasYear, 1],
  [hasMonth, 1],
  [hasSeason, 1],
  [hasPresent, 1],
  [hasComma, -1],
]
