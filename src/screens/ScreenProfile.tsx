import { SettingsProfileRow } from "@/src/components/SettingsProfileRow";
import { SettingsProfileSummary } from "@/src/components/SettingsProfileSummary";
import { useAuth } from "@/src/context/AuthContext";
import { ModalAbout } from "@/src/modals/ModalAbout";
import { ModalContact } from "@/src/modals/ModalContact";
import { ModalPrivacy } from "@/src/modals/ModalPrivacy";
import { ModalTerms } from "@/src/modals/ModalTerms";
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

  // ── Estado de modales ────────────────────────────────────────────────────────
  const [contactVisible, setContactVisible] = React.useState(false);
  const [termsVisible, setTermsVisible] = React.useState(false);
  const [privacyVisible, setPrivacyVisible] = React.useState(false);
  const [aboutVisible, setAboutVisible] = React.useState(false);

  // ── Handlers ────────────────────────────────────────────────────────────────

  const handleEditProfile = () => {
    Alert.alert("Editar perfil", "Próximamente.");
  };

  const { logout } = useAuth();

  const handleLogout = () => {
    Alert.alert(
      "Cerrar sesión",
      "¿Estás seguro de que quieres cerrar sesión?",
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Cerrar sesión", style: "destructive", onPress: logout },
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
    <View
      style={{
        flex: 1,
        paddingBottom: insets.bottom,
        paddingTop: insets.top,
      }}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom },
        ]}
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
            onPress={() => setContactVisible(true)}
          />
          <SettingsProfileRow
            icon="📄"
            iconBg={theme.colors.categories.yellow.bg}
            title="Términos y condiciones"
            onPress={() => setTermsVisible(true)}
          />
          <SettingsProfileRow
            icon="🛡️"
            iconBg={theme.colors.categories.pink.bg}
            title="Privacidad"
            onPress={() => setPrivacyVisible(true)}
          />
          <SettingsProfileRow
            icon="🌿"
            iconBg={theme.colors.categories.green.bg}
            title="Acerca de GardenGreenie"
            value="v1.0.0"
            onPress={() => setAboutVisible(true)}
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

        <View style={{ height: insets.bottom }} />
      </ScrollView>

      {/* ── Modales ── Se utliza visible para controlar la visibilidad
 o onClose para ocultar las modales*/}
      <ModalContact
        visible={contactVisible}
        onClose={() => setContactVisible(false)}
      />
      <ModalTerms
        visible={termsVisible}
        onClose={() => setTermsVisible(false)}
      />
      <ModalPrivacy
        visible={privacyVisible}
        onClose={() => setPrivacyVisible(false)}
      />
      <ModalAbout
        visible={aboutVisible}
        onClose={() => setAboutVisible(false)}
      />
    </View>
  );
}

// ── Estilos ──────────────────────────────────────────────────────────────────

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      paddingHorizontal: theme.spacing.lg,
    },
    sectionLabel: {
      paddingHorizontal: theme.spacing.lg,
      paddingTop: theme.spacing.xxl,
      paddingBottom: theme.spacing.xs,
    },
    sectionLabelText: {
      fontSize: theme.fontSize.sm,
      fontWeight: "600",
      letterSpacing: 0.8,
    },
    group: {
      marginHorizontal: theme.spacing.lg,
      borderRadius: theme.radius.sm,
      borderWidth: theme.spacing.xxs,
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
      width: theme.imageSize.icon * 2,
      height: theme.imageSize.icon * 2,
      borderRadius: theme.radius.full,
      borderWidth: theme.spacing.xxs,
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
      borderWidth: theme.spacing.xxs,
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
