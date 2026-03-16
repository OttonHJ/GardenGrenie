import {
    AppTheme,
    getAppTheme,
    useProfileTheme,
} from "@/src/theme/designSystem";
import React from "react";
import {
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

interface AboutModalProps {
  visible: boolean;
  onClose: () => void;
}

export function ModalAbout({ visible, onClose }: AboutModalProps) {
  const { theme, styles } = useProfileTheme(stylesByMode);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      />
      <View
        style={[styles.sheet, { backgroundColor: theme.colors.bgSecondary }]}
      >
        <View style={styles.handle} />
        <Text style={[styles.title, { color: theme.colors.textPrimary }]}>
          🌿 Acerca de GardenGenie
        </Text>

        <ScrollView
          style={styles.scrollArea}
          showsVerticalScrollIndicator={false}
        >
          {[
            {
              heading: "Versión actual",
              body: "GardenGenie v1.0.\nLanzada en marzo de 2026.",
            },
            {
              heading: "Creadores",
              body: "Ottón Hernández Jara.",
            },
            {
              heading: "Créditos",
              body: "Iconos de plantas por Freepik en Flaticon.\nImágenes de Google Images, etc.",
            },
          ].map(({ heading, body }) => (
            <View key={heading} style={styles.section}>
              <Text
                style={[
                  styles.sectionHeading,
                  { color: theme.colors.textPrimary },
                ]}
              >
                {heading}
              </Text>
              <Text
                style={[
                  styles.sectionBody,
                  { color: theme.colors.textSecondary },
                ]}
              >
                {body}
              </Text>
            </View>
          ))}
        </ScrollView>

        <TouchableOpacity
          style={[
            styles.closeBtn,
            { backgroundColor: theme.colors.accentGreen },
          ]}
          onPress={onClose}
          activeOpacity={0.8}
        >
          <Text style={styles.closeBtnText}>Atrás</Text>
        </TouchableOpacity>
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
      marginBottom: theme.spacing.lg,
    },
    scrollArea: {
      marginBottom: theme.spacing.lg,
    },
    section: {
      marginBottom: theme.spacing.lg,
    },
    sectionHeading: {
      fontSize: theme.fontSize.sm,
      fontWeight: "700",
      marginBottom: theme.spacing.xs,
    },
    sectionBody: {
      fontSize: theme.fontSize.sm,
      lineHeight: 20,
    },
    lastUpdated: {
      fontSize: theme.fontSize.sm,
      textAlign: "center",
      marginTop: theme.spacing.md,
      marginBottom: theme.spacing.lg,
    },
    closeBtn: {
      borderRadius: theme.radius.sm,
      paddingVertical: theme.spacing.md,
      alignItems: "center",
    },
    closeBtnText: {
      fontSize: theme.fontSize.sm,
      fontWeight: "700",
      color: "#ffffff",
    },
  });

const stylesByMode = {
  light: createStyles(getAppTheme("light")),
  dark: createStyles(getAppTheme("dark")),
};
