import { ATTACK_TYPES } from "@/mocks/analytics"
import type { AttackType } from "@/types/fraud"

export interface SimCity {
  name: string
  lat: number
  lon: number
}

// A small fixed pool of origin cities for the map's arcs - stylized, not meant to
// reflect the real origin of any attack (there isn't one; every attack is synthetic).
export const SIM_ORIGIN_CITIES: SimCity[] = [
  { name: "Mumbai", lat: 19.08, lon: 72.88 },
  { name: "Delhi", lat: 28.61, lon: 77.21 },
  { name: "Bengaluru", lat: 12.97, lon: 77.59 },
  { name: "Singapore", lat: 1.35, lon: 103.82 },
  { name: "London", lat: 51.51, lon: -0.13 },
]

// Roughly the geometric center of the five origin cities above - stands in for
// "VectorGuard Detection Core" on the map, not a real office or datacenter location.
export const DETECTION_CORE: SimCity = { name: "VectorGuard Detection Core", lat: 22, lon: 66 }

export type SimOutcome = "BLOCK" | "HOLD" | "ALLOW"

export interface SimulatedAttackEvent {
  id: string
  attackType: AttackType
  city: SimCity
  outcome: SimOutcome
}

let sequence = 0

// Called on each animation cycle by the map component - every call is a fresh event,
// so the visualization never runs out of attacks to show. Outcomes are weighted toward
// BLOCK/HOLD since these represent Red Team attacks meeting Blue Team defenses, with an
// occasional ALLOW standing in for a cleared false-positive review.
export function generateSimulatedAttackEvent(): SimulatedAttackEvent {
  sequence += 1
  const city = SIM_ORIGIN_CITIES[Math.floor(Math.random() * SIM_ORIGIN_CITIES.length)]
  const attackType = ATTACK_TYPES[Math.floor(Math.random() * ATTACK_TYPES.length)]
  const roll = Math.random()
  const outcome: SimOutcome = roll < 0.55 ? "BLOCK" : roll < 0.8 ? "HOLD" : "ALLOW"
  return { id: `sim-${Date.now()}-${sequence}`, attackType, city, outcome }
}
