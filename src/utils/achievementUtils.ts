import { Plant } from "@/src/components/PlantCard";
import { calcStreak, todayDateString } from "@/src/utils/plantUtils";

// ─── Tipos ─────────────────────────────────────────────────────────────────────

export type AchievementRarity = "comun" | "raro" | "epico" | "legendario";
export type AchievementCategory =
  | "plantas"
  | "riego"
  | "racha"
  | "especial"
  | "oculto";

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: AchievementCategory;
  rarity: AchievementRarity;
  hidden?: boolean;
}

export interface AchievementData {
  totalPlants: number;
  totalWaterings: number;
  currentStreak: number;
  totalActiveDays: number;
  wateredTodayCount: number;
  inactiveDays: number;
}

// Estado almacenado en Firestore bajo users/{uid}.achievements
export interface AchievementsFirestoreState {
  unlockedIds: string[];
  seenIds: string[];
  totalWaterings: number;
  activeDays: string[];
  wateredTodayIds: string[];
  lastUpdatedDate: string;
  lastWateredDate: string | null;
}

export const ACHIEVEMENTS_DEFAULT: AchievementsFirestoreState = {
  unlockedIds: [],
  seenIds: [],
  totalWaterings: 0,
  activeDays: [],
  wateredTodayIds: [],
  lastUpdatedDate: "",
  lastWateredDate: null,
};

// ─── Catálogo V1 ───────────────────────────────────────────────────────────────

export const ACHIEVEMENTS: Achievement[] = [
  // Plantas
  {
    id: "first_seed",
    title: "Primera Semilla",
    description: "Agrega tu primera planta al jardín.",
    icon: "🌱",
    category: "plantas",
    rarity: "comun",
  },
  {
    id: "growing_garden",
    title: "Jardín en Crecimiento",
    description: "Registra 5 plantas en tu jardín.",
    icon: "🪴",
    category: "plantas",
    rarity: "comun",
  },
  {
    id: "urban_jungle",
    title: "Selva Urbana",
    description: "Llega a 20 plantas en tu jardín.",
    icon: "🌳",
    category: "plantas",
    rarity: "raro",
  },
  // Riego
  {
    id: "first_water",
    title: "Primer Riego",
    description: "Marca una planta como regada por primera vez.",
    icon: "💧",
    category: "riego",
    rarity: "comun",
  },
  {
    id: "hydrator",
    title: "Hidratador",
    description: "Registra 10 riegos en total.",
    icon: "🚿",
    category: "riego",
    rarity: "comun",
  },
  {
    id: "dedicated_caretaker",
    title: "Cuidador Dedicado",
    description: "Registra 100 riegos en total.",
    icon: "🌊",
    category: "riego",
    rarity: "raro",
  },
  {
    id: "green_guardian",
    title: "Guardián Verde",
    description: "Registra 500 riegos en total.",
    icon: "⛲",
    category: "riego",
    rarity: "epico",
  },
  // Racha
  {
    id: "first_step",
    title: "Primer Paso",
    description: "Mantén una racha de 3 días consecutivos.",
    icon: "🔥",
    category: "racha",
    rarity: "comun",
  },
  {
    id: "one_week_green",
    title: "Una Semana Verde",
    description: "Mantén una racha de 7 días.",
    icon: "📅",
    category: "racha",
    rarity: "comun",
  },
  {
    id: "gardener_constant",
    title: "Jardinero Constante",
    description: "Mantén una racha de 30 días.",
    icon: "🗓️",
    category: "racha",
    rarity: "raro",
  },
  {
    id: "expert_routines",
    title: "Experto en Rutinas",
    description: "Mantén una racha de 100 días.",
    icon: "🏅",
    category: "racha",
    rarity: "epico",
  },
  {
    id: "green_legend",
    title: "Leyenda Verde",
    description: "Mantén una racha de 365 días.",
    icon: "👑",
    category: "racha",
    rarity: "legendario",
  },
  // Especiales / ocultos
  {
    id: "all_in_control",
    title: "Todo Bajo Control",
    description: "Riega todas tus plantas el mismo día.",
    icon: "✅",
    category: "oculto",
    rarity: "epico",
    hidden: true,
  },
  {
    id: "green_marathon",
    title: "Maratón Verde",
    description: "Registra más de 10 riegos en un solo día.",
    icon: "🏃",
    category: "oculto",
    rarity: "raro",
    hidden: true,
  },
  {
    id: "back_to_garden",
    title: "Regreso al Jardín",
    description: "Vuelve a regar tras 30 días de inactividad.",
    icon: "🌿",
    category: "oculto",
    rarity: "raro",
    hidden: true,
  },
];

export const ACHIEVEMENTS_TOTAL = ACHIEVEMENTS.length;

// ─── Evaluación ────────────────────────────────────────────────────────────────

export function evaluateConditions(
  data: AchievementData,
  currentUnlocked: string[],
): string[] {
  const unlocked = new Set(currentUnlocked);
  const newlyUnlocked: string[] = [];

  const check = (id: string, condition: boolean) => {
    if (condition && !unlocked.has(id)) newlyUnlocked.push(id);
  };

  check("first_seed", data.totalPlants >= 1);
  check("growing_garden", data.totalPlants >= 5);
  check("urban_jungle", data.totalPlants >= 20);

  check("first_water", data.totalWaterings >= 1);
  check("hydrator", data.totalWaterings >= 10);
  check("dedicated_caretaker", data.totalWaterings >= 100);
  check("green_guardian", data.totalWaterings >= 500);

  check("first_step", data.currentStreak >= 3);
  check("one_week_green", data.currentStreak >= 7);
  check("gardener_constant", data.currentStreak >= 30);
  check("expert_routines", data.currentStreak >= 100);
  check("green_legend", data.currentStreak >= 365);

  check(
    "all_in_control",
    data.totalPlants > 0 && data.wateredTodayCount >= data.totalPlants,
  );
  check("green_marathon", data.wateredTodayCount >= 10);
  check("back_to_garden", data.inactiveDays >= 30 && data.totalWaterings > 0);

  return newlyUnlocked;
}

// ─── Helpers UI ────────────────────────────────────────────────────────────────

export const RARITY_LABELS: Record<AchievementRarity, string> = {
  comun: "Común",
  raro: "Raro",
  epico: "Épico",
  legendario: "Legendario",
};

export function buildAchievementData(
  plants: Plant[],
  state: AchievementsFirestoreState,
): AchievementData {
  const today = todayDateString();
  const lastWateredDate = state.lastWateredDate;
  const inactiveDays = lastWateredDate
    ? Math.floor(
        (new Date(today).getTime() - new Date(lastWateredDate).getTime()) /
          86_400_000,
      )
    : 0;

  return {
    totalPlants: plants.length,
    totalWaterings: state.totalWaterings,
    currentStreak: calcStreak(plants),
    totalActiveDays: state.activeDays.length,
    wateredTodayCount: state.wateredTodayIds.length,
    inactiveDays,
  };
}
