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
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface TermsModalProps {
  visible: boolean;
  onClose: () => void;
}

const SECTIONS = [
  {
    title: "Aceptación de los términos",
    body: "Al descargar, instalar o utilizar GardenGreenie, aceptas quedar vinculado por estos Términos y Condiciones. Si no estás de acuerdo con alguna de las disposiciones aquí establecidas, debes abstenerte de utilizar la aplicación. El uso continuado de GardenGreenie constituye la aceptación de cualquier modificación posterior a estos términos.",
  },
  {
    title: "Descripción del servicio",
    body: "GardenGreenie es una aplicación móvil de gestión y cuidado de plantas que permite a los usuarios registrar, organizar y recibir recordatorios personalizados para el cuidado de su jardín virtual. Incluye funcionalidades de chat comunitario, identificación de plantas mediante fotografía, seguimiento de racha de riego y un sistema de logros gamificado.",
  },
  {
    title: "Registro y cuenta de usuario",
    body: "Para acceder a todas las funcionalidades de GardenGreenie es necesario crear una cuenta con correo electrónico y contraseña, o mediante la vinculación con una cuenta de Google. Eres responsable de mantener la confidencialidad de tus credenciales de acceso y de todas las actividades que se realicen desde tu cuenta. Debes notificarnos de inmediato si sospechas de cualquier uso no autorizado.",
  },
  {
    title: "Uso aceptable de la plataforma",
    body: "Te comprometes a utilizar GardenGreenie únicamente para fines lícitos y de conformidad con estos términos. Está prohibido: (a) enviar contenido ofensivo, abusivo o engañoso a través del chat; (b) intentar acceder a cuentas de otros usuarios; (c) realizar ingeniería inversa o intentar extraer el código fuente de la aplicación; (d) utilizar la plataforma para cualquier actividad comercial no autorizada expresamente por los titulares.",
  },
  {
    title: "Datos personales y privacidad",
    body: "El tratamiento de tus datos personales se rige por nuestra Política de Privacidad, que forma parte integrante de estos Términos. Al aceptar estos términos, consientes el tratamiento de tus datos según se describe en dicha política. Los datos se almacenan en Firebase (Google Cloud) y se utilizan exclusivamente para prestar el servicio.",
  },
  {
    title: "Propiedad intelectual",
    body: "Todo el contenido presente en GardenGreenie —incluyendo, sin carácter limitativo, el diseño visual, logotipos, iconografía, textos, código fuente y funcionalidades— es propiedad exclusiva de sus desarrolladores y está protegido por las leyes de propiedad intelectual aplicables. Queda expresamente prohibida su reproducción, distribución, modificación o uso comercial sin autorización escrita previa.",
  },
  {
    title: "Limitación de responsabilidad",
    body: "GardenGreenie se proporciona \"tal cual\" y \"según disponibilidad\". No garantizamos resultados específicos en el cuidado de plantas ni la disponibilidad ininterrumpida del servicio. En ningún caso los desarrolladores serán responsables de daños indirectos, incidentales o consecuentes derivados del uso o la imposibilidad de uso de la aplicación. La app es una herramienta de apoyo y no reemplaza el criterio y cuidado personal del usuario.",
  },
  {
    title: "Modificaciones y contacto",
    body: "Nos reservamos el derecho de actualizar estos Términos en cualquier momento. Te notificaremos de cambios significativos a través de la aplicación con al menos 15 días de antelación. El uso continuado tras la notificación implica la aceptación de los nuevos términos. Para cualquier consulta relacionada con este documento, contáctanos a través de la sección Contáctanos de la aplicación.",
  },
];

export function ModalTerms({ visible, onClose }: TermsModalProps) {
  const insets = useSafeAreaInsets();
  const { theme, styles } = useProfileTheme(stylesByMode);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose} />
      <View style={[styles.sheet, { backgroundColor: theme.colors.bgSecondary, paddingBottom: insets.bottom + theme.spacing.xxl }]}>
        <View style={styles.handle} />

        {/* Header */}
        <View style={[styles.headerBlock, { backgroundColor: theme.colors.accentGreen + "22", borderColor: theme.colors.accentGreen + "44" }]}>
          <Text style={styles.headerIcon}>📄</Text>
          <Text style={[styles.headerTitle, { color: theme.colors.textPrimary }]}>
            Términos y condiciones
          </Text>
          <Text style={[styles.headerDate, { color: theme.colors.textTertiary }]}>
            Vigente desde junio 2026
          </Text>
        </View>

        <ScrollView style={styles.scrollArea} showsVerticalScrollIndicator={false}>
          {SECTIONS.map(({ title, body }, i) => (
            <View key={title}>
              <View style={styles.section}>
                <Text style={[styles.articleLabel, { color: theme.colors.accentGreen }]}>
                  Art. {i + 1}
                </Text>
                <Text style={[styles.sectionHeading, { color: theme.colors.textPrimary }]}>
                  {title}
                </Text>
                <Text style={[styles.sectionBody, { color: theme.colors.textSecondary }]}>
                  {body}
                </Text>
              </View>
              {i < SECTIONS.length - 1 && (
                <View style={[styles.divider, { backgroundColor: theme.colors.borderPrimary }]} />
              )}
            </View>
          ))}

          <Text style={[styles.lastUpdated, { color: theme.colors.textTertiary }]}>
            Última actualización: junio 2026
          </Text>
        </ScrollView>

        <TouchableOpacity
          style={[styles.closeBtn, { backgroundColor: theme.colors.accentGreen }]}
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
      maxHeight: "90%",
    },
    handle: {
      width: theme.spacing.xl * 2,
      height: theme.spacing.xs,
      backgroundColor: theme.colors.borderPrimary,
      borderRadius: theme.radius.full,
      alignSelf: "center",
      marginVertical: theme.spacing.md,
    },
    headerBlock: {
      borderWidth: 1,
      borderRadius: theme.radius.sm,
      paddingVertical: theme.spacing.lg,
      alignItems: "center",
      marginBottom: theme.spacing.lg,
      gap: theme.spacing.xs,
    },
    headerIcon: { fontSize: 28 },
    headerTitle: {
      fontSize: theme.fontSize.lg,
      fontWeight: "700",
      textAlign: "center",
    },
    headerDate: {
      fontSize: 12,
      textAlign: "center",
    },
    scrollArea: {
      marginBottom: theme.spacing.lg,
    },
    section: {
      paddingVertical: theme.spacing.md,
      gap: theme.spacing.xs,
    },
    articleLabel: {
      fontSize: 11,
      fontWeight: "700",
      letterSpacing: 0.5,
      textTransform: "uppercase",
    },
    sectionHeading: {
      fontSize: theme.fontSize.sm,
      fontWeight: "700",
    },
    sectionBody: {
      fontSize: theme.fontSize.sm,
      lineHeight: 21,
    },
    divider: {
      height: 1,
      marginHorizontal: theme.spacing.xs,
    },
    lastUpdated: {
      fontSize: 12,
      textAlign: "center",
      marginTop: theme.spacing.lg,
      marginBottom: theme.spacing.md,
    },
    closeBtn: {
      borderRadius: theme.radius.sm,
      paddingVertical: theme.spacing.md + 2,
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
