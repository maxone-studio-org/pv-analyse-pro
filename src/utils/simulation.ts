import type { DayData, SimulationParams, SimulationInterval, DaySimulation } from '../types'

/** Run battery simulation across all days */
export function runSimulation(
  days: DayData[],
  params: SimulationParams
): DaySimulation[] {
  const maxCapacity = params.kapazitaet_kwh
  const minSoc = maxCapacity * (1 - params.entladetiefe_pct / 100)
  const chargeEff = params.ladewirkungsgrad_pct / 100
  const dischargeEff = params.entladewirkungsgrad_pct / 100

  let soc = maxCapacity * (params.anfangs_soc_pct / 100)
  const results: DaySimulation[] = []

  for (const day of days) {
    const socAtDayStart = soc
    const simIntervals: SimulationInterval[] = []
    let dayGeladen = 0
    let dayEntladen = 0
    let dayNetzbezugSim = 0
    let dayEinspeisungSim = 0
    let socMin = soc
    let socMax = soc

    for (const interval of day.intervals) {
      const ueberschuss = interval.erzeugung_kwh - interval.verbrauch_kwh

      let geladen = 0
      let entladen = 0
      let netzbezugSim = 0
      let einspeisungSim = 0

      if (ueberschuss > 0) {
        // Surplus → charge battery
        const maxCharge = maxCapacity - soc
        geladen = Math.min(ueberschuss * chargeEff, maxCharge)
        soc += geladen
        // Remaining surplus goes to grid
        einspeisungSim = ueberschuss - geladen / chargeEff
      } else {
        // Deficit → discharge battery
        const bedarf = Math.abs(ueberschuss)
        const maxDischarge = soc - minSoc
        entladen = Math.min(bedarf / dischargeEff, maxDischarge)
        soc -= entladen
        // Remaining deficit from grid
        netzbezugSim = bedarf - entladen * dischargeEff
      }

      socMin = Math.min(socMin, soc)
      socMax = Math.max(socMax, soc)
      dayGeladen += geladen
      dayEntladen += entladen
      dayNetzbezugSim += netzbezugSim
      dayEinspeisungSim += einspeisungSim

      simIntervals.push({
        timestamp: interval.timestamp,
        soc_kwh: soc,
        geladen_kwh: geladen,
        entladen_kwh: entladen,
        netzbezug_sim_kwh: netzbezugSim,
        einspeisung_sim_kwh: einspeisungSim,
      })
    }

    results.push({
      date: day.date,
      soc_start_kwh: socAtDayStart,
      intervals: simIntervals,
      totals: {
        geladen_kwh: dayGeladen,
        entladen_kwh: dayEntladen,
        netzbezug_sim_kwh: dayNetzbezugSim,
        einspeisung_sim_kwh: dayEinspeisungSim,
        soc_min_kwh: socMin,
        soc_max_kwh: socMax,
      },
    })
  }

  return results
}
