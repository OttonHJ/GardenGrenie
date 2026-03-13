import {
  AppTheme,
  getAppTheme,
  useProfileTheme,
} from "@/src/theme/designSystem";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface ProfileSettingsRowProps {
  icon: string;
  iconBg: string;
  title: string;
  subtitle?: string;
  value?: string;
  onPress: () => void;
  isLast?: boolean;
}

export function SettingsProfileRow({
  icon,
  iconBg,
  title,
  subtitle,
  value,
  onPress,
  isLast = false,
}: ProfileSettingsRowProps) {
  const { theme, styles } = useProfileTheme(stylesByMode);

  return (
    <TouchableOpacity
      style={[
        styles.row,
        !isLast && {
          borderBottomWidth: 1,
          borderBottomColor: theme.colors.borderPrimary,
        },
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.iconWrap, { backgroundColor: iconBg }]}>
        <Text style={styles.iconText}>{icon}</Text>
      </View>
      <View style={styles.textWrap}>
        <Text style={[styles.title, { color: theme.colors.textPrimary }]}>
          {title}
        </Text>
        {subtitle && (
          <Text style={[styles.subtitle, { color: theme.colors.textTertiary }]}>
            {subtitle}
          </Text>
        )}
      </View>
      {value && (
        <Text style={[styles.value, { color: theme.colors.textTertiary }]}>
          {value}
        </Text>
      )}
      <Text style={[styles.chevron, { color: theme.colors.textTertiary }]}>
        ›
      </Text>
    </TouchableOpacity>
  );
}

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    row: {
      flexDirection: "row",
      alignItems: "center",
      gap: theme.spacing.md,
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.md,
    },
    iconWrap: {
      width: 32,
      height: 32,
      borderRadius: theme.radius.xs,
      justifyContent: "center",
      alignItems: "center",
      flexShrink: 0,
    },
    iconText: {
      fontSize: 15,
    },
    textWrap: {
      flex: 1,
    },
    title: {
      fontSize: theme.fontSize.sm,
      fontWeight: "600",
    },
    subtitle: {
      fontSize: 11,
      marginTop: 2,
    },
    value: {
      fontSize: 11,
      marginRight: theme.spacing.xs,
    },
    chevron: {
      fontSize: theme.fontSize.md,
    },
  });

const stylesByMode = {
  light: createStyles(getAppTheme("light")),
  dark: createStyles(getAppTheme("dark")),
};
