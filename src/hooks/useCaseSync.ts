import { useEffect, useRef, useState } from 'react'
import type { User } from '@supabase/supabase-js'
import { useAppStore } from '../store'
import { saveCase, loadCase, type CloudState, type CaseSummary } from '../lib/caseSync'

export type SyncStatus = 'idle' | 'saving' | 'saved' | 'error'

const MILESTONE_KEY = 'sp-milestones'

function readMilestone(): number {
  try {
    const raw = localStorage.getItem(MILESTONE_KEY)
    if (raw) return (JSON.parse(raw) as { current?: number }).current ?? 1
  } catch {}
  return 1
}

export function useCaseSync(user: User | null): SyncStatus {
  const [status, setStatus] = useState<SyncStatus>('idle')
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const prevUserRef = useRef<string | null>(null)

  const importStep        = useAppStore(s => s.importStep)
  const fileMetadataList  = useAppStore(s => s.fileMetadataList)
  const days              = useAppStore(s => s.days)
  const columnMapping     = useAppStore(s => s.columnMapping)
  const inputIsUTC        = useAppStore(s => s.inputIsUTC)
  const inputUnit         = useAppStore(s => s.inputUnit)
  const simulationParams  = useAppStore(s => s.simulationParams)
  const costParams        = useAppStore(s => s.costParams)
  const costCapOverrides  = useAppStore(s => s.costCapOverrides)

  // On login: restore cloud state if local is empty
  useEffect(() => {
    const uid = user?.id ?? null
    if (!uid || uid === prevUserRef.current) return
    prevUserRef.current = uid

    const hasLocalData = importStep === 'done' && fileMetadataList.length > 0
    if (hasLocalData) return // local wins

    loadCase().then(cloud => {
      if (!cloud) return
      useAppStore.setState({
        columnMapping:     cloud.columnMapping,
        inputIsUTC:        cloud.inputIsUTC,
        inputUnit:         cloud.inputUnit,
        simulationParams:  cloud.simulationParams,
        costParams:        cloud.costParams,
        costCapOverrides:  cloud.costCapOverrides,
      })
      if (cloud.diagnose) {
        localStorage.setItem('sp-diagnose-result', JSON.stringify(cloud.diagnose))
      }
    })
  }, [user, importStep, fileMetadataList.length])

  // Debounced save on state change (only when logged in + data exists)
  useEffect(() => {
    if (!user || importStep !== 'done' || fileMetadataList.length === 0) return

    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(async () => {
      setStatus('saving')

      let diagnose: Record<string, unknown> | null = null
      try {
        const raw = localStorage.getItem('sp-diagnose-result')
        if (raw) diagnose = JSON.parse(raw)
      } catch {}

      const dateRange = days.length >= 2
        ? { from: days[0].date, to: days[days.length - 1].date }
        : null

      const summary: CaseSummary = {
        milestone:  readMilestone(),
        dayCount:   days.length,
        dateRange,
        diagnose: diagnose
          ? {
              modell:    (diagnose.modell as string | undefined),
              defektArt: (diagnose.defektArt as string | undefined),
              ampel:     (diagnose.ampel as string | undefined),
            }
          : null,
      }

      const cloud: CloudState = {
        fileMetadataList: fileMetadataList.map(f => ({
          ...f,
          importTimestamp: f.importTimestamp instanceof Date
            ? f.importTimestamp.toISOString()
            : String(f.importTimestamp),
        })),
        columnMapping,
        inputIsUTC,
        inputUnit,
        simulationParams,
        costParams,
        costCapOverrides,
        diagnose,
        summary,
      }

      const id = await saveCase(cloud, user.email ?? undefined)
      setStatus(id ? 'saved' : 'error')
      if (id) setTimeout(() => setStatus('idle'), 3000)
    }, 2000)

    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, importStep, fileMetadataList.length, simulationParams, costParams, costCapOverrides])

  return status
}
