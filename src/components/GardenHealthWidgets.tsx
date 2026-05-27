import { Plant } from "@/src/components/PlantCard";
import {
  AppTheme,
  getAppTheme,
  useProfileTheme,
} from "@/src/theme/designSystem";
import {
  HEALTH_STATE_CONFIG,
  HealthState,
} from "@/src/utils/healthUtils";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export interface HealthWidgetProps {
  plants: Plant[];
  healthCounts: Record<HealthState, number>;
  onSegmentPress?: (state: HealthState) => void;
}

const HEALTH_STATES: HealthState[] = ["healthy", "ok", "stressed", "critical"];

// ─── Opción 1: Barra segmentada ────────────────────────────────────────────────

export function GardenHealthBar({ plants, healthCounts, onSegmentPress }: HealthWidgetProps) {
  const { styles, theme } = useProfileTheme(stylesByMode);
  const total = plants.length;
  if (total === 0) return null;

  return (
    <View>
      <View style={styles.bar}>
        {HEALTH_STATES.map((state) => {
          const count = healthCounts[state];
          if (count === 0) return null;
          const pct = (count / total) * 100;
          return (
            <TouchableOpacity
              key={state}
              activeOpacity={onSegmentPress ? 0.7 : 1}
              onPress={onSegmentPress ? () => onSegmentPress(state) : undefined}
              style={[
                styles.barSegment,
                {
                  width: `${pct}%` as any,
                  backgroundColor: HEALTH_STATE_CONFIG[state].color,
                },
              ]}
            />
          );
        })}
      </View>
      <View style={styles.barLegend}>
        {HEALTH_STATES.map((state) => {
          const count = healthCounts[state];
          if (count === 0) return null;
          const cfg = HEALTH_STATE_CONFIG[state];
          return (
            <TouchableOpacity
              key={state}
              activeOpacity={onSegmentPress ? 0.7 : 1}
              onPress={onSegmentPress ? () => onSegmentPress(state) : undefined}
              style={styles.legendItem}
            >
              <View
                style={[styles.legendDot, { backgroundColor: cfg.color }]}
              />
              <Text
                style={[styles.legendText, { color: theme.colors.textSecondary }]}
              >
                {cfg.emoji} {count}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}


// ─── Estilos ───────────────────────────────────────────────────────────────────

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    // Barra segmentada
    bar: {
      flexDirection: "row",
      height: 10,
      borderRadius: theme.radius.full,
      overflow: "hidden",
      backgroundColor: theme.colors.bgPrimary,
    },
    barSegment: {
      height: "100%",
    },
    barLegend: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: theme.spacing.md,
      marginTop: theme.spacing.sm,
    },
    legendItem: {
      flexDirection: "row",
      alignItems: "center",
      gap: theme.spacing.xs,
    },
    legendDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
    },
    legendText: {
      fontSize: theme.fontSize.sm,
    },

  });

const stylesByMode = {
  light: createStyles(getAppTheme("light")),
  dark: createStyles(getAppTheme("dark")),
};
