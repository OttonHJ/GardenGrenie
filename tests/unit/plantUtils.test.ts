import {
  calcNextWatering,
  isWateringDue,
  matchesFilter,
  sortPlants,
  todayDateString,
} from "@/src/utils/plantUtils";
import { Plant } from "@/src/components/PlantCard";

// ─── Planta base para pruebas ──────────────────────────────────────────────────
const makePlant = (overrides: Partial<Plant> = {}): Plant => ({
  id: "test-1",
  name: "Planta Test",
  scientificName: "Plantus testus",
  category: "suculentas",
  location: "interior",
  waterFrequencyDays: 7,
  nextWatering: calcNextWatering(3), // en 3 días por defecto
  photoUrl: "",
  description: "",
  createdAt: Date.now(),
  wateringHistory: [],
  ...overrides,
});

// ─── calcNextWatering ──────────────────────────────────────────────────────────
describe("calcNextWatering", () => {
  it("con frecuencia 0 devuelve la fecha de hoy", () => {
    const result = calcNextWatering(0);
    const today = new Date();
    const expected = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
    expect(result).toBe(expected);
  });

  it("con frecuencia 7 devuelve la fecha de hoy + 7 días", () => {
    const result = calcNextWatering(7);
    const future = new Date();
    future.setDate(future.getDate() + 7);
    const expected = `${future.getFullYear()}-${String(future.getMonth() + 1).padStart(2, "0")}-${String(future.getDate()).padStart(2, "0")}`;
    expect(result).toBe(expected);
  });

  it("devuelve formato YYYY-MM-DD", () => {
    const result = calcNextWatering(1);
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

// ─── todayDateString ───────────────────────────────────────────────────────────
describe("todayDateString", () => {
  it("devuelve la misma fecha que calcNextWatering(0)", () => {
    expect(todayDateString()).toBe(calcNextWatering(0));
  });
});

// ─── isWateringDue ─────────────────────────────────────────────────────────────
describe("isWateringDue", () => {
  it("fecha pasada → necesita riego", () => {
    expect(isWateringDue("2020-01-01")).toBe(true);
  });

  it("fecha de hoy → necesita riego", () => {
    expect(isWateringDue(todayDateString())).toBe(true);
  });

  it("fecha futura → no necesita riego", () => {
    expect(isWateringDue(calcNextWatering(5))).toBe(false);
  });
});

// ─── matchesFilter ─────────────────────────────────────────────────────────────
describe("matchesFilter", () => {
  it("filtro 'all' acepta cualquier planta", () => {
    expect(matchesFilter(makePlant(), "all")).toBe(true);
  });

  it("filtro 'interior' acepta planta de interior", () => {
    expect(matchesFilter(makePlant({ location: "interior" }), "interior")).toBe(true);
  });

  it("filtro 'exterior' rechaza planta de interior", () => {
    expect(matchesFilter(makePlant({ location: "interior" }), "exterior")).toBe(false);
  });

  it("filtro 'suculentas' acepta planta con categoría suculentas", () => {
    expect(matchesFilter(makePlant({ category: "suculentas" }), "suculentas")).toBe(true);
  });

  it("filtro 'tropicales' rechaza planta con categoría suculentas", () => {
    expect(matchesFilter(makePlant({ category: "suculentas" }), "tropicales")).toBe(false);
  });

  it("filtro 'water-today' acepta planta con riego vencido", () => {
    const plant = makePlant({ nextWatering: "2020-06-01" });
    expect(matchesFilter(plant, "water-today")).toBe(true);
  });

  it("filtro 'water-today' rechaza planta con riego futuro", () => {
    const plant = makePlant({ nextWatering: calcNextWatering(10) });
    expect(matchesFilter(plant, "water-today")).toBe(false);
  });
});

// ─── sortPlants ────────────────────────────────────────────────────────────────
describe("sortPlants", () => {
  const plants: Plant[] = [
    makePlant({ id: "1", name: "Zanahoria", nextWatering: calcNextWatering(5), createdAt: 1000 }),
    makePlant({ id: "2", name: "Albahaca",  nextWatering: calcNextWatering(1), createdAt: 3000 }),
    makePlant({ id: "3", name: "Menta",     nextWatering: calcNextWatering(3), createdAt: 2000 }),
  ];

  it("ordena por nombre A-Z", () => {
    const sorted = sortPlants(plants, "name");
    expect(sorted.map((p) => p.name)).toEqual(["Albahaca", "Menta", "Zanahoria"]);
  });

  it("ordena por próximo riego (más urgente primero)", () => {
    const sorted = sortPlants(plants, "watering");
    expect(sorted.map((p) => p.id)).toEqual(["2", "3", "1"]);
  });

  it("ordena por más reciente (createdAt desc)", () => {
    const sorted = sortPlants(plants, "recent");
    expect(sorted.map((p) => p.id)).toEqual(["2", "3", "1"]);
  });

  it("no modifica el arreglo original", () => {
    const original = [...plants];
    sortPlants(plants, "name");
    expect(plants).toEqual(original);
  });
});
