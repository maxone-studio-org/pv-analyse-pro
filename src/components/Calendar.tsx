import { useMemo } from 'react'
import { useAppStore } from '../store'

const WEEKDAYS = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So']
const MONTHS = [
  'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
  'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember',
]

export function Calendar() {
  const days = useAppStore((s) => s.days)
  const selectedMonth = useAppStore((s) => s.selectedMonth)
  const setSelectedMonth = useAppStore((s) => s.setSelectedMonth)
  const setSelectedDay = useAppStore((s) => s.setSelectedDay)
  const importStep = useAppStore((s) => s.importStep)

  const availableMonths = useMemo(() => {
    const months = new Set<string>()
    for (const d of days) months.add(d.date.substring(0, 7))
    return [...months].sort()
  }, [days])

  const calendarGrid = useMemo(() => {
    if (!selectedMonth) return []

    const [year, month] = selectedMonth.split('-').map(Number)
    const firstDay = new Date(year, month - 1, 1)
    const lastDay = new Date(year, month, 0)

    // Monday = 0, Sunday = 6
    let startDow = firstDay.getDay() - 1
    if (startDow < 0) startDow = 6

    const daysWithData = new Set(
      days.filter((d) => d.date.startsWith(selectedMonth)).map((d) => d.date)
    )

    const grid: { day: number; date: string; hasData: boolean }[] = []

    // Empty cells before first day
    for (let i = 0; i < startDow; i++) {
      grid.push({ day: 0, date: '', hasData: false })
    }

    for (let d = 1; d <= lastDay.getDate(); d++) {
      const dateStr = `${selectedMonth}-${String(d).padStart(2, '0')}`
      grid.push({ day: d, date: dateStr, hasData: daysWithData.has(dateStr) })
    }

    return grid
  }, [selectedMonth, days])

  if (importStep !== 'done' || !selectedMonth) return null

  const [year, month] = selectedMonth.split('-').map(Number)

  const prevMonth = () => {
    const idx = availableMonths.indexOf(selectedMonth)
    if (idx > 0) setSelectedMonth(availableMonths[idx - 1])
  }

  const nextMonth = () => {
    const idx = availableMonths.indexOf(selectedMonth)
    if (idx < availableMonths.length - 1) setSelectedMonth(availableMonths[idx + 1])
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6">
      {/* Navigation */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={prevMonth}
          disabled={availableMonths.indexOf(selectedMonth) === 0}
          className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h2 className="text-lg font-semibold text-gray-900">
          {MONTHS[month - 1]} {year}
        </h2>
        <button
          onClick={nextMonth}
          disabled={availableMonths.indexOf(selectedMonth) === availableMonths.length - 1}
          className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {WEEKDAYS.map((wd) => (
          <div key={wd} className="text-xs font-medium text-gray-500 text-center py-1">
            {wd}
          </div>
        ))}
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-7 gap-1">
        {calendarGrid.map((cell, i) => {
          if (cell.day === 0) {
            return <div key={i} className="aspect-square" />
          }

          return (
            <button
              key={i}
              disabled={!cell.hasData}
              onClick={() => cell.hasData && setSelectedDay(cell.date)}
              className={`aspect-square rounded-lg flex flex-col items-center justify-center text-sm relative transition-colors ${
                cell.hasData
                  ? 'hover:bg-amber-50 cursor-pointer text-gray-900 font-medium'
                  : 'text-gray-300 cursor-not-allowed'
              }`}
            >
              {cell.day}
              {cell.hasData && (
                <span className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-green-500" />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
