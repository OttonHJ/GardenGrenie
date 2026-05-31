import {
  Achievement,
  AchievementRarity,
  RARITY_LABELS,
} from "@/src/utils/achievementUtils";
import {
  AppTheme,
  getAppTheme,
  useProfileTheme,
} from "@/src/theme/designSystem";
import React, { useCallback, useEffect, useRef } from "react";
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// ─── Props ─────────────────────────────────────────────────────────────────────

interface AchievementToastProps {
  achievement: Achievement | null;
  visible: boolean;
  onDismiss: () => void;
}

// ─── Componente ────────────────────────────────────────────────────────────────

export function AchievementToast({
  achievement,
  visible,
  onDismiss,
}: AchievementToastProps) {
  const { theme, styles } = useProfileTheme(stylesByMode);
  const insets = useSafeAreaInsets();
  const translateY = useRef(new Animated.Value(-120)).current;
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const dismiss = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    Animated.timing(translateY, {
      toValue: -120,
      duration: 280,
      useNativeDriver: true,
    }).start(() => onDismiss());
  }, [translateY, onDismiss]);

  useEffect(() => {
    if (visible) {
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        bounciness: 6,
      }).start();
      timerRef.current = setTimeout(dismiss, 4000);
    } else {
      translateY.setValue(-120);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [visible, dismiss, translateY]);

  if (!visible || !achievement) return null;

  const rarityColors = getRarityColors(achievement.rarity, theme);

  return (
    <Animated.View
      style={[
        styles.container,
        {
          paddingTop: insets.top + 8,
          backgroundColor: rarityColors.bg,
          borderBottomColor: rarityColors.border,
          transform: [{ translateY }],
        },
      ]}
    >
      <View style={styles.content}>
        <Text style={styles.achievementIcon}>{achievement.icon}</Text>
        <View style={styles.textBlock}>
          <Text style={[styles.headline, { color: rarityColors.text }]}>
            🏆 ¡Logro desbloqueado!
          </Text>
          <Text style={[styles.title, { color: rarityColors.text }]}>
            {achievement.title}
          </Text>
        </View>
        <View
          style={[
            styles.rarityBadge,
            { backgroundColor: rarityColors.border },
          ]}
        >
          <Text style={styles.rarityText}>
            {RARITY_LABELS[achievement.rarity].toUpperCase()}
          </Text>
        </View>
        <TouchableOpacity
          onPress={dismiss}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessibilityLabel="Cerrar logro"
          accessibilityRole="button"
        >
          <Text style={[styles.closeBtn, { color: rarityColors.text }]}>
            ×
          </Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

function getRarityColors(rarity: AchievementRarity, theme: AppTheme) {
  switch (rarity) {
    case "legendario":
      return {
        bg: theme.colors.categories.pink.bg,
        border: theme.colors.categories.pink.border,
        text: theme.colors.categories.pink.border,
      };
    case "epico":
      return {
        bg: theme.colors.categories.yellow.bg,
        border: theme.colors.categories.yellow.border,
        text: theme.colors.categories.yellow.border,
      };
    case "raro":
      return {
        bg: theme.colors.categories.green.bg,
        border: theme.colors.categories.green.border,
        text: theme.colors.categories.green.border,
      };
    default: // comun
      return {
        bg: theme.colors.categories.brown.bg,
        border: theme.colors.categories.brown.border,
        text: theme.colors.categories.brown.border,
      };
  }
}

// ─── Estilos ───────────────────────────────────────────────────────────────────

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      zIndex: 1000,
      borderBottomWidth: theme.spacing.xxs,
      paddingHorizontal: theme.spacing.lg,
      paddingBottom: theme.spacing.md,
    },
    content: {
      flexDirection: "row",
      alignItems: "center",
      gap: theme.spacing.sm,
    },
    achievementIcon: {
      fontSize: 26,
    },
    textBlock: {
      flex: 1,
      gap: 2,
    },
    headline: {
      fontSize: 11,
      fontWeight: "600",
      opacity: 0.7,
    },
    title: {
      fontSize: theme.fontSize.sm,
      fontWeight: "700",
    },
    rarityBadge: {
      paddingHorizontal: theme.spacing.xs,
      paddingVertical: 2,
      borderRadius: theme.radius.xs,
    },
    rarityText: {
      color: "#ffffff",
      fontSize: 10,
      fontWeight: "700",
      letterSpacing: 0.5,
    },
    closeBtn: {
      fontSize: theme.fontSize.lg,
      fontWeight: "300",
      lineHeight: theme.spacing.xxl,
    },
  });

const stylesByMode = {
  light: createStyles(getAppTheme("light")),
  dark: createStyles(getAppTheme("dark")),
};
