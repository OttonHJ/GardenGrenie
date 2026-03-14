import {
  AppTheme,
  getAppTheme,
  useProfileTheme,
} from "@/src/theme/designSystem";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface GardenEmptyProps {
  variant: "no-plants" | "no-results";
  onAddPress: () => void;
  onClearFilter: () => void;
}

export function GardenEmpty({
  variant,
  onAddPress,
  onClearFilter,
}: GardenEmptyProps) {
  const { theme, styles } = useProfileTheme(stylesByMode);

  const isNoPlants = variant === "no-plants";

  return (
    <View style={styles.container}>
      <Text style={styles.icon}>{isNoPlants ? "🌱" : "🔍"}</Text>
      <Text style={styles.title}>
        {isNoPlants ? "Tu jardín está vacío" : "Sin resultados"}
      </Text>
      <Text style={styles.subtitle}>
        {isNoPlants
          ? "Agrega tu primera planta fotografiándola\no eligiendo una de la galería"
          : "Ninguna planta coincide con tu búsqueda\no filtro actual"}
      </Text>

      <TouchableOpacity
        style={styles.primaryButton}
        onPress={isNoPlants ? onAddPress : onClearFilter}
        activeOpacity={0.8}
      >
        <Text style={styles.primaryButtonText}>
          {isNoPlants ? "📷 Agregar primera planta" : "Limpiar filtros"}
        </Text>
      </TouchableOpacity>

      {/* En "no-results" también ofrece agregar planta nueva */}
      {!isNoPlants && (
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={onAddPress}
          activeOpacity={0.8}
        >
          <Text style={styles.secondaryButtonText}>+ Agregar nueva planta</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: theme.spacing.xxl,
      paddingVertical: theme.spacing.xxl,
      gap: theme.spacing.md,
    },
    icon: {
      fontSize: 56,
      marginBottom: theme.spacing.sm,
    },
    title: {
      fontSize: theme.fontSize.lg,
      fontWeight: "700",
      color: theme.colors.textPrimary,
      textAlign: "center",
    },
    subtitle: {
      fontSize: theme.fontSize.sm,
      color: theme.colors.textTertiary,
      textAlign: "center",
      lineHeight: 20,
    },
    primaryButton: {
      backgroundColor: theme.colors.accentOrange,
      borderRadius: theme.radius.sm,
      paddingHorizontal: theme.spacing.xxl,
      paddingVertical: theme.spacing.md,
      marginTop: theme.spacing.sm,
    },
    primaryButtonText: {
      color: "#ffffff",
      fontSize: theme.fontSize.sm,
      fontWeight: "700",
    },
    secondaryButton: {
      borderRadius: theme.radius.sm,
      paddingHorizontal: theme.spacing.xxl,
      paddingVertical: theme.spacing.md,
      borderWidth: 1,
      borderColor: theme.colors.borderPrimary,
    },
    secondaryButtonText: {
      color: theme.colors.textSecondary,
      fontSize: theme.fontSize.sm,
      fontWeight: "600",
    },
  });

const stylesByMode = {
  light: createStyles(getAppTheme("light")),
  dark: createStyles(getAppTheme("dark")),
};
