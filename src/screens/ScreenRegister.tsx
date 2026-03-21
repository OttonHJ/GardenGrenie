import {
  AppTheme,
  getAppTheme,
  useProfileTheme,
} from "@/src/theme/designSystem";
import React, { useState } from "react";
import {
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

interface ScreenRegisterProps {
  onNavigateLogin: () => void;
  onRegisterSuccess: () => void;
}

export function ScreenRegister({
  onNavigateLogin,
  onRegisterSuccess,
}: ScreenRegisterProps) {
  const insets = useSafeAreaInsets();
  const { theme, styles } = useProfileTheme(stylesByMode);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = () => {
    setError("");

    if (!name.trim()) {
      setError("El nombre es obligatorio.");
      return;
    }
    if (!email.trim()) {
      setError("El correo es obligatorio.");
      return;
    }
    if (password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    // Integración con Firebase Auth pendiente
    // Por ahora llama al callback que activa isAuthenticated en _layout
    onRegisterSuccess();
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
        {/* Encabezado */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onNavigateLogin} style={styles.backBtn}>
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

        {/* Formulario */}
        <View style={styles.form}>
          <Text style={[styles.label, { color: theme.colors.textSecondary }]}>
            Nombre
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
            placeholder="Tu nombre"
            placeholderTextColor={theme.colors.textTertiary}
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
          />

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
              placeholder="Mínimo 8 caracteres"
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

          <Text style={[styles.label, { color: theme.colors.textSecondary }]}>
            Confirmar contraseña
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
            placeholder="Repite tu contraseña"
            placeholderTextColor={theme.colors.textTertiary}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            autoCorrect={false}
          />

          <TouchableOpacity
            style={[
              styles.primaryBtn,
              { backgroundColor: theme.colors.accentGreen },
            ]}
            onPress={handleRegister}
            activeOpacity={0.8}
          >
            <Text style={styles.primaryBtnText}>Crear cuenta</Text>
          </TouchableOpacity>
        </View>

        {/* Ir a login */}
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
    form: {
      marginBottom: theme.spacing.xxl,
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
