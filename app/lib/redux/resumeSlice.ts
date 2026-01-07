/*
 * This file is adapted from OpenResume (https://github.com/xitanggg/open-resume)
 * © 2024 xitanggg (or original authors), licensed under AGPL-3.0
 */
import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type {
  FeaturedSkill,
  InitialResume,
  ResumeSliceEducation,
  ResumeSliceProfile,
  ResumeSkills,
} from 'lib/redux/types'
import type { ShowForm } from 'lib/redux/settingsSlice'

export const initialProfile: ResumeSliceProfile = {
  name: '',
  summary: '',
  email: '',
  phone: '',
  location: '',
  url: '',
}

export const initialEducation: ResumeSliceEducation = {
  school: '',
  degree: '',
  gpa: '',
  date: '',
  descriptions: [],
}

export const initialFeaturedSkill: FeaturedSkill = { skill: '', rating: 4 }
export const initialFeaturedSkills: FeaturedSkill[] = Array(6).fill({
  ...initialFeaturedSkill,
})
export const initialSkills: ResumeSkills = {
  featuredSkills: initialFeaturedSkills,
  descriptions: [],
}

export const initialCustom = {
  descriptions: [],
}

export const initialResumeState: InitialResume = {
  profile: initialProfile,
  educations: [initialEducation],
  custom: initialCustom,
}

// Keep the field & value type in sync with CreateHandleChangeArgsWithDescriptions (components\ResumeForm\types.ts)
export type CreateChangeActionWithDescriptions<T> = {
  idx: number
} & (
  | {
      field: Exclude<keyof T, 'descriptions'>
      value: string
    }
  | { field: 'descriptions'; value: string[] }
)

export const resumeSlice = createSlice({
  name: 'resume',
  initialState: initialResumeState,
  reducers: {
    changeProfile: (
      draft,
      action: PayloadAction<{ field: keyof ResumeSliceProfile; value: string }>
    ) => {
      const { field, value } = action.payload
      draft.profile[field] = value
    },
    changeEducations: (
      draft,
      action: PayloadAction<
        CreateChangeActionWithDescriptions<ResumeSliceEducation>
      >
    ) => {
      const { idx, field, value } = action.payload
      const education = draft.educations[idx]
      if (field === 'descriptions') {
        education[field] = value as string[]
      } else {
        education[field] = value as string
      }
    },
    changeCustom: (
      draft,
      action: PayloadAction<{ field: 'descriptions'; value: string[] }>
    ) => {
      const { value } = action.payload
      draft.custom.descriptions = value
    },
    addSectionInForm: (draft, action: PayloadAction<{ form: ShowForm }>) => {
      const { form } = action.payload
      switch (form) {
        case 'educations': {
          draft.educations.push(structuredClone(initialEducation))
          return draft
        }
      }
    },
    moveSectionInForm: (
      draft,
      action: PayloadAction<{
        form: ShowForm
        idx: number
        direction: 'up' | 'down'
      }>
    ) => {
      const { form, idx, direction } = action.payload
      if (form !== 'skills' && form !== 'custom') {
        if (
          (idx === 0 && direction === 'up') ||
          (idx === draft[form].length - 1 && direction === 'down')
        ) {
          return draft
        }

        const section = draft[form][idx]
        if (direction === 'up') {
          draft[form][idx] = draft[form][idx - 1]
          draft[form][idx - 1] = section
        } else {
          draft[form][idx] = draft[form][idx + 1]
          draft[form][idx + 1] = section
        }
      }
    },
    deleteSectionInFormByIdx: (
      draft,
      action: PayloadAction<{ form: ShowForm; idx: number }>
    ) => {
      const { form, idx } = action.payload
      if (form !== 'skills' && form !== 'custom') {
        draft[form].splice(idx, 1)
      }
    },
    setResume: (_draft, action: PayloadAction<InitialResume>) => {
      return action.payload
    },
  },
})

export default resumeSlice.reducer
