import { SettingsProfileRow } from "@/src/components/SettingsProfileRow";
import { SettingsProfileSummary } from "@/src/components/SettingsProfileSummary";
import { useAuth } from "@/src/context/AuthContext";
import { useAchievementsContext } from "@/src/context/AchievementsContext";
import { ModalAbout } from "@/src/modals/ModalAbout";
import { ModalAchievements } from "@/src/modals/ModalAchievements";
import { ModalContact } from "@/src/modals/ModalContact";
import { ModalPrivacy } from "@/src/modals/ModalPrivacy";
import { ModalTerms } from "@/src/modals/ModalTerms";
import { ScreenEditProfile } from "@/src/screens/ScreenEditProfile";
import { ScreenSecurity } from "@/src/screens/ScreenSecurity";
import {
  Achievement,
  ACHIEVEMENTS_TOTAL,
  RARITY_LABELS,
} from "@/src/utils/achievementUtils";
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

function buildRaritySummary(unlocked: Achievement[]): string {
  if (unlocked.length === 0) return "Sin logros desbloqueados aún";
  const counts: Record<string, number> = {};
  unlocked.forEach((a) => {
    counts[a.rarity] = (counts[a.rarity] ?? 0) + 1;
  });
  return (["legendario", "epico", "raro", "comun"] as const)
    .filter((r) => counts[r])
    .map((r) => `${RARITY_LABELS[r]}: ${counts[r]}`)
    .join("  ·  ");
}

export function ScreenProfile() {
  const insets = useSafeAreaInsets();
  const { theme, styles } = useProfileTheme(stylesByMode);

  // ── Logros ───────────────────────────────────────────────────────────────────
  const { unlockedAchievements, newAchievements, totalUnlocked, markSeen } =
    useAchievementsContext();
  const [achievementsVisible, setAchievementsVisible] = React.useState(false);

  const handleOpenAchievements = () => {
    // Marcar nuevos logros como vistos al abrir el modal
    newAchievements.forEach((a) => markSeen(a.id));
    setAchievementsVisible(true);
  };

  // ── Estado de modales ────────────────────────────────────────────────────────
  const [contactVisible, setContactVisible] = React.useState(false);
  // Estado que controla la visibilidad de la pantalla de edición de perfil
  const [editProfileVisible, setEditProfileVisible] = React.useState(false);
  const [termsVisible, setTermsVisible] = React.useState(false);
  const [privacyVisible, setPrivacyVisible] = React.useState(false);
  const [aboutVisible, setAboutVisible] = React.useState(false);
  const [securityVisible, setSecurityVisible] = React.useState(false);

  // ── Handlers ────────────────────────────────────────────────────────────────

  const handleEditProfile = () => {
    // Abre la pantalla de edición de perfil como modal
    setEditProfileVisible(true);
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
        paddingTop: insets.top,
      }}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 80 },
        ]}
      >
        {/* Cabecera: avatar + nombre + editar */}
        <SettingsProfileSummary onEditPress={handleEditProfile} />

        {/* Sección: Logros */}
        <View style={styles.sectionLabel}>
          <Text
            style={[
              styles.sectionLabelText,
              { color: theme.colors.textTertiary },
            ]}
          >
            LOGROS
          </Text>
        </View>
        <TouchableOpacity
          style={[
            styles.group,
            styles.achievementsCard,
            {
              backgroundColor: theme.colors.bgSecondary,
              borderColor: theme.colors.borderPrimary,
            },
          ]}
          onPress={handleOpenAchievements}
          activeOpacity={0.8}
        >
          <View style={styles.achievementsRow}>
            <Text style={[styles.achievementsTitle, { color: theme.colors.textPrimary }]}>
              🏆 Mis Logros
            </Text>
            <View style={styles.achievementsRight}>
              {newAchievements.length > 0 && (
                <View
                  style={[
                    styles.newBadge,
                    { backgroundColor: theme.colors.accentOrange },
                  ]}
                >
                  <Text style={styles.newBadgeText}>{newAchievements.length}</Text>
                </View>
              )}
              <Text style={[styles.achievementsCount, { color: theme.colors.accentGreen }]}>
                {totalUnlocked} / {ACHIEVEMENTS_TOTAL}
              </Text>
              <Text style={[styles.chevron, { color: theme.colors.textTertiary }]}>›</Text>
            </View>
          </View>
          <View
            style={[
              styles.progressBar,
              { backgroundColor: theme.colors.borderPrimary },
            ]}
          >
            <View
              style={[
                styles.progressFill,
                {
                  backgroundColor: theme.colors.accentGreen,
                  width: `${(totalUnlocked / ACHIEVEMENTS_TOTAL) * 100}%`,
                },
              ]}
            />
          </View>
          <Text style={[styles.rarityRow, { color: theme.colors.textTertiary }]}>
            {buildRaritySummary(unlockedAchievements)}
          </Text>
        </TouchableOpacity>

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
            onPress={() => setSecurityVisible(true)}
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

      </ScrollView>

      {/* ── Modales ── Se utliza visible para controlar la visibilidad
 o onClose para ocultar las modales*/}
      {/* Pantalla de edición de perfil — se presenta sobre ScreenProfile */}
      <ScreenEditProfile
        visible={editProfileVisible}
        onClose={() => setEditProfileVisible(false)}
      />
      <ScreenSecurity
        visible={securityVisible}
        onClose={() => setSecurityVisible(false)}
      />

      <ModalAchievements
        visible={achievementsVisible}
        onClose={() => setAchievementsVisible(false)}
        unlockedIds={unlockedAchievements.map((a) => a.id)}
      />
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
    achievementsCard: {
      padding: theme.spacing.md,
    },
    achievementsRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: theme.spacing.sm,
    },
    achievementsTitle: {
      fontSize: theme.fontSize.sm,
      fontWeight: "700",
    },
    achievementsRight: {
      flexDirection: "row",
      alignItems: "center",
      gap: theme.spacing.xs,
    },
    achievementsCount: {
      fontSize: theme.fontSize.sm,
      fontWeight: "700",
    },
    chevron: {
      fontSize: theme.fontSize.lg,
      fontWeight: "300",
    },
    newBadge: {
      minWidth: 18,
      height: 18,
      borderRadius: 9,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 4,
    },
    newBadgeText: {
      color: "#ffffff",
      fontSize: 10,
      fontWeight: "700",
    },
    progressBar: {
      height: 6,
      borderRadius: theme.radius.full,
      marginBottom: theme.spacing.xs,
      overflow: "hidden",
    },
    progressFill: {
      height: "100%",
      borderRadius: theme.radius.full,
    },
    rarityRow: {
      fontSize: 11,
    },
  });

const stylesByMode = {
  light: createStyles(getAppTheme("light")),
  dark: createStyles(getAppTheme("dark")),
};
