import { useCallback, useRef, useState } from 'react'
import { useAppStore } from '../store'

export function CsvImport() {
  const loadFiles = useAppStore((s) => s.loadFiles)
  const importStep = useAppStore((s) => s.importStep)
  const rehydrating = useAppStore((s) => s.rehydrating)
  const resetImport = useAppStore((s) => s.resetImport)
  const fileCount = useAppStore((s) => s.fileMetadataList.length)
  const [dragActive, setDragActive] = useState(false)
  const [loading, setLoading] = useState(false)
  const [fileError, setFileError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFiles = useCallback(
    async (fileList: FileList) => {
      setFileError('')
      const csvFiles = Array.from(fileList).filter((f) => f.name.endsWith('.csv'))
      if (csvFiles.length === 0) {
        setFileError('Bitte mindestens eine CSV-Datei auswählen.')
        return
      }
      setLoading(true)
      try {
        await loadFiles(csvFiles)
      } finally {
        setLoading(false)
      }
    },
    [loadFiles]
  )

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setDragActive(false)
      if (e.dataTransfer.files.length > 0) handleFiles(e.dataTransfer.files)
    },
    [handleFiles]
  )

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(true)
  }, [])

  const onDragLeave = useCallback(() => setDragActive(false), [])

  const onFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) handleFiles(e.target.files)
    },
    [handleFiles]
  )

  if (rehydrating) return null

  if (importStep !== 'idle') {
    return (
      <div className="px-6 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
        <span className="text-sm text-gray-600">
          {importStep === 'mapping'
            ? `Spalten-Mapping konfigurieren (${fileCount} ${fileCount === 1 ? 'Datei' : 'Dateien'})...`
            : importStep === 'processing'
            ? `Daten werden verarbeitet (${fileCount} ${fileCount === 1 ? 'Datei' : 'Dateien'})...`
            : `Daten geladen (${fileCount} ${fileCount === 1 ? 'Datei' : 'Dateien'})`}
        </span>
        <button
          onClick={resetImport}
          className="text-sm text-red-600 hover:text-red-700 font-medium"
        >
          Neue Dateien laden
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
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
          dragActive
            ? 'border-amber-400 bg-amber-50'
            : 'border-gray-300 hover:border-gray-400 bg-white'
        }`}
      >
        <svg className="w-10 h-10 mx-auto text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
        <p className="text-base font-medium text-gray-700 mb-1">
          Wechselrichter-Exportdaten hochladen
        </p>
        <p className="text-sm text-gray-500 mb-4">
          Ziehe deine CSV-Dateien hierher oder klicke zum Auswählen
        </p>
        {loading ? (
          <div className="flex items-center justify-center gap-2 mt-2">
            <svg className="w-5 h-5 text-amber-500 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <span className="text-sm text-amber-700 font-medium">Dateien werden verarbeitet...</span>
          </div>
        ) : (
          <p className="text-xs text-gray-400 max-w-lg mx-auto leading-relaxed">
            Die Exportdaten findest du im Online-Portal deines Herstellers
            (SMA Sunny Portal, Fronius Solar.web, Huawei FusionSolar, SENEC, Kostal Solar Portal).
            Exportiere die Messdaten als CSV-Datei — am besten für den gesamten Zeitraum des Schadens.
            Du kannst auch mehrere Dateien gleichzeitig hochladen.
          </p>
        )}

        {fileError && (
          <div className="mt-3 px-4 py-2 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700">{fileError}</p>
          </div>
        )}

        <input
          ref={inputRef}
          type="file"
          accept=".csv"
          multiple
          onChange={onFileSelect}
          className="hidden"
          aria-label="CSV-Dateien auswählen"
        />
      </div>
    </div>
  )
}
