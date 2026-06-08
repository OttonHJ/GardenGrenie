import { useAuth } from "@/src/context/AuthContext";
import {
  AppTheme,
  getAppTheme,
  useProfileTheme,
} from "@/src/theme/designSystem";
import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";

type DayPeriod = "morning" | "afternoon" | "night";

function getGreeting(): { icon: string; text: string; period: DayPeriod } {
  const hour = new Date().getHours();
  if (hour >= 6 && hour < 12) return { icon: "🌅", text: "Buenos días", period: "morning" };
  if (hour >= 12 && hour < 18) return { icon: "☀️", text: "Buenas tardes", period: "afternoon" };
  return { icon: "🌙", text: "Buenas noches", period: "night" };
}

export function ProfileSummary() {
  const { styles, theme } = useProfileTheme(stylesByMode);
  const { user, profile } = useAuth();

  const displayName = profile?.displayName || user?.displayName || user?.email?.split("@")[0] || "Usuario";
  const username = profile?.username ? `@${profile.username}` : user?.email ?? "";
  const birthday = profile?.birthday ?? "";
  const bio = profile?.bio?.trim() ?? "";
  const greeting = getGreeting();

  return (
    <View style={[styles.containerHeader, { backgroundColor: theme.colors.timeOfDay[greeting.period] }]}>
      <View style={styles.containerHeaderStack}>
        <Image
          source={
            profile?.photoURL
              ? { uri: profile.photoURL }
              : require("@/assets/images/profilePlaceholder.png")
          }
          style={styles.profileImage}
        />
        <View style={styles.personalInfoStack}>
          <Text style={styles.greetingText}>{greeting.icon} {greeting.text}</Text>
          <Text style={styles.name}>{displayName}</Text>
          <Text style={styles.username}>{username}</Text>
          {!!birthday && (
            <Text style={styles.username}>🎂 {birthday}</Text>
          )}
        </View>
      </View>
      {!!bio && (
        <Text style={styles.bioText}>{bio}</Text>
      )}
    </View>
  );
}

///Ahora en vez de crear una hoja de styles como lo hicimos anteriormente,
//vamos a hacer lo siguiente
export const createUserStyles = (theme: AppTheme) =>
  StyleSheet.create({
    containerHeader: {
      paddingHorizontal: theme.spacing.lg,
      paddingTop: theme.spacing.lg,
      paddingBottom: theme.spacing.md,
    },
    containerHeaderStack: {
      flexDirection: "row",
      alignItems: "center",
      gap: theme.spacing.lg,
    },
    alignContainer: {
      flex: 1,
      alignItems: "baseline",
      justifyContent: "space-between",
      flexDirection: "row",
      gap: theme.spacing.md,
    },
    personalInfoStack: {
      flex: 1,
      justifyContent: "center",
    },
    profileImage: {
      width: theme.imageSize.profile,
      height: theme.imageSize.profile,
      borderRadius: theme.radius.full,
      borderWidth: 2,
      borderColor: theme.colors.accentGreen,
    },
    greetingText: {
      fontSize: theme.fontSize.sm,
      color: theme.colors.textSecondary,
      marginBottom: theme.spacing.xs,
    },
    name: {
      fontSize: theme.fontSize.lg,
      fontWeight: "700",
      color: theme.colors.textPrimary,
    },
    username: {
      fontSize: theme.fontSize.sm,
      color: theme.colors.textSecondary,
      marginTop: 2,
    },
    bioText: {
      fontSize: theme.fontSize.sm,
      color: theme.colors.textTertiary,
      lineHeight: 20,
      marginTop: theme.spacing.md,
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
