/*
 * This file is adapted from OpenResume (https://github.com/xitanggg/open-resume)
 * © 2024 xitanggg (or original authors), licensed under AGPL-3.0
 */
import { readPdf } from 'lib/parse-resume-from-pdf/read-pdf'
import { groupTextItemsIntoLines } from 'lib/parse-resume-from-pdf/group-text-items-into-lines'
import { groupLinesIntoSections } from 'lib/parse-resume-from-pdf/group-lines-into-sections'
import { extractResumeFromSections } from 'lib/parse-resume-from-pdf/extract-resume-from-sections'

/**
 * Resume parser util that parses a resume from a resume pdf file
 *
 * Note: The parser algorithm only works for single column resume in English language
 */
export const parseResumeFromPdf = async (fileUrl: string) => {
  // Step 1. Read a pdf resume file into text items to prepare for processing
  const textItems = await readPdf(fileUrl)
  console.log('Total text items:', textItems)

  // Step 2. Group text items into lines
  const lines = groupTextItemsIntoLines(textItems)
  console.log('Total lines:', lines.length)

  // Step 3. Group lines into sections
  const sections = groupLinesIntoSections(lines)
  console.log('Sections:', Object.keys(sections))

  // Step 4. Extract resume from sections
  const resume = extractResumeFromSections(sections)
  console.log('Parsed resume:', resume)

  return resume
}
