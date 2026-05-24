# Documentación de Pruebas — GardenGenie
**EIF209 – Lab 4 | Testing**

---

## Configuración del entorno de pruebas

### Herramientas utilizadas

| Herramienta | Versión | Propósito |
|---|---|---|
| Jest | ~29.7.0 | Framework base de pruebas |
| jest-expo | ~54.0.17 | Preset oficial de Expo para Jest |
| React Native Testing Library | ^13.3.3 | Render y consulta de componentes |
| Zod | ^3.25.76 | Validación de esquemas (bajo prueba) |

### Archivos de configuración

- **`jest.config.js`** — preset `jest-expo`, alias `@/`, mocks de módulos nativos
- **`tests/jest.setup.js`** — mocks de Firebase, AsyncStorage, expo-router, Reanimated

### Comandos disponibles

```bash
npm test               # Corre todas las pruebas
npm run test:watch     # Modo observador (re-corre al guardar)
npm run test:coverage  # Genera reporte de cobertura en /coverage
```

---

## Prueba 1 — Funciones utilitarias de plantas

### Descripción

Verifica el correcto funcionamiento de las funciones puras del módulo `src/utils/plantUtils.tsx`. Estas funciones son el núcleo de la lógica de negocio de la app: calculan cuándo regar una planta, determinan si el riego está vencido, filtran plantas por categoría/ubicación y las ordenan por distintos criterios. Dado que estas funciones no dependen de ningún componente de React Native, se prueban directamente con Jest como pruebas unitarias puras.

**Archivo:** `tests/unit/plantUtils.test.ts`  
**Módulo bajo prueba:** `src/utils/plantUtils.tsx`

### Funciones cubiertas

| Función | Descripción |
|---|---|
| `calcNextWatering(days)` | Calcula la fecha de próximo riego sumando `days` días a hoy |
| `todayDateString()` | Devuelve la fecha actual en formato `YYYY-MM-DD` |
| `isWateringDue(date)` | Retorna `true` si la fecha de riego es hoy o ha pasado |
| `matchesFilter(plant, filter)` | Determina si una planta cumple el filtro activo |
| `sortPlants(plants, sort)` | Ordena un arreglo de plantas por nombre, riego urgente o más reciente |

### Fragmento de código

```typescript
import {
  calcNextWatering,
  isWateringDue,
  matchesFilter,
  sortPlants,
  todayDateString,
} from "@/src/utils/plantUtils";
import { Plant } from "@/src/components/PlantCard";

const makePlant = (overrides: Partial<Plant> = {}): Plant => ({
  id: "test-1",
  name: "Planta Test",
  scientificName: "Plantus testus",
  category: "suculentas",
  location: "interior",
  waterFrequencyDays: 7,
  nextWatering: calcNextWatering(3),
  photoUrl: "",
  description: "",
  createdAt: Date.now(),
  wateringHistory: [],
  ...overrides,
});

// calcNextWatering
describe("calcNextWatering", () => {
  it("con frecuencia 0 devuelve la fecha de hoy", () => {
    const result = calcNextWatering(0);
    const today = new Date();
    const expected = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
    expect(result).toBe(expected);
  });

  it("devuelve formato YYYY-MM-DD", () => {
    expect(calcNextWatering(1)).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

// isWateringDue
describe("isWateringDue", () => {
  it("fecha pasada → necesita riego", () => {
    expect(isWateringDue("2020-01-01")).toBe(true);
  });

  it("fecha futura → no necesita riego", () => {
    expect(isWateringDue(calcNextWatering(5))).toBe(false);
  });
});

// matchesFilter
describe("matchesFilter", () => {
  it("filtro 'water-today' acepta planta con riego vencido", () => {
    const plant = makePlant({ nextWatering: "2020-06-01" });
    expect(matchesFilter(plant, "water-today")).toBe(true);
  });

  it("filtro 'tropicales' rechaza planta con categoría suculentas", () => {
    expect(matchesFilter(makePlant({ category: "suculentas" }), "tropicales")).toBe(false);
  });
});

// sortPlants
describe("sortPlants", () => {
  it("ordena por nombre A-Z", () => {
    const plants = [
      makePlant({ name: "Zanahoria" }),
      makePlant({ name: "Albahaca" }),
      makePlant({ name: "Menta" }),
    ];
    const sorted = sortPlants(plants, "name");
    expect(sorted.map((p) => p.name)).toEqual(["Albahaca", "Menta", "Zanahoria"]);
  });

  it("no modifica el arreglo original", () => {
    const plants = [makePlant({ id: "1" }), makePlant({ id: "2" })];
    const original = [...plants];
    sortPlants(plants, "name");
    expect(plants).toEqual(original);
  });
});
```

