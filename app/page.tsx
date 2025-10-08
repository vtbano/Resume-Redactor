'use client'
import { useState, useEffect } from 'react'
import Image from 'next/image'
import { ResumeDropzone } from './components/ResumeDropzone'
import Link from 'next/link'
import { readPdf } from 'lib/parse-resume-from-pdf/read-pdf'
import type { TextItems } from 'lib/parse-resume-from-pdf/types'

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

const defaultFileUrl = RESUME_EXAMPLES[0]['fileUrl']

export default function Home() {
  const [fileUrl, setFileUrl] = useState(defaultFileUrl)
  const [textItems, setTextItems] = useState<TextItems>([])
  useEffect(() => {
    async function test() {
      const textItems = await readPdf(fileUrl)
      setTextItems(textItems)
    }
    test()
  }, [fileUrl])

  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <main className="flex flex-row gap-[32px] row-start-2 items-center sm:items-center">
        <div className="w-[420px]">
          <h1 className="text-4xl font-bold text-center sm:text-left">
            Resume Redactor
          </h1>
          <p className="max-w-[700px] text-center sm:text-left">
            Welcome to Resume Redactor. A tool that helps you redact personal
            information from resumes.
          </p>
          <div className="mt-3">
            <ResumeDropzone
              onFileUrlChange={(fileUrl) =>
                setFileUrl(fileUrl || defaultFileUrl)
              }
              playgroundView={true}
            />
          </div>
        </div>
        <div className="w-[800px] h-[900px]">
          <iframe src={`${fileUrl}#navpanes=0`} className="h-full w-full" />
        </div>
      </main>
      <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://github.com/vtbano"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/github.svg"
            alt="Github icon"
            width={16}
            height={16}
          />
          My Github
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
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
            aria-hidden
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
