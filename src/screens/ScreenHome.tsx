import { ProfileSummary } from "@/src/components/ProfileSummary";
import { SmallBio } from "@/src/components/SmallBio";
import { StreakFooter } from "@/src/components/StreakFooter";
import { Toast } from "@/src/components/Toast";
import { usePlants } from "@/src/context/PlantContext";
import { useStreakBreak } from "@/src/hooks/useStreakBreak";
import { useVacationMode } from "@/src/hooks/useVacationMode";
import { ModalVacationMode } from "@/src/modals/ModalVacationMode";
import {
  AppTheme,
  getAppTheme,
  useProfileTheme,
} from "@/src/theme/designSystem";
import { GardenHealthBar } from "@/src/components/GardenHealthWidgets";
import { calcHealth, HealthState } from "@/src/utils/healthUtils";
import { FilterId, calcStreak, isWateringDue } from "@/src/utils/plantUtils";
import { router } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { FavoritePlant } from "../components/FavoritePlant";

const CATEGORY_HOME_CONFIG = [
  { id: "suculentas" as FilterId, label: "Suculentas", style: "categoryGreen" as const },
  { id: "tropicales" as FilterId, label: "Tropicales", style: "categoryBrown" as const },
  { id: "aromaticas" as FilterId, label: "Aromáticas", style: "categoryPink" as const },
  { id: "cactaceas" as FilterId, label: "Cactáceas", style: "categoryYellow" as const },
  { id: "orquideas" as FilterId, label: "Orquídeas", style: "categoryPink" as const },
  { id: "helechos" as FilterId, label: "Helechos", style: "categoryGreen" as const },
  { id: "palmeras" as FilterId, label: "Palmeras", style: "categoryYellow" as const },
];

