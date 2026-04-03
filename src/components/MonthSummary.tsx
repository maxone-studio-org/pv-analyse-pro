import { useMemo } from 'react'
import { useAppStore } from '../store'

export function MonthSummary() {
  const days = useAppStore((s) => s.days)
  const simulationResults = useAppStore((s) => s.simulationResults)
  const selectedMonth = useAppStore((s) => s.selectedMonth)
  const importStep = useAppStore((s) => s.importStep)

  const summary = useMemo(() => {
    if (!selectedMonth) return null

    const monthDays = days.filter((d) => d.date.startsWith(selectedMonth))
    const monthSim = simulationResults.filter((d) => d.date.startsWith(selectedMonth))

    if (monthDays.length === 0) return null

    const totals = {
      erzeugung: monthDays.reduce((s, d) => s + d.totals.erzeugung_kwh, 0),
      verbrauch: monthDays.reduce((s, d) => s + d.totals.verbrauch_kwh, 0),
      einspeisung: monthDays.reduce((s, d) => s + d.totals.einspeisung_kwh, 0),
      netzbezug: monthDays.reduce((s, d) => s + d.totals.netzbezug_kwh, 0),
      geladen: monthSim.reduce((s, d) => s + d.totals.geladen_kwh, 0),
      entladen: monthSim.reduce((s, d) => s + d.totals.entladen_kwh, 0),
      netzbezugSim: monthSim.reduce((s, d) => s + d.totals.netzbezug_sim_kwh, 0),
      tage: monthDays.length,
    }

    const autarkieOhne = totals.verbrauch > 0
      ? ((totals.verbrauch - totals.netzbezug) / totals.verbrauch) * 100
      : 0
    const autarkieMit = totals.verbrauch > 0
      ? ((totals.verbrauch - totals.netzbezugSim) / totals.verbrauch) * 100
      : 0

    return { ...totals, autarkieOhne, autarkieMit }
  }, [days, simulationResults, selectedMonth])

  if (importStep !== 'done' || !summary) return null

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Monatszusammenfassung ({summary.tage} Tage)
      </h2>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-3 py-2 text-left font-medium text-gray-600">Kennzahl</th>
              <th className="px-3 py-2 text-right font-medium text-gray-600">Ist</th>
              <th className="px-3 py-2 text-right font-medium text-gray-600">Simuliert</th>
            </tr>
          </thead>
          <tbody>
            <Row label="Erzeugung" ist={summary.erzeugung} />
            <Row label="Verbrauch" ist={summary.verbrauch} />
            <Row label="Einspeisung" ist={summary.einspeisung} />
            <Row label="Netzbezug" ist={summary.netzbezug} sim={summary.netzbezugSim} />
            <Row label="Sp. geladen" sim={summary.geladen} />
            <Row label="Sp. entladen" sim={summary.entladen} />
            <tr className="border-t-2 border-gray-300 bg-amber-50">
              <td className="px-3 py-2 font-semibold text-amber-800">Ersparnis Netzbezug</td>
              <td className="px-3 py-2 text-right">—</td>
              <td className="px-3 py-2 text-right font-semibold text-amber-600">
                {(summary.netzbezug - summary.netzbezugSim).toFixed(2)} kWh
              </td>
            </tr>
            <tr className="border-gray-300">
              <td className="px-3 py-2 font-medium">Autarkiegrad</td>
              <td className="px-3 py-2 text-right">{summary.autarkieOhne.toFixed(1)} %</td>
              <td className="px-3 py-2 text-right font-semibold text-amber-600">
                {summary.autarkieMit.toFixed(1)} %
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}

function Row({ label, ist, sim }: { label: string; ist?: number; sim?: number }) {
  return (
    <tr className="border-b border-gray-100">
      <td className="px-3 py-2 text-gray-700">{label}</td>
      <td className="px-3 py-2 text-right font-mono">
        {ist !== undefined ? `${ist.toFixed(2)} kWh` : '—'}
      </td>
      <td className="px-3 py-2 text-right font-mono">
        {sim !== undefined ? `${sim.toFixed(2)} kWh` : '—'}
      </td>
    </tr>
  )
}
