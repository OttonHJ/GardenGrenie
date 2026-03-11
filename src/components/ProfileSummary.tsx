import { AppTheme, getAppTheme, useAppTheme } from "@/src/theme/designSystem";
import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";

export function ProfileSummary() {
  const { styles } = useProfileTheme();
  return (
    <View style={styles.containerHeader}>
      <View style={styles.containerHeaderStack}>
        <Image
          source={{
            uri: "https://images.unsplash.com/photo-1656417671052-ff145afcc351?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b21hbiUyMGJvdGFuaWNhbCUyMGdhcmRlbiUyMHBvcnRyYWl0fGVufDF8fHx8MTc3Mjk0Nzk5NHww&ixlib=rb-4.1.0&q=80&w=400",
          }}
          style={styles.profileImage}
        />
        <View style={styles.personalInfoStack}>
          <Text style={styles.name}>María González</Text>
          <Text style={styles.username}>@plantlover</Text>
          <View style={styles.birthdayInfo}>
            <Image
              style={styles.birthdayIcon}
              source={require("@/assets/icons/cake.png")}
            />
            <Text style={styles.bio}>15 de Mayo </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

///Ahora en vez de crear una hoja de styles como lo hicimos anteriormente,
//vamos a hacer lo siguiente
export const createUserStyles = (theme: AppTheme) =>
  StyleSheet.create({
    containerHeader: {
      alignItems: "center",
      paddingBottom: 16,
      flex: 1,
    },
    containerHeaderStack: {
      alignItems: "center",
      paddingTop: 24,
      flex: 2,
      flexDirection: "row",
    },
    personalInfoStack: {
      marginLeft: 20,
      marginTop: 10,
      alignItems: "baseline",
      alignSelf: "flex-start",
    },
    profileImage: {
      width: 114,
      height: 114,
      borderRadius: 56,
      borderWidth: 2,
      borderColor: "#c9e4de",
    },
    name: {
      marginTop: 12,
      fontSize: 20,
      fontWeight: "600",
      color: "#1a4037",
      marginBottom: 2,
    },
    username: {
      fontSize: 14,
      color: "#5d8679",
      marginTop: 4,
      marginBottom: 3,
    },
    birthdayInfo: {
      flexDirection: "row",
    },
    birthdayIcon: {
      width: 25,
      height: 25,
      alignSelf: "flex-end",
      marginRight: 5,
    },
    bio: {
      fontSize: theme.fontSize.md,
      color: "#7a7a7a",
      marginTop: 8,
      textAlign: "center",
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
