import { Plant } from "@/src/components/PlantCard";
import { db } from "@/src/config/firebase";
import { useAuth } from "@/src/context/AuthContext";
import {
  FilterId,
  calcNextWatering,
  todayDateString,
} from "@/src/utils/plantUtils";
import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

// ─── Tipos ─────────────────────────────────────────────────────────────────────

interface PlantsContextValue {
  plants: Plant[];
  loading: boolean;
  addPlant: (plant: Plant) => Promise<void>;
  updatePlant: (plant: Plant) => Promise<void>;
  deletePlant: (plantId: string) => Promise<void>;
  waterPlant: (plantId: string) => Promise<void>;
  activeFilter: FilterId;
  setActiveFilter: (filter: FilterId) => void;
}

// ─── Contexto ──────────────────────────────────────────────────────────────────

const PlantsContext = createContext<PlantsContextValue | null>(null);

// ─── Helpers ───────────────────────────────────────────────────────────────────

// Convierte un documento de Firestore al tipo Plant
function docToPlant(id: string, data: Record<string, any>): Plant {
  return {
    id,
    createdAt: data.createdAt ?? Date.now(),
    name: data.name ?? "",
    scientificName: data.scientificName ?? "",
    image: data.image ?? "",
    lastWatered: data.lastWatered ?? todayDateString(),
    nextWatering: data.nextWatering ?? todayDateString(),
    sunlight: data.sunlight ?? "medium",
    temperature: data.temperature ?? "",
    waterFrequency: data.waterFrequency ?? "c/7 días",
    location: data.location ?? "interior",
    category: data.category ?? "",
  };
}

// Convierte un Plant al objeto que se guarda en Firestore (solo strings)
function plantToDoc(plant: Plant): Record<string, any> {
  return {
    createdAt: plant.createdAt,
    name: plant.name,
    scientificName: plant.scientificName,
    image: typeof plant.image === "string" ? plant.image : "",
    lastWatered: plant.lastWatered,
    nextWatering: plant.nextWatering,
    sunlight: plant.sunlight,
    temperature: plant.temperature,
    waterFrequency: plant.waterFrequency,
    location: plant.location,
    category: plant.category,
  };
}

// ─── Provider ──────────────────────────────────────────────────────────────────

export function PlantsProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [plants, setPlants] = useState<Plant[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<FilterId>("all");

  // Escucha en tiempo real la colección del usuario
  useEffect(() => {
    if (!user) {
      setPlants([]);
      setLoading(false);
      return;
    }

    const plantsRef = collection(db, "users", user.uid, "plants");
    const q = query(plantsRef, orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const loaded = snapshot.docs.map((d) =>
        docToPlant(d.id, d.data())
      );
      setPlants(loaded);
      setLoading(false);
    });

    return unsubscribe;
  }, [user]);

  const addPlant = useCallback(async (plant: Plant) => {
    if (!user) return;
    const ref = doc(db, "users", user.uid, "plants", plant.id);
    await setDoc(ref, plantToDoc(plant));
  }, [user]);

  const updatePlant = useCallback(async (updated: Plant) => {
    if (!user) return;
    const ref = doc(db, "users", user.uid, "plants", updated.id);
    await updateDoc(ref, plantToDoc(updated));
  }, [user]);

  const deletePlant = useCallback(async (plantId: string) => {
    if (!user) return;
    const ref = doc(db, "users", user.uid, "plants", plantId);
    await deleteDoc(ref);
  }, [user]);

  const waterPlant = useCallback(async (plantId: string) => {
    if (!user) return;
    const plant = plants.find((p) => p.id === plantId);
    if (!plant) return;
    const match = plant.waterFrequency.match(/\d+/);
    const days = match ? parseInt(match[0]) : 7;
    const ref = doc(db, "users", user.uid, "plants", plantId);
    await updateDoc(ref, {
      lastWatered: todayDateString(),
      nextWatering: calcNextWatering(days),
    });
  }, [user, plants]);

  return (
    <PlantsContext.Provider
      value={{
        plants,
        loading,
        addPlant,
        updatePlant,
        deletePlant,
        waterPlant,
        activeFilter,
        setActiveFilter,
      }}
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
