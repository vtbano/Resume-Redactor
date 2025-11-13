/*
 * This file is adapted from OpenResume (https://github.com/xitanggg/open-resume)
 * © 2024 xitanggg (or original authors), licensed under AGPL-3.0
 */

import type {
  TextItem,
  FeatureSet,
  ResumeSectionToLines,
} from 'lib/parse-resume-from-pdf/types'
import type { ResumeEducation } from 'lib/redux/types'
import { getSectionLinesByKeywords } from 'lib/parse-resume-from-pdf/extract-resume-from-sections/lib/get-section-lines'
import {
  DATE_FEATURE_SETS,
  hasComma,
  hasLetter,
  hasNumber,
} from 'lib/parse-resume-from-pdf/extract-resume-from-sections/lib/common-features'
import { getTextWithHighestFeatureScore } from 'lib/parse-resume-from-pdf/extract-resume-from-sections/lib/feature-scoring-system'
import {
  getBulletPointsFromLines,
  getDescriptionsLineIdx,
} from 'lib/parse-resume-from-pdf/extract-resume-from-sections/lib/bullet-points'

/**
 *              Unique Attribute
 * School       Has school
 * Degree       Has degree
 * GPA          Has number
 */

// prettier-ignore
const SCHOOLS = ['College', 'University', 'Institute', 'School', 'Academy', 'BASIS', 'Magnet']
const hasSchool = (item: TextItem) =>
  SCHOOLS.some((school) => item.text.includes(school))
// prettier-ignore
const DEGREES = ["Associate", "Bachelor", "Master", "PhD", "Ph."];
const hasDegree = (item: TextItem) =>
  DEGREES.some((degree) => item.text.includes(degree)) ||
  /[ABM][A-Z\.]/.test(item.text) // Match AA, B.S., MBA, etc.
const matchGPA = (item: TextItem) => item.text.match(/[0-4]\.\d{1,2}/)
const matchGrade = (item: TextItem) => {
  const grade = parseFloat(item.text)
  if (Number.isFinite(grade) && grade <= 110) {
    return [String(grade)] as RegExpMatchArray
  }
  return null
}

const SCHOOL_FEATURE_SETS: FeatureSet[] = [
  [hasSchool, 4],
  [hasDegree, -4],
  [hasNumber, -4],
]

const DEGREE_FEATURE_SETS: FeatureSet[] = [
  [hasDegree, 4],
  [hasSchool, -4],
  [hasNumber, -3],
]

const GPA_FEATURE_SETS: FeatureSet[] = [
  [matchGPA, 4, true],
  [matchGrade, 3, true],
  [hasComma, -3],
  [hasLetter, -4],
]

/*
 *  divideEducationIntoSubsections added by Resume Redactor Author
 *  to improve the recognition of schools within resume
 */

type TextLine = TextItem[] // One line of text items
type EducationSubsection = TextLine[] // Multiple lines forming one education entry
type EducationSubsections = EducationSubsection[] // All education entries

const divideEducationIntoSubsections = (
  lines: TextLine[]
): EducationSubsections => {
  const subsections: EducationSubsections = []
  let currentSubsection: EducationSubsection = []

  lines.forEach((line, index) => {
    // Check if ANY item in this line has a school keyword
    const lineHasSchool = line.some((item) => hasSchool(item))

    if (lineHasSchool && index > 0 && currentSubsection.length > 0) {
      subsections.push([...currentSubsection])
      currentSubsection = [line]
    } else {
      currentSubsection.push(line)
    }
  })

  // Add the last subsection
  if (currentSubsection.length > 0) {
    subsections.push(currentSubsection)
  }

  return subsections
}

export const extractEducation = (sections: ResumeSectionToLines) => {
  const educations: ResumeEducation[] = []
  const educationsScores = []
  const lines = getSectionLinesByKeywords(sections, ['education'])
  const subsections = divideEducationIntoSubsections(lines)
  for (const subsectionLines of subsections) {
    const textItems = subsectionLines.flat()
    console.log('textItems for education,', textItems)
    const [school, schoolScores] = getTextWithHighestFeatureScore(
      textItems,
      SCHOOL_FEATURE_SETS
    )
    console.log('School:', school, 'School Scores:', schoolScores)
    const [degree, degreeScores] = getTextWithHighestFeatureScore(
      textItems,
      DEGREE_FEATURE_SETS
    )
    const [gpa, gpaScores] = getTextWithHighestFeatureScore(
      textItems,
      GPA_FEATURE_SETS
    )
    const [date, dateScores] = getTextWithHighestFeatureScore(
      textItems,
      DATE_FEATURE_SETS
    )

    let descriptions: string[] = []
    const descriptionsLineIdx = getDescriptionsLineIdx(subsectionLines)
    if (descriptionsLineIdx !== undefined) {
      const descriptionsLines = subsectionLines.slice(descriptionsLineIdx)
      descriptions = getBulletPointsFromLines(descriptionsLines)
    }

    educations.push({ school, degree, gpa, date, descriptions })
    educationsScores.push({
      schoolScores,
      degreeScores,
      gpaScores,
      dateScores,
    })
  }

  if (educations.length !== 0) {
    const coursesLines = getSectionLinesByKeywords(sections, ['course'])
    if (coursesLines.length !== 0) {
      educations[0].descriptions.push(
        'Courses: ' +
          coursesLines
            .flat()
            .map((item) => item.text)
            .join(' ')
      )
    }
  }

  return {
    educations,
    educationsScores,
  }
}
