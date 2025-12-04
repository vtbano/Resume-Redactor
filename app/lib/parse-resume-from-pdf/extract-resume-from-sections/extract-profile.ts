/*
 * This file is adapted from OpenResume (https://github.com/xitanggg/open-resume)
 * © 2024 xitanggg (or original authors), licensed under AGPL-3.0
 */
import type {
  ResumeSectionToLines,
  TextItem,
  FeatureSet,
} from 'lib/parse-resume-from-pdf/types'
import { getSectionLinesByKeywords } from 'lib/parse-resume-from-pdf/extract-resume-from-sections/lib/get-section-lines'
import {
  isBold,
  hasNumber,
  hasComma,
  hasLetter,
  hasLetterAndIsAllUpperCase,
} from 'lib/parse-resume-from-pdf/extract-resume-from-sections/lib/common-features'
import { VALID_LOCATIONS } from './lib/constants-locations'
import { getTextWithHighestFeatureScore } from 'lib/parse-resume-from-pdf/extract-resume-from-sections/lib/feature-scoring-system'
import { fixExtractedItemCoordinates } from './lib/fix-item-coordinates'

// Name
export const matchOnlyLetterSpaceOrPeriod = (item: TextItem) =>
  item.text.match(/^[a-zA-Z\s\.]+$/)

// Email
// Simple email regex: xxx@xxx.xxx (xxx = anything not space)
export const matchEmail = (item: TextItem) => item.text.match(/\S+@\S+\.\S+/)
const hasAt = (item: TextItem) => item.text.includes('@')

// Phone
// Simple phone regex that matches (xxx)-xxx-xxxx where () and - are optional, - can also be space
export const matchPhone = (item: TextItem) =>
  item.text.match(/\(?\d{3}\)?[\s-]?\d{3}[\s-]?\d{4}/)
const hasParenthesis = (item: TextItem) => /\([0-9]+\)/.test(item.text)

/*
 *  Refactor matchCityAndState by Resume Redactor Author
 *  to improve the match with state/provinces respectively US/Canada
 */
// Location
// Validates against actual state/province names
const normalize = (s: string) => s.replace(/\./g, '').trim().toLowerCase()

const VALID_SET = new Set(VALID_LOCATIONS.map(normalize))

const cleanContactLine = (orig: string) =>
  orig.replace(/\|/g, ',').replace(/(^|[\s,;:|])n(?=[A-Za-z])/g, '$1')

const splitParts = (cleaned: string) =>
  cleaned
    .split(',')
    .map((p) => p.trim())
    .filter(Boolean)

const buildLocationMatch = (
  cleaned: string,
  parts: string[],
  idx: number,
  orig: string
): RegExpMatchArray => {
  const token = parts[idx]
  const city = idx > 0 ? parts[idx - 1] : undefined
  const country = idx + 1 < parts.length ? parts[idx + 1] : undefined

  const pieces: string[] = []
  if (city) pieces.push(city)
  pieces.push(token)
  if (country && VALID_SET.has(normalize(country))) pieces.push(country)

  const substring = pieces.join(', ')
  const idxPos = cleaned.indexOf(substring)
  const match =
    pieces.length === 3
      ? ([substring, city || '', token, country] as unknown as RegExpMatchArray)
      : ([substring, city || '', token] as unknown as RegExpMatchArray)

  match.index = idxPos >= 0 ? idxPos : cleaned.indexOf(token)
  match.input = orig
  return match
}

export const matchCityAndState = (item: TextItem) => {
  const orig = item.text || ''
  if (!orig.trim()) return null

  const cleaned = cleanContactLine(orig)
  const parts = splitParts(cleaned)

  const idx = parts.findIndex((part) => VALID_SET.has(normalize(part)))
  if (idx === -1) {
    return null
  }

  const match = buildLocationMatch(cleaned, parts, idx, orig)
  console.log(match)
  return match
}

// Url
// Simple url regex that matches "xxx.xxx/xxx" (xxx = anything not space)
export const matchUrl = (item: TextItem) => item.text.match(/\S+\.[a-z]+\/\S+/)
// Match https://xxx.xxx where s is optional
const matchUrlHttpFallback = (item: TextItem) =>
  item.text.match(/https?:\/\/\S+\.\S+/)
// Match www.xxx.xxx
const matchUrlWwwFallback = (item: TextItem) => item.text.match(/www\.\S+\.\S+/)
const hasSlash = (item: TextItem) => item.text.includes('/')

// Summary
const has4OrMoreWords = (item: TextItem) => item.text.split(' ').length >= 4

