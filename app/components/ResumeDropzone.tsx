import { useState, useRef } from 'react'
import { LockClosedIcon } from '@heroicons/react/24/solid'
import { XMarkIcon } from '@heroicons/react/24/outline'
import Image from 'next/image'
import { cx } from 'lib/utils/cx'

const defaultFileState = {
  name: '',
  size: 0,
  fileUrl: '',
}

export const ResumeDropzone = ({
  onFileUrlChange,
  className,
  setModifiedDoc,
}: {
  onFileUrlChange: (fileUrl: string) => void
  className?: string
  setModifiedDoc: (doc: string) => void
}) => {
  const [file, setFile] = useState(defaultFileState)
  const [isHoveredOnDropzone, setIsHoveredOnDropzone] = useState(false)
  const [hasNonPdfFile, setHasNonPdfFile] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const hasFile = Boolean(file.name)

  const setNewFile = (newFile: File) => {
    if (file.fileUrl) {
      URL.revokeObjectURL(file.fileUrl)
    }

    const { name, size } = newFile
    const fileUrl = URL.createObjectURL(newFile)
    setFile({ name, size, fileUrl })
    onFileUrlChange(fileUrl)
  }

  const onDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    const newFile = event.dataTransfer.files[0]
    if (newFile.name.endsWith('.pdf')) {
      setHasNonPdfFile(false)
      setNewFile(newFile)
    } else {
      setHasNonPdfFile(true)
    }
    setIsHoveredOnDropzone(false)
  }

  const onInputChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files) return

    const newFile = files[0]
    setNewFile(newFile)
  }

  const onRemove = () => {
    setModifiedDoc('')
    setFile(defaultFileState)
    onFileUrlChange('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div
      className={cx(
        'flex justify-center rounded-md border-2 border-dashed border-gray-300 px-6 ',
        isHoveredOnDropzone && 'border-sky-400',
        'pb-6 pt-4',
        className
      )}
      onDragOver={(event) => {
        event.preventDefault()
        setIsHoveredOnDropzone(true)
      }}
      onDragLeave={() => setIsHoveredOnDropzone(false)}
      onDrop={onDrop}
    >
      <div className={cx('text-center', 'space-y-2')}>
        {!hasFile ? (
          <>
            <p className={cx('pt-3 text-gray-700')}>
              Browse a pdf file or drop it here
            </p>
            <p className="flex text-sm text-gray-500">
              <LockClosedIcon className="mr-1 mt-1 h-3 w-3 text-gray-400" />
              File data is used locally and never leaves your browser
            </p>
          </>
        ) : (
          <div className="flex items-center justify-center gap-3 pt-3">
            <div className="pl-7 font-semibold text-gray-900">
              {file.name} - {getFileSizeString(file.size)}
            </div>
            <button
              type="button"
              className="outline-theme-blue rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-500"
              title="Remove file"
              onClick={onRemove}
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
        )}
        <div className="pt-4">
          <>
            <label
              className={cx(
                'within-outline-theme-purple cursor-pointer rounded-full px-6 pb-2.5 pt-2 font-semibold shadow-sm',
                'border'
              )}
            >
              Browse file
              <input
                ref={fileInputRef}
                type="file"
                className="sr-only"
                accept=".pdf"
                onChange={onInputChange}
              />
            </label>
            {hasNonPdfFile && (
              <p className="mt-6 text-red-400">Only pdf file is supported</p>
            )}
          </>
        </div>
      </div>
    </div>
  )
}

const getFileSizeString = (fileSizeB: number) => {
  const fileSizeKB = fileSizeB / 1024
  const fileSizeMB = fileSizeKB / 1024
  if (fileSizeKB < 1000) {
    return fileSizeKB.toPrecision(3) + ' KB'
  } else {
    return fileSizeMB.toPrecision(3) + ' MB'
  }
}
