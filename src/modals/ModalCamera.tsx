import { useCamera } from "@/src/hooks/useCamera";
import { CameraView } from "expo-camera";
import React from "react";
import {
  ActivityIndicator,
  Modal,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface ModalCameraProps {
  visible: boolean;
  onCapture: (uri: string) => void;
  onClose: () => void;
}

const FLASH_LABELS: Record<string, string> = {
  off: "⚡ OFF",
  on: "⚡ ON",
  auto: "⚡ AUTO",
};

const STATUS_BAR_HEIGHT =
  Platform.OS === "android" ? (StatusBar.currentHeight ?? 24) : 44;

export function ModalCamera({ visible, onCapture, onClose }: ModalCameraProps) {
  const insets = useSafeAreaInsets();
  const {
    cameraRef,
    permissions,
    isLoadingPermissions,
    isCameraInitialized,
    facing,
    flashMode,
    requestPermissions,
    onCameraReady,
    takePhoto,
    toggleFacing,
    toggleFlash,
  } = useCamera({ requestOnMount: visible });

  const isCameraReady = !!permissions && permissions.camera === "granted";

  const handleCapture = async () => {
    const photo = await takePhoto({ quality: 0.8 });
    if (photo) {
      onCapture(photo.uri);
    }
  };

  const renderContent = () => {
    if (isLoadingPermissions) {
      return (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#fff" />
        </View>
      );
    }

    if (!isCameraReady) {
      return (
        <View style={styles.centered}>
          <Text style={styles.permText}>
            Se necesita permiso de cámara para continuar.
          </Text>
          <TouchableOpacity style={styles.permBtn} onPress={requestPermissions}>
            <Text style={styles.permBtnText}>Dar permiso</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelTextBtn} onPress={onClose}>
            <Text style={styles.cancelTextBtnText}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <>
        <StatusBar hidden />
        <CameraView
          ref={cameraRef}
          style={StyleSheet.absoluteFill}
          facing={facing}
          flash={flashMode}
          onCameraReady={onCameraReady}
        />
        <View style={[styles.topBar, { paddingTop: STATUS_BAR_HEIGHT }]}>
          <TouchableOpacity style={styles.iconBtn} onPress={onClose}>
            <Text style={styles.iconText}>✕</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.flashBtn} onPress={toggleFlash}>
            <Text style={styles.flashText}>{FLASH_LABELS[flashMode]}</Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom + 16, 48) }]}>
          <TouchableOpacity style={styles.iconBtn} onPress={toggleFacing}>
            <Text style={styles.flipText}>⟳</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.captureBtn, !isCameraInitialized && { opacity: 0.4 }]}
            onPress={handleCapture}
            activeOpacity={0.8}
            disabled={!isCameraInitialized}
          >
            <View style={styles.captureInner} />
          </TouchableOpacity>
          <View style={styles.iconBtn} />
        </View>
      </>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.container}>{renderContent()}</View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    gap: 16,
  },
  permText: {
    color: "#fff",
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
  },
  permBtn: {
    backgroundColor: "#4CAF50",
    borderRadius: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  permBtnText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
  },
  cancelTextBtn: {
    paddingVertical: 8,
  },
  cancelTextBtnText: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 15,
  },
  topBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 32,
    paddingBottom: 48,
  },
  iconBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(0,0,0,0.45)",
    alignItems: "center",
    justifyContent: "center",
  },
  iconText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  flipText: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "400",
  },
  flashBtn: {
    backgroundColor: "rgba(0,0,0,0.45)",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  flashText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "700",
  },
  captureBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "rgba(255,255,255,0.25)",
    borderWidth: 3,
    borderColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  captureInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#fff",
  },
});
