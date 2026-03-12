import {
  AppTheme,
  getAppTheme,
  useProfileTheme,
} from "@/src/theme/designSystem";
import {
  FILTER_OPTIONS,
  FilterId,
  FilterOption,
  SORT_OPTIONS,
  SortId,
} from "@/src/utils/plantUtils";
import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface GardenFilterBarProps {
  activeFilter: FilterId;
  onFilterChange: (id: FilterId) => void;
  sortBy: SortId;
  onSortChange: (id: SortId) => void;
  resultCount: number;
}

export function GardenFilterBar({
  activeFilter,
  onFilterChange,
  sortBy,
  onSortChange,
  resultCount,
}: GardenFilterBarProps) {
  const { theme, styles } = useProfileTheme(stylesByMode);

  // Rotar al siguiente orden con cada tap
  const handleSortPress = () => {
    const idx = SORT_OPTIONS.findIndex((s) => s.id === sortBy);
    const next = SORT_OPTIONS[(idx + 1) % SORT_OPTIONS.length];
    onSortChange(next.id);
  };

  const currentSortLabel =
    SORT_OPTIONS.find((s) => s.id === sortBy)?.label ?? "";

  return (
    <View>
      {/* Fila de chips de filtro */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filtersRow}
        style={styles.filtersContainer}
      >
        {FILTER_OPTIONS.map((filter: FilterOption) => {
          const isActive = filter.id === activeFilter;
          const isUrgent = filter.id === "water-today";
          return (
            <TouchableOpacity
              key={filter.id}
              style={[
                styles.chip,
                isActive &&
                  (isUrgent ? styles.chipActiveOrange : styles.chipActiveGreen),
              ]}
              onPress={() => onFilterChange(filter.id)}
              activeOpacity={0.7}
            >
              <Text
                style={[styles.chipText, isActive && styles.chipTextActive]}
              >
                {filter.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Barra de resultados + ordenamiento */}
      <View style={styles.sortBar}>
        <Text style={styles.resultText}>
          {resultCount} resultado{resultCount !== 1 ? "s" : ""}
        </Text>
        <TouchableOpacity
          onPress={handleSortPress}
          style={styles.sortButton}
          activeOpacity={0.7}
        >
          <Text style={styles.sortText}>↕ {currentSortLabel}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    filtersContainer: {
      backgroundColor: theme.colors.bgSecondary,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.borderPrimary,
    },
    filtersRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: theme.spacing.sm,
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.sm,
    },
    chip: {
      alignSelf: "flex-start",
      borderRadius: theme.radius.full,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.xs,
      backgroundColor: theme.colors.bgPrimary,
      borderWidth: 1,
      borderColor: theme.colors.borderPrimary,
    },
    chipActiveGreen: {
      backgroundColor: theme.colors.toggleTrackActive,
      borderColor: theme.colors.toggleTrackActive,
    },
    chipActiveOrange: {
      backgroundColor: theme.colors.accentOrange,
      borderColor: theme.colors.accentOrange,
    },
    chipText: {
      fontSize: theme.fontSize.sm,
      fontWeight: "600",
      color: theme.colors.textSecondary,
    },
    chipTextActive: {
      color: "#ffffff",
    },
    sortBar: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      backgroundColor: theme.colors.bgPrimary,
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.xs,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.borderPrimary,
    },
    resultText: {
      fontSize: 11,
      color: theme.colors.textTertiary,
    },
    sortButton: {
      paddingVertical: theme.spacing.xxs,
    },
    sortText: {
      fontSize: theme.fontSize.sm,
      fontWeight: "600",
      color: theme.colors.accentGreen,
    },
  });

const stylesByMode = {
  light: createStyles(getAppTheme("light")),
  dark: createStyles(getAppTheme("dark")),
};
