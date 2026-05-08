import { z } from "zod";

// ─── Regex compartidos ─────────────────────────────────────────────────────────

const usernameRegex = /^[a-z0-9_.]+$/;
const birthdayRegex = /^\d{2}\/\d{2}\/\d{4}$/;

// ─── Login ─────────────────────────────────────────────────────────────────────

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "El correo es obligatorio")
    .email("El correo no tiene un formato válido"),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
});

export type LoginFormData = z.infer<typeof loginSchema>;

// ─── Registro ──────────────────────────────────────────────────────────────────

export const registerSchema = z
  .object({
    name: z
      .string()
      .min(1, "El nombre es obligatorio")
      .max(60, "El nombre no puede superar los 60 caracteres"),
    username: z
      .string()
      .min(3, "El alias debe tener al menos 3 caracteres")
      .max(30, "El alias no puede superar los 30 caracteres")
      .regex(
        usernameRegex,
        "El alias solo puede tener letras minúsculas, números, puntos y guiones bajos",
      ),
    birthday: z
      .string()
      .optional()
      .refine(
        (val) => !val || birthdayRegex.test(val),
        "La fecha debe tener el formato DD/MM/AAAA",
      ),
    email: z
      .string()
      .min(1, "El correo es obligatorio")
      .email("El correo no tiene un formato válido"),
    password: z
      .string()
      .min(8, "La contraseña debe tener al menos 8 caracteres"),
    confirmPassword: z.string().min(1, "Confirma tu contraseña"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

export type RegisterFormData = z.infer<typeof registerSchema>;

// ─── Planta ────────────────────────────────────────────────────────────────────

export const plantSchema = z.object({
  name: z
    .string()
    .min(1, "El nombre de la planta es obligatorio")
    .max(60, "El nombre no puede superar los 60 caracteres"),
  scientificName: z
    .string()
    .max(80, "El nombre científico no puede superar los 80 caracteres")
    .optional(),
  category: z.enum(["suculentas", "tropicales", "aromaticas", "cactaceas", "orquideas", "helechos", "palmeras"], {
    errorMap: () => ({ message: "Selecciona una categoría válida" }),
  }),
  location: z.enum(["interior", "exterior"], {
    errorMap: () => ({ message: "Selecciona una ubicación válida" }),
  }),
  sunlight: z.enum(["low", "medium", "high"], {
    errorMap: () => ({ message: "Selecciona un nivel de luz válido" }),
  }),
  temperature: z.string().min(1, "La temperatura es obligatoria"),
  waterFrequencyDays: z
    .number()
    .min(1, "La frecuencia debe ser al menos 1 día")
    .max(60, "La frecuencia no puede superar los 60 días"),
});

export type PlantFormData = z.infer<typeof plantSchema>;

// ─── Perfil de usuario ─────────────────────────────────────────────────────────

export const profileSchema = z.object({
  displayName: z
    .string()
    .min(1, "El nombre es obligatorio")
    .max(60, "El nombre no puede superar los 60 caracteres"),
  username: z
    .string()
    .min(3, "El alias debe tener al menos 3 caracteres")
    .max(30, "El alias no puede superar los 30 caracteres")
    .regex(
      usernameRegex,
      "El alias solo puede tener letras minúsculas, números, puntos y guiones bajos",
    ),
  birthday: z
    .string()
    .optional()
    .refine(
      (val) => !val || birthdayRegex.test(val),
      "La fecha debe tener el formato DD/MM/AAAA",
    ),
  bio: z
    .string()
    .max(160, "La bio no puede superar los 160 caracteres")
    .optional(),
});

export type ProfileFormData = z.infer<typeof profileSchema>;