### Resultado de ejecución

```
PASS tests/unit/plantUtils.test.ts
  calcNextWatering
    √ con frecuencia 0 devuelve la fecha de hoy
    √ con frecuencia 7 devuelve la fecha de hoy + 7 días
    √ devuelve formato YYYY-MM-DD
  todayDateString
    √ devuelve la misma fecha que calcNextWatering(0)
  isWateringDue
    √ fecha pasada → necesita riego
    √ fecha de hoy → necesita riego
    √ fecha futura → no necesita riego
  matchesFilter
    √ filtro 'all' acepta cualquier planta
    √ filtro 'interior' acepta planta de interior
    √ filtro 'exterior' rechaza planta de interior
    √ filtro 'suculentas' acepta planta con categoría suculentas
    √ filtro 'tropicales' rechaza planta con categoría suculentas
    √ filtro 'water-today' acepta planta con riego vencido
    √ filtro 'water-today' rechaza planta con riego futuro
  sortPlants
    √ ordena por nombre A-Z
    √ ordena por próximo riego (más urgente primero)
    √ ordena por más reciente (createdAt desc)
    √ no modifica el arreglo original

Tests: 18 passed, 18 total
```

> **Nota:** Adjuntar captura de pantalla de la terminal ejecutando `npm test` con los 18 tests en verde.

---

## Prueba 2 — Validación de esquemas Zod

### Descripción

Verifica que los esquemas de validación Zod (`loginSchema`, `plantSchema`, `registerSchema`) rechacen datos inválidos con los mensajes de error correctos y acepten datos válidos sin errores. Esta es la capa de validación crítica que protege todos los formularios de la aplicación: login, registro y alta de plantas. Si esta lógica falla, datos corruptos podrían llegar a Firebase.

Las pruebas utilizan `safeParse()` de Zod directamente, sin necesidad de renderizar componentes, lo que las hace rápidas y deterministas.

**Archivo:** `tests/unit/schemas.test.ts`  
**Módulo bajo prueba:** `src/schemas/index.tsx`

### Casos cubiertos

| Esquema | Caso de prueba | Resultado esperado |
|---|---|---|
| `loginSchema` | Correo + contraseña válidos | `success: true` |
| `loginSchema` | Correo vacío | "El correo es obligatorio" |
| `loginSchema` | Correo sin formato | "El correo no tiene un formato válido" |
| `loginSchema` | Contraseña < 8 chars | "La contraseña debe tener al menos 8 caracteres" |
| `plantSchema` | Todos los campos válidos | `success: true` |
| `plantSchema` | Nombre vacío | "El nombre de la planta es obligatorio" |
| `plantSchema` | Nombre > 60 chars | "El nombre no puede superar los 60 caracteres" |
| `plantSchema` | Categoría no reconocida | "Selecciona una categoría válida" |
| `plantSchema` | Frecuencia de riego = 0 | "La frecuencia debe ser al menos 1 día" |
| `plantSchema` | Frecuencia de riego = 61 | "La frecuencia no puede superar los 60 días" |
| `plantSchema` | Sin nombre científico | `success: true` (campo opcional) |
| `registerSchema` | Todos los campos válidos | `success: true` |
| `registerSchema` | Contraseñas distintas | "Las contraseñas no coinciden" |
| `registerSchema` | Username con mayúsculas/espacios | "El alias solo puede tener letras minúsculas, números, puntos y guiones bajos" |
| `registerSchema` | Fecha en formato ISO | "La fecha debe tener el formato DD/MM/AAAA" |
| `registerSchema` | Fecha en formato DD/MM/AAAA | `success: true` |

### Fragmento de código

