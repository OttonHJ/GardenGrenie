import {
  AppTheme,
  getAppTheme,
  useProfileTheme,
} from "@/src/theme/designSystem";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export function TopBarMenu() {
  const { styles } = useProfileTheme(stylesByMode);
  return (
    <View style={styles.topBarMenu}>
      <TouchableOpacity>
        <Image
          style={styles.settingsButton}
          source={require("@/assets/icons/plant.png")}
        />
      </TouchableOpacity>
      <Text>Mi Jardin Virtual</Text>
      <TouchableOpacity>
        <Image
          style={styles.settingsButton}
          source={require("@/assets/icons/cogwheel.png")}
        />
      </TouchableOpacity>
    </View>
  );
}

///Ahora en vez de crear una hoja de styles como lo hicimos anteriormente,
//vamos a hacer lo siguiente
export const createUserStyles = (theme: AppTheme) =>
  StyleSheet.create({
    topBarMenu: {
      flexDirection: "row",
      flex: 1,
      justifyContent: "space-between",
      marginLeft: theme.spacing.md,
      marginRight: theme.spacing.md,
      marginTop: theme.spacing.lg,
    },
    jardinVirtualLogo: {
      width: theme.imageSize.plants,
      height: theme.imageSize.plants,
      alignSelf: "flex-start",
    },
    settingsButton: {
      width: theme.imageSize.icon,
      height: theme.imageSize.icon,
      alignSelf: "flex-end",
    },
  });

//Creamos un record con ambos styles, modo claro y oscuro
const stylesByMode = {
  light: createUserStyles(getAppTheme("light")),
  dark: createUserStyles(getAppTheme("dark")),
};
