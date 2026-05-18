export interface Lawyer {
  id: string
  name: string
  kanzlei: string
  email?: string
  phone?: string
  plz: string
  ort: string
  bundesland: string
  schwerpunkte: string[]
  senec_faelle: number
  erstberatung_eur: number | null
  erstberatung_kostenlos: boolean
  website?: string
  beschreibung?: string
  listing_typ: 'kostenlos' | 'basis' | 'premium'
  status?: 'active' | 'pending'
}

const PANEL_URL = 'https://panel.maxone.one'
const ANON_KEY  = 'eyJhbGciOiAiSFMyNTYiLCAidHlwIjogIkpXVCJ9.eyJyb2xlIjogImFub24iLCAiaXNzIjogInN1cGFiYXNlIiwgImlhdCI6IDE3Mjk3MjgwMDAsICJleHAiOiAxODg3NDk0NDAwfQ.bkbevdi1DwbqCos2hMTd3UnYAj5PogIBTqjZdOyTGiQ'

export async function fetchLawyers(): Promise<Lawyer[]> {
  const res = await fetch(`${PANEL_URL}/functions/v1/list-lawyers`, {
    headers: { 'apikey': ANON_KEY, 'Content-Type': 'application/json' },
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const data = await res.json()
  return data as Lawyer[]
}

export async function addLawyer(lawyer: Omit<Lawyer, 'id'>, adminKey: string): Promise<void> {
  const res = await fetch(`${PANEL_URL}/functions/v1/add-lawyer`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${adminKey}`,
      'apikey': ANON_KEY,
    },
    body: JSON.stringify(lawyer),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: `HTTP ${res.status}` }))
    throw new Error(err.error ?? `HTTP ${res.status}`)
  }
}

function adminHeaders(adminKey: string) {
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${adminKey}`,
    'apikey': adminKey,
  }
}

export async function fetchPendingLawyers(adminKey: string): Promise<Lawyer[]> {
  const res = await fetch(`${PANEL_URL}/rest/v1/lawyers?status=eq.pending&order=created_at.asc`, {
    headers: { ...adminHeaders(adminKey), 'Accept': 'application/json' },
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

export async function approveLawyer(id: string, adminKey: string): Promise<void> {
  const res = await fetch(`${PANEL_URL}/rest/v1/lawyers?id=eq.${id}`, {
    method: 'PATCH',
    headers: { ...adminHeaders(adminKey), 'Prefer': 'return=minimal' },
    body: JSON.stringify({ status: 'active' }),
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
}

export async function rejectLawyer(id: string, adminKey: string): Promise<void> {
  const res = await fetch(`${PANEL_URL}/rest/v1/lawyers?id=eq.${id}`, {
    method: 'DELETE',
    headers: adminHeaders(adminKey),
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
}

export async function fetchAllLawyers(adminKey: string): Promise<Lawyer[]> {
  const res = await fetch(`${PANEL_URL}/rest/v1/lawyers?order=status.asc,kanzlei.asc`, {
    headers: { ...adminHeaders(adminKey), 'Accept': 'application/json' },
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

export async function updateLawyer(id: string, updates: Partial<Omit<Lawyer, 'id'>>, adminKey: string): Promise<void> {
  const res = await fetch(`${PANEL_URL}/rest/v1/lawyers?id=eq.${id}`, {
    method: 'PATCH',
    headers: { ...adminHeaders(adminKey), 'Prefer': 'return=minimal' },
    body: JSON.stringify(updates),
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
}

export async function deleteLawyer(id: string, adminKey: string): Promise<void> {
  const res = await fetch(`${PANEL_URL}/rest/v1/lawyers?id=eq.${id}`, {
    method: 'DELETE',
    headers: adminHeaders(adminKey),
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
}

export interface LawyerSubmission {
  name: string
  kanzlei: string
  plz: string
  ort: string
  website?: string
  phone?: string
  beschreibung?: string
}

export async function submitLawyer(submission: LawyerSubmission): Promise<void> {
  const res = await fetch(`${PANEL_URL}/functions/v1/submit-lawyer`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'apikey': ANON_KEY, 'Authorization': `Bearer ${ANON_KEY}` },
    body: JSON.stringify(submission),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: `HTTP ${res.status}` }))
    throw new Error(err.error ?? `HTTP ${res.status}`)
  }
}

export function plzToBundesland(plz: string): string {
  const n = parseInt(plz.slice(0, 2) || '0')
  if (n >= 1  && n <= 9)  return 'Sachsen/Thüringen/Sachsen-Anhalt'
  if (n >= 10 && n <= 19) return 'Berlin/Brandenburg/Mecklenburg-Vorpommern'
  if (n >= 20 && n <= 29) return 'Hamburg/Schleswig-Holstein/Niedersachsen'
  if (n >= 30 && n <= 39) return 'Niedersachsen/Sachsen-Anhalt'
  if (n >= 40 && n <= 59) return 'Nordrhein-Westfalen'
  if (n >= 60 && n <= 67) return 'Hessen/Rheinland-Pfalz/Saarland'
  if (n >= 68 && n <= 79) return 'Baden-Württemberg'
  if (n >= 80 && n <= 97) return 'Bayern'
  if (n >= 98 && n <= 99) return 'Thüringen'
  return 'Deutschland'
}
