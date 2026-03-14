import { ScreenHome } from "@/src/screens/ScreenHome";
import {
  AppTheme,
  getAppTheme,
  useProfileTheme,
} from "@/src/theme/designSystem";
import React from "react";
import { StyleSheet, View } from "react-native";

export default function tabHome() {
  const { styles } = useProfileTheme(stylesByMode);

  return (
    <View style={styles.container}>
      <ScreenHome />
    </View>
  );
}

///Ahora en vez de crear una hoja de styles como lo hicimos anteriormente,
//vamos a hacer lo siguiente
export const createUserStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.bgPrimary,
    },
  });

//Creamos un record con ambos styles, modo claro y oscuro
const stylesByMode = {
  light: createUserStyles(getAppTheme("light")),
  dark: createUserStyles(getAppTheme("dark")),
};
