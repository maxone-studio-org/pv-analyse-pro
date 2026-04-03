import { useCallback, useRef, useState } from 'react'
import { useAppStore } from '../store'

export function CsvImport() {
  const loadFile = useAppStore((s) => s.loadFile)
  const importStep = useAppStore((s) => s.importStep)
  const resetImport = useAppStore((s) => s.resetImport)
  const [dragActive, setDragActive] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = useCallback(
    async (file: File) => {
      if (!file.name.endsWith('.csv')) {
        alert('Bitte eine CSV-Datei auswählen.')
        return
      }
      await loadFile(file)
    },
    [loadFile]
  )

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setDragActive(false)
      const file = e.dataTransfer.files[0]
      if (file) handleFile(file)
    },
    [handleFile]
  )

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(true)
  }, [])

  const onDragLeave = useCallback(() => setDragActive(false), [])

  const onFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) handleFile(file)
    },
    [handleFile]
  )

  if (importStep !== 'idle') {
    return (
      <div className="px-6 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
        <span className="text-sm text-gray-600">
          {importStep === 'mapping' ? 'Spalten-Mapping konfigurieren...' : 'Daten geladen'}
        </span>
        <button
          onClick={resetImport}
          className="text-sm text-red-600 hover:text-red-700 font-medium"
        >
          Neue Datei laden
        </button>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onClick={() => inputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-colors ${
          dragActive
            ? 'border-amber-400 bg-amber-50'
            : 'border-gray-300 hover:border-gray-400 bg-white'
        }`}
      >
        <svg className="w-12 h-12 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
        <p className="text-lg font-medium text-gray-700 mb-1">
          CSV-Datei hierher ziehen
        </p>
        <p className="text-sm text-gray-500">
          oder klicken zum Auswählen
        </p>
        <input
          ref={inputRef}
          type="file"
          accept=".csv"
          onChange={onFileSelect}
          className="hidden"
        />
      </div>
    </div>
  )
}