export function ScreenHome() {
  const insets = useSafeAreaInsets();
  const { styles } = useProfileTheme(stylesByMode);
  const { plants, loading, setActiveFilter } = usePlants();
  const { brokenStreak, dismiss } = useStreakBreak(plants, loading);
  const { vacation, activate, deactivate } = useVacationMode();
  const [vacationModalVisible, setVacationModalVisible] = useState(false);

  // ── Estadísticas derivadas del contexto ──────────────────────────────────
  const totalPlants = plants.length;

  const waterToday = useMemo(
    () => plants.filter((p) => isWateringDue(p.nextWatering)).length,
    [plants],
  );

  const streak = useMemo(() => calcStreak(plants), [plants]);

  const healthCounts = useMemo(() => {
    const counts: Record<HealthState, number> = { healthy: 0, ok: 0, stressed: 0, critical: 0 };
    plants.forEach((p) => { counts[calcHealth(p).state]++; });
    return counts;
  }, [plants]);

  const countByCategory = useMemo(
    () => CATEGORY_HOME_CONFIG.map((cat) => ({
      ...cat,
      count: plants.filter((p) => p.category === cat.id).length,
    })),
    [plants],
  );

  const handleCategoryPress = (filter: FilterId) => {
    setActiveFilter(filter);
    router.navigate("/tabGarden");
  };

  return (
    <View
      style={{
        flex: 1,
        paddingTop: insets.top,
      }}
    >
      <ScrollView
        style={styles.flex}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 60 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View>
          <View style={styles.profileCard}>
            <TouchableOpacity style={styles.flex}>
              <ProfileSummary />
            </TouchableOpacity>
          </View>
          {/* Stats / Empty state */}
          {plants.length === 0 && !loading ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>🌱</Text>
              <Text style={styles.emptyTitle}>Tu jardín está vacío</Text>
              <Text style={styles.emptySubtitle}>
                Agregá tu primera planta y empezá a registrar sus riegos
              </Text>
              <TouchableOpacity
                style={styles.emptyButton}
                onPress={() => router.navigate("/tabGarden")}
                activeOpacity={0.8}
              >
                <Text style={styles.emptyButtonText}>📷 Agregar primera planta</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <View style={[styles.section, styles.statsContainer]}>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{totalPlants}</Text>
                  <Text style={styles.statLabel}>{"Plantas\nregistradas"}</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={waterToday > 0 ? styles.statNumberOrange : styles.statNumber}>
                    {waterToday}
                  </Text>
                  <Text style={styles.statLabel}>{"Regar\nhoy"}</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={streak > 0 ? styles.statNumberOrange : styles.statNumber}>{streak}</Text>
                  <Text style={styles.statLabel}>{"Días\nde racha"}</Text>
                </View>
              </View>
              <View style={styles.healthSection}>
                <Text style={styles.healthTitle}>🌡️ SALUD GENERAL DEL JARDÍN</Text>
                <Text style={styles.healthSubtitle}>
                  Basado en consistencia de riegos y días de atraso
                </Text>
                <GardenHealthBar plants={plants} healthCounts={healthCounts} />
              </View>
            </>
          )}
          <SmallBio />
          <FavoritePlant />
          {/* Modo Vacaciones */}
          {vacation?.active ? (
            <TouchableOpacity
              style={styles.vacationBanner}
              onPress={() => setVacationModalVisible(true)}
              activeOpacity={0.8}
            >
              <View style={styles.vacationBannerLeft}>
                <Text style={styles.vacationBannerTitle}>🌴 Modo Vacaciones activo</Text>
                <Text style={styles.vacationBannerDates}>
                  {vacation.startDate.split("-").reverse().join("/")} → {vacation.endDate.split("-").reverse().join("/")}
                </Text>
              </View>
              <Text style={styles.vacationBannerEdit}>Editar</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.vacationButton}
              onPress={() => setVacationModalVisible(true)}
              activeOpacity={0.7}
            >
              <Text style={styles.vacationButtonIcon}>🌴</Text>
              <View>
                <Text style={styles.vacationButtonTitle}>Modo Vacaciones</Text>
                <Text style={styles.vacationButtonSub}>Revisá qué plantas necesitan atención</Text>
              </View>
            </TouchableOpacity>
          )}
          {/* Categorías en grid */}
          {plants.length > 0 && (
            <View style={styles.sectionLast}>
              <View style={styles.categoriesHeader}>
                <Text style={styles.sectionTitle}>🍃 CATEGORÍAS</Text>
              </View>
              <View style={styles.categoriesGrid}>
                {countByCategory.filter(({ count }) => count > 0).map(({ id, label, style, count }) => (
                  <TouchableOpacity
                    key={id}
                    style={[styles.categoryCard, styles[style]]}
                    onPress={() => handleCategoryPress(id)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.categoryNumber}>{count}</Text>
                    <Text style={styles.categoryLabel}>{label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
          {/* Categorías en grid */}
          <StreakFooter />
        </View>
      </ScrollView>
      <Toast
        visible={brokenStreak > 0}
        message={`🔥 Perdiste tu racha de ${brokenStreak} día${brokenStreak !== 1 ? "s" : ""}`}
        type="error"
        onDismiss={dismiss}
        duration={5000}
      />
      <ModalVacationMode
        visible={vacationModalVisible}
        plants={plants}
        isActive={vacation?.active ?? false}
        initialStartDate={vacation?.startDate}
        initialEndDate={vacation?.endDate}
        onClose={() => setVacationModalVisible(false)}
        onActivate={activate}
        onDeactivate={deactivate}
      />
    </View>
  );
}

///Ahora en vez de crear una hoja de styles como lo hicimos anteriormente,
//vamos a hacer lo siguiente
export const createUserStyles = (theme: AppTheme) =>
  StyleSheet.create({
    flex: {
      flex: 1,
    },
    scrollContent: {
      paddingHorizontal: theme.spacing.lg,
    },
    profileCard: {
      alignItems: "center",
      backgroundColor: theme.colors.bgSecondary,
      borderWidth: 1,
      borderColor: theme.colors.borderPrimary,
      color: "black",
      borderRadius: theme.radius.xl,
      marginTop: theme.spacing.xl,
      marginBottom: theme.spacing.xl,
    },

    // Stats
    statsContainer: {
      flexDirection: "row",
      justifyContent: "space-around",
      marginBottom: theme.spacing.xxl,
      paddingBottom: theme.spacing.xxl,
      borderBottomWidth: theme.spacing.xs,
      borderBottomColor: theme.colors.separator,
    },
    statItem: {
      alignItems: "center",
      flex: 1,
    },
    statNumber: {
      fontSize: theme.fontSize.xl,
      fontWeight: "700",
      color: theme.colors.textSecondary,
    },
    statNumberOrange: {
      fontSize: theme.fontSize.xl,
      fontWeight: "700",
      color: theme.colors.accentOrange,
    },
    statLabel: {
      fontSize: theme.fontSize.sm,
      color: theme.colors.textTertiary,
      marginTop: theme.spacing.xs,
      textAlign: "center",
    },
    statSublabel: {
      fontSize: theme.fontSize.sm,
      color: theme.colors.textInactive,
    },
    statSublabelOrange: {
      fontSize: theme.fontSize.sm,
      color: theme.colors.accentOrange,
    },
    divider: {
      borderBottomWidth: theme.spacing.xxl,
      borderBottomColor: theme.colors.separator,
    },

    // Sections
    section: {
      marginBottom: theme.spacing.xxl,
      paddingBottom: theme.spacing.xxl,
      borderBottomWidth: theme.spacing.xs,
      borderBottomColor: theme.colors.separator,
    },
    sectionLast: {
      marginBottom: theme.spacing.xxl,
    },
    sectionTitle: {
      fontSize: theme.fontSize.md,
      color: theme.colors.textPrimary,
      marginBottom: theme.spacing.md,
      letterSpacing: 1,
      fontWeight: "600",
    },

    // Categories
    categoriesHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: theme.spacing.sm,
      marginBottom: theme.spacing.lg,
    },
    categoriesGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: theme.spacing.sm,
    },
    categoryCard: {
      width: "48%",
      padding: theme.spacing.md,
      borderLeftWidth: theme.spacing.xs,
    },
    categoryGreen: {
      backgroundColor: theme.colors.categories.green.bg,
      borderLeftColor: theme.colors.categories.green.border,
    },
    categoryBrown: {
      backgroundColor: theme.colors.categories.brown.bg,
      borderLeftColor: theme.colors.categories.brown.border,
    },
    categoryPink: {
      backgroundColor: theme.colors.categories.pink.bg,
      borderLeftColor: theme.colors.categories.pink.border,
    },
    categoryYellow: {
      backgroundColor: theme.colors.categories.yellow.bg,
      borderLeftColor: theme.colors.categories.yellow.border,
    },
    categoryNumber: {
      fontSize: theme.fontSize.lg,
      fontWeight: "700",
      color: theme.colors.textPrimary,
    },
    categoryLabel: {
      fontSize: theme.fontSize.sm,
      color: theme.colors.textSecondary,
      marginTop: theme.spacing.xxs,
    },

    // Vacation mode
    vacationBanner: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: theme.colors.bgFooter,
      borderLeftWidth: theme.spacing.xs,
      borderLeftColor: theme.colors.accentGreen,
      borderRadius: theme.radius.sm,
      padding: theme.spacing.md,
      marginBottom: theme.spacing.xxl,
    },
    vacationBannerLeft: {
      flex: 1,
    },
    vacationBannerTitle: {
      fontSize: theme.fontSize.sm,
      fontWeight: "700",
      color: theme.colors.textPrimary,
    },
    vacationBannerDates: {
      fontSize: theme.fontSize.sm,
      color: theme.colors.textTertiary,
      marginTop: 2,
    },
    vacationBannerEdit: {
      fontSize: theme.fontSize.sm,
      color: theme.colors.accentGreen,
      fontWeight: "600",
    },
    vacationButton: {
      flexDirection: "row",
      alignItems: "center",
      gap: theme.spacing.md,
      borderWidth: 1,
      borderColor: theme.colors.borderPrimary,
      borderRadius: theme.radius.sm,
      padding: theme.spacing.md,
      marginBottom: theme.spacing.xxl,
    },
    vacationButtonIcon: {
      fontSize: theme.fontSize.xl,
    },
    vacationButtonTitle: {
      fontSize: theme.fontSize.sm,
      fontWeight: "600",
      color: theme.colors.textPrimary,
    },
    vacationButtonSub: {
      fontSize: theme.fontSize.sm,
      color: theme.colors.textTertiary,
      marginTop: 2,
    },

    // Empty state
    emptyState: {
      alignItems: "center",
      paddingVertical: theme.spacing.xxl,
      marginBottom: theme.spacing.xxl,
      paddingBottom: theme.spacing.xxl,
      borderBottomWidth: theme.spacing.xs,
      borderBottomColor: theme.colors.separator,
      gap: theme.spacing.sm,
    },
    emptyIcon: {
      fontSize: 52,
      marginBottom: theme.spacing.sm,
    },
    emptyTitle: {
      fontSize: theme.fontSize.lg,
      fontWeight: "700",
      color: theme.colors.textPrimary,
      textAlign: "center",
    },
    emptySubtitle: {
      fontSize: theme.fontSize.sm,
      color: theme.colors.textTertiary,
      textAlign: "center",
      lineHeight: 20,
    },
    emptyButton: {
      backgroundColor: theme.colors.accentOrange,
      borderRadius: theme.radius.sm,
      paddingHorizontal: theme.spacing.xxl,
      paddingVertical: theme.spacing.md,
      marginTop: theme.spacing.sm,
    },
    emptyButtonText: {
      color: "#ffffff",
      fontSize: theme.fontSize.sm,
      fontWeight: "700",
    },

    // Garden health
    healthSection: {
      marginBottom: theme.spacing.xxl,
      paddingBottom: theme.spacing.xxl,
      borderBottomWidth: theme.spacing.xs,
      borderBottomColor: theme.colors.separator,
    },
    healthTitle: {
      fontSize: theme.fontSize.md,
      color: theme.colors.textPrimary,
      marginBottom: theme.spacing.xs,
      letterSpacing: 1,
      fontWeight: "600",
    },
    healthSubtitle: {
      fontSize: theme.fontSize.sm,
      color: theme.colors.textTertiary,
      marginBottom: theme.spacing.md,
    },
    optionLabel: {
      fontSize: theme.fontSize.sm,
      fontWeight: "600",
      color: theme.colors.textTertiary,
      letterSpacing: 0.8,
      marginBottom: theme.spacing.sm,
    },
    optionLabelSpaced: {
      marginTop: theme.spacing.lg,
    },
  });

//Creamos un record con ambos styles, modo claro y oscuro
const stylesByMode = {
  light: createUserStyles(getAppTheme("light")),
  dark: createUserStyles(getAppTheme("dark")),
};
