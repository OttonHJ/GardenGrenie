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

interface ScreenLoginProps {
  onNavigateRegister: () => void;
  onNavigateForgot: () => void;
  onLoginSuccess: () => void;
}

export function ScreenLogin({
  onNavigateRegister,
  onNavigateForgot,
  onLoginSuccess,
}: ScreenLoginProps) {
  const insets = useSafeAreaInsets();
  const { theme, styles } = useProfileTheme(stylesByMode);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = () => {
    // Integración con Firebase Auth pendiente
    // Por ahora llama al callback que activa isAuthenticated en _layout
    onLoginSuccess();
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

          {/* Botón de ingreso */}
          <TouchableOpacity
            style={[
              styles.primaryBtn,
              { backgroundColor: theme.colors.accentGreen },
            ]}
            onPress={handleLogin}
            activeOpacity={0.8}
          >
            <Text style={styles.primaryBtnText}>Ingresar</Text>
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
