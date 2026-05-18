import { supabase, PANEL_URL, ANON_KEY } from '../lib/supabase'

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

export async function fetchLawyers(): Promise<Lawyer[]> {
  const { data, error } = await supabase
    .from('lawyers')
    .select('*')
    .eq('status', 'active')
    .order('listing_typ', { ascending: false })
    .order('senec_faelle', { ascending: false })
  if (error) throw new Error(error.message)
  return data as Lawyer[]
}

export async function addLawyer(lawyer: Omit<Lawyer, 'id'>): Promise<void> {
  const { error } = await supabase.from('lawyers').insert(lawyer)
  if (error) throw new Error(error.message)
}

export async function fetchPendingLawyers(): Promise<Lawyer[]> {
  const { data, error } = await supabase
    .from('lawyers')
    .select('*')
    .eq('status', 'pending')
    .order('created_at', { ascending: true })
  if (error) throw new Error(error.message)
  return data as Lawyer[]
}

export async function approveLawyer(id: string): Promise<void> {
  const { error } = await supabase
    .from('lawyers')
    .update({ status: 'active' })
    .eq('id', id)
  if (error) throw new Error(error.message)
}

export async function rejectLawyer(id: string): Promise<void> {
  const { error } = await supabase.from('lawyers').delete().eq('id', id)
  if (error) throw new Error(error.message)
}

export async function fetchAllLawyers(): Promise<Lawyer[]> {
  const { data, error } = await supabase
    .from('lawyers')
    .select('*')
    .order('status', { ascending: true })
    .order('kanzlei', { ascending: true })
  if (error) throw new Error(error.message)
  return data as Lawyer[]
}

export async function updateLawyer(id: string, updates: Partial<Omit<Lawyer, 'id'>>): Promise<void> {
  const { error } = await supabase.from('lawyers').update(updates).eq('id', id)
  if (error) throw new Error(error.message)
}

export async function deleteLawyer(id: string): Promise<void> {
  const { error } = await supabase.from('lawyers').delete().eq('id', id)
  if (error) throw new Error(error.message)
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
  const { error } = await supabase.from('lawyers').insert({
    ...submission,
    bundesland: plzToBundesland(submission.plz),
    schwerpunkte: [],
    status: 'pending',
    listing_typ: 'kostenlos',
  })
  if (error) throw new Error(error.message)
}

// Keep for edge-function calls that stay on panel.maxone.one
export { PANEL_URL, ANON_KEY }

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
