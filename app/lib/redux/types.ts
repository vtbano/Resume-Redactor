/*
 * This file is adapted from OpenResume (https://github.com/xitanggg/open-resume)
 * © 2024 xitanggg (or original authors), licensed under AGPL-3.0
 *
 *
 */

/*
 * updates by Resume Redactor Author: import TextItem to ensure
 * ResumeProfile and ResumeEducation had TextItem type
 */

import type { TextItem } from 'lib/parse-resume-from-pdf/types'

export interface ResumeSliceProfile {
  name: string
  email: string
  phone: string
  url: string
  summary: string
  location: string
}
export interface ResumeProfile {
  name: TextItem
  email: TextItem
  phone: TextItem
  url: TextItem
  summary: TextItem | string
  location: TextItem
}


export interface ResumeSliceEducation {
  school: string
  degree: string
  date: string
  gpa: string
  descriptions: string[]
}
export interface ResumeEducation {
  school: TextItem
  degree: TextItem
  date: TextItem
  gpa: TextItem
  descriptions: string[]
}


export interface FeaturedSkill {
  skill: string
  rating: number
}

export interface ResumeSkills {
  featuredSkills: FeaturedSkill[]
  descriptions: string[]
}

export interface ResumeCustom {
  descriptions: string[]
}

export interface InitialResume {
  profile: ResumeSliceProfile
  educations: ResumeSliceEducation[]
  custom: ResumeCustom
}

export interface Resume {
  profile: ResumeProfile
  educations: ResumeEducation[]
  custom: ResumeCustom
}

export type ResumeKey = keyof Resume
