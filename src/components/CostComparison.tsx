import { useState, useMemo } from 'react'
import { useAppStore } from '../store'
import { calculateCostComparison } from '../utils/cost'
import type { CostParams } from '../types/cost'

const DEFAULT_PARAMS: CostParams = {
  kreditrate_eur_monat: 0,
  nachzahlung_eur_jahr: 0,
  wartung_eur_jahr: 0,
  einspeiseverguetung_ct_kwh: 8.2,
}

export function CostComparison() {
  const days = useAppStore((s) => s.days)
  const importStep = useAppStore((s) => s.importStep)
  const [params, setParams] = useState<CostParams>(DEFAULT_PARAMS)
  const [expanded, setExpanded] = useState(false)

  const results = useMemo(
    () => (days.length > 0 ? calculateCostComparison(days, params) : []),
    [days, params]
  )

  const totals = useMemo(() => {
    if (results.length === 0) return null
    return {
      anlage: results.reduce((s, r) => s + r.kosten_anlage_eur, 0),
      strom: results.reduce((s, r) => s + r.kosten_strom_eur, 0),
      differenz: results.reduce((s, r) => s + r.differenz_eur, 0),
    }
  }, [results])

  if (importStep !== 'done') return null

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between"
      >
        <h2 className="text-sm font-semibold text-gray-900">Kostenvergleich</h2>
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform ${expanded ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {!expanded && totals && (
        <p className={`text-xs mt-2 font-medium ${totals.differenz >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          {totals.differenz >= 0
            ? `Anlage ${totals.differenz.toFixed(0)} EUR günstiger als reiner Stromeinkauf`
            : `Stromeinkauf wäre ${Math.abs(totals.differenz).toFixed(0)} EUR günstiger gewesen`
          }
        </p>
      )}

      {expanded && (
        <div className="mt-3 space-y-4">
          <p className="text-xs text-gray-500">
            Vergleich: Was hat die Anlage gekostet vs. was hätte der Strom vom Versorger gekostet?
            Preise basieren auf BDEW-Durchschnittspreisen inkl. Strompreisbremse 2022/2023.
          </p>

          {/* Input fields */}
          <div className="space-y-2">
            <NumberInput
              label="Kreditrate (EUR/Monat)"
              help="Monatliche Rate für die PV-Anlage"
              value={params.kreditrate_eur_monat}
              onChange={(v) => setParams({ ...params, kreditrate_eur_monat: v })}
            />
            <NumberInput
              label="Nachzahlung Versorger (EUR/Jahr)"
              help="Jährliche Stromnachzahlung, z.B. 1.600 EUR"
              value={params.nachzahlung_eur_jahr}
              onChange={(v) => setParams({ ...params, nachzahlung_eur_jahr: v })}
            />
            <NumberInput
              label="Wartung & Reparatur (EUR/Jahr)"
              help="Jährliche Kosten für Wartung und Versicherung"
              value={params.wartung_eur_jahr}
              onChange={(v) => setParams({ ...params, wartung_eur_jahr: v })}
            />
            <NumberInput
              label="Einspeisevergütung (ct/kWh)"
              help="Vergütung für eingespeisten Strom — steht im Vertrag mit dem Netzbetreiber"
              value={params.einspeiseverguetung_ct_kwh}
              step={0.1}
              onChange={(v) => setParams({ ...params, einspeiseverguetung_ct_kwh: v })}
            />
          </div>

          {/* Results table */}
          {results.length > 0 && (
            <div className="overflow-x-auto">
              <table className="min-w-full text-xs">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-2 py-1.5 text-left font-medium text-gray-600">Jahr</th>
                    <th className="px-2 py-1.5 text-right font-medium text-gray-600">Anlage (EUR)</th>
                    <th className="px-2 py-1.5 text-right font-medium text-gray-600">Strom kaufen (EUR)</th>
                    <th className="px-2 py-1.5 text-right font-medium text-gray-600">Differenz</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((r) => (
                    <tr key={r.year} className="border-b border-gray-100">
                      <td className="px-2 py-1 font-medium">{r.year}</td>
                      <td className="px-2 py-1 text-right">{r.kosten_anlage_eur.toFixed(0)}</td>
                      <td className="px-2 py-1 text-right">{r.kosten_strom_eur.toFixed(0)}</td>
                      <td className={`px-2 py-1 text-right font-medium ${r.differenz_eur >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {r.differenz_eur >= 0 ? '+' : ''}{r.differenz_eur.toFixed(0)}
                      </td>
                    </tr>
                  ))}
                  {totals && (
                    <tr className="border-t-2 border-gray-300 font-semibold">
                      <td className="px-2 py-1.5">Gesamt</td>
                      <td className="px-2 py-1.5 text-right">{totals.anlage.toFixed(0)}</td>
                      <td className="px-2 py-1.5 text-right">{totals.strom.toFixed(0)}</td>
                      <td className={`px-2 py-1.5 text-right ${totals.differenz >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {totals.differenz >= 0 ? '+' : ''}{totals.differenz.toFixed(0)}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Explanation */}
          {totals && (
            <div className={`p-3 rounded-lg text-xs ${totals.differenz >= 0 ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
              {totals.differenz >= 0 ? (
                <p>
                  <span className="font-semibold">Ergebnis:</span> Die Anlage war insgesamt{' '}
                  {totals.differenz.toFixed(0)} EUR günstiger als reiner Stromeinkauf vom Versorger.
                  Für deine Gesamtkosten von {totals.anlage.toFixed(0)} EUR hättest du{' '}
                  {(totals.strom / (results[0]?.strompreis_ct / 100 || 1)).toFixed(0)} kWh
                  Strom kaufen können.
                </p>
              ) : (
                <p>
                  <span className="font-semibold">Ergebnis:</span> Reiner Stromeinkauf wäre{' '}
                  {Math.abs(totals.differenz).toFixed(0)} EUR günstiger gewesen.
                  Die Anlage hat {totals.anlage.toFixed(0)} EUR gekostet,
                  der Strom hätte nur {totals.strom.toFixed(0)} EUR gekostet.
                </p>
              )}
            </div>
          )}

          <p className="text-xs text-gray-400">
            Strompreise: BDEW-Durchschnittspreise Haushaltsstrom (brutto).
            2022/2023: Strompreisbremse max. 40 ct/kWh berücksichtigt.
          </p>
        </div>
      )}
    </div>
  )
}

function NumberInput({
  label,
  help,
  value,
  step = 1,
  onChange,
}: {
  label: string
  help: string
  value: number
  step?: number
  onChange: (v: number) => void
}) {
  return (
    <div>
      <label className="block text-xs text-gray-600 mb-0.5">{label}</label>
      <input
        type="number"
        min={0}
        step={step}
        value={value || ''}
        onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
        placeholder="0"
        className="w-full rounded-lg border border-gray-300 px-3 py-1.5 text-sm"
      />
      <p className="text-xs text-gray-400 mt-0.5">{help}</p>
    </div>
  )
}
