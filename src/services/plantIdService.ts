/*
 * ¿Qué hace este archivo?
 * -----------------------
 * Conecta la app con nuestro backend en Render, que a su vez llama a plant.id.
 * Recibe la URI de una foto local, la convierte a base64, la envía al backend
 * y transforma la respuesta en datos listos para llenar el formulario.
 */

import * as FileSystem from "expo-file-system/legacy";

// URL del backend desplegado en Render
const BACKEND_URL = "https://gardengrenie-backend.onrender.com";

// ─── Tipos ────────────────────────────────────────────────────────────────────

export interface PlantIdentification {
  identified: boolean;
  name: string;               // nombre común (ej: "Costilla de Adán")
  scientificName: string;     // nombre científico (ej: "Monstera deliciosa")
  probability: number;        // confianza 0–1 (ej: 0.83 = 83%)
  waterFrequencyDays: number; // frecuencia de riego en días (3, 7, 10 o 14)
  category: string;           // categoría mapeada del formulario
  description: string;
  allSuggestions: Array<{
    name: string;
    commonName: string;
    probability: number;
  }>;
}

// ─── Funciones de mapeo ───────────────────────────────────────────────────────

/*
 * Convierte el rango de días de riego de plant.id a la opción más cercana
 * del formulario (3, 7, 10 o 14 días).
 *
 * plant.id devuelve { min: 2, max: 2 }, donde el número es días entre riegos.
 * Si no hay datos de riego, devuelve 7 (el valor por defecto del formulario).
 */
function mapWateringDays(watering: { min?: number; max?: number } | string): number {
  if (typeof watering === "string" || !watering?.min) return 7;
  const avg = ((watering.min ?? 7) + (watering.max ?? 7)) / 2;
  if (avg <= 4) return 3;
  if (avg <= 8) return 7;
  if (avg <= 12) return 10;
  return 14;
}

/*
 * Mapea la familia taxonómica de plant.id a las categorías del formulario.
 * Si la familia no está en la lista, devuelve "tropicales" por defecto.
 */
function mapCategory(family: string): string {
  const f = family.toLowerCase();
  if (f === "cactaceae") return "cactaceas";
  if (f === "orchidaceae") return "orquideas";
  if (f === "arecaceae") return "palmeras";
  if (["polypodiaceae", "dryopteridaceae", "nephrolepidaceae", "aspleniaceae",
       "pteridaceae", "blechnaceae", "thelypteridaceae", "dennstaedtiaceae"].includes(f))
    return "helechos";
  if (["crassulaceae", "aizoaceae", "portulacaceae", "asphodelaceae",
       "xanthorrhoeaceae"].includes(f))
    return "suculentas";
  if (["lamiaceae", "apiaceae", "asteraceae", "myrtaceae", "verbenaceae"].includes(f))
    return "aromaticas";
  return "tropicales";
}

// ─── Función principal ────────────────────────────────────────────────────────

/*
 * identifyPlant
 * -------------
 * Recibe la URI local de una foto (ej: "file:///data/...jpg"),
 * la convierte a base64 y llama al backend para identificar la planta.
 *
 * Lanza un Error si el servidor no responde o si ocurre un problema de red.
 */
export async function identifyPlant(uri: string): Promise<PlantIdentification> {
  // Convierte la imagen local a base64.
  // expo-file-system lee el archivo directamente desde el dispositivo.
  const base64 = await FileSystem.readAsStringAsync(uri, {
    encoding: "base64",
  });

  // Envía la imagen al backend — el backend agrega la API key y llama a plant.id
  const response = await fetch(`${BACKEND_URL}/identify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ image: base64 }),
  });

  if (!response.ok) {
    throw new Error(`Error del servidor: ${response.status}`);
  }

  const data = await response.json();

  // Si plant.id no pudo identificar ninguna planta en la imagen
  if (!data.identified) {
    return {
      identified: false,
      name: "",
      scientificName: "",
      probability: 0,
      waterFrequencyDays: 7,
      category: "tropicales",
      description: "",
      allSuggestions: [],
    };
  }

  return {
    identified: true,
    name: data.commonName || data.name,
    scientificName: data.name,
    probability: data.probability,
    waterFrequencyDays: mapWateringDays(data.watering),
    category: mapCategory(data.taxonomy?.family ?? ""),
    description: data.description ?? "",
    allSuggestions: data.allSuggestions ?? [],
  };
}
