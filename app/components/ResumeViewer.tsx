export const ResumeViewer = ({
  pdfURL = '',
  documentName = '',
}: {
  pdfURL?: string
  documentName?: string
}) => {
  return (
    <div className="w-full max-w-[800px] mb-8">
      <h2 className="text-xl font-bold mb-2">{documentName}</h2>
      {/* FIXED: Make container and iframe truly responsive */}
      <div className="w-full aspect-[8/9] bg-gray-100 rounded border">
        <iframe
          src={`${pdfURL}#navpanes=0&zoom=page-width`}
          className="w-full h-full rounded"
        />
      </div>
    </div>
  )
}
