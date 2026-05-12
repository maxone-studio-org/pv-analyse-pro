import type { MilestoneId } from '../hooks/useMilestones'
import { canAccess } from '../hooks/useMilestones'

const STEPS: { id: MilestoneId; label: string }[] = [
  { id: 1, label: 'Diagnose' },
  { id: 2, label: 'Datenexport' },
  { id: 3, label: 'Analyse' },
  { id: 4, label: 'Anwalt finden' },
  { id: 5, label: 'Briefing' },
]

interface Props {
  current: MilestoneId
  completed: MilestoneId[]
  onGoTo: (m: MilestoneId) => void
}

function CheckIcon() {
  return (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  )
}

export function Prozessleiste({ current, completed, onGoTo }: Props) {
  return (
    <div className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 sm:py-4">

        {/* Desktop: Kreise + Labels + Verbindungslinien */}
        <div className="hidden sm:flex items-start">
          {STEPS.map((step, i) => {
            const isDone = completed.includes(step.id)
            const isActive = current === step.id
            const accessible = canAccess(step.id, completed)
            const isLast = i === STEPS.length - 1

            return (
              <div key={step.id} className="flex items-start flex-1">
                <div className="flex flex-col items-center gap-1.5 min-w-0">
                  <button
                    onClick={() => accessible && onGoTo(step.id)}
                    disabled={!accessible}
                    className={[
                      'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors flex-shrink-0',
                      isDone
                        ? 'bg-green-600 text-white'
                        : isActive
                          ? 'bg-blue-600 text-white ring-4 ring-blue-100'
                          : accessible
                            ? 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                            : 'bg-gray-100 text-gray-400 cursor-not-allowed',
                    ].join(' ')}
                    aria-label={`Schritt ${step.id}: ${step.label}`}
                    aria-current={isActive ? 'step' : undefined}
                  >
                    {isDone ? <CheckIcon /> : step.id}
                  </button>
                  <span
                    className={[
                      'text-xs font-medium text-center leading-tight',
                      isActive ? 'text-blue-600' : isDone ? 'text-green-600' : 'text-gray-400',
                    ].join(' ')}
                  >
                    {step.label}
                  </span>
                </div>

                {/* Connector */}
                {!isLast && (
                  <div
                    className={[
                      'flex-1 h-0.5 mt-4 mx-2 rounded-full transition-colors',
                      isDone ? 'bg-green-400' : 'bg-gray-200',
                    ].join(' ')}
                  />
                )}
              </div>
            )
          })}
        </div>

        {/* Mobile: Dots + aktiver Label */}
        <div className="flex sm:hidden flex-col items-center gap-2">
          <div className="flex items-center">
            {STEPS.map((step, i) => {
              const isDone = completed.includes(step.id)
              const isActive = current === step.id
              const accessible = canAccess(step.id, completed)
              const isLast = i === STEPS.length - 1

              return (
                <div key={step.id} className="flex items-center">
                  <button
                    onClick={() => accessible && onGoTo(step.id)}
                    disabled={!accessible}
                    className={[
                      'w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors',
                      isDone
                        ? 'bg-green-600 text-white'
                        : isActive
                          ? 'bg-blue-600 text-white ring-4 ring-blue-100'
                          : accessible
                            ? 'bg-gray-200 text-gray-600'
                            : 'bg-gray-100 text-gray-400 cursor-not-allowed',
                    ].join(' ')}
                    aria-label={`Schritt ${step.id}: ${step.label}`}
                    aria-current={isActive ? 'step' : undefined}
                  >
                    {isDone ? <CheckIcon /> : step.id}
                  </button>
                  {!isLast && (
                    <div
                      className={[
                        'w-5 h-0.5 rounded-full',
                        isDone ? 'bg-green-400' : 'bg-gray-200',
                      ].join(' ')}
                    />
                  )}
                </div>
              )
            })}
          </div>
          <p className="text-xs font-semibold text-blue-600">
            Schritt {current} · {STEPS.find((s) => s.id === current)?.label}
          </p>
        </div>

      </div>
    </div>
  )
}
