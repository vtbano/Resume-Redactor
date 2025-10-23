import { ResumeViewer } from './ResumeViewer'

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
  if (error !== null) return <div>Error loading PDF: {error?.message}</div>
  if (!modifiedDoc) return null

  return (
    <>
      <ResumeViewer pdfURL={modifiedDoc} documentName="Modified Resume" />
    </>
  )
}
