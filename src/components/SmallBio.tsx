import {
  AppTheme,
  getAppTheme,
  useProfileTheme,
} from "@/src/theme/designSystem";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

export function SmallBio() {
  const { styles } = useProfileTheme(stylesByMode);
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>SOBRE MÍ</Text>
      <Text style={styles.description}>
        Apasionada de la botánica y el cuidado de plantas. Me encanta compartir
        mis conocimientos y ayudar a otros a mantener sus plantas felices y
        saludables.
      </Text>
    </View>
  );
}

///Ahora en vez de crear una hoja de styles como lo hicimos anteriormente,
//vamos a hacer lo siguiente
export const createUserStyles = (theme: AppTheme) =>
  StyleSheet.create({
    section: {
      marginBottom: theme.spacing.xxl,
      paddingBottom: theme.spacing.xxl,
      borderBottomWidth: theme.spacing.xs,
      borderBottomColor: theme.colors.separator,
    },
    sectionTitle: {
      fontSize: theme.fontSize.md,
      color: theme.colors.textPrimary,
      marginBottom: theme.spacing.md,
      letterSpacing: 1,
      fontWeight: "600",
    },
    description: {
      fontSize: theme.fontSize.sm,
      color: theme.colors.textPrimary,
      lineHeight: 22,
    },
  });

//Vamos a crear un hook, podemos crear una carpeta para estas en la sección de styles
//O junto a los styles.
//Creamos un record con ambos styles, modo claro y oscuro
const stylesByMode = {
  light: createUserStyles(getAppTheme("light")),
  dark: createUserStyles(getAppTheme("dark")),
};
