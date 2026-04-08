import { useState } from 'react'
import { useAppStore } from '../store'
import type { SimulationParams } from '../types'

const PARAM_CONFIG: {
  key: keyof SimulationParams
  label: string
  unit: string
  min: number
  max: number
  step: number
  help: string
}[] = [
  {
    key: 'kapazitaet_kwh',
    label: 'Speicherkapazität',
    unit: 'kWh',
    min: 1, max: 100, step: 0.5,
    help: 'Die maximale Kapazität deines Speichers in Kilowattstunden. Steht im Datenblatt oder auf dem Gerät selbst.',
  },
  {
    key: 'entladetiefe_pct',
    label: 'Entladetiefe (DoD)',
    unit: '%',
    min: 50, max: 100, step: 1,
    help: 'Wie viel Prozent der Kapazität tatsächlich nutzbar sind. Bei den meisten Heimspeichern liegt das zwischen 80 und 90 Prozent.',
  },
  {
    key: 'ladewirkungsgrad_pct',
    label: 'Ladewirkungsgrad',
    unit: '%',
    min: 50, max: 100, step: 1,
    help: 'Verluste beim Laden des Speichers. Herstellerangabe — typischerweise 90 bis 95 Prozent.',
  },
  {
    key: 'entladewirkungsgrad_pct',
    label: 'Entladewirkungsgrad',
    unit: '%',
    min: 50, max: 100, step: 1,
    help: 'Verluste beim Entladen des Speichers. Gleicher Wert wie Ladewirkungsgrad, wenn keine separate Angabe vorhanden.',
  },
  {
    key: 'anfangs_soc_pct',
    label: 'Anfangs-Ladezustand',
    unit: '%',
    min: 0, max: 100, step: 1,
    help: 'Ladezustand des Speichers zu Beginn der Simulation. Im Zweifel 0% — das ist die konservativste und damit fairste Annahme.',
  },
]

export function SimulationConfig() {
  const params = useAppStore((s) => s.simulationParams)
  const setParam = useAppStore((s) => s.setSimulationParam)
  const importStep = useAppStore((s) => s.importStep)
  const [openHelp, setOpenHelp] = useState<string | null>(null)

  if (importStep !== 'done') return null

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4">
      <h2 className="text-sm font-semibold text-gray-900 mb-1">Speichersimulation</h2>
      <p className="text-xs text-gray-500 mb-3">
        Trage hier die Daten deines Speichers ein. Die Werte findest du im Datenblatt.
      </p>
      <div className="space-y-3">
        {PARAM_CONFIG.map(({ key, label, unit, min, max, step, help }) => (
          <div key={key}>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-1">
                <label className="text-xs text-gray-600">{label}</label>
                <button
                  onClick={() => setOpenHelp(openHelp === key ? null : key)}
                  className="text-gray-400 hover:text-amber-500 transition-colors"
                  title="Was bedeutet das?"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </button>
              </div>
              <span className="text-xs font-mono text-gray-900">
                {params[key]} {unit}
              </span>
            </div>
            {openHelp === key && (
              <p className="text-xs text-gray-500 bg-gray-50 rounded-lg px-3 py-2 mb-1.5 leading-relaxed">
                {help}
              </p>
            )}
            <input
              type="range"
              min={min}
              max={max}
              step={step}
              value={params[key]}
              onChange={(e) => setParam(key, parseFloat(e.target.value))}
              className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
              aria-label={`${label} in ${unit}`}
              aria-valuenow={params[key]}
              aria-valuemin={min}
              aria-valuemax={max}
              aria-valuetext={`${params[key]} ${unit}`}
            />
          </div>
        ))}
      </div>
      <p className="text-xs text-gray-400 mt-3">
        Die Simulation läuft über alle Tage — der Ladezustand wird von Tag zu Tag übernommen.
      </p>
    </div>
  )
}
