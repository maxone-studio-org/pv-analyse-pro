interface Props {
  duplicateCount: number
  totalCount: number
  isFullDuplicate: boolean
  fileName: string
  onImportNew: () => void
  onReplaceAll: () => void
  onCancel: () => void
}

export function DuplicateDialog({
  duplicateCount,
  totalCount,
  isFullDuplicate,
  fileName,
  onImportNew,
  onReplaceAll,
  onCancel,
}: Props) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
            <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {isFullDuplicate ? 'Datei bereits importiert' : 'Überlappende Daten erkannt'}
            </h3>
            <p className="text-sm text-gray-500 mt-1 font-mono">{fileName}</p>
          </div>
        </div>

        <div className="mb-6">
          {isFullDuplicate ? (
            <p className="text-sm text-gray-600">
              Diese Datei wurde bereits vollständig importiert.
              Alle {totalCount} Einträge sind schon vorhanden.
            </p>
          ) : (
            <p className="text-sm text-gray-600">
              {duplicateCount} von {totalCount} Einträgen sind bereits vorhanden.
              {totalCount - duplicateCount} neue Einträge wurden gefunden.
            </p>
          )}
        </div>

        <div className="space-y-2">
          {!isFullDuplicate && (
            <button
              onClick={onImportNew}
              className="w-full bg-amber-500 hover:bg-amber-600 text-white font-medium py-2.5 rounded-lg transition-colors text-sm"
            >
              Nur neue Einträge importieren ({totalCount - duplicateCount})
            </button>
          )}
          <button
            onClick={onReplaceAll}
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2.5 rounded-lg transition-colors text-sm"
          >
            {isFullDuplicate ? 'Trotzdem ersetzen' : 'Alle ersetzen'}
          </button>
          <button
            onClick={onCancel}
            className="w-full text-gray-500 hover:text-gray-700 font-medium py-2 text-sm transition-colors"
          >
            Abbrechen
          </button>
        </div>
      </div>
    </div>
  )
}
