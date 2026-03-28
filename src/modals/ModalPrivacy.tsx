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
              body: "Recopilamos los datos que ingresas voluntariamente: nombre, correo electrónico, alias, fecha de nacimiento, biografía, información de tus plantas (nombre, categoría, frecuencia de riego) y las fotografías que tomas o seleccionas para identificarlas.",
            },
            {
              heading: "¿Dónde se almacenan tus datos?",
              body: "Tu información se almacena de forma segura en la nube mediante Firebase, un servicio de Google. Esto nos permite sincronizar tus datos entre dispositivos y mantenerlos disponibles incluso si cambias de teléfono.",
            },
            {
              heading: "¿Compartimos tus datos?",
              body: "No vendemos ni alquilamos tu información personal. Tus datos son procesados por Firebase (Google) únicamente para brindar el servicio. Puedes consultar la política de privacidad de Google en google.com/policies/privacy.",
            },
            {
              heading: "Fotografías y cámara",
              body: "GardenGreenie solicita acceso a tu cámara y galería para que puedas fotografiar tus plantas. Las fotos que seleccionas se suben a Firebase Storage para mostrarlas en tu jardín. No se usan con ningún otro fin.",
            },
            {
              heading: "Tus derechos",
              body: "Puedes editar o eliminar cualquier planta o información desde la app en cualquier momento. Para eliminar tu cuenta y todos tus datos, contáctanos a través del formulario de contacto.",
            },
            {
              heading: "Cambios en esta política",
              body: "Si actualizamos esta política, te notificaremos dentro de la app antes de que los cambios entren en vigor.",
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
