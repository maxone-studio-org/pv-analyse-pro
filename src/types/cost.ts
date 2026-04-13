/** User-entered cost parameters */
export interface CostParams {
  kreditrate_eur_monat: number
  nachzahlung_eur_jahr: number // default/fallback for years without specific entry
  nachzahlung_pro_jahr: Record<number, number> // year → EUR (overrides nachzahlung_eur_jahr)
  rueckerstattung_eur_jahr: number
  wartung_eur_jahr: number
  cloud_eur_monat: number // default/fallback for months without specific entry
  cloud_pro_monat: Record<string, number> // "YYYY-MM" → EUR (overrides cloud_eur_monat)
  einspeiseverguetung_ct_kwh: number
}

/** BDEW electricity price per year (ct/kWh) */
export interface BdewPrice {
  year: number
  price_ct: number
  cap_ct: number | null
  capped_default: boolean
}

/** Result of cost comparison for one year */
export interface YearCostComparison {
  year: number
  // Seite A: Anlage betreiben
  kreditrate_eur: number
  nachzahlung_eur: number
  rueckerstattung_eur: number
  wartung_eur: number
  cloud_eur: number
  einspeiseverguetung_eur: number
  gesamtkosten_eur: number
  // Verbrauchsdaten
  eigenverbrauch_kwh: number
  einspeisung_kwh: number
  // Seite B: Strom kaufen
  strompreis_ct: number
  aequivalent_kwh: number // Gesamtkosten / Strompreis = wie viele kWh man hätte kaufen können
  // Bewertung
  differenz_kwh: number // Eigenverbrauch - Äquivalent (positiv = Anlage günstiger)
}
