import { create } from 'zustand'
import type {
  ColumnMapping,
  DayData,
  DaySimulation,
  DstWarning,
  FileMetadata,
  SimulationParams,
} from '../types'
import { autoDetectMapping, parseCSVPreview, parseCSVWithMapping, validateMapping } from '../utils/csv'
import { processRawData } from '../utils/timezone'
import { runSimulation } from '../utils/simulation'
import { computeSHA256 } from '../utils/hash'

export type ImportStep = 'idle' | 'mapping' | 'done'

interface AppState {
  // CSV / Import
  importStep: ImportStep
  csvText: string | null
  csvHeaders: string[]
  csvPreview: string[][]
  columnMapping: ColumnMapping
  fileMetadata: FileMetadata | null

  // Processed data
  days: DayData[]
  importErrors: { line: number; message: string }[]
  dstWarnings: DstWarning[]

  // Simulation
  simulationParams: SimulationParams
  simulationResults: DaySimulation[]

  // UI
  selectedMonth: string | null // YYYY-MM
  selectedDay: string | null // YYYY-MM-DD
  inputIsUTC: boolean

  // Actions
  loadFile: (file: File) => Promise<void>
  setMapping: (field: string, csvColumn: string) => void
  confirmMapping: () => void
  resetImport: () => void
  setSimulationParam: <K extends keyof SimulationParams>(key: K, value: SimulationParams[K]) => void
  setSelectedMonth: (month: string) => void
  setSelectedDay: (day: string | null) => void
  setInputIsUTC: (isUTC: boolean) => void
}

export const useAppStore = create<AppState>((set, get) => ({
  // Initial state
  importStep: 'idle',
  csvText: null,
  csvHeaders: [],
  csvPreview: [],
  columnMapping: {},
  fileMetadata: null,
  days: [],
  importErrors: [],
  dstWarnings: [],
  simulationParams: {
    kapazitaet_kwh: 10,
    entladetiefe_pct: 90,
    ladewirkungsgrad_pct: 95,
    entladewirkungsgrad_pct: 95,
    anfangs_soc_pct: 0,
  },
  simulationResults: [],
  selectedMonth: null,
  selectedDay: null,
  inputIsUTC: false,

  loadFile: async (file: File) => {
    const [text, arrayBuffer] = await Promise.all([
      file.text(),
      file.arrayBuffer(),
    ])

    const sha256 = await computeSHA256(arrayBuffer)
    const { headers, preview } = parseCSVPreview(text)
    const mapping = autoDetectMapping(headers)

    set({
      csvText: text,
      csvHeaders: headers,
      csvPreview: preview,
      columnMapping: mapping,
      importStep: 'mapping',
      fileMetadata: {
        name: file.name,
        size: file.size,
        sha256,
        importTimestamp: new Date(),
      },
      // Reset previous data
      days: [],
      importErrors: [],
      dstWarnings: [],
      simulationResults: [],
      selectedMonth: null,
      selectedDay: null,
    })
  },

  setMapping: (field, csvColumn) => {
    set((s) => ({
      columnMapping: { ...s.columnMapping, [field]: csvColumn },
    }))
  },

  confirmMapping: () => {
    const { csvText, columnMapping, inputIsUTC, simulationParams } = get()
    if (!csvText) return

    const errors = validateMapping(columnMapping)
    if (errors.length > 0) {
      set({ importErrors: errors.map((e) => ({ line: 0, message: e })) })
      return
    }

    const { rows, errors: parseErrors } = parseCSVWithMapping(csvText, columnMapping)
    const { days, warnings } = processRawData(rows, inputIsUTC)

    // Auto-select first month
    const firstMonth = days.length > 0 ? days[0].date.substring(0, 7) : null

    // Run simulation
    const simulationResults = runSimulation(days, simulationParams)

    set({
      days,
      importErrors: parseErrors,
      dstWarnings: warnings,
      importStep: 'done',
      selectedMonth: firstMonth,
      simulationResults,
    })
  },

  resetImport: () => {
    set({
      importStep: 'idle',
      csvText: null,
      csvHeaders: [],
      csvPreview: [],
      columnMapping: {},
      fileMetadata: null,
      days: [],
      importErrors: [],
      dstWarnings: [],
      simulationResults: [],
      selectedMonth: null,
      selectedDay: null,
    })
  },

  setSimulationParam: (key, value) => {
    const state = get()
    const newParams = { ...state.simulationParams, [key]: value }
    const simulationResults = state.days.length > 0
      ? runSimulation(state.days, newParams)
      : []
    set({ simulationParams: newParams, simulationResults })
  },

  setSelectedMonth: (month) => set({ selectedMonth: month, selectedDay: null }),
  setSelectedDay: (day) => set({ selectedDay: day }),
  setInputIsUTC: (isUTC) => set({ inputIsUTC: isUTC }),
}))
