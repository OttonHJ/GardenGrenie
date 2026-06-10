import FormInput from "@/src/components/FormInput";
import { useAuth } from "@/src/context/AuthContext";
import { RegisterFormData, registerSchema } from "@/src/schemas";
import {
  AppTheme,
  getAppTheme,
  useProfileTheme,
} from "@/src/theme/designSystem";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// ─── Tipos ─────────────────────────────────────────────────────────────────────

interface ScreenRegisterProps {
  onNavigateLogin: () => void;
}

// ─── Mapeo de errores Firebase ─────────────────────────────────────────────────

// Traduce códigos de error de Firebase Auth a mensajes en español.
// Solo cubre errores del proceso de creación de cuenta — la validación
// de formato de campos ya la maneja registerSchema con Zod.
function firebaseRegisterError(code: string): string {
  switch (code) {
    case "auth/email-already-in-use":
      return "Ya existe una cuenta con ese correo.";
    case "auth/invalid-email":
      return "El correo no es válido.";
    case "auth/weak-password":
      return "La contraseña es muy débil.";
    default:
      return "Ocurrió un error. Intenta de nuevo.";
  }
}

// ─── Componente ────────────────────────────────────────────────────────────────

export function ScreenRegister({ onNavigateLogin }: ScreenRegisterProps) {
  const insets = useSafeAreaInsets();
  const { theme, styles } = useProfileTheme(stylesByMode);

  // Método de registro del contexto
  const { register } = useAuth();

  // Estado de carga del botón — UI state, no de formulario
  const [isLoading, setIsLoading] = useState(false);

  // Error global para fallos de Firebase — separado de los errores
  // de validación de campos que maneja RHF/Zod internamente
  const [globalError, setGlobalError] = useState("");

  // ── Configuración de React Hook Form ──────────────────────────────────────

  const {
    control, // conecta los FormInput con el estado de RHF
    handleSubmit, // envuelve onSubmit con la validación del esquema Zod
    formState: { errors }, // errores de validación por campo
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    // Valores iniciales vacíos para todos los campos del esquema
    defaultValues: {
      name: "",
      username: "",
      birthday: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  // ── Handler de registro ───────────────────────────────────────────────────

  // handleSubmit solo ejecuta onSubmit si Zod valida todos los campos.
  // Toda la validación manual que existía antes (if !name.trim(), regex,
  // password === confirmPassword, etc.) ahora la hace registerSchema.
  const onSubmit = async (data: RegisterFormData) => {
    setGlobalError("");
    setIsLoading(true);
    try {
      await register(
        data.name,
        data.email,
        data.password,
        data.username,
        data.birthday ?? "",
      );
      // Si register es exitoso, onAuthStateChanged en AuthContext
      // detecta el nuevo usuario y _layout.tsx monta los tabs
    } catch (e: any) {
      // Error de Firebase — se muestra en el banner global
      setGlobalError(firebaseRegisterError(e.code));
    } finally {
      setIsLoading(false);
    }
  };

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        style={[styles.container, { paddingTop: insets.top }]}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* ── Encabezado con botón volver ── */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={onNavigateLogin}
            style={styles.backBtn}
            accessibilityLabel="Volver al inicio de sesión"
            accessibilityRole="button"
          >
            <Text
              style={[styles.backText, { color: theme.colors.accentGreen }]}
            >
              ← Volver
            </Text>
          </TouchableOpacity>
          <Text style={styles.logo}>🌱</Text>
          <Text style={[styles.title, { color: theme.colors.textPrimary }]}>
            Crear cuenta
          </Text>
          <Text style={[styles.subtitle, { color: theme.colors.textTertiary }]}>
            Únete y empieza a cuidar tus plantas
          </Text>
        </View>

        {/* Banner de error global — solo para errores de Firebase.
            Se limpia automáticamente en el siguiente intento de submit. */}
        {globalError !== "" && (
          <View
            style={[
              styles.errorBanner,
              {
                backgroundColor: theme.colors.categories.pink.bg,
                borderColor: theme.colors.categories.pink.border,
              },
            ]}
          >
            <Text
              style={[
                styles.errorBannerText,
                { color: theme.colors.categories.pink.border },
              ]}
            >
              {globalError}
            </Text>
            {/* Botón × para cerrar el banner manualmente */}
            <TouchableOpacity onPress={() => setGlobalError("")}>
              <Text
                style={[
                  styles.errorBannerClose,
                  { color: theme.colors.categories.pink.border },
                ]}
              >
                ×
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ── Formulario ──
            Cada Controller conecta un FormInput con RHF.
            Los errores de validación aparecen debajo de cada campo
            automáticamente cuando el usuario intenta hacer submit
            o cuando abandona un campo con error (onBlur). */}
        <View style={styles.form}>
          {/* Nombre — capitalización por palabras */}
          <Controller
            control={control}
            name="name"
            render={({ field: { onChange, onBlur, value, ref } }) => (
              <FormInput
                ref={ref}
                label="Nombre"
                type="text"
                required
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.name?.message}
                placeholder="Tu nombre completo"
                autoCapitalize="words"
              />
            )}
          />

          {/* Alias — type formatted fuerza minúsculas y elimina espacios.
              El transform se aplica en cada keystroke antes de notificar a RHF,
              por lo que el usuario nunca puede ingresar mayúsculas o espacios */}
          <Controller
            control={control}
            name="username"
            render={({ field: { onChange, onBlur, value, ref } }) => (
              <FormInput
                ref={ref}
                label="Alias"
                type="formatted"
                required
                transform={(v) => v.toLowerCase().replace(/\s/g, "")}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.username?.message}
                placeholder="ej. maria.gonzalez"
                autoCapitalize="none"
                autoCorrect={false}
              />
            )}
          />

          {/* Fecha de nacimiento — campo opcional con formato DD/MM/AAAA.
              El teclado numérico facilita el ingreso en móvil */}
          <Controller
            control={control}
            name="birthday"
            render={({ field: { onChange, onBlur, value, ref } }) => (
              <FormInput
                ref={ref}
                label="Fecha de nacimiento"
                type="date"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.birthday?.message}
                placeholder="DD/MM/AAAA"
              />
            )}
          />

          {/* Correo — type="email" configura automáticamente keyboardType
              y autoCapitalize="none" sin que el padre los especifique */}
          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, onBlur, value, ref } }) => (
              <FormInput
                ref={ref}
                label="Correo electrónico"
                type="email"
                required
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.email?.message}
                placeholder="tu@correo.com"
              />
            )}
          />

          {/* Contraseña — type="password" incluye el toggle de visibilidad */}
          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, onBlur, value, ref } }) => (
              <FormInput
                ref={ref}
                label="Contraseña"
                type="password"
                required
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.password?.message}
                placeholder="Mínimo 8 caracteres"
              />
            )}
          />

          {/* Confirmar contraseña — Zod valida que coincida con password
              mediante el .refine() en registerSchema */}
          <Controller
            control={control}
            name="confirmPassword"
            render={({ field: { onChange, onBlur, value, ref } }) => (
              <FormInput
                ref={ref}
                label="Confirmar contraseña"
                type="password"
                required
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.confirmPassword?.message}
                placeholder="Repite tu contraseña"
              />
            )}
          />

          {/* Botón de registro — deshabilitado durante la carga */}
          <TouchableOpacity
            style={[
              styles.primaryBtn,
              {
                backgroundColor: theme.colors.accentGreen,
                opacity: isLoading ? 0.7 : 1,
              },
            ]}
            onPress={handleSubmit(onSubmit)}
            activeOpacity={0.8}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.primaryBtnText}>Crear cuenta</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* ── Footer con link a login ── */}
        <View style={styles.footer}>
          <Text
            style={[styles.footerText, { color: theme.colors.textTertiary }]}
          >
            ¿Ya tienes cuenta?{" "}
          </Text>
          <TouchableOpacity onPress={onNavigateLogin}>
            <Text
              style={[styles.footerLink, { color: theme.colors.accentGreen }]}
            >
              Inicia sesión
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ─── Estilos ───────────────────────────────────────────────────────────────────

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.bgPrimary,
    },
    content: {
      paddingHorizontal: theme.spacing.lg,
      paddingBottom: theme.spacing.xxl,
      flexGrow: 1,
    },
    // Encabezado con botón volver + logo + título
    header: {
      alignItems: "center",
      marginTop: theme.spacing.xl,
      marginBottom: theme.spacing.xl,
    },
    backBtn: {
      alignSelf: "flex-start",
      marginBottom: theme.spacing.lg,
    },
    backText: {
      fontSize: theme.fontSize.sm,
      fontWeight: "600",
    },
    logo: {
      fontSize: 48,
      marginBottom: theme.spacing.sm,
    },
    title: {
      fontSize: theme.fontSize.lg,
      fontWeight: "700",
    },
    subtitle: {
      fontSize: theme.fontSize.sm,
      marginTop: theme.spacing.xs,
    },
    // Banner de error global — tipo 3 del sistema de notificaciones
    errorBanner: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      borderRadius: theme.radius.sm,
      borderWidth: theme.spacing.xxs,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      marginBottom: theme.spacing.md,
    },
    errorBannerText: {
      fontSize: theme.fontSize.sm,
      fontWeight: "600",
      flex: 1,
    },
    errorBannerClose: {
      fontSize: theme.fontSize.lg,
      fontWeight: "300",
      marginLeft: theme.spacing.sm,
    },
    form: {
      marginBottom: theme.spacing.xxl,
    },
    // Botón principal de registro
    primaryBtn: {
      borderRadius: theme.radius.sm,
      paddingVertical: theme.spacing.md + 2,
      alignItems: "center",
      marginTop: theme.spacing.xl,
    },
    primaryBtnText: {
      color: "#ffffff",
      fontSize: theme.fontSize.sm,
      fontWeight: "700",
    },
    // Footer con link a login
    footer: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
    },
    footerText: {
      fontSize: theme.fontSize.sm,
    },
    footerLink: {
      fontSize: theme.fontSize.sm,
      fontWeight: "700",
    },
  });

const stylesByMode = {
  light: createStyles(getAppTheme("light")),
  dark: createStyles(getAppTheme("dark")),
};
