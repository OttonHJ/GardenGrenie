import { usePlants } from "@/src/context/PlantContext";
import {
    AppTheme,
    getAppTheme,
    useProfileTheme,
} from "@/src/theme/designSystem";
import { calcFavoritePlant } from "@/src/utils/plantUtils";
import React, { useMemo } from "react";
import { Image, StyleSheet, Text, View } from "react-native";

export function FavoritePlant() {
  const { styles, theme } = useProfileTheme(stylesByMode);
  const { plants } = usePlants();

  const favorite = useMemo(() => calcFavoritePlant(plants), [plants]);

  if (!favorite) return null;

  const waterings = (favorite.wateringHistory ?? []).length;
  const freqMatch = favorite.waterFrequency.match(/\d+/);
  const freqDays = freqMatch ? parseInt(freqMatch[0]) : 7;
  const daysSince = Math.max((Date.now() - favorite.createdAt) / 86_400_000, 1);
  const expected = Math.min(daysSince / freqDays, 60);
  const consistencyPct = Math.min(Math.round((waterings / Math.max(expected, 1)) * 100), 100);

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>⭐ PLANTA FAVORITA</Text>
      <View style={[styles.favoritePlant, { backgroundColor: theme.colors.bgSecondary, borderColor: theme.colors.borderPrimary }]}>
        {favorite.image ? (
          <Image source={{ uri: favorite.image }} style={styles.plantImage} />
        ) : (
          <View style={[styles.plantImage, styles.plantImageFallback, { backgroundColor: theme.colors.categories.green.bg }]}>
            <Text style={styles.plantEmoji}>🌱</Text>
          </View>
        )}
        <View style={styles.plantInfo}>
          <Text style={styles.plantName}>{favorite.name}</Text>
          {favorite.scientificName ? (
            <Text style={[styles.plantScientific, { color: theme.colors.textTertiary }]}>{favorite.scientificName}</Text>
          ) : null}
          <Text style={styles.plantStats}>
            💧 {waterings} riego{waterings !== 1 ? "s" : ""} · {favorite.waterFrequency}
          </Text>
          <View style={[styles.plantBadge, { backgroundColor: theme.colors.accentGreen + "18" }]}>
            <Text style={[styles.plantBadgeText, { color: theme.colors.accentGreen }]}>
              📈 {consistencyPct}% de consistencia
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

///Ahora en vez de crear una hoja de styles como lo hicimos anteriormente,
//vamos a hacer lo siguiente
export const createUserStyles = (theme: AppTheme) =>
  StyleSheet.create({
    section: {
      marginBottom: theme.spacing.xxl,
      paddingBottom: theme.spacing.xxl,
      borderBottomWidth: theme.spacing.xs,
      borderBottomColor: theme.colors.separator,
    },
    sectionTitle: {
      fontSize: theme.fontSize.md,
      color: theme.colors.textPrimary,
      marginBottom: theme.spacing.md,
      letterSpacing: 1,
      fontWeight: "600",
    },
    favoritePlant: {
      flexDirection: "row",
      gap: theme.spacing.lg,
      borderWidth: 1,
      borderRadius: theme.radius.sm,
      padding: theme.spacing.md,
    },
    plantImage: {
      width: theme.imageSize.plants,
      height: theme.imageSize.plants,
      borderRadius: theme.radius.sm,
    },
    plantImageFallback: {
      justifyContent: "center",
      alignItems: "center",
    },
    plantEmoji: {
      fontSize: 28,
    },
    plantInfo: {
      flex: 1,
      justifyContent: "center",
    },
    plantName: {
      fontSize: theme.fontSize.md,
      fontWeight: "600",
      color: theme.colors.textPrimary,
    },
    plantScientific: {
      fontSize: theme.fontSize.sm,
      fontStyle: "italic",
      marginTop: theme.spacing.xxs,
    },
    plantStats: {
      fontSize: theme.fontSize.sm,
      color: theme.colors.textTertiary,
      marginTop: theme.spacing.xs,
    },
    plantBadge: {
      alignSelf: "flex-start",
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xxs,
      borderRadius: theme.radius.xxs * 4,
      marginTop: theme.spacing.sm,
    },
    plantBadgeText: {
      fontSize: theme.fontSize.sm,
      fontWeight: "600",
    },
  });

//Vamos a crear un hook, podemos crear una carpeta para estas en la sección de styles
//O junto a los styles.
//Creamos un record con ambos styles, modo claro y oscuro
const stylesByMode = {
  light: createUserStyles(getAppTheme("light")),
  dark: createUserStyles(getAppTheme("dark")),
};
