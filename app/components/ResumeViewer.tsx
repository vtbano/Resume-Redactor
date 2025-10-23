export const ResumeViewer = ({
  pdfURL = '',
  documentName = '',
}: {
  pdfURL?: string
  documentName?: string
}) => {
  return (
    <div className="w-full sm:w-[800px] h-[900px] lg: mb-8">
      <h2 className="text-xl font-bold mb-2">{documentName}</h2>
      <div className="scale-[0.85] origin-top-left sm:scale-100">
        <iframe src={`${pdfURL}#navpanes=0`} className="h-[900px] w-[800px]" />
      </div>
    </div>
  )
}
