import { Plant } from "@/src/components/PlantCard";
import { db } from "@/src/config/firebase";
import { useAuth } from "@/src/context/AuthContext";
import {
  ACHIEVEMENTS,
  ACHIEVEMENTS_DEFAULT,
  AchievementsFirestoreState,
  buildAchievementData,
  evaluateConditions,
  Achievement,
} from "@/src/utils/achievementUtils";
import { todayDateString } from "@/src/utils/plantUtils";
import {
  arrayUnion,
  doc,
  getDoc,
  increment,
  updateDoc,
} from "firebase/firestore";
import { useCallback, useEffect, useRef, useState } from "react";

// ─── Hook ──────────────────────────────────────────────────────────────────────

export function useAchievements(plants: Plant[], plantsLoading: boolean) {
  const { user } = useAuth();
  const [state, setState] = useState<AchievementsFirestoreState>(
    ACHIEVEMENTS_DEFAULT,
  );
  const [stateLoaded, setStateLoaded] = useState(false);
  // Plantas procesadas hoy (en memoria) para evitar doble-procesamiento sin esperar Firestore
  const processedTodayRef = useRef<Set<string>>(new Set());

  // ── Carga inicial desde Firestore ────────────────────────────────────────────
  useEffect(() => {
    if (!user) return;
    const userRef = doc(db, "users", user.uid);
    getDoc(userRef).then((snap) => {
      if (!snap.exists()) return;
      const data = snap.data();
      const raw = data?.achievements as Partial<AchievementsFirestoreState> | undefined;
      if (raw) {
        // Merge with defaults so missing Firestore fields don't crash .length calls
        const saved: AchievementsFirestoreState = { ...ACHIEVEMENTS_DEFAULT, ...raw };
        // Reset wateredTodayIds si el día cambió
        const today = todayDateString();
        if (saved.lastUpdatedDate !== today) {
          setState({ ...saved, wateredTodayIds: [], lastUpdatedDate: today });
          processedTodayRef.current = new Set();
        } else {
          setState(saved);
          processedTodayRef.current = new Set(saved.wateredTodayIds);
        }
      }
      setStateLoaded(true);
    });
  }, [user]);

  // ── Detección reactiva de nuevos riegos ──────────────────────────────────────
  useEffect(() => {
    if (!user || !stateLoaded || plantsLoading || plants.length === 0) return;

    const today = todayDateString();

    // Plantas regadas hoy que aún no procesamos
    const newlyWatered = plants.filter(
      (p) =>
        p.lastWatered === today &&
        !processedTodayRef.current.has(p.id),
    );

    if (newlyWatered.length === 0) {
      // Sin nuevos riegos — solo evaluar logros de plantas (addPlant)
      runEvaluation(state, false);
      return;
    }

    // Actualizar estado local optimistamente
    const updatedWateredIds = [
      ...state.wateredTodayIds,
      ...newlyWatered.map((p) => p.id),
    ];
    const updatedActiveDays = state.activeDays.includes(today)
      ? state.activeDays
      : [...state.activeDays, today];

    const updatedState: AchievementsFirestoreState = {
      ...state,
      totalWaterings: state.totalWaterings + newlyWatered.length,
      wateredTodayIds: updatedWateredIds,
      activeDays: updatedActiveDays,
      lastWateredDate: today,
      lastUpdatedDate: today,
    };

    // Marcar como procesadas en memoria
    newlyWatered.forEach((p) => processedTodayRef.current.add(p.id));

    // Escribir incrementos atómicos a Firestore
    const userRef = doc(db, "users", user.uid);
    updateDoc(userRef, {
      "achievements.totalWaterings": increment(newlyWatered.length),
      "achievements.activeDays": arrayUnion(today),
      "achievements.lastWateredDate": today,
      "achievements.lastUpdatedDate": today,
      "achievements.wateredTodayIds": arrayUnion(
        ...newlyWatered.map((p) => p.id),
      ),
    }).catch(console.error);

    setState(updatedState);
    runEvaluation(updatedState, true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plants, stateLoaded]);

  // ── Primera carga con datos existentes (retroactividad) ──────────────────────
  useEffect(() => {
    if (!user || !stateLoaded || plantsLoading) return;
    if (state.unlockedIds.length === 0 && plants.length > 0) {
      const data = buildAchievementData(plants, state);
      const newIds = evaluateConditions(data, []);
      if (newIds.length === 0) return;
      // Marcar como vistos automáticamente — no mostrar toast retroactivo
      const userRef = doc(db, "users", user.uid);
      updateDoc(userRef, {
        "achievements.unlockedIds": arrayUnion(...newIds),
        "achievements.seenIds": arrayUnion(...newIds),
      }).catch(console.error);
      setState((prev) => ({
        ...prev,
        unlockedIds: [...prev.unlockedIds, ...newIds],
        seenIds: [...prev.seenIds, ...newIds],
      }));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stateLoaded, plantsLoading]);

  // ── Evaluación de condiciones ────────────────────────────────────────────────
  const runEvaluation = useCallback(
    (currentState: AchievementsFirestoreState, fromWatering: boolean) => {
      if (!user) return;
      const data = buildAchievementData(plants, currentState);
      const newIds = evaluateConditions(data, currentState.unlockedIds);
      if (newIds.length === 0) return;

      const userRef = doc(db, "users", user.uid);
      updateDoc(userRef, {
        "achievements.unlockedIds": arrayUnion(...newIds),
      }).catch(console.error);

      setState((prev) => ({
        ...prev,
        unlockedIds: [...prev.unlockedIds, ...newIds],
      }));

      // Suprimir toast si no viene de una acción del usuario
      if (!fromWatering) {
        updateDoc(userRef, {
          "achievements.seenIds": arrayUnion(...newIds),
        }).catch(console.error);
        setState((prev) => ({
          ...prev,
          seenIds: [...prev.seenIds, ...newIds],
        }));
      }
    },
    [user, plants],
  );

  // ── Marcar logro como visto (dismiss toast) ──────────────────────────────────
  const markSeen = useCallback(
    (achievementId: string) => {
      if (!user) return;
      const userRef = doc(db, "users", user.uid);
      updateDoc(userRef, {
        "achievements.seenIds": arrayUnion(achievementId),
      }).catch(console.error);
      setState((prev) => ({
        ...prev,
        seenIds: [...prev.seenIds, achievementId],
      }));
    },
    [user],
  );

  // ── Valores derivados ────────────────────────────────────────────────────────
  const unlockedAchievements = ACHIEVEMENTS.filter((a) =>
    state.unlockedIds.includes(a.id),
  );

  const newAchievements: Achievement[] = ACHIEVEMENTS.filter(
    (a) =>
      state.unlockedIds.includes(a.id) && !state.seenIds.includes(a.id),
  );

  return {
    unlockedAchievements,
    newAchievements,
    totalUnlocked: state.unlockedIds.length,
    markSeen,
    stateLoaded,
  };
}
