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

// Calcula la próxima fecha de riego: hoy + N días, formato "YYYY-MM-DD"
// Usa fecha local para evitar desfase por zona horaria (toISOString devuelve UTC)
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
  | "cactaceas";

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
