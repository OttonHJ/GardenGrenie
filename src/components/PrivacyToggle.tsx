import {
  AppTheme,
  getAppTheme,
  useProfileTheme,
} from "@/src/theme/designSystem";
import React, { useState } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export function PrivacyToggle() {
  const [isPublic, setIsPublic] = useState(true);
  const { styles } = useProfileTheme(stylesByMode);

  return (
    <View style={styles.privacyContainer}>
      <View style={styles.alignContainer}>
        <View style={styles.rowAlign}>
          <Image
            style={styles.iconRight}
            source={require("@/assets/icons/worldwide.png")}
          />
          <Text style={styles.textInfo}>Público</Text>
        </View>

        <TouchableOpacity
          onPress={() => setIsPublic(!isPublic)}
          style={styles.toggleButton}
          activeOpacity={0.7}
        >
          <View
            style={[styles.toggleTrack, isPublic && styles.toggleTrackActive]}
          >
            <View
              style={[styles.toggleThumb, isPublic && styles.toggleThumbActive]}
            />
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export const createUserStyles = (theme: AppTheme) =>
  StyleSheet.create({
    privacyContainer: {
      flex: 1,
      alignItems: "baseline",
      justifyContent: "space-between",
      borderStyle: "solid",
      borderColor: theme.colors.accentOrange,
      borderWidth: 1,
      borderRadius: theme.radius.md,
      backgroundColor: theme.colors.bgPrimary,
      marginBottom: theme.spacing.xxl,
      marginTop: theme.spacing.xxl,
      paddingVertical: theme.spacing.sm,
      padding: theme.spacing.md,
    },
    alignContainer: {
      flex: 1,
      alignItems: "baseline",
      justifyContent: "space-between",
      flexDirection: "row",
      width: "85%",
      gap: theme.spacing.md,
    },
    privacyText: {
      fontSize: theme.fontSize.sm,
      color: theme.colors.textPrimary,
    },
    toggleButton: {
      padding: theme.spacing.xs,
    },
    toggleTrack: {
      width: 50,
      height: theme.spacing.xxl,
      backgroundColor: theme.colors.toggleTrack,
      borderRadius: theme.radius.sm,
      justifyContent: "center",
    },
    toggleTrackActive: {
      backgroundColor: theme.colors.toggleTrackActive,
    },
    toggleThumb: {
      width: theme.spacing.lg,
      height: theme.spacing.lg,
      backgroundColor: theme.colors.bgSecondary,
      borderRadius: theme.radius.md,
      position: "absolute",
      left: theme.spacing.xs,
    },
    toggleThumbActive: {
      left: 28,
    },
    rowAlign: {
      flexDirection: "row",
      textAlign: "center",
      alignContent: "center",
      alignItems: "center",
      justifyContent: "center",
    },
    iconRight: {
      width: theme.imageSize.icon,
      height: theme.imageSize.icon,
      marginRight: theme.spacing.sm,
    },
    textInfo: {
      fontSize: theme.fontSize.md,
      color: theme.colors.textPrimary,
    },
  });

//Vamos a crear un hook, podemos crear una carpeta para estas en la sección de styles
//O junto a los styles.
//Creamos un record con ambos styles, modo claro y oscuro
const stylesByMode = {
  light: createUserStyles(getAppTheme("light")),
  dark: createUserStyles(getAppTheme("dark")),
};
