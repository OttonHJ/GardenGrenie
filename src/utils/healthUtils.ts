import { Plant } from "@/src/components/PlantCard";
import { isWateringDue, parseWaterFrequencyDays } from "@/src/utils/plantUtils";

export type HealthState = "healthy" | "ok" | "stressed" | "critical";

export interface HealthData {
  score: number;
  state: HealthState;
  emoji: string;
  label: string;
  color: string;
  daysOverdue: number;
  consistencyPct: number;
}

export const HEALTH_STATE_CONFIG: Record<
  HealthState,
  { emoji: string; label: string; color: string }
> = {
  healthy:  { emoji: "🌿", label: "Saludable",   color: "#5db89a" },
  ok:       { emoji: "🌱", label: "Bien",         color: "#66BB6A" },
  stressed: { emoji: "🍂", label: "Estresada",    color: "#FFA726" },
  critical: { emoji: "💀", label: "En peligro",   color: "#EF5350" },
};

function scoreToState(score: number): HealthState {
  if (score >= 80) return "healthy";
  if (score >= 60) return "ok";
  if (score >= 30) return "stressed";
  return "critical";
}

export function calcHealth(plant: Plant): HealthData {
  const now = Date.now();
  const freqDays = parseWaterFrequencyDays(plant.waterFrequency);
  const daysSinceCreation = Math.max((now - plant.createdAt) / 86_400_000, 0);

  const [y, m, d] = plant.nextWatering.split("-").map(Number);
  const nextDate = new Date(y, m - 1, d);
  const daysOverdue = Math.max(
    0,
    Math.floor((now - nextDate.getTime()) / 86_400_000),
  );

  const expectedWaterings = daysSinceCreation / freqDays;

  // Brand-new plant: hasn't reached first full watering cycle yet
  if (expectedWaterings < 1) {
    const score = Math.max(0, 100 - daysOverdue * 20);
    const state = scoreToState(score);
    return {
      score,
      state,
      ...HEALTH_STATE_CONFIG[state],
      daysOverdue,
      consistencyPct: 100,
    };
  }

  // Use wateringHistory; fall back to lastWatered for migrated plants
  const historyLen = (plant.wateringHistory ?? []).length;
  const actual = historyLen > 0 ? historyLen : plant.lastWatered ? 1 : 0;
  const consistency = Math.min(actual / expectedWaterings, 1.0);
  const consistencyPct = Math.round(consistency * 100);

  let score = consistency * 80;
  if (daysOverdue === 0) {
    score += 20;
  } else {
    score -= Math.min(daysOverdue * 10, 30);
  }

  const finalScore = Math.round(Math.max(0, Math.min(100, score)));
  const state = scoreToState(finalScore);

  return {
    score: finalScore,
    state,
    ...HEALTH_STATE_CONFIG[state],
    daysOverdue,
    consistencyPct,
  };
}
