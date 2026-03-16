import { PrivacyToggle } from "@/src/components/PrivacyToggle";
import { ProfileSummary } from "@/src/components/ProfileSummary";
import { SmallBio } from "@/src/components/SmallBio";
import { StreakFooter } from "@/src/components/StreakFooter";
import {
  AppTheme,
  getAppTheme,
  useProfileTheme,
} from "@/src/theme/designSystem";
import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { FavoritePlant } from "../components/FavoritePlant";

export function ScreenHome() {
  const insets = useSafeAreaInsets();
  const { styles } = useProfileTheme(stylesByMode);

  return (
    <View
      style={{
        flex: 1,
        paddingBottom: insets.bottom,
        paddingTop: insets.top,
      }}
    >
      <ScrollView
        style={styles.flex}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View>
          <View style={styles.profileCard}>
            <TouchableOpacity style={styles.flex}>
              <ProfileSummary />
            </TouchableOpacity>
            <PrivacyToggle />
          </View>
          {/* Stats horizontales con líneas divisorias */}
          <View style={(styles.section, styles.statsContainer)}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>127</Text>
              <Text style={styles.statLabel}>{"Plantas\nregistradas"}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>42</Text>
              <Text style={styles.statLabel}>{"Amigos\nconectados"}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumberOrange}>28</Text>
              <Text style={styles.statLabel}>{"Días\nde racha"}</Text>
            </View>
          </View>
          {/* Stats horizontales con líneas divisorias */}
          <SmallBio />
          <FavoritePlant />
          {/* Categorías en grid */}
          <View style={styles.sectionLast}>
            <View style={styles.categoriesHeader}>
              <Text style={styles.sectionTitle}>🍃 CATEGORÍAS</Text>
            </View>
            <View style={styles.categoriesGrid}>
              <View style={[styles.categoryCard, styles.categoryGreen]}>
                <Text style={styles.categoryNumber}>34</Text>
                <Text style={styles.categoryLabel}>Suculentas</Text>
              </View>
              <View style={[styles.categoryCard, styles.categoryBrown]}>
                <Text style={styles.categoryNumber}>28</Text>
                <Text style={styles.categoryLabel}>Tropicales</Text>
              </View>
              <View style={[styles.categoryCard, styles.categoryPink]}>
                <Text style={styles.categoryNumber}>22</Text>
                <Text style={styles.categoryLabel}>Aromáticas</Text>
              </View>
              <View style={[styles.categoryCard, styles.categoryYellow]}>
                <Text style={styles.categoryNumber}>18</Text>
                <Text style={styles.categoryLabel}>Cactáceas</Text>
              </View>
            </View>
          </View>
          {/* Categorías en grid */}
          <StreakFooter />
        </View>
      </ScrollView>
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
  });

//Creamos un record con ambos styles, modo claro y oscuro
const stylesByMode = {
  light: createUserStyles(getAppTheme("light")),
  dark: createUserStyles(getAppTheme("dark")),
};
