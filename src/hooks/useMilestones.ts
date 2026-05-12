import { useState, useCallback } from 'react'

export type MilestoneId = 1 | 2 | 3 | 4 | 5

interface MilestoneState {
  current: MilestoneId
  completed: MilestoneId[]
}

const STORAGE_KEY = 'sp-milestones'
const DEFAULT: MilestoneState = { current: 1, completed: [] }

function load(): MilestoneState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<MilestoneState>
      if (
        typeof parsed.current === 'number' &&
        parsed.current >= 1 &&
        parsed.current <= 5 &&
        Array.isArray(parsed.completed)
      ) {
        return parsed as MilestoneState
      }
    }
  } catch {}
  return DEFAULT
}

function save(state: MilestoneState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {}
}

export function canAccess(m: MilestoneId, completed: MilestoneId[]): boolean {
  if (m <= 3) return true
  if (m === 4) return completed.includes(3)
  if (m === 5) return completed.includes(4)
  return false
}

export function useMilestones() {
  const [state, setState] = useState<MilestoneState>(load)

  const goTo = useCallback((m: MilestoneId) => {
    setState((prev) => {
      if (!canAccess(m, prev.completed)) return prev
      const next = { ...prev, current: m }
      save(next)
      return next
    })
  }, [])

  const complete = useCallback((m: MilestoneId) => {
    setState((prev) => {
      const completed = prev.completed.includes(m)
        ? prev.completed
        : ([...prev.completed, m] as MilestoneId[])
      const nextId = Math.min(5, m + 1) as MilestoneId
      const next: MilestoneState = { current: nextId, completed }
      save(next)
      return next
    })
  }, [])

  const reset = useCallback(() => {
    save(DEFAULT)
    setState(DEFAULT)
  }, [])

  return {
    current: state.current,
    completed: state.completed,
    goTo,
    complete,
    reset,
  }
}
