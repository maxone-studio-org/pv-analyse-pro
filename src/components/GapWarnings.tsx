import { useState, useMemo } from 'react'
import { useAppStore } from '../store'
import type { DataGap } from '../types'

const MONTH_NAMES = [
  'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
  'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember',
]

export function GapWarnings() {
  const dataGaps = useAppStore((s) => s.dataGaps)
  const overlapSummaries = useAppStore((s) => s.overlapSummaries)
  const fileMetadataList = useAppStore((s) => s.fileMetadataList)
  const importStep = useAppStore((s) => s.importStep)

  const [expandedSection, setExpandedSection] = useState<'days' | 'intervals' | null>(null)

  if (importStep !== 'done') return null

  const totalOverlaps = overlapSummaries.reduce((s, o) => s + o.count, 0)
  if (dataGaps.length === 0 && totalOverlaps === 0) return null

  const missingDays = dataGaps.filter((g) => g.type === 'missing_days')
  const missingIntervals = dataGaps.filter((g) => g.type === 'missing_intervals')
  const totalGapHours = dataGaps.reduce((s, g) => s + g.durationHours, 0)

  const fileName = (idx: number) => fileMetadataList[idx]?.name ?? `Datei ${idx + 1}`
  const fileHash = (idx: number) => fileMetadataList[idx]?.sha256.substring(0, 12) ?? '???'

  return (
    <div className="space-y-2">
      {/* Summary banner */}
      <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3">
        <div className="flex items-start gap-2">
          <svg className="w-5 h-5 text-red-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <div>
            <p className="text-sm font-semibold text-red-800">
              In deinen Daten fehlen Zeiträume
            </p>
            <p className="text-xs text-red-700 mt-0.5">
              {dataGaps.length} Lücke{dataGaps.length !== 1 ? 'n' : ''} erkannt
              {totalOverlaps > 0 && `, ${totalOverlaps} Überlappung${totalOverlaps !== 1 ? 'en' : ''} bereinigt`}.
              {dataGaps.length > 0 && ` Insgesamt ${formatTotalHours(totalGapHours)} ohne Daten.`}
              {' '}Das kann passieren wenn der Wechselrichter offline war oder der Export unvollständig ist.
              Diese Lücken sind im PDF dokumentiert — dein Anwalt sollte wissen, dass für diese Zeiträume keine Simulation möglich war.
            </p>
          </div>
        </div>
      </div>

      {/* Missing days — collapsible */}
      {missingDays.length > 0 && (
        <CollapsibleSection
          title={`Fehlende Tage (${missingDays.length})`}
          color="red"
          expanded={expandedSection === 'days'}
          onToggle={() => setExpandedSection(expandedSection === 'days' ? null : 'days')}
        >
          <ul className="text-xs text-red-700 space-y-0.5">
            {missingDays.map((g, i) => (
              <li key={i} className="flex items-center gap-1.5">
                <span className="w-1 h-1 rounded-full bg-red-400 shrink-0" />
                {g.message}
              </li>
            ))}
          </ul>
        </CollapsibleSection>
      )}

      {/* Missing intervals — collapsible, grouped by month */}
      {missingIntervals.length > 0 && (
        <CollapsibleSection
          title={`Fehlende Intervalle (${missingIntervals.length})`}
          color="orange"
          expanded={expandedSection === 'intervals'}
          onToggle={() => setExpandedSection(expandedSection === 'intervals' ? null : 'intervals')}
        >
          <GroupedIntervalList gaps={missingIntervals} />
        </CollapsibleSection>
      )}

      {/* Overlaps — per file pair with names and hashes */}
      {overlapSummaries.map((os, i) => (
        <div key={i} className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-2.5">
          <p className="text-xs text-blue-800">
            <span className="font-semibold">{os.count} Überlappung{os.count !== 1 ? 'en' : ''}</span> zwischen{' '}
            <span className="font-mono">{fileName(os.fileIndexA)}</span> ({fileHash(os.fileIndexA)}...) und{' '}
            <span className="font-mono">{fileName(os.fileIndexB)}</span> ({fileHash(os.fileIndexB)}...).
          </p>
          <p className="text-xs text-blue-700 mt-0.5">
            Vorrang: <span className="font-semibold">{fileName(os.fileIndexA)}</span> (zuerst hochgeladen).
          </p>
        </div>
      ))}
    </div>
  )
}

/** Collapsible section with toggle */
function CollapsibleSection({
  title,
  color,
  expanded,
  onToggle,
  children,
}: {
  title: string
  color: 'red' | 'orange'
  expanded: boolean
  onToggle: () => void
  children: React.ReactNode
}) {
  const colors = {
    red: { bg: 'bg-red-50/50', border: 'border-red-100', text: 'text-red-800', chevron: 'text-red-400' },
    orange: { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-800', chevron: 'text-orange-400' },
  }
  const c = colors[color]

  return (
    <div className={`${c.bg} border ${c.border} rounded-lg`}>
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-2.5"
      >
        <p className={`text-xs font-semibold ${c.text}`}>{title}</p>
        <svg
          className={`w-3.5 h-3.5 ${c.chevron} transition-transform ${expanded ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {expanded && (
        <div className="px-4 pb-3 max-h-64 overflow-y-auto">
          {children}
        </div>
      )}
    </div>
  )
}

/** Group gaps by YYYY-MM and display with month headers */
function GroupedIntervalList({ gaps }: { gaps: DataGap[] }) {
  const grouped = useMemo(() => {
    const map = new Map<string, DataGap[]>()
    for (const gap of gaps) {
      // Extract date from message (dd.MM.yyyy format at start)
      const match = gap.message.match(/^(\d{2})\.(\d{2})\.(\d{4})/)
      const key = match ? `${match[3]}-${match[2]}` : 'unknown'
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(gap)
    }
    return [...map.entries()].sort(([a], [b]) => a.localeCompare(b))
  }, [gaps])

  return (
    <div className="space-y-2">
      {grouped.map(([monthKey, monthGaps]) => {
        const [year, month] = monthKey.split('-')
        const monthName = MONTH_NAMES[parseInt(month) - 1] ?? month
        const totalMinutes = monthGaps.reduce((s, g) => s + g.durationHours * 60, 0)

        return (
          <div key={monthKey}>
            <p className="text-xs font-medium text-orange-700 mb-0.5">
              {monthName} {year}
              <span className="font-normal text-orange-500 ml-1">
                — {monthGaps.length} Lücke{monthGaps.length !== 1 ? 'n' : ''}, {formatDuration(totalMinutes)}
              </span>
            </p>
            <ul className="text-xs text-orange-700 space-y-0.5 ml-2">
              {monthGaps.map((g, i) => (
                <li key={i} className="flex items-center gap-1.5">
                  <span className="w-1 h-1 rounded-full bg-orange-400 shrink-0" />
                  {g.message}
                </li>
              ))}
            </ul>
          </div>
        )
      })}
    </div>
  )
}

function formatTotalHours(hours: number): string {
  if (hours < 1) return `${Math.round(hours * 60)} Minuten`
  if (hours < 24) return `${hours.toFixed(1)} Stunden`
  const days = Math.floor(hours / 24)
  const remaining = hours % 24
  if (remaining === 0) return `${days} Tag${days !== 1 ? 'e' : ''}`
  return `${days} Tag${days !== 1 ? 'e' : ''} ${remaining.toFixed(0)} Std.`
}

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${Math.round(minutes)} Min.`
  const h = Math.floor(minutes / 60)
  const m = Math.round(minutes % 60)
  if (m === 0) return `${h} Std.`
  return `${h} Std. ${m} Min.`
}
