import { Icon, Label, NativeTabs } from "expo-router/unstable-native-tabs";

export default function RootLayout() {
  return (
    <NativeTabs>
      <NativeTabs.Trigger name="index">
        <Label>Home</Label>
        <Icon sf={"house.fill"} drawable="ic_menu_mylocation" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="personGarden">
        <Label>Garden</Label>
        <Icon sf={"leaf.fill"} drawable="ic_menu_mylocation" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="profileSettings">
        <Label>Profile</Label>
        <Icon sf={"person.fill"} drawable="ic_menu_mylocation" />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
