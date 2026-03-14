import {
  AppTheme,
  getAppTheme,
  useProfileTheme,
} from "@/src/theme/designSystem";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface ProfileSummaryProps {
  onEditPress: () => void;
}

export function SettingsProfileSummary({ onEditPress }: ProfileSummaryProps) {
  const { theme, styles } = useProfileTheme(stylesByMode);

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.bgSecondary,
          borderBottomColor: theme.colors.borderPrimary,
        },
      ]}
    >
      <Image
        source={{
          uri: "https://images.unsplash.com/photo-1656417671052-ff145afcc351?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b21hbiUyMGJvdGFuaWNhbCUyMGdhcmRlbiUyMHBvcnRyYWl0fGVufDF8fHx8MTc3Mjk0Nzk5NHww&ixlib=rb-4.1.0&q=80&w=400",
        }}
        style={[styles.avatar, { borderColor: theme.colors.accentGreen }]}
      />
      <Text style={[styles.name, { color: theme.colors.textPrimary }]}>
        María González
      </Text>
      <TouchableOpacity
        style={[
          styles.editButton,
          {
            borderColor: theme.colors.accentGreen,
            backgroundColor: theme.colors.accentGreen + "22",
          },
        ]}
        onPress={onEditPress}
        activeOpacity={0.7}
      >
        <Text
          style={[styles.editButtonText, { color: theme.colors.accentGreen }]}
        >
          Editar perfil
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      alignItems: "center",
      paddingVertical: theme.spacing.xxl,
      borderBottomWidth: theme.spacing.xxs,
    },
    avatar: {
      width: theme.imageSize.profile,
      height: theme.imageSize.profile,
      borderRadius: theme.radius.full,
      borderWidth: theme.spacing.xxs,
    },
    name: {
      fontSize: theme.fontSize.lg,
      fontWeight: "600",
      marginTop: theme.spacing.md,
    },
    editButton: {
      borderWidth: 1,
      borderRadius: theme.radius.sm,
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.xs,
      marginTop: theme.spacing.sm,
    },
    editButtonText: {
      fontSize: theme.fontSize.sm,
      fontWeight: "600",
    },
  });

const stylesByMode = {
  light: createStyles(getAppTheme("light")),
  dark: createStyles(getAppTheme("dark")),
};
