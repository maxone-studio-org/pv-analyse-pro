import type { BdewPrice, CostParams, YearCostComparison } from '../types/cost'
import type { DayData } from '../types'

/** BDEW Durchschnittspreise Haushaltsstrom (ct/kWh, brutto) */
const BDEW_PRICES: BdewPrice[] = [
  { year: 2018, price_ct: 29.42, capped: false, effective_ct: 29.42 },
  { year: 2019, price_ct: 30.43, capped: false, effective_ct: 30.43 },
  { year: 2020, price_ct: 31.81, capped: false, effective_ct: 31.81 },
  { year: 2021, price_ct: 32.16, capped: false, effective_ct: 32.16 },
  { year: 2022, price_ct: 40.07, capped: true, effective_ct: 40.00 },
  { year: 2023, price_ct: 41.28, capped: true, effective_ct: 40.00 },
  { year: 2024, price_ct: 39.72, capped: false, effective_ct: 39.72 },
  { year: 2025, price_ct: 37.99, capped: false, effective_ct: 37.99 },
  { year: 2026, price_ct: 37.99, capped: false, effective_ct: 37.99 }, // Prognose
]

const STROMPREISBREMSE_CAP = 40.00 // ct/kWh

export function getBdewPrices(): BdewPrice[] {
  return BDEW_PRICES.map((p) => ({
    ...p,
    effective_ct: p.capped ? Math.min(p.price_ct, STROMPREISBREMSE_CAP) : p.price_ct,
  }))
}

export function getBdewPriceForYear(year: number): BdewPrice | undefined {
  return getBdewPrices().find((p) => p.year === year)
}

/** Calculate cost comparison per year from data */
export function calculateCostComparison(
  days: DayData[],
  params: CostParams,
): YearCostComparison[] {
  // Group days by year
  const yearMap = new Map<number, DayData[]>()
  for (const day of days) {
    const year = parseInt(day.date.substring(0, 4))
    if (!yearMap.has(year)) yearMap.set(year, [])
    yearMap.get(year)!.push(day)
  }

  const results: YearCostComparison[] = []
  const sortedYears = [...yearMap.keys()].sort()

  for (const year of sortedYears) {
    const yearDays = yearMap.get(year)!
    const monthsInData = new Set(yearDays.map((d) => d.date.substring(0, 7))).size

    // Total consumption for this year's data
    const verbrauch_kwh = yearDays.reduce((s, d) => s + d.totals.verbrauch_kwh, 0)
    const einspeisung_kwh = yearDays.reduce((s, d) => s + d.totals.einspeisung_kwh, 0)

    // Seite A: Anlage betreiben (anteilig nach Monaten im Datensatz)
    const anteil = monthsInData / 12
    const kreditrate_eur = params.kreditrate_eur_monat * monthsInData
    const nachzahlung_eur = params.nachzahlung_eur_jahr * anteil
    const wartung_eur = params.wartung_eur_jahr * anteil
    const einspeiseverguetung_eur = (einspeisung_kwh * params.einspeiseverguetung_ct_kwh) / 100

    const kosten_anlage_eur = kreditrate_eur + nachzahlung_eur + wartung_eur - einspeiseverguetung_eur

    // Seite B: Strom einfach kaufen
    const bdew = getBdewPriceForYear(year)
    const strompreis_ct = bdew?.effective_ct ?? 37.99
    const kosten_strom_eur = (verbrauch_kwh * strompreis_ct) / 100

    results.push({
      year,
      kreditrate_eur,
      nachzahlung_eur,
      wartung_eur,
      einspeiseverguetung_eur,
      kosten_anlage_eur,
      verbrauch_kwh,
      strompreis_ct,
      kosten_strom_eur,
      differenz_eur: kosten_strom_eur - kosten_anlage_eur,
    })
  }

  return results
}
