import { usePlants } from "@/src/context/PlantContext";
import { useAchievements } from "@/src/hooks/useAchievements";
import { Achievement } from "@/src/utils/achievementUtils";
import React, { createContext, useContext } from "react";

interface AchievementsContextValue {
  unlockedAchievements: Achievement[];
  newAchievements: Achievement[];
  totalUnlocked: number;
  markSeen: (id: string) => void;
  stateLoaded: boolean;
}

const AchievementsContext = createContext<AchievementsContextValue | null>(null);

export function AchievementsProvider({ children }: { children: React.ReactNode }) {
  const { plants, loading } = usePlants();
  const value = useAchievements(plants, loading);

  return (
    <AchievementsContext.Provider value={value}>
      {children}
    </AchievementsContext.Provider>
  );
}

export function useAchievementsContext(): AchievementsContextValue {
  const ctx = useContext(AchievementsContext);
  if (!ctx) throw new Error("useAchievementsContext debe usarse dentro de AchievementsProvider");
  return ctx;
}
