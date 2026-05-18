import { useState, useEffect } from 'react'
import { fetchContent } from '../data/content'

export function useContent<T>(key: string, defaultValue: T): T {
  const [value, setValue] = useState<T>(defaultValue)

  useEffect(() => {
    fetchContent<T>(key).then(v => {
      if (v !== null) setValue(v)
    }).catch(() => {})
  }, [key])

  return value
}
