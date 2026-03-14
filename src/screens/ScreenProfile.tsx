import { SettingsProfileRow } from "@/src/components/SettingsProfileRow";
import { SettingsProfileSummary } from "@/src/components/SettingsProfileSummary";
import {
  AppTheme,
  getAppTheme,
  useProfileTheme,
} from "@/src/theme/designSystem";
import React from "react";
import {
  Alert,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export function ScreenProfile() {
  const insets = useSafeAreaInsets();
  const { theme, styles } = useProfileTheme(stylesByMode);

  // ── Handlers ────────────────────────────────────────────────────────────────

  const handleEditProfile = () => {
    Alert.alert("Editar perfil", "Próximamente.");
  };

  const handleLogout = () => {
    Alert.alert(
      "Cerrar sesión",
      "¿Estás seguro de que quieres cerrar sesión?",
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Cerrar sesión", style: "destructive", onPress: () => {} },
      ],
    );
  };

  const handleSocial = (platform: string) => {
    const urls: Record<string, string> = {
      X: "https://x.com",
      LinkedIn: "https://linkedin.com",
      Instagram: "https://instagram.com",
      YouTube: "https://youtube.com",
    };
    Linking.openURL(urls[platform]);
  };

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <ScrollView
      style={[styles.container, { paddingTop: insets.top }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Cabecera: avatar + nombre + editar */}
      <SettingsProfileSummary onEditPress={handleEditProfile} />

      {/* Sección: Cuenta */}
      <View style={styles.sectionLabel}>
        <Text
          style={[
            styles.sectionLabelText,
            { color: theme.colors.textTertiary },
          ]}
        >
          CUENTA
        </Text>
      </View>
      <View
        style={[
          styles.group,
          {
            backgroundColor: theme.colors.bgSecondary,
            borderColor: theme.colors.borderPrimary,
          },
        ]}
      >
        <SettingsProfileRow
          icon="🔒"
          iconBg={theme.colors.categories.brown.bg}
          title="Seguridad"
          subtitle="Contraseña, autenticación"
          onPress={() => Alert.alert("Seguridad", "Próximamente.")}
        />
      </View>

      {/* Sección: Soporte */}
      <View style={styles.sectionLabel}>
        <Text
          style={[
            styles.sectionLabelText,
            { color: theme.colors.textTertiary },
          ]}
        >
          SOPORTE
        </Text>
      </View>
      <View
        style={[
          styles.group,
          {
            backgroundColor: theme.colors.bgSecondary,
            borderColor: theme.colors.borderPrimary,
          },
        ]}
      >
        <SettingsProfileRow
          icon="💬"
          iconBg={theme.colors.categories.green.bg}
          title="Contáctanos"
          onPress={() => Alert.alert("Contáctanos", "Próximamente.")}
        />
        <SettingsProfileRow
          icon="📄"
          iconBg={theme.colors.categories.yellow.bg}
          title="Términos y condiciones"
          onPress={() => Alert.alert("Términos", "Próximamente.")}
        />
        <SettingsProfileRow
          icon="🛡️"
          iconBg={theme.colors.categories.pink.bg}
          title="Privacidad"
          onPress={() => Alert.alert("Privacidad", "Próximamente.")}
        />
        <SettingsProfileRow
          icon="🌿"
          iconBg={theme.colors.categories.green.bg}
          title="Acerca de GardenGreenie"
          value="v1.0.0"
          onPress={() => Alert.alert("GardenGreenie", "Versión 1.0.0")}
          isLast
        />
      </View>

      {/* Redes sociales */}
      <View style={styles.sectionLabel}>
        <Text
          style={[
            styles.sectionLabelText,
            { color: theme.colors.textTertiary },
          ]}
        >
          SÍGUENOS
        </Text>
      </View>
      <View style={styles.socialRow}>
        {[
          { label: "𝕏", platform: "X" },
          { label: "in", platform: "LinkedIn" },
          { label: "ig", platform: "Instagram" },
          { label: "yt", platform: "YouTube" },
        ].map(({ label, platform }) => (
          <TouchableOpacity
            key={platform}
            style={[
              styles.socialBtn,
              {
                backgroundColor: theme.colors.bgSecondary,
                borderColor: theme.colors.borderPrimary,
              },
            ]}
            onPress={() => handleSocial(platform)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.socialBtnText,
                { color: theme.colors.textSecondary },
              ]}
            >
              {label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Logout */}
      <TouchableOpacity
        style={[
          styles.logoutBtn,
          {
            backgroundColor: theme.colors.categories.pink.bg,
            borderColor: theme.colors.categories.pink.border,
          },
        ]}
        onPress={handleLogout}
        activeOpacity={0.8}
      >
        <Text
          style={[
            styles.logoutText,
            { color: theme.colors.categories.pink.border },
          ]}
        >
          Cerrar sesión
        </Text>
      </TouchableOpacity>

      <View style={{ height: insets.bottom + 24 }} />
    </ScrollView>
  );
}

// ── Estilos ──────────────────────────────────────────────────────────────────

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.bgPrimary,
    },
    sectionLabel: {
      paddingHorizontal: theme.spacing.lg,
      paddingTop: theme.spacing.lg,
      paddingBottom: theme.spacing.xs,
    },
    sectionLabelText: {
      fontSize: 10,
      fontWeight: "600",
      letterSpacing: 0.8,
    },
    group: {
      marginHorizontal: theme.spacing.lg,
      borderRadius: theme.radius.sm,
      borderWidth: 1,
      overflow: "hidden",
    },
    socialRow: {
      flexDirection: "row",
      justifyContent: "center",
      gap: theme.spacing.md,
      marginHorizontal: theme.spacing.lg,
      marginTop: theme.spacing.sm,
    },
    socialBtn: {
      width: 44,
      height: 44,
      borderRadius: theme.radius.full,
      borderWidth: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    socialBtnText: {
      fontSize: theme.fontSize.sm,
      fontWeight: "600",
    },
    logoutBtn: {
      marginHorizontal: theme.spacing.lg,
      marginTop: theme.spacing.xl,
      borderRadius: theme.radius.sm,
      borderWidth: 1,
      paddingVertical: theme.spacing.md,
      alignItems: "center",
    },
    logoutText: {
      fontSize: theme.fontSize.sm,
      fontWeight: "700",
    },
  });

const stylesByMode = {
  light: createStyles(getAppTheme("light")),
  dark: createStyles(getAppTheme("dark")),
};
