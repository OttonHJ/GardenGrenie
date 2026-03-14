import { PlantsProvider } from "@/src/context/PlantContext";
import {
  AppTheme,
  getAppTheme,
  useProfileTheme,
} from "@/src/theme/designSystem";
import { Icon, Label, NativeTabs } from "expo-router/unstable-native-tabs";
import React from "react";
import { StyleSheet } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function RootLayout() {
  const { styles } = useProfileTheme(stylesByMode);

  return (
    <SafeAreaProvider>
      <PlantsProvider>
        <NativeTabs>
          <NativeTabs.Trigger name="index">
            <Label>Home</Label>
            <Icon sf={"house.fill"} drawable="ic_menu_mylocation" />
          </NativeTabs.Trigger>
          <NativeTabs.Trigger name="personGarden">
            <Label>Garden</Label>
            <Icon sf={"leaf.fill"} drawable="leaf" />
          </NativeTabs.Trigger>
          <NativeTabs.Trigger name="calendar">
            <Label>Calendar</Label>
            <Icon sf={"calendar"} drawable="ic_menu_today" />
          </NativeTabs.Trigger>
          <NativeTabs.Trigger name="profileSettings">
            <Label>Profile</Label>
            <Icon sf={"person.fill"} drawable="person" />
          </NativeTabs.Trigger>
        </NativeTabs>
      </PlantsProvider>
    </SafeAreaProvider>
  );
}

export const createUserStyles = (theme: AppTheme) => StyleSheet.create({});

const stylesByMode = {
  light: createUserStyles(getAppTheme("light")),
  dark: createUserStyles(getAppTheme("dark")),
};
