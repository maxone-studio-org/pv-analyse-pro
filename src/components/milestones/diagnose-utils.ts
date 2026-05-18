export const DIAGNOSE_RESULT_KEY = 'sp-diagnose-result'

export interface DiagnoseResult {
  kaufjahr: string
  modell: string
  defektArt: string
  kommuniziert: string
  kulanzangebot: string
  anlagenwert: string
  verzichtsklausel: string
  kulanzBetrag: string
  ampel: 'gruen' | 'gelb' | 'rot' | null
  coveragePct: number | null
}

export type Step =
  | 'kaufjahr' | 'modell' | 'defektArt' | 'kommuniziert'
  | 'kulanzangebot' | 'anlagenwert' | 'verzichtsklausel'
  | 'kulanzBetrag' | 'ergebnis'

export interface Answers {
  kaufjahr: string
  modell: string
  defektArt: string
  kommuniziert: string
  kulanzangebot: string
  anlagenwert: string
  verzichtsklausel: string
  kulanzBetrag: string
}

export const EMPTY: Answers = {
  kaufjahr: '', modell: '', defektArt: '', kommuniziert: '',
  kulanzangebot: '', anlagenwert: '', verzichtsklausel: '', kulanzBetrag: '',
}

export function loadSaved(): { history: Step[]; answers: Answers } {
  try {
    const raw = localStorage.getItem(DIAGNOSE_RESULT_KEY)
    if (!raw) return { history: ['kaufjahr'], answers: EMPTY }
    const r = JSON.parse(raw) as DiagnoseResult
    const a: Answers = {
      kaufjahr:         r.kaufjahr         ?? '',
      modell:           r.modell           ?? '',
      defektArt:        r.defektArt        ?? '',
      kommuniziert:     r.kommuniziert     ?? '',
      kulanzangebot:    r.kulanzangebot    ?? '',
      anlagenwert:      r.anlagenwert      ?? '',
      verzichtsklausel: r.verzichtsklausel ?? '',
      kulanzBetrag:     r.kulanzBetrag     ?? '',
    }
    return { history: ['kaufjahr', 'ergebnis'], answers: a }
  } catch {
    return { history: ['kaufjahr'], answers: EMPTY }
  }
}

export function computeAmpel(answers: Answers): 'gruen' | 'gelb' | 'rot' | null {
  if (answers.kulanzangebot !== 'ja') return null
  if (answers.verzichtsklausel === 'ja') return 'rot'
  if (answers.defektArt === 'drosselung') return 'rot'
  const aw = parseFloat(answers.anlagenwert)
  const kb = parseFloat(answers.kulanzBetrag)
  if (!isNaN(aw) && aw > 0 && !isNaN(kb) && kb > 0) {
    const pct = (kb / aw) * 100
    if (pct >= 100) return 'gruen'
    if (pct >= 80) return 'gelb'
    return 'rot'
  }
  return answers.verzichtsklausel === 'nein' ? 'gelb' : 'rot'
}

export function getAnsprueche(answers: Answers): string[] {
  const age = 2026 - (parseInt(answers.kaufjahr) || 2020)
  const result: string[] = []
  if (age <= 2)
    result.push('Gesetzliche Gewährleistung (2 Jahre) — automatisch gültig')
  else if (age <= 5)
    result.push('Gesetzliche Gewährleistung abgelaufen — SENEC-Garantie prüfen (meist 5–10 Jahre)')
  else
    result.push('Gewährleistung abgelaufen — Ihren Garantievertrag mit SENEC prüfen')
  if (answers.defektArt === 'drosselung')
    result.push('Sachmangel: OLG Hamm Az. 2 U 5/25 (11.04.2025) — Drosselung = Rücktrittsrecht')
  else if (answers.defektArt === 'totalausfall')
    result.push('Erheblicher Sachmangel — Rücktritt und Schadensersatz möglich')
  else if (answers.defektArt === 'teilausfall')
    result.push('Sachmangel — Nachbesserung fordern; bei Fehlschlagen: Rücktritt')
  if (answers.kommuniziert === 'nein')
    result.push('Tipp: Mangel schriftlich bei SENEC melden — startet Fristen')
  return result
}
