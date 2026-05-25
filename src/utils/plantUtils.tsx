import { Plant } from "@/src/components/PlantCard";

// ─── Riego ─────────────────────────────────────────────────────────────────────

// Devuelve true si nextWatering es hoy o ya pasó
export function isWateringDue(nextWatering: string): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const waterDate = new Date(nextWatering);
  waterDate.setHours(0, 0, 0, 0);
  return waterDate <= today;
}

// Devuelve la fecha de hoy en formato "YYYY-MM-DD" usando fecha local (no UTC)
export function todayDateString(): string {
  return calcNextWatering(0);
}

// Calcula la próxima fecha de riego: hoy + N días, formato "YYYY-MM-DD"
// Usa fecha local para evitar desfase por zona horaria
export function calcNextWatering(frequencyDays: number): string {
  const date = new Date();
  date.setDate(date.getDate() + frequencyDays);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

// ─── Filtros ───────────────────────────────────────────────────────────────────

export type FilterId =
  | "all"
  | "water-today"
  | "interior"
  | "exterior"
  | "suculentas"
  | "tropicales"
  | "aromaticas"
  | "cactaceas"
  | "orquideas"
  | "helechos"
  | "palmeras";

export interface FilterOption {
  id: FilterId;
  label: string;
}

export const FILTER_OPTIONS: FilterOption[] = [
  { id: "all", label: "🌿 Todas" },
  { id: "water-today", label: "💧 Regar hoy" },
  { id: "interior", label: "🏠 Interior" },
  { id: "exterior", label: "🌞 Exterior" },
  { id: "suculentas", label: "🪴 Suculentas" },
  { id: "tropicales", label: "🌴 Tropicales" },
  { id: "aromaticas", label: "🌿 Aromáticas" },
  { id: "cactaceas", label: "🌵 Cactáceas" },
  { id: "orquideas", label: "🌸 Orquídeas" },
  { id: "helechos", label: "🌱 Helechos" },
  { id: "palmeras", label: "🌴 Palmeras" },
];

export function matchesFilter(plant: Plant, filter: FilterId): boolean {
  switch (filter) {
    case "all":
      return true;
    case "water-today":
      return isWateringDue(plant.nextWatering);
    case "interior":
      return plant.location === "interior";
    case "exterior":
      return plant.location === "exterior";
    default:
      return plant.category.toLowerCase() === filter;
  }
}

// ─── Planta favorita ───────────────────────────────────────────────────────────

// Score compuesto: consistencia de riegos (normalizada por frecuencia y edad)
// con bonus de recencia si fue regada en los últimos 30 días.
// Esto evita el sesgo por frecuencia (cactácea c/14 días vs tropical c/3 días)
// y por edad (planta nueva vs planta de 6 meses).
export function calcFavoritePlant(plants: Plant[]): Plant | null {
  if (plants.length === 0) return null;

  const now = Date.now();

  const scored = plants.map((plant) => {
    const daysSinceCreation = Math.max((now - plant.createdAt) / 86_400_000, 1);
    const freqMatch = plant.waterFrequency.match(/\d+/);
    const freqDays = freqMatch ? parseInt(freqMatch[0]) : 7;

    const actual = (plant.wateringHistory ?? []).length;
    // Riegos esperados en la ventana medida (máx 60 slots de historial)
    const expected = Math.min(daysSinceCreation / freqDays, 60);
    const consistency = actual / Math.max(expected, 1);

    // Bonus ×1.2 si fue regada en los últimos 30 días
    const lastWateredDays = plant.lastWatered
      ? (now - new Date(plant.lastWatered).getTime()) / 86_400_000
      : Infinity;
    const recency = lastWateredDays <= 30 ? 1.2 : 1.0;

    return { plant, score: consistency * recency };
  });

  const best = scored.reduce((a, b) => (b.score > a.score ? b : a));
  return best.plant;
}

// ─── Ordenamiento ──────────────────────────────────────────────────────────────

export type SortId = "name" | "watering" | "recent";

export interface SortOption {
  id: SortId;
  label: string;
}

export const SORT_OPTIONS: SortOption[] = [
  { id: "name", label: "Nombre A-Z" },
  { id: "watering", label: "Próximo riego" },
  { id: "recent", label: "Más reciente" },
];

export function sortPlants(plants: Plant[], sortBy: SortId): Plant[] {
  const copy = [...plants];
  switch (sortBy) {
    case "name":
      return copy.sort((a, b) => a.name.localeCompare(b.name));
    case "watering":
      return copy.sort(
        (a, b) =>
          new Date(a.nextWatering).getTime() -
          new Date(b.nextWatering).getTime(),
      );
    case "recent":
    default:
      return copy.sort((a, b) => b.createdAt - a.createdAt);
  }
}
