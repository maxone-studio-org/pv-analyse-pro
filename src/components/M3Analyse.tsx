/**
 * M3Analyse — lazy-loadable wrapper for the CSV analysis step.
 * Keeps jsPDF, chart.js and all analysis components out of the initial bundle.
 */
import { CsvImport } from './CsvImport'
import { ColumnMapping } from './ColumnMapping'
import { ImportWarnings } from './ImportWarnings'
import { GapWarnings } from './GapWarnings'
import { SimulationConfig } from './SimulationConfig'
import { Calendar } from './Calendar'
import { MonthSummary } from './MonthSummary'
import { DayDetailModal } from './DayDetailModal'
import { ExportPanel } from './ExportPanel'
import { LandingBanner } from './LandingBanner'
import { CostComparison } from './CostComparison'
import { AllMonthsOverview } from './AllMonthsOverview'
import { DataIntegrityPanel } from './DataIntegrityPanel'
import { useAppStore } from '../store'

interface Props {
  onLandingOpen: () => void
  onPdfExported: () => void
}

export function M3Analyse({ onLandingOpen, onPdfExported }: Props) {
  const importStep   = useAppStore((s) => s.importStep)
  const rehydrating  = useAppStore((s) => s.rehydrating)
  const persistError = useAppStore((s) => s.persistError)

  return (
    <>
      {persistError && (
        <div className="px-6 py-2">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-2 flex items-center justify-between">
            <p className="text-xs text-yellow-800">{persistError}</p>
            <button
              onClick={() => useAppStore.setState({ persistError: null })}
              className="text-yellow-600 hover:text-yellow-800 text-xs font-medium ml-4"
            >
              OK
            </button>
          </div>
        </div>
      )}

      {rehydrating && (
        <div className="px-6 py-8 text-center">
          <div className="inline-flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-lg px-6 py-3">
            <svg className="w-5 h-5 text-amber-500 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <span className="text-sm text-amber-800 font-medium">Gespeicherte Daten werden geladen...</span>
          </div>
        </div>
      )}

      <CsvImport />
      {importStep === 'idle' && <LandingBanner onOpen={onLandingOpen} />}
      <ColumnMapping />

      {importStep === 'done' && (
        <div className="px-6 py-4 space-y-4">
          <ImportWarnings />
          <GapWarnings />
          <DataIntegrityPanel />

          <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] lg:grid-cols-[280px_1fr] gap-4">
            <div className="space-y-4">
              <SimulationConfig />
              <CostComparison />
              <ExportPanel onPdfExported={onPdfExported} />
            </div>
            <div className="space-y-4">
              <AllMonthsOverview />
              <Calendar />
              <MonthSummary />
            </div>
          </div>
        </div>
      )}

      <DayDetailModal />
    </>
  )
}
