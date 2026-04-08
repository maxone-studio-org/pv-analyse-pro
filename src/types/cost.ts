/** User-entered cost parameters */
export interface CostParams {
  kreditrate_eur_monat: number
  nachzahlung_eur_jahr: number
  wartung_eur_jahr: number
  einspeiseverguetung_ct_kwh: number
}

/** BDEW electricity price per year (ct/kWh) */
export interface BdewPrice {
  year: number
  price_ct: number // BDEW Durchschnittspreis Haushaltsstrom
  capped: boolean  // Strompreisbremse aktiv
  effective_ct: number // min(price, cap) wenn Bremse aktiv
}

/** Result of cost comparison for one year */
export interface YearCostComparison {
  year: number
  // Seite A: Anlage betreiben
  kreditrate_eur: number
  nachzahlung_eur: number
  wartung_eur: number
  einspeiseverguetung_eur: number
  kosten_anlage_eur: number
  // Seite B: Strom kaufen
  verbrauch_kwh: number
  strompreis_ct: number
  kosten_strom_eur: number
  // Vergleich
  differenz_eur: number // positiv = Anlage günstiger
}
