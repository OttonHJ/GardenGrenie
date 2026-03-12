import {
  AppTheme,
  getAppTheme,
  useProfileTheme,
} from "@/src/theme/designSystem";
import { Icon, Label, NativeTabs } from "expo-router/unstable-native-tabs";
import React from "react";
import { StyleSheet } from "react-native";
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

export default function RootLayout() {
  const insets = useSafeAreaInsets();
  const { styles } = useProfileTheme(stylesByMode);

  return (
    <SafeAreaProvider>
      <NativeTabs>
        <NativeTabs.Trigger name="index">
          <Label>Home</Label>
          <Icon sf={"house.fill"} drawable="ic_menu_mylocation" />
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="personGarden">
          <Label>Garden</Label>
          <Icon sf={"leaf.fill"} drawable="leaf" />
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="profileSettings">
          <Label>Profile</Label>
          <Icon sf={"person.fill"} drawable="person" />
        </NativeTabs.Trigger>
      </NativeTabs>
    </SafeAreaProvider>
  );
}

///Ahora en vez de crear una hoja de styles como lo hicimos anteriormente,
//vamos a hacer lo siguiente
export const createUserStyles = (theme: AppTheme) => StyleSheet.create({});

//Creamos un record con ambos styles, modo claro y oscuro
const stylesByMode = {
  light: createUserStyles(getAppTheme("light")),
  dark: createUserStyles(getAppTheme("dark")),
};
