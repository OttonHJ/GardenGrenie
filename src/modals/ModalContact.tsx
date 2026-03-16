import {
  AppTheme,
  getAppTheme,
  useProfileTheme,
} from "@/src/theme/designSystem";
import React, { useState } from "react";
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface ContactModalProps {
  visible: boolean;
  onClose: () => void;
}

export function ModalContact({ visible, onClose }: ContactModalProps) {
  const { theme, styles } = useProfileTheme(stylesByMode);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");

  const handleSend = () => {
    if (!name.trim()) {
      Alert.alert("Campo requerido", "Por favor ingresa tu nombre.");
      return;
    }
    if (!message.trim()) {
      Alert.alert("Campo requerido", "Por favor escribe tu mensaje.");
      return;
    }
    // Integración de envío pendiente
    Alert.alert(
      "✅ Mensaje enviado",
      "Gracias por contactarnos. Te responderemos pronto.",
      [{ text: "OK", onPress: onClose }],
    );
    setName("");
    setMessage("");
  };

  const handleClose = () => {
    setName("");
    setMessage("");
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={handleClose}
      />
      <View
        style={[styles.sheet, { backgroundColor: theme.colors.bgSecondary }]}
      >
        <View style={styles.handle} />
        <Text style={[styles.title, { color: theme.colors.textPrimary }]}>
          💬 Contáctanos
        </Text>
        <Text style={[styles.subtitle, { color: theme.colors.textTertiary }]}>
          Envíanos tu consulta o sugerencia
        </Text>

        <ScrollView showsVerticalScrollIndicator={false}>
          <Text style={[styles.label, { color: theme.colors.textSecondary }]}>
            Nombre <Text style={{ color: theme.colors.accentOrange }}>*</Text>
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.colors.bgPrimary,
                borderColor: theme.colors.borderPrimary,
                color: theme.colors.textPrimary,
              },
            ]}
            placeholder="Tu nombre"
            placeholderTextColor={theme.colors.textTertiary}
            value={name}
            onChangeText={setName}
          />

          <Text style={[styles.label, { color: theme.colors.textSecondary }]}>
            Mensaje <Text style={{ color: theme.colors.accentOrange }}>*</Text>
          </Text>
          <TextInput
            style={[
              styles.input,
              styles.textArea,
              {
                backgroundColor: theme.colors.bgPrimary,
                borderColor: theme.colors.borderPrimary,
                color: theme.colors.textPrimary,
              },
            ]}
            placeholder="¿En qué podemos ayudarte?"
            placeholderTextColor={theme.colors.textTertiary}
            value={message}
            onChangeText={setMessage}
            multiline
            numberOfLines={5}
            textAlignVertical="top"
          />

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[
                styles.cancelBtn,
                { borderColor: theme.colors.borderPrimary },
              ]}
              onPress={handleClose}
            >
              <Text
                style={[
                  styles.cancelText,
                  { color: theme.colors.textSecondary },
                ]}
              >
                Cancelar
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.sendBtn,
                { backgroundColor: theme.colors.accentGreen },
              ]}
              onPress={handleSend}
              activeOpacity={0.8}
            >
              <Text style={styles.sendText}>Enviar</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.5)",
    },
    sheet: {
      borderTopLeftRadius: theme.radius.lg,
      borderTopRightRadius: theme.radius.lg,
      paddingHorizontal: theme.spacing.lg,
      paddingBottom: theme.spacing.xxl,
      maxHeight: "85%",
    },
    handle: {
      width: theme.spacing.xl * 2,
      height: theme.spacing.xs,
      backgroundColor: theme.colors.borderPrimary,
      borderRadius: theme.radius.full,
      alignSelf: "center",
      marginVertical: theme.spacing.md,
    },
    title: {
      fontSize: theme.fontSize.lg,
      fontWeight: "700",
      textAlign: "center",
    },
    subtitle: {
      fontSize: theme.fontSize.sm,
      textAlign: "center",
      marginTop: theme.spacing.xs,
      marginBottom: theme.spacing.lg,
    },
    label: {
      fontSize: theme.fontSize.sm,
      fontWeight: "600",
      marginTop: theme.spacing.md,
      marginBottom: theme.spacing.xs,
    },
    input: {
      borderRadius: theme.radius.sm,
      borderWidth: theme.spacing.xxs,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      fontSize: theme.fontSize.sm,
    },
    textArea: {
      height: 120,
      paddingTop: theme.spacing.sm,
    },
    buttonRow: {
      flexDirection: "row",
      gap: theme.spacing.md,
      marginTop: theme.spacing.xl,
    },
    cancelBtn: {
      flex: 1,
      borderRadius: theme.radius.sm,
      borderWidth: theme.spacing.xxs,
      paddingVertical: theme.spacing.md,
      alignItems: "center",
    },
    cancelText: {
      fontSize: theme.fontSize.sm,
      fontWeight: "600",
    },
    sendBtn: {
      flex: 2,
      borderRadius: theme.radius.sm,
      paddingVertical: theme.spacing.md,
      alignItems: "center",
    },
    sendText: {
      fontSize: theme.fontSize.sm,
      fontWeight: "700",
      color: "#ffffff",
    },
  });

const stylesByMode = {
  light: createStyles(getAppTheme("light")),
  dark: createStyles(getAppTheme("dark")),
};
