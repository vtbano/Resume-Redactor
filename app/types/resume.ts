/*
 * Resume type definitions adapted from OpenResume (https://github.com/xitanggg/open-resume)
 * © 2024 xitanggg (or original authors), licensed under AGPL-3.0
 */

import type { TextItem } from 'lib/parse-resume-from-pdf/types'

export interface ResumeProfile {
  name: TextItem
  email: TextItem
  phone: TextItem
  url: TextItem
  summary: TextItem | string
  location: TextItem
}

export interface ResumeEducation {
  school: TextItem
  degree: TextItem
  date: TextItem
  gpa: TextItem
  descriptions: string[]
}

export interface ResumeCustom {
  descriptions: string[]
}

export interface Resume {
  profile: ResumeProfile
  educations: ResumeEducation[]
  custom: ResumeCustom
}

export type ResumeKey = keyof Resume
