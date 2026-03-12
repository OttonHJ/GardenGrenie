import { AppTheme, getAppTheme, useProfileTheme } from "@/src/theme/designSystem";
import { FilterId } from "@/src/utils/plantUtils";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface GardenTopBarProps {
  plantCount: number;
  activeFilter: FilterId;
  onAddPress: () => void;
}

export function GardenTopBar({ plantCount, activeFilter, onAddPress }: GardenTopBarProps) {
  const { theme, styles } = useProfileTheme(stylesByMode);

  const isUrgentFilter = activeFilter === "water-today";

  const subtitleText = isUrgentFilter
    ? `💧 Regar hoy · ${plantCount}`
    : `${plantCount} planta${plantCount !== 1 ? "s" : ""}`;

  const subtitleColor = isUrgentFilter
    ? theme.colors.accentOrange
    : theme.colors.textTertiary;

  return (
    <View style={styles.container}>
      <View>
        <Text style={styles.title}>🌿 Mi Jardín</Text>
        <Text style={[styles.subtitle, { color: subtitleColor }]}>
          {subtitleText}
        </Text>
      </View>
      <TouchableOpacity
        style={styles.addButton}
        onPress={onAddPress}
        activeOpacity={0.8}
      >
        <Text style={styles.addButtonText}>+ Agregar</Text>
      </TouchableOpacity>
    </View>
  );
}

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      backgroundColor: theme.colors.bgSecondary,
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.borderPrimary,
    },
    title: {
      fontSize: theme.fontSize.md,
      fontWeight: "700",
      color: theme.colors.textPrimary,
    },
    subtitle: {
      fontSize: theme.fontSize.sm,
      marginTop: theme.spacing.xxs,
    },
    addButton: {
      backgroundColor: theme.colors.accentOrange,
      borderRadius: theme.radius.sm,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
    },
    addButtonText: {
      color: "#ffffff",
      fontSize: theme.fontSize.sm,
      fontWeight: "700",
    },
  });

const stylesByMode = {
  light: createStyles(getAppTheme("light")),
  dark:  createStyles(getAppTheme("dark")),
};
