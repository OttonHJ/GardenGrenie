import React, { useState } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export function PrivacyToggle() {
  const [isPublic, setIsPublic] = useState(true);
  return (
    <View style={styles.privacyContainer}>
      <View style={styles.privacyToggle}>
        <View style={styles.rowAlign}>
          <Image
            style={styles.iconRight}
            source={require("@/assets/icons/padlock.png")}
          />
          <Text style={styles.textInfo}>Privado</Text>
        </View>

        <TouchableOpacity
          onPress={() => setIsPublic(!isPublic)}
          style={styles.toggleButton}
          activeOpacity={0.7}
        >
          <View
            style={[styles.toggleTrack, isPublic && styles.toggleTrackActive]}
          >
            <View
              style={[styles.toggleThumb, isPublic && styles.toggleThumbActive]}
            />
          </View>
        </TouchableOpacity>
        <View style={styles.rowAlign}>
          <Text style={[styles.textInfo, isPublic && styles.privacyTextActive]}>
            Público
          </Text>
          <Image
            style={styles.iconLeft}
            source={require("@/assets/icons/open-padlock.png")}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  privacyContainer: {
    alignItems: "center",
    marginBottom: 24,
    borderStyle: "solid",
  },
  privacyToggle: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#a8e5c1",
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#000000",
  },
  privacyText: {
    fontSize: 12,
    color: "#5d8679",
  },
  privacyTextInactive: {
    fontSize: 12,
    color: "#5d8679",
  },
  privacyTextActive: {
    color: "#1a401e",
    fontWeight: "bold",
  },
  toggleButton: {
    padding: 2,
  },
  toggleTrack: {
    width: 40,
    height: 20,
    backgroundColor: "#c9e4de",
    borderRadius: 10,
    justifyContent: "center",
  },
  toggleTrackActive: {
    backgroundColor: "#6b9e8b",
  },
  toggleThumb: {
    width: 16,
    height: 16,
    backgroundColor: "white",
    borderRadius: 8,
    position: "absolute",
    left: 2,
  },
  toggleThumbActive: {
    left: 22,
  },

  rowAlign: {
    flexDirection: "row",
  },
  iconRight: {
    width: 25,
    height: 25,
    alignSelf: "flex-end",
    marginRight: 5,
  },
  iconLeft: {
    width: 25,
    height: 25,
    alignSelf: "flex-end",
    marginLeft: 5,
  },
  textInfo: {
    fontSize: 12,
    color: "#7a7a7a",
    marginTop: 8,
    textAlign: "center",
  },
});
