import { loginSchema, plantSchema, registerSchema } from "@/src/schemas";

// ─── loginSchema ───────────────────────────────────────────────────────────────
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

  it("correo con formato inválido → 'El correo no tiene un formato válido'", () => {
    const result = loginSchema.safeParse({ email: "no-es-correo", password: "contraseña123" });
    expect(result.success).toBe(false);
    const messages = result.error!.issues.map((i) => i.message);
    expect(messages).toContain("El correo no tiene un formato válido");
  });

  it("contraseña menor a 8 caracteres → error de longitud mínima", () => {
    const result = loginSchema.safeParse({ email: "usuario@gmail.com", password: "abc" });
    expect(result.success).toBe(false);
    const messages = result.error!.issues.map((i) => i.message);
    expect(messages).toContain("La contraseña debe tener al menos 8 caracteres");
  });
});

// ─── plantSchema ───────────────────────────────────────────────────────────────
describe("plantSchema", () => {
  const validPlant = {
    name: "Sábila",
    scientificName: "Aloe vera",
    category: "suculentas" as const,
    location: "interior" as const,
    sunlight: "medium" as const,
    temperature: "18-25°C",
    waterFrequencyDays: 7,
  };

  it("datos válidos pasan la validación", () => {
    const result = plantSchema.safeParse(validPlant);
    expect(result.success).toBe(true);
  });

  it("nombre vacío → 'El nombre de la planta es obligatorio'", () => {
    const result = plantSchema.safeParse({ ...validPlant, name: "" });
    expect(result.success).toBe(false);
    const messages = result.error!.issues.map((i) => i.message);
    expect(messages).toContain("El nombre de la planta es obligatorio");
  });

  it("nombre mayor a 60 caracteres → error de longitud máxima", () => {
    const result = plantSchema.safeParse({ ...validPlant, name: "A".repeat(61) });
    expect(result.success).toBe(false);
    const messages = result.error!.issues.map((i) => i.message);
    expect(messages).toContain("El nombre no puede superar los 60 caracteres");
  });

  it("categoría inválida → 'Selecciona una categoría válida'", () => {
    const result = plantSchema.safeParse({ ...validPlant, category: "inexistente" });
    expect(result.success).toBe(false);
    const messages = result.error!.issues.map((i) => i.message);
    expect(messages).toContain("Selecciona una categoría válida");
  });

  it("frecuencia de riego 0 → 'La frecuencia debe ser al menos 1 día'", () => {
    const result = plantSchema.safeParse({ ...validPlant, waterFrequencyDays: 0 });
    expect(result.success).toBe(false);
    const messages = result.error!.issues.map((i) => i.message);
    expect(messages).toContain("La frecuencia debe ser al menos 1 día");
  });

  it("frecuencia de riego mayor a 60 → 'La frecuencia no puede superar los 60 días'", () => {
    const result = plantSchema.safeParse({ ...validPlant, waterFrequencyDays: 61 });
    expect(result.success).toBe(false);
    const messages = result.error!.issues.map((i) => i.message);
    expect(messages).toContain("La frecuencia no puede superar los 60 días");
  });

  it("scientificName opcional — planta sin nombre científico pasa", () => {
    const { scientificName, ...withoutSci } = validPlant;
    const result = plantSchema.safeParse(withoutSci);
    expect(result.success).toBe(true);
  });
});

// ─── registerSchema ────────────────────────────────────────────────────────────
describe("registerSchema", () => {
  const validRegister = {
    name: "Juan Pérez",
    username: "juan_perez",
    email: "juan@gmail.com",
    password: "segura123",
    confirmPassword: "segura123",
  };

  it("datos válidos pasan la validación", () => {
    const result = registerSchema.safeParse(validRegister);
    expect(result.success).toBe(true);
  });

  it("contraseñas distintas → 'Las contraseñas no coinciden'", () => {
    const result = registerSchema.safeParse({
      ...validRegister,
      confirmPassword: "diferente",
    });
    expect(result.success).toBe(false);
    const messages = result.error!.issues.map((i) => i.message);
    expect(messages).toContain("Las contraseñas no coinciden");
  });

  it("username con caracteres inválidos → mensaje de formato", () => {
    const result = registerSchema.safeParse({ ...validRegister, username: "Juan Pérez!" });
    expect(result.success).toBe(false);
    const messages = result.error!.issues.map((i) => i.message);
    expect(messages).toContain(
      "El alias solo puede tener letras minúsculas, números, puntos y guiones bajos"
    );
  });

  it("birthday con formato inválido → 'La fecha debe tener el formato DD/MM/AAAA'", () => {
    const result = registerSchema.safeParse({ ...validRegister, birthday: "1999-12-31" });
    expect(result.success).toBe(false);
    const messages = result.error!.issues.map((i) => i.message);
    expect(messages).toContain("La fecha debe tener el formato DD/MM/AAAA");
  });

  it("birthday correcto DD/MM/AAAA pasa la validación", () => {
    const result = registerSchema.safeParse({ ...validRegister, birthday: "31/12/1999" });
    expect(result.success).toBe(true);
  });
});
