import { Plant } from "@/src/components/PlantCard";
import { calcNextWatering } from "@/src/utils/plantUtils";

// Fechas relativas al momento de ejecución para que los filtros funcionen
const today    = calcNextWatering(0);   // hoy
const overdue  = "2025-03-01";          // vencido (pasado fijo)
const tomorrow = calcNextWatering(1);
const in3days  = calcNextWatering(3);
const in7days  = calcNextWatering(7);
const in14days = calcNextWatering(14);

export const MOCK_PLANTS: Plant[] = [
  {
    id: "001",
    name: "Cactus San Pedro",
    scientificName: "Echinopsis pachanoi",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/49/Echinopsis_pachanoi_edit.jpg/800px-Echinopsis_pachanoi_edit.jpg",
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
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Monstera_deliciosa_-_1.jpg/800px-Monstera_deliciosa_-_1.jpg",
    lastWatered: "2025-03-05",
    nextWatering: today,          // → aparece en "Regar hoy"
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
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b6/Phalaenopsis_RBGE.jpg/800px-Phalaenopsis_RBGE.jpg",
    lastWatered: "2025-02-28",
    nextWatering: overdue,        // → ⚠️ vencida
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
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/Aloe_vera_flower_inset.png/800px-Aloe_vera_flower_inset.png",
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
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/Lavender_-_Lavandula_angustifolia.jpg/800px-Lavender_-_Lavandula_angustifolia.jpg",
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
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ea/Pothos_on_a_pole.jpg/800px-Pothos_on_a_pole.jpg",
    lastWatered: "2025-03-09",
    nextWatering: tomorrow,       // → aparece en "Regar hoy" (mañana muy pronto)
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
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/Echeveria_elegans_1.jpg/800px-Echeveria_elegans_1.jpg",
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
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/Mint-leaves-2007.jpg/800px-Mint-leaves-2007.jpg",
    lastWatered: "2025-03-10",
    nextWatering: in3days,
    sunlight: "medium",
    temperature: "15–25°C",
    waterFrequency: "c/3 días",
    location: "interior",
    category: "aromaticas",
  },
];
