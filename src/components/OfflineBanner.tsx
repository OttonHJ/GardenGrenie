/*
 * OfflineBanner
 * -------------
 * Muestra una franja amarilla en la parte superior de la pantalla cuando
 * el dispositivo no tiene conexión a internet.
 *
 * Cuando el usuario recupera la conexión, el banner desaparece.
 * Los datos que escribió mientras estaba offline se sincronizan
 * automáticamente con Firebase al reconectarse.
 *
 * Uso: agregar <OfflineBanner /> una sola vez en el layout raíz.
 */

import { useNetworkStatus } from "@/src/hooks/useNetworkStatus";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export function OfflineBanner() {
  const { isConnected, isChecking } = useNetworkStatus();
  const insets = useSafeAreaInsets();
  const visible = !isChecking && !isConnected;

  return (
    <View
      style={[
        styles.banner,
        { paddingTop: insets.top + 8 },
        !visible && { display: "none" },
      ]}
    >
      <Text style={styles.text}>
        Sin conexión — los cambios se sincronizarán al reconectarte
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: "#F59E0B",
    paddingBottom: 8,
    paddingHorizontal: 16,
    alignItems: "center",
    zIndex: 9999,
    elevation: 9999,
  },
  text: {
    color: "#1C1C1E",
    fontSize: 13,
    fontWeight: "600",
    textAlign: "center",
  },
});
