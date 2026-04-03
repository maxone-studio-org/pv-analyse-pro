import { useAppStore } from '../store'
import type { SimulationParams } from '../types'

const PARAM_CONFIG: {
  key: keyof SimulationParams
  label: string
  unit: string
  min: number
  max: number
  step: number
}[] = [
  { key: 'kapazitaet_kwh', label: 'Speicherkapazität', unit: 'kWh', min: 1, max: 100, step: 0.5 },
  { key: 'entladetiefe_pct', label: 'Entladetiefe (DoD)', unit: '%', min: 50, max: 100, step: 1 },
  { key: 'ladewirkungsgrad_pct', label: 'Ladewirkungsgrad', unit: '%', min: 50, max: 100, step: 1 },
  { key: 'entladewirkungsgrad_pct', label: 'Entladewirkungsgrad', unit: '%', min: 50, max: 100, step: 1 },
  { key: 'anfangs_soc_pct', label: 'Anfangs-SoC', unit: '%', min: 0, max: 100, step: 1 },
]

export function SimulationConfig() {
  const params = useAppStore((s) => s.simulationParams)
  const setParam = useAppStore((s) => s.setSimulationParam)
  const importStep = useAppStore((s) => s.importStep)

  if (importStep !== 'done') return null

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4">
      <h2 className="text-sm font-semibold text-gray-900 mb-3">Speichersimulation</h2>
      <div className="space-y-3">
        {PARAM_CONFIG.map(({ key, label, unit, min, max, step }) => (
          <div key={key}>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs text-gray-600">{label}</label>
              <span className="text-xs font-mono text-gray-900">
                {params[key]} {unit}
              </span>
            </div>
            <input
              type="range"
              min={min}
              max={max}
              step={step}
              value={params[key]}
              onChange={(e) => setParam(key, parseFloat(e.target.value))}
              className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
            />
          </div>
        ))}
      </div>
    </div>
  )
}
