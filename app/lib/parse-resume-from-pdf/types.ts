/*
 * This file is adapted from OpenResume (https://github.com/xitanggg/open-resume)
 * © 2024 xitanggg (or original authors), licensed under AGPL-3.0
 */
import type { ResumeKey } from '../redux/types'

export interface TextItem {
  text: string
  x: number
  y: number
  width: number
  height: number
  fontName: string
  hasEOL: boolean
}
export type TextItems = TextItem[]

export type Line = TextItem[]
export type Lines = Line[]

export type ResumeSectionToLines = { [sectionName in ResumeKey]?: Lines } & {
  [otherSectionName: string]: Lines
}
export type Subsections = Lines[]

type FeatureScore = -4 | -3 | -2 | -1 | 0 | 1 | 2 | 3 | 4
type ReturnMatchingTextOnly = boolean
export type FeatureSet =
  | [(item: TextItem) => boolean, FeatureScore]
  | [
      (item: TextItem) => RegExpMatchArray | null,
      FeatureScore,
      ReturnMatchingTextOnly
    ]

export interface TextScore {
  text: string
  x: number
  y: number
  width: number
  height: number
  fontName: string
  hasEOL: boolean
  score: number
  match: boolean
}

export const emptyTextItemDetails: TextItem = {
  text: '',
  x: 0,
  y: 0,
  width: 0,
  height: 0,
  fontName: '',
  hasEOL: false,
}
// perhaps update this to also include the other values from the TextItem
export type TextScores = TextScore[]
