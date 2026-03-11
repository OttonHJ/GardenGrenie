import { AppTheme, getAppTheme, useAppTheme } from "@/src/theme/designSystem";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export function TopBarMenu() {
  const { styles } = useProfileTheme();
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
      width: 80,
      height: 80,
      alignSelf: "flex-start",
    },
    settingsButton: {
      width: 20,
      height: 20,
      alignSelf: "flex-end",
    },
  });

//Vamos a crear un hook, podemos crear una carpeta para estas en la sección de styles
//O junto a los styles.
//Creamos un record con ambos styles, modo claro y oscuro
const stylesByMode = {
  light: createUserStyles(getAppTheme("light")),
  dark: createUserStyles(getAppTheme("dark")),
};

//Segun el tema, exportamos los estilos correctamos y el mismo
//tema para los que no son estilos
export function useProfileTheme() {
  const theme = useAppTheme();
  return { theme, styles: stylesByMode[theme.mode] };
}
