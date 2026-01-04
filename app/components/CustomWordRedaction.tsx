import { useState, KeyboardEvent } from 'react'
import { XMarkIcon } from '@heroicons/react/24/outline'

interface CustomWordRedactionProps {
  onWordsChange: (words: string[]) => void
}

export default function CustomWordRedaction({
  onWordsChange,
}: CustomWordRedactionProps) {
  const [inputValue, setInputValue] = useState('')
  const [customWords, setCustomWords] = useState<string[]>([])

  const addWord = () => {
    const trimmedWord = inputValue.trim()
    if (trimmedWord && !customWords.includes(trimmedWord)) {
      const updatedWords = [...customWords, trimmedWord]
      setCustomWords(updatedWords)
      onWordsChange(updatedWords)
      setInputValue('')
    }
  }

  const removeWord = (wordToRemove: string) => {
    const updatedWords = customWords.filter((word) => word !== wordToRemove)
    setCustomWords(updatedWords)
    onWordsChange(updatedWords)
  }

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addWord()
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="Enter word to redact"
          className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
        />
        <button
          type="button"
          onClick={addWord}
          className="rounded-md bg-teal-500 px-4 py-2 text-sm font-semibold text-white transition-colors duration-200 hover:bg-teal-600"
        >
          Add
        </button>
      </div>

      {customWords.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {customWords.map((word) => (
            <div
              key={word}
              className="flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-sm"
            >
              <span className="text-gray-700">{word}</span>
              <button
                type="button"
                onClick={() => removeWord(word)}
                className="rounded-full p-0.5 text-gray-400 transition-colors hover:bg-gray-200 hover:text-gray-600"
                title={`Remove "${word}"`}
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {customWords.length === 0 && (
        <p className="text-sm text-gray-400">No custom words added yet</p>
      )}
    </div>
  )
}
