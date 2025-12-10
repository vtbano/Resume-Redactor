'use client'
import { useState } from 'react'
import Select from 'react-select'
import type { StylesConfig } from 'react-select'
import { MultiValue } from 'react-select'
import Image from 'next/image'
import { ResumeDropzone } from './components/ResumeDropzone'
import { ModifiedResumeViewer } from 'components/ModifiedResumeViewer'
import { ResumeViewer } from 'components/ResumeViewer'
import Button from 'components/Button'
import { modifyPdf } from 'lib/modify-pdf'
import { RedactionFields } from 'lib/modify-pdf/types'

const defaultResumeExampleUrl = 'resume-example/openresume-resume.pdf'

type Option = { value: keyof RedactionFields; label: string }

export default function Home() {
  const [fileUrl, setFileUrl] = useState(defaultResumeExampleUrl)
  const [modifiedDoc, setModifiedDoc] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [redactionFields, setRedactionFields] = useState<RedactionFields>({
    name: false,
    email: false,
    phone: false,
    address: false,
    url: false,
    graduation_date: false,
    degree: false,
    gpa: false,
    school: false,
  })

  const redactionOptions = (
    Object.keys(redactionFields) as (keyof RedactionFields)[]
  ).map((key) => ({
    value: key,
    label: key.toUpperCase().replace(/_/g, ' '),
  }))

  const createRedactionFieldsFromSelected = (
    selected: (keyof RedactionFields)[]
  ) => {
    return Object.fromEntries(
      (Object.keys(redactionFields) as (keyof RedactionFields)[]).map((key) => [
        key,
        selected.includes(key),
      ])
    ) as RedactionFields
  }

  const handleRedactionChange = (
    selectedOptions: MultiValue<{
      value: keyof RedactionFields
      label: string
    }>
  ) => {
    const selected = selectedOptions
      ? selectedOptions.map(
          (option: { value: keyof RedactionFields; label: string }) =>
            option.value
        )
      : []

    console.log('selected', selected)
    setRedactionFields(createRedactionFieldsFromSelected(selected))
  }

  const handleSelectAll = () => {
    const allKeys = Object.keys(redactionFields) as (keyof RedactionFields)[]
    setRedactionFields(createRedactionFieldsFromSelected(allKeys))
  }

  const handleDeselectAll = () => {
    setRedactionFields(createRedactionFieldsFromSelected([]))
  }

  const hasSelectedFields = Object.values(redactionFields).some(Boolean)

  const handleModifyPdf = async () => {
    try {
      setLoading(true)
      setError(null)
      const result = await modifyPdf(fileUrl, redactionFields)
      setModifiedDoc(result)
    } catch (err) {
      console.error('Error modifying PDF:', err)
      setError(err instanceof Error ? err : new Error('Error modifying PDF'))
    } finally {
      setLoading(false)
    }
  }

  const selectStyles: StylesConfig<Option, true> = {
    control: (provided, state) => ({
      ...provided,
      borderColor: state.isFocused ? '#14B8A6' : provided.borderColor,
      boxShadow: state.isFocused ? '0 0 0 1px #14B8A6' : provided.boxShadow,
      '&:hover': { borderColor: '#14B8A6' },
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isFocused ? '#E6FFFA' : provided.backgroundColor,
    }),
  }

  return (
    <div className="flex flex-col items-center min-h-screen font-sans p-8 pb-20 gap-16 sm:p-20">
      <div className="w-full max-w-[1600px] mx-auto flex flex-col items-center text-center">
        <div className="flex items-center">
          <h1 className="text-4xl font-bold text-teal-500">Resume Redactor</h1>
          <Image
            src="/resume-redact-image.png"
            alt="Redaction Icon"
            width={80}
            height={80}
            className="block"
          />
        </div>

        <div className="p-3 max-w-[700px]">
          A tool that helps you redact personal information from resumes. Made
          for HR professionals in mind by a former Talent Leader.
        </div>

        <div className="mt-3 mx-auto w-full max-w-[800px]">
          <ResumeDropzone
            onFileUrlChange={(fileUrl) =>
              setFileUrl(fileUrl || defaultResumeExampleUrl)
            }
            setModifiedDoc={setModifiedDoc}
          />
        </div>
        <div className="flex flex-col gap-3 mt-6 items-center">
          <div className="flex gap-2 mb-2">
            <Button
              type="button"
              onClick={handleSelectAll}
              variant="secondary"
              className="text-sm px-3 py-1"
            >
              Select All
            </Button>
            <Button
              type="button"
              onClick={handleDeselectAll}
              variant="secondary"
              className="text-sm px-3 py-1"
            >
              Deselect All
            </Button>
          </div>
          <Select
            instanceId="redaction-select"
            isMulti
            options={redactionOptions}
            value={redactionOptions.filter(
              (option) => redactionFields[option.value]
            )}
            onChange={handleRedactionChange}
            placeholder="Redaction Field Options"
            className="min-w-[300px]"
            styles={selectStyles}
          />
          <div>
            {!hasSelectedFields && (
              <p className="text-gray-500 text-sm mt-1">
                Select at least one field to enable PDF modification
              </p>
            )}
          </div>
          <div>
            {hasSelectedFields && (
              <Button type="button" onClick={handleModifyPdf} className="mr-4">
                Modify PDF
              </Button>
            )}
          </div>
        </div>
      </div>

      <main
        className="
      flex flex-col lg:flex-row
      justify-center 2xl: items-start
      gap-8
      w-full
      max-w-[1600px]
      mx-auto
    "
      >
        <ResumeViewer
          pdfURL={fileUrl}
          documentName={
            fileUrl === defaultResumeExampleUrl
              ? 'Example Resume'
              : 'Uploaded Resume'
          }
        />
        <ModifiedResumeViewer
          modifiedDoc={modifiedDoc}
          loading={loading}
          error={error}
        />
      </main>
      <section>
        <div className="flex">
          <Image
            src="/story.png"
            alt="Review icon"
            width={300}
            height={300}
            className="hidden md:block flex-shrink-0 object-contain"
          />
          <div className="max-w-[500px]">
            <h2 className="font-bold text-teal-500">App Inspo</h2>
            <p>
              This tool was inspired by its creator’s experience as a Talent
              Leader, someone who deeply understands the friction of blind
              screening without built-in ATS redaction. While most tracking
              systems require tedious manual redaction line-by-line, this tool
              automates profile and education redaction, removing the manual
              burden and dramatically speeding up the process.
            </p>
          </div>
        </div>
        <div className="flex pt-5">
          <div>
            <h2 className="font-bold text-teal-500">
              Stay tuned for upgrades...
            </h2>
            <div className="max-w-[500px]">
              <a
                className="flex items-center gap-2 hover:underline hover:underline-offset-4 font-bold text-teal-500"
                href="https://github.com/vtbano/Resume-Redactor/issues/1"
                target="_blank"
                rel="noopener noreferrer"
              >
                API
              </a>
              <p>
                This upcoming addition is intended to improve the flow of the
                redaction process, by allowing the ATS to plug-in and utilize
                the redaction features for free!
              </p>
              <a
                className="flex items-center gap-2 hover:underline hover:underline-offset-4 font-bold text-teal-500"
                href="https://github.com/vtbano/Resume-Redactor/issues/2"
                target="_blank"
                rel="noopener noreferrer"
              >
                Batch Redaction
              </a>
              <p>
                This upcoming feature will take the redaction tool to the next
                level, by allowing the recruiter to batch redact! There are
                typically a few resumes that are part of the screening process,
                so being able to redact all at once will shave off a lot of time
                from the day-to-day recruitment process.
              </p>
            </div>
          </div>
          <Image
            src="/ideas.png"
            alt="Review icon"
            width={300}
            height={300}
            className="hidden md:block flex-shrink-0 object-contain"
          />
        </div>
      </section>

      {/* FOOTER */}
      <footer className="mt-auto flex gap-6 flex-wrap items-center justify-center border-t border-gray-200 p-6">
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://github.com/vtbano"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image src="/github.svg" alt="Github icon" width={16} height={16} />
          My Github
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://linkedin.com/in/vanessatbano"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            src="/linkedin.svg"
            alt="Linkedin icon"
            width={16}
            height={16}
          />
          LinkedIn
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://www.linkedin.com/in/vanessatbano/#:~:text=all%2047%20skills-,Recommendations,-Recommendations"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            src="/peer-review.svg"
            alt="Review icon"
            width={16}
            height={16}
          />
          Reviews about working with me
        </a>
      </footer>
    </div>
  )
}
