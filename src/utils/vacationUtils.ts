import { Plant } from "@/src/components/PlantCard";
import { parseWaterFrequencyDays, todayDateString } from "@/src/utils/plantUtils";

export type RiskLevel = "critical" | "warning" | "safe";

export interface AtRiskPlant {
  plant: Plant;
  firstRiskDate: string;
  riskLevel: RiskLevel;
}

// Proyecta fechas futuras de riego para una planta y retorna la primera
// que cae dentro del rango [vacStart, vacEnd], o null si ninguna cae.
function firstWateringInRange(
  plant: Plant,
  vacStart: string,
  vacEnd: string,
): string | null {
  const freqDays = parseWaterFrequencyDays(plant.waterFrequency);
  let current = plant.nextWatering;

  // Avanzar hasta el inicio de la vacación o encontrar una fecha en rango
  while (current <= vacEnd) {
    if (current >= vacStart) return current;
    // Sumar freqDays días (local, sin desfase UTC)
    const [y, m, d] = current.split("-").map(Number);
    const next = new Date(y, m - 1, d + freqDays);
    current = `${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, "0")}-${String(next.getDate()).padStart(2, "0")}`;
  }
  return null;
}

function calcRiskLevel(firstRiskDate: string, vacStart: string): RiskLevel {
  const [ry, rm, rd] = firstRiskDate.split("-").map(Number);
  const [sy, sm, sd] = vacStart.split("-").map(Number);
  const riskMs = new Date(ry, rm - 1, rd).getTime();
  const startMs = new Date(sy, sm - 1, sd).getTime();
  const daysDiff = (riskMs - startMs) / 86_400_000;
  return daysDiff <= 2 ? "critical" : "warning";
}

export function calcAtRiskPlants(
  plants: Plant[],
  vacStart: string,
  vacEnd: string,
): AtRiskPlant[] {
  const result: AtRiskPlant[] = [];

  for (const plant of plants) {
    const firstRiskDate = firstWateringInRange(plant, vacStart, vacEnd);
    if (firstRiskDate) {
      result.push({
        plant,
        firstRiskDate,
        riskLevel: calcRiskLevel(firstRiskDate, vacStart),
      });
    }
  }

  // Orden: crítico primero, luego precaución, por fecha dentro de cada nivel
  const order: Record<RiskLevel, number> = { critical: 0, warning: 1, safe: 2 };
  return result.sort((a, b) => {
    const lvlDiff = order[a.riskLevel] - order[b.riskLevel];
    if (lvlDiff !== 0) return lvlDiff;
    return a.firstRiskDate.localeCompare(b.firstRiskDate);
  });
}

// Valida el rango de fechas. Retorna string con error o null si es válido.
export function validateVacationDates(
  startDate: string,
  endDate: string,
): string | null {
  const today = todayDateString();
  if (startDate < today) return "La fecha de inicio debe ser hoy o en el futuro";
  if (endDate <= startDate) return "La fecha de fin debe ser posterior al inicio";
  const [sy, sm, sd] = startDate.split("-").map(Number);
  const [ey, em, ed] = endDate.split("-").map(Number);
  const days =
    (new Date(ey, em - 1, ed).getTime() - new Date(sy, sm - 1, sd).getTime()) /
    86_400_000;
  if (days > 60) return "La vacación no puede superar 60 días";
  return null;
}
