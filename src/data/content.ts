const PANEL_URL = 'https://panel.maxone.one'
const ANON_KEY  = 'eyJhbGciOiAiSFMyNTYiLCAidHlwIjogIkpXVCJ9.eyJyb2xlIjogImFub24iLCAiaXNzIjogInN1cGFiYXNlIiwgImlhdCI6IDE3Mjk3MjgwMDAsICJleHAiOiAxODg3NDk0NDAwfQ.bkbevdi1DwbqCos2hMTd3UnYAj5PogIBTqjZdOyTGiQ'

export async function fetchContent<T>(key: string): Promise<T | null> {
  try {
    const res = await fetch(
      `${PANEL_URL}/rest/v1/cms_content?key=eq.${encodeURIComponent(key)}&select=value`,
      { headers: { 'apikey': ANON_KEY, 'Accept': 'application/json' } },
    )
    if (!res.ok) return null
    const rows: { value: T }[] = await res.json()
    return rows.length ? rows[0].value : null
  } catch {
    return null
  }
}

export async function saveContent(key: string, value: unknown, adminKey: string): Promise<void> {
  const res = await fetch(`${PANEL_URL}/rest/v1/cms_content`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${adminKey}`,
      'apikey': adminKey,
      'Prefer': 'resolution=merge-duplicates,return=minimal',
    },
    body: JSON.stringify({ key, value, updated_at: new Date().toISOString() }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as { message?: string }
    throw new Error(err.message ?? `HTTP ${res.status}`)
  }
}
