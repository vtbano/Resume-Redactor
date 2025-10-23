'use client'
import { useState, useEffect } from 'react'
import Image from 'next/image'
import { ResumeDropzone } from './components/ResumeDropzone'
import { ResumeModifier } from 'components/ResumeModifier'
import Link from 'next/link'
import { readPdf } from 'lib/parse-resume-from-pdf/read-pdf'
import type { TextItems } from 'lib/parse-resume-from-pdf/types'
import { ResumeViewer } from 'components/ResumeViewer'
import Button from 'components/Button'
import { modifyPdf } from 'lib/modify-pdf'

const RESUME_EXAMPLES = [
  {
    fileUrl: 'resume-example/laverne-resume.pdf',
    description: (
      <span>
        Borrowed from University of La Verne Career Center -{' '}
        <Link href="https://laverne.edu/careers/wp-content/uploads/sites/15/2010/12/Undergraduate-Student-Resume-Examples.pdf">
          Link
        </Link>
      </span>
    ),
  },
  {
    fileUrl: 'resume-example/openresume-resume.pdf',
    description: (
      <span>
        Created with OpenResume resume builder -{' '}
        <Link href="/resume-builder">Link</Link>
      </span>
    ),
  },
]

const defaultFileUrl = RESUME_EXAMPLES[1]['fileUrl']

export default function Home() {
  const [fileUrl, setFileUrl] = useState(defaultFileUrl)
  const [textItems, setTextItems] = useState<TextItems>([])
  const [modifiedDoc, setModifiedDoc] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    async function test() {
      const textItems = await readPdf(fileUrl)
      setTextItems(textItems)
    }
    test()
  }, [fileUrl])

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
    setFileUrl(defaultFileUrl)
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
            onFileUrlChange={(fileUrl) => setFileUrl(fileUrl || defaultFileUrl)}
            playgroundView={true}
            setModifiedDoc={setModifiedDoc}
          />
        </div>
        <Button onClick={handleModifyPdf} className="mr-4">
          Modify PDF
        </Button>
        {modifiedDoc && fileUrl === defaultFileUrl && (
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
            fileUrl === defaultFileUrl ? 'Example Resume' : 'Uploaded Resume'
          }
        />
        <ResumeModifier
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
