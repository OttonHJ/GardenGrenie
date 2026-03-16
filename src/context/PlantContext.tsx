import { Plant } from "@/src/components/PlantCard";
import { MOCK_PLANTS } from "@/src/data/mockPlants";
import { calcNextWatering, todayDateString } from "@/src/utils/plantUtils";
import React, { createContext, useCallback, useContext, useState } from "react";

// ─── Tipos ─────────────────────────────────────────────────────────────────────

interface PlantsContextValue {
  plants: Plant[];
  addPlant: (plant: Plant) => void;
  updatePlant: (plant: Plant) => void;
  deletePlant: (plantId: string) => void;
  waterPlant: (plantId: string) => void;
}

// ─── Contexto ──────────────────────────────────────────────────────────────────

const PlantsContext = createContext<PlantsContextValue | null>(null);

// ─── Provider ──────────────────────────────────────────────────────────────────

export function PlantsProvider({ children }: { children: React.ReactNode }) {
  const [plants, setPlants] = useState<Plant[]>(MOCK_PLANTS);

  const addPlant = useCallback((plant: Plant) => {
    setPlants((prev) => [plant, ...prev]);
  }, []);

  const updatePlant = useCallback((updated: Plant) => {
    setPlants((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
  }, []);

  const deletePlant = useCallback((plantId: string) => {
    setPlants((prev) => prev.filter((p) => p.id !== plantId));
  }, []);

  const waterPlant = useCallback((plantId: string) => {
    setPlants((prev) =>
      prev.map((p) => {
        if (p.id !== plantId) return p;
        const match = p.waterFrequency.match(/\d+/);
        const days = match ? parseInt(match[0]) : 7;
        return {
          ...p,
          lastWatered: todayDateString(),
          nextWatering: calcNextWatering(days),
        };
      }),
    );
  }, []);

  return (
    <PlantsContext.Provider
      value={{ plants, addPlant, updatePlant, deletePlant, waterPlant }}
    >
      {children}
    </PlantsContext.Provider>
  );
}

// ─── Hook ──────────────────────────────────────────────────────────────────────

export function usePlants(): PlantsContextValue {
  const ctx = useContext(PlantsContext);
  if (!ctx) throw new Error("usePlants debe usarse dentro de <PlantsProvider>");
  return ctx;
}
