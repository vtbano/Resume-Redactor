import { ResumeViewer } from './ResumeViewer'
import { ArrowDownTrayIcon } from '@heroicons/react/24/outline'

export const ModifiedResumeViewer = ({
  modifiedDoc,
  loading,
  error,
}: {
  modifiedDoc?: string
  loading?: boolean
  error?: Error | null
}) => {
  if (loading) return <div>Loading PDF...</div>
  if (error) return <div>Error loading PDF: {error.message}</div>
  if (!modifiedDoc) return null

  const handleViewPdf = () => {
    window.open(modifiedDoc, '_blank')
  }

  return (
    <div className="w-full max-w-[800px] mb-8">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xl font-bold">Modified Resume</h2>
        <button
          onClick={handleViewPdf}
          className="lg:hidden flex items-center gap-2 px-4 py-2 bg-teal-500 text-white rounded hover:bg-teal-600 transition-colors"
        >
          <ArrowDownTrayIcon className="w-5 h-5" />
          View PDF
        </button>
      </div>
      <ResumeViewer pdfURL={modifiedDoc} documentName="" />
    </div>
  )
}
