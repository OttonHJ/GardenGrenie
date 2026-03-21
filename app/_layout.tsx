import { AuthProvider, useAuth } from "@/src/context/AuthContext";
import { PlantsProvider } from "@/src/context/PlantContext";
import { ScreenForgotPassword } from "@/src/screens/ScreenForgotPassword";
import { ScreenLogin } from "@/src/screens/ScreenLogin";
import { ScreenRegister } from "@/src/screens/ScreenRegister";
import {
  AppTheme,
  getAppTheme,
  useProfileTheme,
} from "@/src/theme/designSystem";
import { Icon, Label, NativeTabs } from "expo-router/unstable-native-tabs";
import React, { useState } from "react";
import { StyleSheet } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

type AuthScreen = "login" | "register" | "forgot";

// Componente interno que consume el contexto
function AppContent() {
  const { styles } = useProfileTheme(stylesByMode);
  const { isAuthenticated, login } = useAuth();
  const [authScreen, setAuthScreen] = useState<AuthScreen>("login");

  if (!isAuthenticated) {
    return (
      <>
        {authScreen === "login" && (
          <ScreenLogin
            onNavigateRegister={() => setAuthScreen("register")}
            onNavigateForgot={() => setAuthScreen("forgot")}
            onLoginSuccess={login}
          />
        )}
        {authScreen === "register" && (
          <ScreenRegister
            onNavigateLogin={() => setAuthScreen("login")}
            onRegisterSuccess={login}
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
    <PlantsProvider>
      <NativeTabs>
        <NativeTabs.Trigger name="tabHome">
          <Label>Home</Label>
          <Icon sf={"house.fill"} drawable="ic_menu_mylocation" />
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="tabGarden">
          <Label>Garden</Label>
          <Icon sf={"leaf.fill"} drawable="leaf" />
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="tabCalendar">
          <Label>Calendar</Label>
          <Icon sf={"calendar"} drawable="ic_menu_today" />
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="tabSettings">
          <Label>Profile</Label>
          <Icon sf={"person.fill"} drawable="person" />
        </NativeTabs.Trigger>
      </NativeTabs>
    </PlantsProvider>
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

export const createUserStyles = (theme: AppTheme) => StyleSheet.create({});

const stylesByMode = {
  light: createUserStyles(getAppTheme("light")),
  dark: createUserStyles(getAppTheme("dark")),
};