/**
 *              Unique Attribute
 * Name         Bold or Has all uppercase letter
 * Email        Has @
 * Phone        Has ()
 * Location     Has ,    (overlap with summary)
 * Url          Has slash
 * Summary      Has 4 or more words
 */

/**
 * Name -> contains only letters/space/period, e.g. Leonardo W. DiCaprio
 *         (it isn't common to include middle initial in resume)
 *      -> is bolded or has all letters as uppercase
 */
const NAME_FEATURE_SETS: FeatureSet[] = [
  [matchOnlyLetterSpaceOrPeriod, 3, true],
  [isBold, 2],
  [hasLetterAndIsAllUpperCase, 2],
  // Match against other unique attributes
  [hasAt, -4], // Email
  [hasNumber, -4], // Phone
  [hasParenthesis, -4], // Phone
  [hasComma, -4], // Location
  [hasSlash, -4], // Url
  [has4OrMoreWords, -2], // Summary
]

// Email -> match email regex xxx@xxx.xxx
const EMAIL_FEATURE_SETS: FeatureSet[] = [
  [matchEmail, 4, true],
  [isBold, -1], // Name
  [hasLetterAndIsAllUpperCase, -1], // Name
  [hasParenthesis, -4], // Phone
  [hasComma, -4], // Location
  [hasSlash, -4], // Url
  [has4OrMoreWords, -4], // Summary
]

// Phone -> match phone regex (xxx)-xxx-xxxx
const PHONE_FEATURE_SETS: FeatureSet[] = [
  [matchPhone, 4, true],
  [hasLetter, -4], // Name, Email, Location, Url, Summary
]

// Location -> match location regex <City>, <ST>
const LOCATION_FEATURE_SETS: FeatureSet[] = [
  [matchCityAndState, 4, true],
  [isBold, -1], // Name
  [hasAt, -4], // Email
  [hasParenthesis, -3], // Phone
  [hasSlash, -4], // Url
]

// URL -> match url regex xxx.xxx/xxx
const URL_FEATURE_SETS: FeatureSet[] = [
  [matchUrl, 4, true],
  [matchUrlHttpFallback, 3, true],
  [matchUrlWwwFallback, 3, true],
  [isBold, -1], // Name
  [hasAt, -4], // Email
  [hasParenthesis, -3], // Phone
  [hasComma, -4], // Location
  [has4OrMoreWords, -4], // Summary
]

// Summary -> has 4 or more words
const SUMMARY_FEATURE_SETS: FeatureSet[] = [
  [has4OrMoreWords, 4],
  [isBold, -1], // Name
  [hasAt, -4], // Email
  [hasParenthesis, -3], // Phone
  [matchCityAndState, -4, false], // Location
]

export const extractProfile = (sections: ResumeSectionToLines) => {
  const lines = sections.profile || []
  const textItems = lines.flat()

  const [name, nameScores] = getTextWithHighestFeatureScore(
    textItems,
    NAME_FEATURE_SETS
  )
  const [email, emailScores] = getTextWithHighestFeatureScore(
    textItems,
    EMAIL_FEATURE_SETS
  )
  const [phone, phoneScores] = getTextWithHighestFeatureScore(
    textItems,
    PHONE_FEATURE_SETS
  )
  const [location, locationScores] = getTextWithHighestFeatureScore(
    textItems,
    LOCATION_FEATURE_SETS
  )
  const [url, urlScores] = getTextWithHighestFeatureScore(
    textItems,
    URL_FEATURE_SETS
  )
  const [summary, summaryScores] = getTextWithHighestFeatureScore(
    textItems,
    SUMMARY_FEATURE_SETS,
    undefined,
    true
  )

  const updatedFields = fixExtractedItemCoordinates(textItems, {
    name,
    email,
    phone,
    location,
  })

  const updatedName = updatedFields.name ?? name
  const updatedEmail = updatedFields.email ?? email
  const updatedPhone = updatedFields.phone ?? phone
  const updatedLocation = updatedFields.location ?? location

  const summaryLines = getSectionLinesByKeywords(sections, ['summary'])
  const summarySection = summaryLines
    .flat()
    .map((textItem) => textItem.text)
    .join(' ')
  const objectiveLines = getSectionLinesByKeywords(sections, ['objective'])
  const objectiveSection = objectiveLines
    .flat()
    .map((textItem) => textItem.text)
    .join(' ')

  return {
    profile: {
      name: updatedName,
      email: updatedEmail,
      phone: updatedPhone,
      location: updatedLocation,
      url,
      summary: summarySection || objectiveSection || summary,
    },
    profileScores: {
      name: nameScores,
      email: emailScores,
      phone: phoneScores,
      location: locationScores,
      url: urlScores,
      summary: summaryScores,
    },
  }
}
