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

const SECTIONS = [
  {
    title: "Responsable del tratamiento",
    body: "El responsable del tratamiento de tus datos personales es el equipo de desarrollo de GardenGreenie. Para cualquier consulta relacionada con el tratamiento de tus datos puedes contactarnos a través de la sección Contáctanos de la aplicación.",
  },
  {
    title: "Datos que recopilamos",
    body: "Recopilamos únicamente los datos que proporcionas voluntariamente: nombre completo, correo electrónico, alias de usuario, fecha de nacimiento y biografía. Adicionalmente, almacenamos la información de tus plantas (nombre, categoría, frecuencia de riego, historial de riegos), tus fotografías de perfil, y las fotos que utilizas para identificar plantas mediante la función de IA.",
  },
  {
    title: "Finalidad del tratamiento",
    body: "Tus datos se utilizan exclusivamente para: (a) gestionar tu cuenta y autenticar tu identidad; (b) sincronizar tu jardín virtual entre sesiones; (c) enviarte recordatorios de riego según tus preferencias; (d) mostrarte tu progreso y logros dentro de la aplicación; (e) permitir la comunicación en el chat comunitario con tu alias. No utilizamos tus datos para publicidad ni los cedemos a terceros con fines comerciales.",
  },
  {
    title: "Almacenamiento y seguridad",
    body: "Tu información se almacena de forma segura en Firebase, una plataforma de Google Cloud con certificación ISO 27001. Las comunicaciones entre la app y los servidores se realizan mediante HTTPS con cifrado TLS. Las contraseñas se almacenan como hashes seguros y nunca en texto plano. Aplicamos controles de acceso para que solo tú puedas leer y modificar tus datos.",
  },
  {
    title: "Cámara y acceso a fotos",
    body: "GardenGreenie solicita acceso a tu cámara y galería de fotos para: (a) actualizar tu foto de perfil; (b) fotografiar plantas para su identificación mediante inteligencia artificial. Las fotografías que seleccionas o capturas se suben a Firebase Storage en una carpeta privada asociada a tu cuenta. No se analizan, venden ni comparten con terceros más allá del procesamiento necesario para la identificación de plantas.",
  },
  {
    title: "Derechos del usuario",
    body: "Tienes derecho a: (a) acceder a todos tus datos desde la aplicación en cualquier momento; (b) rectificar cualquier información incorrecta desde la sección Editar perfil; (c) eliminar plantas individuales desde tu jardín; (d) eliminar tu cuenta y todos los datos asociados desde la sección Seguridad > Eliminar cuenta. El ejercicio de estos derechos es inmediato y no requiere justificación.",
  },
  {
    title: "Cambios a esta política y contacto",
    body: "Podemos actualizar esta Política de Privacidad para reflejar cambios en nuestras prácticas o por requerimientos legales. Te notificaremos dentro de la aplicación con al menos 15 días de antelación antes de que los cambios entren en vigor. El uso continuado de GardenGreenie tras la notificación constituye la aceptación de la política actualizada. Para cualquier consulta escríbenos a través de la sección Contáctanos.",
  },
];

export function ModalPrivacy({ visible, onClose }: PrivacyModalProps) {
  const { theme, styles } = useProfileTheme(stylesByMode);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose} />
      <View style={[styles.sheet, { backgroundColor: theme.colors.bgSecondary }]}>
        <View style={styles.handle} />

        {/* Header */}
        <View style={[styles.headerBlock, { backgroundColor: theme.colors.categories.pink.bg, borderColor: theme.colors.categories.pink.border + "66" }]}>
          <Text style={styles.headerIcon}>🛡️</Text>
          <Text style={[styles.headerTitle, { color: theme.colors.textPrimary }]}>
            Política de privacidad
          </Text>
          <Text style={[styles.headerDate, { color: theme.colors.textTertiary }]}>
            Vigente desde junio 2026
          </Text>
        </View>

        <ScrollView style={styles.scrollArea} showsVerticalScrollIndicator={false}>
          {SECTIONS.map(({ title, body }, i) => (
            <View key={title}>
              <View style={styles.section}>
                <Text style={[styles.articleLabel, { color: theme.colors.categories.pink.border }]}>
                  §{i + 1}
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
