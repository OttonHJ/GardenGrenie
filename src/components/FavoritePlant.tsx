import {
    AppTheme,
    getAppTheme,
    useProfileTheme,
} from "@/src/theme/designSystem";
import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";

export function FavoritePlant() {
  const { styles } = useProfileTheme(stylesByMode);
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>PLANTA FAVORITA</Text>
      <View style={styles.favoritePlant}>
        <Image
          source={{
            uri: "https://images.unsplash.com/photo-1648528203163-8604bf696e7c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb25zdGVyYSUyMGRlbGljaW9zYSUyMHBsYW50fGVufDF8fHx8MTc3Mjk0Nzk5NXww&ixlib=rb-4.1.0&q=80&w=400",
          }}
          style={styles.plantImage}
        />
        <View style={styles.plantInfo}>
          <Text style={styles.plantName}>Monstera Deliciosa</Text>
          <Text style={styles.plantStats}>86 consultas realizadas</Text>
          <View style={styles.plantBadge}>
            <Text style={styles.plantBadgeText}>📈 Más consultada del mes</Text>
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
    },
    plantImage: {
      width: theme.imageSize.plants,
      height: theme.imageSize.plants,
      borderRadius: theme.radius.sm,
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
    plantStats: {
      fontSize: theme.fontSize.sm,
      color: theme.colors.textTertiary,
      marginTop: theme.spacing.xs,
    },
    plantBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: theme.spacing.xs,
      marginTop: theme.spacing.sm,
    },
    plantBadgeText: {
      fontSize: theme.fontSize.sm,
      color: theme.colors.textInactive,
    },
  });

//Vamos a crear un hook, podemos crear una carpeta para estas en la sección de styles
//O junto a los styles.
//Creamos un record con ambos styles, modo claro y oscuro
const stylesByMode = {
  light: createUserStyles(getAppTheme("light")),
  dark: createUserStyles(getAppTheme("dark")),
};
