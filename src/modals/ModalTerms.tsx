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

interface TermsModalProps {
  visible: boolean;
  onClose: () => void;
}

export function ModalTerms({ visible, onClose }: TermsModalProps) {
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
          📄 Términos y condiciones
        </Text>

        <ScrollView
          style={styles.scrollArea}
          showsVerticalScrollIndicator={false}
        >
          {[
            {
              heading: "1. Aceptación de los términos",
              body: "Al usar GardenGreenie aceptas estos términos. Si no estás de acuerdo, por favor no uses la aplicación.",
            },
            {
              heading: "2. Uso de la aplicación",
              body: "GardenGreenie es una aplicación de cuidado personal de plantas. Puedes registrar, organizar y recibir recordatorios para el cuidado de tus plantas.",
            },
            {
              heading: "3. Datos personales",
              body: "Los datos que ingreses en la app (nombre, plantas, fotografías) se almacenan localmente en tu dispositivo. No compartimos tu información con terceros sin tu consentimiento.",
            },
            {
              heading: "4. Propiedad intelectual",
              body: "Todo el contenido, diseño y código de GardenGreenie son propiedad de sus desarrolladores. No está permitida su reproducción sin autorización.",
            },
            {
              heading: "5. Limitación de responsabilidad",
              body: "GardenGreenie no garantiza resultados específicos en el cuidado de plantas. La app es una herramienta de apoyo y no reemplaza el criterio del usuario.",
            },
            {
              heading: "6. Modificaciones",
              body: "Nos reservamos el derecho de actualizar estos términos. Te notificaremos de cambios significativos a través de la aplicación.",
            },
            {
              heading: "7. Contacto",
              body: "Para consultas sobre estos términos puedes contactarnos a través de la sección Contáctanos.",
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
