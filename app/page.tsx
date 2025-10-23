'use client'
import { useState } from 'react'
import Image from 'next/image'
import { ResumeDropzone } from './components/ResumeDropzone'
import { ModifiedResumeViewer } from 'components/ModifiedResumeViewer'
import Link from 'next/link'
import { ResumeViewer } from 'components/ResumeViewer'
import Button from 'components/Button'
import { modifyPdf } from 'lib/modify-pdf'

const defaultResumeExampleUrl = 'resume-example/openresume-resume.pdf'

export default function Home() {
  const [fileUrl, setFileUrl] = useState(defaultResumeExampleUrl)
  const [modifiedDoc, setModifiedDoc] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const handleModifyPdf = async () => {
    try {
      setLoading(true)
      setError(null)
      const result = await modifyPdf(fileUrl)
      setModifiedDoc(result)
    } catch (err) {
      console.error('Error modifying PDF:', err)
      setError(err instanceof Error ? err : new Error('Error modifying PDF'))
    } finally {
      setLoading(false)
    }
  }

  const onReset = () => {
    setModifiedDoc('')
    setFileUrl(defaultResumeExampleUrl)
  }

  return (
    <div className="flex flex-col items-center min-h-screen font-sans p-8 pb-20 gap-16 sm:p-20">
      <div className="w-full max-w-[1600px] mx-auto items-center text-center">
        <h1 className="text-4xl font-bold">Resume Redactor</h1>
        <p className="max-w-[700px]">
          Welcome to Resume Redactor. A tool that helps you redact personal
          information from resumes.
        </p>

        <div className="mt-3 mx-auto w-full max-w-[1600px]">
          <ResumeDropzone
            onFileUrlChange={(fileUrl) =>
              setFileUrl(fileUrl || defaultResumeExampleUrl)
            }
            setModifiedDoc={setModifiedDoc}
          />
        </div>
        <Button onClick={handleModifyPdf} className="mr-4">
          Modify PDF
        </Button>
        {modifiedDoc && fileUrl === defaultResumeExampleUrl && (
          <div className="mt-3">
            <Button onClick={onReset}>Clear Example</Button>
          </div>
        )}
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
