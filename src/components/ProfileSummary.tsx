import { useAuth } from "@/src/context/AuthContext";
import {
  AppTheme,
  getAppTheme,
  useProfileTheme,
} from "@/src/theme/designSystem";
import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";

export function ProfileSummary() {
  const { styles } = useProfileTheme(stylesByMode);
  const { user, profile } = useAuth();

  const displayName = profile?.displayName || user?.displayName || user?.email?.split("@")[0] || "Usuario";
  const username = profile?.username ? `@${profile.username}` : user?.email ?? "";
  const birthday = profile?.birthday ?? "";

  return (
    <View style={styles.containerHeader}>
      <View style={styles.containerHeaderStack}>
        <Image
          source={
            user?.photoURL
              ? { uri: user.photoURL }
              : require("@/assets/images/profilePlaceholder.png")
          }
          style={styles.profileImage}
        />
        <View style={styles.personalInfoStack}>
          <Text style={styles.name}>{displayName}</Text>
          <Text style={styles.username}>{username}</Text>
          {!!birthday && (
            <Text style={styles.username}>🎂 {birthday}</Text>
          )}
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
      alignItems: "baseline",
      marginBottom: theme.spacing.lg,
      flex: 1,
    },
    containerHeaderStack: {
      alignItems: "center",
      paddingTop: theme.spacing.xxl,
      flex: 2,
      flexDirection: "row",
    },
    alignContainer: {
      flex: 1,
      alignItems: "baseline",
      justifyContent: "space-between",
      flexDirection: "row",
      gap: theme.spacing.md,
    },
    personalInfoStack: {
      marginLeft: theme.spacing.xl,
      marginTop: theme.spacing.md,
      textAlign: "center",
      alignContent: "center",
      justifyContent: "center",
    },
    profileImage: {
      width: theme.imageSize.profile,
      height: theme.imageSize.profile,
      borderRadius: theme.radius.full,
      borderWidth: theme.radius.xxs,
      borderColor: theme.colors.borderPrivacy,
    },
    name: {
      fontSize: theme.fontSize.lg,
      fontWeight: "600",
      color: theme.colors.textPrimary,
      marginBottom: theme.spacing.xs,
    },
    username: {
      fontSize: theme.fontSize.md,
      color: theme.colors.textSecondary,
      marginTop: theme.spacing.xs,
      marginBottom: theme.spacing.sm,
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
      marginTop: theme.spacing.xs,
    },
  });

//Vamos a crear un hook, podemos crear una carpeta para estas en la sección de styles
//O junto a los styles.
//Creamos un record con ambos styles, modo claro y oscuro
const stylesByMode = {
  light: createUserStyles(getAppTheme("light")),
  dark: createUserStyles(getAppTheme("dark")),
};
