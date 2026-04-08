import { useMemo, useState } from 'react'
import { Line, Bar } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js'
import { toZonedTime } from 'date-fns-tz'
import { useAppStore } from '../store'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler)

const TZ = 'Europe/Berlin'

export function DayDetailModal() {
  const selectedDay = useAppStore((s) => s.selectedDay)
  const setSelectedDay = useAppStore((s) => s.setSelectedDay)
  const days = useAppStore((s) => s.days)
  const simulationResults = useAppStore((s) => s.simulationResults)
  const simulationParams = useAppStore((s) => s.simulationParams)

  const [showBeladung, setShowBeladung] = useState(false)
  const [showEntladung, setShowEntladung] = useState(false)
  const [showSocPct, setShowSocPct] = useState(true)

  const dayData = useMemo(
    () => days.find((d) => d.date === selectedDay),
    [days, selectedDay]
  )

  const simData = useMemo(
    () => simulationResults.find((d) => d.date === selectedDay),
    [simulationResults, selectedDay]
  )

  const dayIndex = useMemo(
    () => simulationResults.findIndex((d) => d.date === selectedDay),
    [simulationResults, selectedDay]
  )

  if (!selectedDay || !dayData) return null

  const formatDate = (dateStr: string) => {
    const [y, m, d] = dateStr.split('-')
    return `${d}.${m}.${y}`
  }

  const isFirstDay = dayIndex === 0
  const socStartPct = simData
    ? (simData.soc_start_kwh / simulationParams.kapazitaet_kwh) * 100
    : 0

  const labels = dayData.intervals.map((i) => {
    const berlin = toZonedTime(i.timestamp, TZ)
    return `${String(berlin.getHours()).padStart(2, '0')}:${String(berlin.getMinutes()).padStart(2, '0')}`
  })

  const socChartData = simData
    ? {
        labels,
        datasets: [
          {
            label: 'SoC (kWh)',
            data: simData.intervals.map((i) => i.soc_kwh),
            borderColor: '#f59e0b',
            backgroundColor: 'rgba(245, 158, 11, 0.1)',
            fill: true,
            tension: 0.3,
            pointRadius: 0,
          },
        ],
      }
    : null

  const evChartData = {
    labels,
    datasets: [
      {
        label: 'Erzeugung (kWh)',
        data: dayData.intervals.map((i) => i.erzeugung_kwh),
        backgroundColor: 'rgba(34, 197, 94, 0.7)',
      },
      {
        label: 'Verbrauch (kWh)',
        data: dayData.intervals.map((i) => i.verbrauch_kwh),
        backgroundColor: 'rgba(239, 68, 68, 0.7)',
      },
    ],
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'top' as const } },
    scales: { x: { ticks: { maxTicksLimit: 6 } } },
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Tagesdetail: {formatDate(selectedDay)}
            </h2>
            {/* SoC Carry-Over hint */}
            {simData && (
              <p className="text-xs text-gray-500 mt-1">
                {isFirstDay
                  ? `Startladung: ${socStartPct.toFixed(0)}% (konfigurierter Anfangs-SoC)`
                  : `Startladung: ${socStartPct.toFixed(0)}% (vom Vortag übernommen)`
                }
              </p>
            )}
          </div>
          <button
            onClick={() => setSelectedDay(null)}
            className="p-2 rounded-lg hover:bg-gray-100"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Summary cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <SummaryCard label="Erzeugung" value={dayData.totals.erzeugung_kwh} unit="kWh" color="green" />
            <SummaryCard label="Verbrauch" value={dayData.totals.verbrauch_kwh} unit="kWh" color="red" />
            <SummaryCard label="Einspeisung" value={dayData.totals.einspeisung_kwh} unit="kWh" color="blue" />
            <SummaryCard label="Netzbezug" value={dayData.totals.netzbezug_kwh} unit="kWh" color="orange" />
          </div>

          {simData && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <SummaryCard label="Sp. geladen" value={simData.totals.geladen_kwh} unit="kWh" color="amber" />
              <SummaryCard label="Sp. entladen" value={simData.totals.entladen_kwh} unit="kWh" color="amber" />
              <SummaryCard label="Netzbezug sim." value={simData.totals.netzbezug_sim_kwh} unit="kWh" color="purple" />
              <SummaryCard label="SoC Min/Max" value={`${simData.totals.soc_min_kwh.toFixed(2)} / ${simData.totals.soc_max_kwh.toFixed(2)}`} unit="kWh" color="gray" />
            </div>
          )}

          {/* Charts */}
          {socChartData && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">SoC-Verlauf (simuliert)</h3>
              <div className="h-64">
                <Line data={socChartData} options={chartOptions} />
              </div>
            </div>
          )}

          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Erzeugung vs. Verbrauch</h3>
            <div className="h-64">
              <Bar data={evChartData} options={chartOptions} />
            </div>
          </div>

          {/* Interval table with toggle columns */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-gray-700">Messwerte</h3>
              {simData && (
                <div className="flex gap-3 text-xs">
                  <ToggleChip label="Speicher %" active={showSocPct} onToggle={() => setShowSocPct(!showSocPct)} />
                  <ToggleChip label="Beladung" active={showBeladung} onToggle={() => setShowBeladung(!showBeladung)} />
                  <ToggleChip label="Entladung" active={showEntladung} onToggle={() => setShowEntladung(!showEntladung)} />
                </div>
              )}
            </div>
            <div className="overflow-x-auto max-h-64 overflow-y-auto">
              <table className="min-w-full text-xs">
                <thead className="sticky top-0 bg-gray-50">
                  <tr>
                    <th className="px-2 py-1.5 text-left font-medium text-gray-600">Zeit</th>
                    <th className="px-2 py-1.5 text-right font-medium text-gray-600">Erzeugung</th>
                    <th className="px-2 py-1.5 text-right font-medium text-gray-600">Verbrauch</th>
                    <th className="px-2 py-1.5 text-right font-medium text-gray-600">Einspeisung</th>
                    <th className="px-2 py-1.5 text-right font-medium text-gray-600">Netzbezug</th>
                    {simData && showSocPct && (
                      <th className="px-2 py-1.5 text-right font-medium text-amber-600">Speicher %</th>
                    )}
                    {simData && showBeladung && (
                      <th className="px-2 py-1.5 text-right font-medium text-green-600">Beladung</th>
                    )}
                    {simData && showEntladung && (
                      <th className="px-2 py-1.5 text-right font-medium text-red-600">Entladung</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {dayData.intervals.map((interval, i) => {
                    const berlin = toZonedTime(interval.timestamp, TZ)
                    const time = `${String(berlin.getHours()).padStart(2, '0')}:${String(berlin.getMinutes()).padStart(2, '0')}`
                    const sim = simData?.intervals[i]
                    const socPct = sim ? (sim.soc_kwh / simulationParams.kapazitaet_kwh) * 100 : 0
                    return (
                      <tr key={i} className="border-b border-gray-100">
                        <td className="px-2 py-1 font-mono">{time}</td>
                        <td className="px-2 py-1 text-right">{interval.erzeugung_kwh.toFixed(2)}</td>
                        <td className="px-2 py-1 text-right">{interval.verbrauch_kwh.toFixed(2)}</td>
                        <td className="px-2 py-1 text-right">{interval.einspeisung_kwh.toFixed(2)}</td>
                        <td className="px-2 py-1 text-right">{interval.netzbezug_kwh.toFixed(2)}</td>
                        {simData && showSocPct && (
                          <td className="px-2 py-1 text-right font-medium text-amber-600">
                            {socPct.toFixed(1)}%
                          </td>
                        )}
                        {simData && showBeladung && (
                          <td className="px-2 py-1 text-right text-green-600">
                            {sim?.geladen_kwh.toFixed(3)}
                          </td>
                        )}
                        {simData && showEntladung && (
                          <td className="px-2 py-1 text-right text-red-600">
                            {sim?.entladen_kwh.toFixed(3)}
                          </td>
                        )}
                      </tr>
                    )
                  })}
                  {/* Day totals row */}
                  {simData && (showBeladung || showEntladung || showSocPct) && (
                    <tr className="border-t-2 border-gray-300 font-semibold bg-gray-50">
                      <td className="px-2 py-1.5">Summe</td>
                      <td className="px-2 py-1.5 text-right">{dayData.totals.erzeugung_kwh.toFixed(2)}</td>
                      <td className="px-2 py-1.5 text-right">{dayData.totals.verbrauch_kwh.toFixed(2)}</td>
                      <td className="px-2 py-1.5 text-right">{dayData.totals.einspeisung_kwh.toFixed(2)}</td>
                      <td className="px-2 py-1.5 text-right">{dayData.totals.netzbezug_kwh.toFixed(2)}</td>
                      {showSocPct && (
                        <td className="px-2 py-1.5 text-right text-amber-600">
                          {((simData.intervals.at(-1)?.soc_kwh ?? 0) / simulationParams.kapazitaet_kwh * 100).toFixed(1)}%
                        </td>
                      )}
                      {showBeladung && (
                        <td className="px-2 py-1.5 text-right text-green-600">
                          {simData.totals.geladen_kwh.toFixed(3)}
                        </td>
                      )}
                      {showEntladung && (
                        <td className="px-2 py-1.5 text-right text-red-600">
                          {simData.totals.entladen_kwh.toFixed(3)}
                        </td>
                      )}
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function ToggleChip({ label, active, onToggle }: { label: string; active: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className={`px-2 py-0.5 rounded-full border text-xs transition-colors ${
        active
          ? 'bg-amber-100 border-amber-300 text-amber-800'
          : 'bg-gray-50 border-gray-200 text-gray-500 hover:border-gray-300'
      }`}
    >
      {label}
    </button>
  )
}

function SummaryCard({
  label,
  value,
  unit,
  color,
}: {
  label: string
  value: number | string
  unit: string
  color: string
}) {
  const colorClasses: Record<string, string> = {
    green: 'bg-green-50 text-green-700',
    red: 'bg-red-50 text-red-700',
    blue: 'bg-blue-50 text-blue-700',
    orange: 'bg-orange-50 text-orange-700',
    amber: 'bg-amber-50 text-amber-700',
    purple: 'bg-purple-50 text-purple-700',
    gray: 'bg-gray-50 text-gray-700',
  }

  const formatted = typeof value === 'number' ? value.toFixed(2) : value

  return (
    <div className={`rounded-lg p-3 ${colorClasses[color] ?? colorClasses.gray}`}>
      <p className="text-xs font-medium opacity-75">{label}</p>
      <p className="text-lg font-semibold">
        {formatted} <span className="text-xs font-normal">{unit}</span>
      </p>
    </div>
  )
}
