import {
  AppTheme,
  getAppTheme,
  useProfileTheme,
} from "@/src/theme/designSystem";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

export function StreakFooter() {
  const { styles } = useProfileTheme(stylesByMode);
  return (
    <View style={styles.footer}>
      <Text style={styles.footerHeadline}>TU PROGRESO</Text>
      <View style={styles.footerContent}>
        <Text style={styles.footerText}>
          🔥 ¡28 días seguidos cuidando tus plantas!
        </Text>
      </View>
    </View>
  );
}

///Ahora en vez de crear una hoja de styles como lo hicimos anteriormente,
//vamos a hacer lo siguiente
export const createUserStyles = (theme: AppTheme) =>
  StyleSheet.create({
    footer: {
      backgroundColor: theme.colors.bgFooter,
      padding: theme.spacing.lg,
      borderTopWidth: theme.spacing.xs,
      borderTopColor: theme.colors.borderFooter,
      marginHorizontal: -16,
      alignItems: "center",
      justifyContent: "center",
    },
    footerContent: {
      flexDirection: "row",
      gap: theme.spacing.sm,
    },
    footerHeadline: {
      color: theme.colors.accentOrange,
    },
    footerText: {
      fontSize: theme.fontSize.sm,
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
