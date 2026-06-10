import FormInput from "@/src/components/FormInput";
import { useAuth } from "@/src/context/AuthContext";
import { LoginFormData, loginSchema } from "@/src/schemas";
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

interface ScreenLoginProps {
  onNavigateRegister: () => void;
  onNavigateForgot: () => void;
}

// ─── Mapeo de errores Firebase ─────────────────────────────────────────────────

// Traduce los códigos de error de Firebase Auth a mensajes en español.
// Estos errores son globales — no pertenecen a un campo específico,
// sino al intento de autenticación completo.
function firebaseLoginError(code: string): string {
  switch (code) {
    case "auth/invalid-credential":
    case "auth/user-not-found":
    case "auth/wrong-password":
      return "Correo o contraseña incorrectos.";
    case "auth/invalid-email":
      return "El correo no es válido.";
    case "auth/too-many-requests":
      return "Demasiados intentos. Intenta más tarde.";
    case "auth/user-disabled":
      return "Esta cuenta ha sido deshabilitada.";
    default:
      return `Error: ${code ?? "desconocido"}`;
  }
}

// ─── Componente ────────────────────────────────────────────────────────────────

export function ScreenLogin({
  onNavigateRegister,
  onNavigateForgot,
}: ScreenLoginProps) {
  const insets = useSafeAreaInsets();
  const { theme, styles } = useProfileTheme(stylesByMode);

  // Métodos de autenticación del contexto
  const { login, loginWithGoogle } = useAuth();

  // Estados de carga separados para email/password y Google
  // ya que ambos botones pueden estar activos simultáneamente
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // Error global para fallos de Firebase Auth — separado de los errores
  // de validación de campos que maneja RHF/Zod internamente
  const [globalError, setGlobalError] = useState("");

  // ── Configuración de React Hook Form ──────────────────────────────────────

  const {
    control, // conecta los FormInput con el estado de RHF
    handleSubmit, // envuelve onSubmit con la validación de Zod
    formState: { errors }, // errores de validación campo por campo
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),

    defaultValues: {
      email: "",
      password: "",
    },
  });

  // ── Handler de login con email y contraseña ────────────────────────────────

  // handleSubmit de RHF ejecuta onSubmit solo si Zod valida el formulario.
  // Si hay errores de validación, los asigna a errors y no llama onSubmit.
  const onSubmit = async (data: LoginFormData) => {
    setGlobalError("");
    setIsLoading(true);
    try {
      await login(data.email, data.password);
      // Si login es exitoso, onAuthStateChanged en AuthContext detecta
      // el cambio y _layout.tsx muestra los tabs automáticamente
    } catch (e: any) {
      // Error de Firebase — se muestra en el banner global
      setGlobalError(firebaseLoginError(e.code));
    } finally {
      setIsLoading(false);
    }
  };

  // ── Handler de login con Google ───────────────────────────────────────────

  const handleGoogleLogin = async () => {
    setGlobalError("");
    setIsGoogleLoading(true);
    try {
      await loginWithGoogle();
    } catch (e: any) {
      console.error("[Google Sign-In error]", e?.code, e?.message, e);
      setGlobalError("No se pudo iniciar sesión con Google. Intenta de nuevo.");
    } finally {
      setIsGoogleLoading(false);
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
        {/* ── Logo y título de la app ── */}
        <View style={styles.header}>
          <Text style={styles.logo}>🌿</Text>
          <Text style={[styles.appName, { color: theme.colors.accentGreen }]}>
            GardenGreenie
          </Text>
          <Text style={[styles.tagline, { color: theme.colors.textTertiary }]}>
            Cuida tus plantas, día a día
          </Text>
        </View>

        {/* ── Formulario ── */}
        <View style={styles.form}>
          <Text style={[styles.formTitle, { color: theme.colors.textPrimary }]}>
            Iniciar sesión
          </Text>

          {/* Campo email — type="email" configura keyboardType y autoCapitalize */}
          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, onBlur, value, ref } }) => (
              <FormInput
                ref={ref}
                label="Correo electrónico"
                type="email"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.email?.message}
                placeholder="tu@correo.com"
              />
            )}
          />

          {/* Campo contraseña — type="password" incluye el toggle 👁️ */}
          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, onBlur, value, ref } }) => (
              <FormInput
                ref={ref}
                label="Contraseña"
                type="password"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.password?.message}
                placeholder="Tu contraseña"
              />
            )}
          />

          {/* Link a recuperar contraseña — alineado a la derecha */}
          <TouchableOpacity style={styles.forgotBtn} onPress={onNavigateForgot}>
            <Text
              style={[styles.forgotText, { color: theme.colors.accentGreen }]}
            >
              ¿Olvidaste tu contraseña?
            </Text>
          </TouchableOpacity>

          {/* Banner de error global — solo visible cuando hay error de Firebase.
              Se cierra automáticamente en el siguiente intento de login. */}
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

          {/* Botón principal — deshabilitado mientras cualquier carga está activa */}
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
            disabled={isLoading || isGoogleLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.primaryBtnText}>Ingresar</Text>
            )}
          </TouchableOpacity>

          {/* Separador visual entre email/password y Google */}
          <View style={styles.divider}>
            <View
              style={[
                styles.dividerLine,
                { backgroundColor: theme.colors.borderPrimary },
              ]}
            />
            <Text
              style={[styles.dividerText, { color: theme.colors.textTertiary }]}
            >
              o
            </Text>
            <View
              style={[
                styles.dividerLine,
                { backgroundColor: theme.colors.borderPrimary },
              ]}
            />
          </View>

          {/* Botón de Google — estado de carga independiente del botón principal */}
          <TouchableOpacity
            style={[
              styles.googleBtn,
              {
                backgroundColor: theme.colors.bgSecondary,
                borderColor: theme.colors.borderPrimary,
                opacity: isGoogleLoading ? 0.7 : 1,
              },
            ]}
            onPress={handleGoogleLogin}
            activeOpacity={0.8}
            disabled={isLoading || isGoogleLoading}
          >
            {isGoogleLoading ? (
              <ActivityIndicator color={theme.colors.textPrimary} />
            ) : (
              <>
                <Text style={styles.googleIcon}>G</Text>
                <Text
                  style={[
                    styles.googleBtnText,
                    { color: theme.colors.textPrimary },
                  ]}
                >
                  Continuar con Google
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* ── Footer con link a registro ── */}
        <View style={styles.footer}>
          <Text
            style={[styles.footerText, { color: theme.colors.textTertiary }]}
          >
            ¿No tienes cuenta?{" "}
          </Text>
          <TouchableOpacity onPress={onNavigateRegister}>
            <Text
              style={[styles.footerLink, { color: theme.colors.accentGreen }]}
            >
              Regístrate
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
      justifyContent: "center",
    },
    // Encabezado centrado con logo, nombre y tagline
    header: {
      alignItems: "center",
      marginBottom: theme.spacing.xxl * 2,
    },
    logo: {
      fontSize: 56,
      marginBottom: theme.spacing.sm,
    },
    appName: {
      fontSize: theme.fontSize.xl,
      fontWeight: "700",
      letterSpacing: 0.5,
    },
    tagline: {
      fontSize: theme.fontSize.sm,
      marginTop: theme.spacing.xs,
    },
    form: {
      marginBottom: theme.spacing.xxl,
    },
    formTitle: {
      fontSize: theme.fontSize.lg,
      fontWeight: "700",
      marginBottom: theme.spacing.xs,
    },
    // Link de contraseña olvidada — alineado a la derecha
    forgotBtn: {
      alignSelf: "flex-end",
      marginTop: theme.spacing.sm,
      marginBottom: theme.spacing.xl,
    },
    forgotText: {
      fontSize: theme.fontSize.sm,
      fontWeight: "600",
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
    // Botón principal de ingreso
    primaryBtn: {
      borderRadius: theme.radius.sm,
      paddingVertical: theme.spacing.md + 2,
      alignItems: "center",
    },
    primaryBtnText: {
      color: "#ffffff",
      fontSize: theme.fontSize.sm,
      fontWeight: "700",
    },
    // Separador entre los dos métodos de login
    divider: {
      flexDirection: "row",
      alignItems: "center",
      marginVertical: theme.spacing.lg,
      gap: theme.spacing.sm,
    },
    dividerLine: {
      flex: 1,
      height: 1,
    },
    dividerText: {
      fontSize: theme.fontSize.sm,
    },
    // Botón de Google con borde y fondo secundario
    googleBtn: {
      borderRadius: theme.radius.sm,
      borderWidth: theme.spacing.xxs,
      paddingVertical: theme.spacing.md + 2,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: theme.spacing.sm,
    },
    googleIcon: {
      fontSize: theme.fontSize.md,
      fontWeight: "700",
      color: "#4285F4",
    },
    googleBtnText: {
      fontSize: theme.fontSize.sm,
      fontWeight: "600",
    },
    // Footer con link a registro
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