```typescript
import { loginSchema, plantSchema, registerSchema } from "@/src/schemas";

// loginSchema
describe("loginSchema", () => {
  it("datos válidos pasan la validación", () => {
    const result = loginSchema.safeParse({
      email: "usuario@gmail.com",
      password: "contraseña123",
    });
    expect(result.success).toBe(true);
  });

  it("correo vacío → 'El correo es obligatorio'", () => {
    const result = loginSchema.safeParse({ email: "", password: "contraseña123" });
    expect(result.success).toBe(false);
    const messages = result.error!.issues.map((i) => i.message);
    expect(messages).toContain("El correo es obligatorio");
  });

  it("contraseña menor a 8 caracteres → error de longitud mínima", () => {
    const result = loginSchema.safeParse({ email: "usuario@gmail.com", password: "abc" });
    expect(result.success).toBe(false);
    const messages = result.error!.issues.map((i) => i.message);
    expect(messages).toContain("La contraseña debe tener al menos 8 caracteres");
  });
});

// plantSchema
describe("plantSchema", () => {
  const validPlant = {
    name: "Sábila",
    category: "suculentas" as const,
    location: "interior" as const,
    sunlight: "medium" as const,
    temperature: "18-25°C",
    waterFrequencyDays: 7,
  };

  it("frecuencia de riego 0 → 'La frecuencia debe ser al menos 1 día'", () => {
    const result = plantSchema.safeParse({ ...validPlant, waterFrequencyDays: 0 });
    expect(result.success).toBe(false);
    const messages = result.error!.issues.map((i) => i.message);
    expect(messages).toContain("La frecuencia debe ser al menos 1 día");
  });

  it("categoría inválida → 'Selecciona una categoría válida'", () => {
    const result = plantSchema.safeParse({ ...validPlant, category: "inexistente" });
    expect(result.success).toBe(false);
    const messages = result.error!.issues.map((i) => i.message);
    expect(messages).toContain("Selecciona una categoría válida");
  });
});

// registerSchema — contraseñas no coinciden
describe("registerSchema", () => {
  it("contraseñas distintas → 'Las contraseñas no coinciden'", () => {
    const result = registerSchema.safeParse({
      name: "Juan Pérez",
      username: "juan_perez",
      email: "juan@gmail.com",
      password: "segura123",
      confirmPassword: "diferente",
    });
    expect(result.success).toBe(false);
    const messages = result.error!.issues.map((i) => i.message);
    expect(messages).toContain("Las contraseñas no coinciden");
  });
});
```

### Resultado de ejecución

```
PASS tests/unit/schemas.test.ts
  loginSchema
    √ datos válidos pasan la validación
    √ correo vacío → 'El correo es obligatorio'
    √ correo con formato inválido → 'El correo no tiene un formato válido'
    √ contraseña menor a 8 caracteres → error de longitud mínima
  plantSchema
    √ datos válidos pasan la validación
    √ nombre vacío → 'El nombre de la planta es obligatorio'
    √ nombre mayor a 60 caracteres → error de longitud máxima
    √ categoría inválida → 'Selecciona una categoría válida'
    √ frecuencia de riego 0 → 'La frecuencia debe ser al menos 1 día'
    √ frecuencia de riego mayor a 60 → 'La frecuencia no puede superar los 60 días'
    √ scientificName opcional — planta sin nombre científico pasa
  registerSchema
    √ datos válidos pasan la validación
    √ contraseñas distintas → 'Las contraseñas no coinciden'
    √ username con caracteres inválidos → mensaje de formato
    √ birthday con formato inválido → 'La fecha debe tener el formato DD/MM/AAAA'
    √ birthday correcto DD/MM/AAAA pasa la validación

Tests: 16 passed, 16 total
```

> **Nota:** Adjuntar captura de pantalla de la terminal ejecutando `npm test` con los 16 tests en verde.

---

## Resultado consolidado

```
PASS tests/unit/plantUtils.test.ts
PASS tests/unit/schemas.test.ts

Test Suites: 2 passed, 2 total
Tests:       34 passed, 34 total
Snapshots:   0 total
Time:        ~3.5 s
```

> **Nota:** Adjuntar captura de pantalla ejecutando `npm test` para mostrar los 34 tests pasando simultáneamente.

---

## 2.3 Reflexión

Integrar pruebas en un proyecto React Native / Expo ya existente resultó más complejo de lo esperado. El mayor obstáculo no fue escribir las pruebas en sí, sino configurar el entorno: el preset `jest-expo` requiere ajuste fino del campo `transformIgnorePatterns` para que módulos como `expo-modules-core` o `firebase` (que usan ESM) sean transpilados correctamente por Babel antes de ejecutarse en el ambiente de pruebas. También hubo un conflicto de versiones entre `react-test-renderer@19.2.6` y `react@19.1.0` que requirió instalar la versión exacta con `--legacy-peer-deps`. Una vez superada la configuración inicial, escribir las pruebas fue directo y los resultados inmediatos. Lo que cambia al incorporar pruebas es la forma de pensar el código: funciones puras y esquemas de validación aislados del framework son triviales de probar, mientras que componentes con efectos secundarios o dependencias de contexto requieren mocks y una arquitectura más cuidadosa. Esta experiencia refuerza la idea de que las pruebas no son un paso final, sino una guía de diseño que incentiva escribir código más modular y predecible desde el inicio.
