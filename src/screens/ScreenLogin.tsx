import { useAuth } from "@/src/context/AuthContext";
import {
  AppTheme,
  getAppTheme,
  useProfileTheme,
} from "@/src/theme/designSystem";
import React, { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface ScreenLoginProps {
  onNavigateRegister: () => void;
  onNavigateForgot: () => void;
}

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
      return "Ocurrió un error. Intenta de nuevo.";
  }
}

export function ScreenLogin({
  onNavigateRegister,
  onNavigateForgot,
}: ScreenLoginProps) {
  const insets = useSafeAreaInsets();
  const { theme, styles } = useProfileTheme(stylesByMode);
  const { login, loginWithGoogle } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const handleLogin = async () => {
    setError("");
    if (!email.trim() || !password) return;
    setIsLoading(true);
    try {
      await login(email.trim(), password);
    } catch (e: any) {
      setError(firebaseLoginError(e.code));
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError("");
    setIsGoogleLoading(true);
    try {
      await loginWithGoogle();
    } catch {
      setError("No se pudo iniciar sesión con Google. Intenta de nuevo.");
    } finally {
      setIsGoogleLoading(false);
    }
  };

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
        {/* Logo y título */}
        <View style={styles.header}>
          <Text style={styles.logo}>🌿</Text>
          <Text style={[styles.appName, { color: theme.colors.accentGreen }]}>
            GardenGreenie
          </Text>
          <Text style={[styles.tagline, { color: theme.colors.textTertiary }]}>
            Cuida tus plantas, día a día
          </Text>
        </View>

        {/* Formulario */}
        <View style={styles.form}>
          <Text style={[styles.formTitle, { color: theme.colors.textPrimary }]}>
            Iniciar sesión
          </Text>

          {/* Email */}
          <Text style={[styles.label, { color: theme.colors.textSecondary }]}>
            Correo electrónico
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.colors.bgSecondary,
                borderColor: theme.colors.borderPrimary,
                color: theme.colors.textPrimary,
              },
            ]}
            placeholder="tu@correo.com"
            placeholderTextColor={theme.colors.textTertiary}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />

          {/* Contraseña */}
          <Text style={[styles.label, { color: theme.colors.textSecondary }]}>
            Contraseña
          </Text>
          <View style={styles.passwordRow}>
            <TextInput
              style={[
                styles.input,
                styles.passwordInput,
                {
                  backgroundColor: theme.colors.bgSecondary,
                  borderColor: theme.colors.borderPrimary,
                  color: theme.colors.textPrimary,
                },
              ]}
              placeholder="Tu contraseña"
              placeholderTextColor={theme.colors.textTertiary}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TouchableOpacity
              style={[
                styles.eyeBtn,
                {
                  borderColor: theme.colors.borderPrimary,
                  backgroundColor: theme.colors.bgSecondary,
                },
              ]}
              onPress={() => setShowPassword(!showPassword)}
            >
              <Text style={{ fontSize: 16 }}>{showPassword ? "🙈" : "👁️"}</Text>
            </TouchableOpacity>
          </View>

          {/* Olvidé contraseña */}
          <TouchableOpacity style={styles.forgotBtn} onPress={onNavigateForgot}>
            <Text
              style={[styles.forgotText, { color: theme.colors.accentGreen }]}
            >
              ¿Olvidaste tu contraseña?
            </Text>
          </TouchableOpacity>

          {/* Error */}
          {error !== "" && (
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
                  styles.errorText,
                  { color: theme.colors.categories.pink.border },
                ]}
              >
                {error}
              </Text>
            </View>
          )}

          {/* Botón de ingreso */}
          <TouchableOpacity
            style={[
              styles.primaryBtn,
              { backgroundColor: theme.colors.accentGreen, opacity: isLoading ? 0.7 : 1 },
            ]}
            onPress={handleLogin}
            activeOpacity={0.8}
            disabled={isLoading || isGoogleLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.primaryBtnText}>Ingresar</Text>
            )}
          </TouchableOpacity>

          {/* Separador */}
          <View style={styles.divider}>
            <View style={[styles.dividerLine, { backgroundColor: theme.colors.borderPrimary }]} />
            <Text style={[styles.dividerText, { color: theme.colors.textTertiary }]}>o</Text>
            <View style={[styles.dividerLine, { backgroundColor: theme.colors.borderPrimary }]} />
          </View>

          {/* Botón Google */}
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
                <Text style={[styles.googleBtnText, { color: theme.colors.textPrimary }]}>
                  Continuar con Google
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Ir a registro */}
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
    errorBanner: {
      borderRadius: theme.radius.sm,
      borderWidth: theme.spacing.xxs,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      marginBottom: theme.spacing.md,
    },
    errorText: {
      fontSize: theme.fontSize.sm,
      fontWeight: "600",
    },
    formTitle: {
      fontSize: theme.fontSize.lg,
      fontWeight: "700",
      marginBottom: theme.spacing.xl,
    },
    label: {
      fontSize: theme.fontSize.sm,
      fontWeight: "600",
      marginBottom: theme.spacing.xs,
      marginTop: theme.spacing.md,
    },
    input: {
      borderRadius: theme.radius.sm,
      borderWidth: theme.spacing.xxs,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.md,
      fontSize: theme.fontSize.sm,
    },
    passwordRow: {
      flexDirection: "row",
      gap: theme.spacing.sm,
    },
    passwordInput: {
      flex: 1,
    },
    eyeBtn: {
      borderRadius: theme.radius.sm,
      borderWidth: theme.spacing.xxs,
      paddingHorizontal: theme.spacing.md,
      justifyContent: "center",
      alignItems: "center",
    },
    forgotBtn: {
      alignSelf: "flex-end",
      marginTop: theme.spacing.sm,
      marginBottom: theme.spacing.xl,
    },
    forgotText: {
      fontSize: theme.fontSize.sm,
      fontWeight: "600",
    },
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
