import {
  AppTheme,
  getAppTheme,
  useProfileTheme,
} from "@/src/theme/designSystem";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Step = "form" | "sent";

interface ScreenForgotPasswordProps {
  onNavigateLogin: () => void;
}

export function ScreenForgotPassword({
  onNavigateLogin,
}: ScreenForgotPasswordProps) {
  const insets = useSafeAreaInsets();
  const { theme, styles } = useProfileTheme(stylesByMode);

  const [email, setEmail] = useState("");
  const [step, setStep] = useState<Step>("form");

  const handleSend = () => {
    if (!email.trim()) return;
    // Integración con Firebase Auth pendiente
    setStep("sent");
  };

  if (step === "sent") {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.sentContent}>
          <Text style={styles.sentIcon}>📬</Text>
          <Text style={[styles.sentTitle, { color: theme.colors.textPrimary }]}>
            Revisa tu correo
          </Text>
          <Text
            style={[styles.sentSubtitle, { color: theme.colors.textTertiary }]}
          >
            Si{" "}
            <Text
              style={{ color: theme.colors.accentGreen, fontWeight: "600" }}
            >
              {email}
            </Text>{" "}
            está registrado, recibirás un enlace para restablecer tu contraseña.
          </Text>
          <TouchableOpacity
            style={[
              styles.primaryBtn,
              { backgroundColor: theme.colors.accentGreen },
            ]}
            onPress={onNavigateLogin}
            activeOpacity={0.8}
          >
            <Text style={styles.primaryBtnText}>
              Volver al inicio de sesión
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.content}>
          {/* Encabezado */}
          <TouchableOpacity onPress={onNavigateLogin} style={styles.backBtn}>
            <Text
              style={[styles.backText, { color: theme.colors.accentGreen }]}
            >
              ← Volver
            </Text>
          </TouchableOpacity>

          <Text style={styles.icon}>🔑</Text>
          <Text style={[styles.title, { color: theme.colors.textPrimary }]}>
            Recuperar contraseña
          </Text>
          <Text style={[styles.subtitle, { color: theme.colors.textTertiary }]}>
            Ingresa tu correo y te enviaremos un enlace para restablecer tu
            contraseña.
          </Text>

          {/* Campo email */}
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

          <TouchableOpacity
            style={[
              styles.primaryBtn,
              {
                backgroundColor: email.trim()
                  ? theme.colors.accentGreen
                  : theme.colors.toggleTrack,
              },
            ]}
            onPress={handleSend}
            activeOpacity={0.8}
            disabled={!email.trim()}
          >
            <Text style={styles.primaryBtnText}>Enviar enlace</Text>
          </TouchableOpacity>
        </View>
      </View>
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
      flex: 1,
      paddingHorizontal: theme.spacing.lg,
      paddingTop: theme.spacing.xl,
    },
    backBtn: {
      marginBottom: theme.spacing.xl,
    },
    backText: {
      fontSize: theme.fontSize.sm,
      fontWeight: "600",
    },
    icon: {
      fontSize: 48,
      marginBottom: theme.spacing.md,
    },
    title: {
      fontSize: theme.fontSize.lg,
      fontWeight: "700",
      marginBottom: theme.spacing.sm,
    },
    subtitle: {
      fontSize: theme.fontSize.sm,
      lineHeight: 20,
      marginBottom: theme.spacing.xl,
    },
    label: {
      fontSize: theme.fontSize.sm,
      fontWeight: "600",
      marginBottom: theme.spacing.xs,
    },
    input: {
      borderRadius: theme.radius.sm,
      borderWidth: theme.spacing.xxs,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.md,
      fontSize: theme.fontSize.sm,
      marginBottom: theme.spacing.xl,
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
    // Pantalla de confirmación
    sentContent: {
      flex: 1,
      paddingHorizontal: theme.spacing.lg,
      justifyContent: "center",
      alignItems: "center",
      gap: theme.spacing.md,
    },
    sentIcon: {
      fontSize: 56,
      marginBottom: theme.spacing.sm,
    },
    sentTitle: {
      fontSize: theme.fontSize.lg,
      fontWeight: "700",
      textAlign: "center",
    },
    sentSubtitle: {
      fontSize: theme.fontSize.sm,
      textAlign: "center",
      lineHeight: 20,
      paddingHorizontal: theme.spacing.md,
    },
  });

const stylesByMode = {
  light: createStyles(getAppTheme("light")),
  dark: createStyles(getAppTheme("dark")),
};
