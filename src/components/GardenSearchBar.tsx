import { AppTheme, getAppTheme, useProfileTheme } from "@/src/theme/designSystem";
import { Search, X } from "lucide-react-native";
import React from "react";
import { StyleSheet, TextInput, TouchableOpacity, View } from "react-native";

interface GardenSearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  onClear: () => void;
}

export function GardenSearchBar({ value, onChangeText, onClear }: GardenSearchBarProps) {
  const { theme, styles } = useProfileTheme(stylesByMode);

  return (
    <View style={styles.container}>
      <View style={styles.searchBar}>
        <Search size={16} color={theme.colors.textTertiary} />
        <TextInput
          style={styles.input}
          placeholder="Buscar planta..."
          placeholderTextColor={theme.colors.textTertiary}
          value={value}
          onChangeText={onChangeText}
          returnKeyType="search"
          autoCorrect={false}
          autoCapitalize="none"
        />
        {value.length > 0 && (
          <TouchableOpacity onPress={onClear} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <X size={16} color={theme.colors.textTertiary} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      backgroundColor: theme.colors.bgSecondary,
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.borderPrimary,
    },
    searchBar: {
      flexDirection: "row",
      alignItems: "center",
      gap: theme.spacing.sm,
      backgroundColor: theme.colors.bgPrimary,
      borderRadius: theme.radius.sm,
      borderWidth: 1,
      borderColor: theme.colors.borderPrimary,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
    },
    input: {
      flex: 1,
      fontSize: theme.fontSize.sm,
      color: theme.colors.textPrimary,
      padding: 0,  // elimina padding interno en Android
    },
  });

const stylesByMode = {
  light: createStyles(getAppTheme("light")),
  dark:  createStyles(getAppTheme("dark")),
};
