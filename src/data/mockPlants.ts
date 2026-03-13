import { Plant } from "@/src/components/PlantCard";
import { calcNextWatering } from "@/src/utils/plantUtils";

// Fechas relativas al momento de ejecución para que los filtros funcionen
const today = calcNextWatering(0); // hoy
const overdue = "2025-03-01"; // vencido (pasado fijo)
const tomorrow = calcNextWatering(1);
const in3days = calcNextWatering(3);
const in7days = calcNextWatering(7);
const in14days = calcNextWatering(14);

// Imagen local genérica como placeholder.
// Cuando se integre expo-image-picker/camera cada planta tendrá su URI real.
const PLANT_IMG = require("@/assets/icons/plant.png");

export const MOCK_PLANTS: Plant[] = [
  {
    id: "001",
    name: "Cactus San Pedro",
    scientificName: "Echinopsis pachanoi",
    image: PLANT_IMG,
    lastWatered: "2025-03-01",
    nextWatering: in14days,
    sunlight: "high",
    temperature: "18–30°C",
    waterFrequency: "c/14 días",
    location: "exterior",
    category: "cactaceas",
  },
  {
    id: "002",
    name: "Monstera Deliciosa",
    scientificName: "Monstera deliciosa",
    image: PLANT_IMG,
    lastWatered: "2025-03-05",
    nextWatering: today,
    sunlight: "medium",
    temperature: "20–30°C",
    waterFrequency: "c/7 días",
    location: "interior",
    category: "tropicales",
  },
  {
    id: "003",
    name: "Orquídea Phalaenopsis",
    scientificName: "Phalaenopsis sp.",
    image: PLANT_IMG,
    lastWatered: "2025-02-28",
    nextWatering: overdue,
    sunlight: "low",
    temperature: "18–25°C",
    waterFrequency: "c/7 días",
    location: "interior",
    category: "tropicales",
  },
  {
    id: "004",
    name: "Aloe Vera",
    scientificName: "Aloe barbadensis",
    image: PLANT_IMG,
    lastWatered: "2025-03-01",
    nextWatering: in14days,
    sunlight: "high",
    temperature: "15–30°C",
    waterFrequency: "c/14 días",
    location: "exterior",
    category: "suculentas",
  },
  {
    id: "005",
    name: "Lavanda",
    scientificName: "Lavandula angustifolia",
    image: PLANT_IMG,
    lastWatered: "2025-03-08",
    nextWatering: in3days,
    sunlight: "high",
    temperature: "10–25°C",
    waterFrequency: "c/10 días",
    location: "exterior",
    category: "aromaticas",
  },
  {
    id: "006",
    name: "Pothos",
    scientificName: "Epipremnum aureum",
    image: PLANT_IMG,
    lastWatered: "2025-03-09",
    nextWatering: tomorrow,
    sunlight: "low",
    temperature: "18–30°C",
    waterFrequency: "c/7 días",
    location: "interior",
    category: "tropicales",
  },
  {
    id: "007",
    name: "Echeveria",
    scientificName: "Echeveria elegans",
    image: PLANT_IMG,
    lastWatered: "2025-03-01",
    nextWatering: in7days,
    sunlight: "high",
    temperature: "10–28°C",
    waterFrequency: "c/10 días",
    location: "exterior",
    category: "suculentas",
  },
  {
    id: "008",
    name: "Menta",
    scientificName: "Mentha spicata",
    image: PLANT_IMG,
    lastWatered: "2025-03-10",
    nextWatering: in3days,
    sunlight: "medium",
    temperature: "15–25°C",
    waterFrequency: "c/3 días",
    location: "interior",
    category: "aromaticas",
  },
];
