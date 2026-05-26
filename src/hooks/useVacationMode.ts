import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useState } from "react";
import { todayDateString } from "@/src/utils/plantUtils";

const STORAGE_KEY = "vacationMode";

export interface VacationData {
  active: boolean;
  startDate: string;
  endDate: string;
}

interface UseVacationModeResult {
  vacation: VacationData | null;
  activate: (startDate: string, endDate: string) => Promise<void>;
  deactivate: () => Promise<void>;
  loading: boolean;
}

export function useVacationMode(): UseVacationModeResult {
  const [vacation, setVacation] = useState<VacationData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const data: VacationData = JSON.parse(raw);
          const today = todayDateString();
          // Auto-desactivar si la vacación ya terminó
          if (data.active && data.endDate < today) {
            await AsyncStorage.removeItem(STORAGE_KEY);
          } else {
            setVacation(data);
          }
        }
      } catch {}
      setLoading(false);
    };
    load();
  }, []);

  const activate = useCallback(async (startDate: string, endDate: string) => {
    const data: VacationData = { active: true, startDate, endDate };
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      setVacation(data);
    } catch {}
  }, []);

  const deactivate = useCallback(async () => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
      setVacation(null);
    } catch {}
  }, []);

  return { vacation, activate, deactivate, loading };
}
