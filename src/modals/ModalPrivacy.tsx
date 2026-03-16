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

interface PrivacyModalProps {
  visible: boolean;
  onClose: () => void;
}

export function ModalPrivacy({ visible, onClose }: PrivacyModalProps) {
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
          🛡️ Política de privacidad
        </Text>

        <ScrollView
          style={styles.scrollArea}
          showsVerticalScrollIndicator={false}
        >
          {[
            {
              heading: "¿Qué datos recopilamos?",
              body: "Solo recopilamos los datos que tú ingresas voluntariamente: nombre de usuario, información de tus plantas (nombre, categoría, frecuencia de riego) y fotografías que tú tomas o seleccionas.",
            },
            {
              heading: "¿Dónde se almacenan tus datos?",
              body: "Todos tus datos se almacenan localmente en tu dispositivo. No subimos ni sincronizamos tu información con servidores externos en esta versión de la app.",
            },
            {
              heading: "¿Compartimos tus datos?",
              body: "No. No vendemos, alquilamos ni compartimos tu información personal con terceros bajo ninguna circunstancia.",
            },
            {
              heading: "Fotografías y cámara",
              body: "GardenGreenie solicita acceso a tu cámara y galería únicamente para que puedas fotografiar tus plantas. Estas fotos se guardan en tu dispositivo y no se transmiten a ningún servidor.",
            },
            {
              heading: "Tus derechos",
              body: "Tienes control total sobre tus datos. Puedes editar o eliminar cualquier planta o información desde la app en cualquier momento.",
            },
            {
              heading: "Cambios en esta política",
              body: "Si actualizamos esta política de privacidad, te notificaremos dentro de la app antes de que los cambios entren en vigor.",
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

          <Text
            style={[styles.lastUpdated, { color: theme.colors.textTertiary }]}
          >
            Última actualización: marzo 2026
          </Text>
        </ScrollView>

        <TouchableOpacity
          style={[
            styles.closeBtn,
            { backgroundColor: theme.colors.accentGreen },
          ]}
          onPress={onClose}
          activeOpacity={0.8}
        >
          <Text style={styles.closeBtnText}>Entendido</Text>
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
