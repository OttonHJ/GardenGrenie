import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useRef, useState } from "react";
import { Plant } from "@/src/components/PlantCard";
import { calcStreak, todayDateString } from "@/src/utils/plantUtils";

const STORAGE_KEY = "streakSnapshot";

interface StreakSnapshot {
  streak: number;
  date: string;
}

// Detecta si se perdió una racha activa desde la última apertura.
// Retorna el número de días de la racha perdida (0 = sin novedad).
export function useStreakBreak(plants: Plant[], loading: boolean) {
  const [brokenStreak, setBrokenStreak] = useState(0);
  const checkedRef = useRef(false);

  useEffect(() => {
    if (loading || checkedRef.current) return;
    checkedRef.current = true;

    const check = async () => {
      const current = calcStreak(plants);
      const today = todayDateString();

      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const saved: StreakSnapshot = JSON.parse(raw);
          if (saved.streak > 0 && saved.date !== today && current === 0) {
            setBrokenStreak(saved.streak);
          }
        }
      } catch {}

      try {
        await AsyncStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({ streak: current, date: today }),
        );
      } catch {}
    };

    check();
  }, [loading, plants]);

  return {
    brokenStreak,
    dismiss: () => setBrokenStreak(0),
  };
}
