import { AuthProvider, useAuth } from "@/src/context/AuthContext";
import { ChatProvider } from "@/src/context/ChatContext";
import { AchievementsProvider } from "@/src/context/AchievementsContext";
import { PlantsProvider } from "@/src/context/PlantContext";
import { OfflineBanner } from "@/src/components/OfflineBanner";
import { ScreenForgotPassword } from "@/src/screens/ScreenForgotPassword";
import { ScreenLogin } from "@/src/screens/ScreenLogin";
import { ScreenRegister } from "@/src/screens/ScreenRegister";
import {
  AppTheme,
  getAppTheme,
  useProfileTheme,
} from "@/src/theme/designSystem";
import { Icon, Label, NativeTabs } from "expo-router/unstable-native-tabs";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

type AuthScreen = "login" | "register" | "forgot";

// Componente interno que consume el contexto
function AppContent() {
  const { theme } = useProfileTheme(stylesByMode);
  const { user, loading } = useAuth();
  const [authScreen, setAuthScreen] = useState<AuthScreen>("login");

  useEffect(() => {
    if (!user) setAuthScreen("login");
  }, [user]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: theme.colors.bgPrimary }}>
        <ActivityIndicator size="large" color={theme.colors.accentGreen} />
      </View>
    );
  }

  if (!user) {
    return (
      <>
        {authScreen === "login" && (
          <ScreenLogin
            onNavigateRegister={() => setAuthScreen("register")}
            onNavigateForgot={() => setAuthScreen("forgot")}
          />
        )}
        {authScreen === "register" && (
          <ScreenRegister
            onNavigateLogin={() => setAuthScreen("login")}
          />
        )}
        {authScreen === "forgot" && (
          <ScreenForgotPassword
            onNavigateLogin={() => setAuthScreen("login")}
          />
        )}
      </>
    );
  }

  return (
    <ChatProvider>
      <PlantsProvider>
        <AchievementsProvider>
          <OfflineBanner />
          <NativeTabs>
            <NativeTabs.Trigger name="tabHome">
              <Label>Home</Label>
              <Icon sf={"house.fill"} drawable="tab_home" />
            </NativeTabs.Trigger>
            <NativeTabs.Trigger name="tabGarden">
              <Label>Jardín</Label>
              <Icon sf={"leaf.fill"} drawable="tab_garden" />
            </NativeTabs.Trigger>
            <NativeTabs.Trigger name="tabCalendar">
              <Label>Calendario</Label>
              <Icon sf={"calendar"} drawable="tab_calendar" />
            </NativeTabs.Trigger>
            <NativeTabs.Trigger name="tabChat">
              <Label>Chat</Label>
              <Icon sf={"message.fill"} drawable="tab_chat" />
            </NativeTabs.Trigger>
            <NativeTabs.Trigger name="tabSettings">
              <Label>Perfil</Label>
              <Icon sf={"person.fill"} drawable="tab_profile" />
            </NativeTabs.Trigger>
          </NativeTabs>
        </AchievementsProvider>
      </PlantsProvider>
    </ChatProvider>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </SafeAreaProvider>
  );
}

export const createUserStyles = (_theme: AppTheme) => StyleSheet.create({});

const stylesByMode = {
  light: createUserStyles(getAppTheme("light")),
  dark: createUserStyles(getAppTheme("dark")),
};
