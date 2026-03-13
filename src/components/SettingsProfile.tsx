import { AppTheme, getAppTheme, useAppTheme } from "@/src/theme/designSystem";
import React /*, { useState }*/ from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

export function SettingsProfile() {
  //const [isPublic, setIsPublic] = useState(true);
  const { styles } = useProfileTheme();

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View /*style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}*/
        >
          <View style={styles.testCard}>
            <Text>ESTA ES LA SECCION DE EDICION DEL PERFIL DE USUARIO</Text>
          </View>

          <View style={styles.testCard}>
            <Text>ESTA ES LA SECCION DE INFORMACION DE LA APP</Text>
            <Text>CONTACTO, REDES SOCIALES, LOG OUT Y DEMAS</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({});

///Ahora en vez de crear una hoja de styles como lo hicimos anteriormente,
//vamos a hacer lo siguiente
export const createUserStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.bgPrimary,
      justifyContent: "center",
      alignItems: "center",
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      paddingHorizontal: theme.spacing.lg,
      paddingBottom: theme.spacing.xl,
    },
    testCard: {
      alignItems: "center",
      backgroundColor: theme.colors.bgSecondary,
      borderWidth: 1,
      borderColor: theme.colors.borderPrimary,
      color: "black",
      borderRadius: theme.radius.xl,
      marginTop: theme.spacing.xl,
      marginBottom: theme.spacing.xl,
    },

    // Stats
    statsContainer: {
      flexDirection: "row",
      justifyContent: "space-around",
      marginBottom: theme.spacing.xxl,
      paddingBottom: theme.spacing.xxl,
      borderBottomWidth: theme.spacing.xs,
      borderBottomColor: theme.colors.separator,
    },
    statItem: {
      alignItems: "center",
      flex: 1,
    },
    statNumber: {
      fontSize: theme.fontSize.xl,
      fontWeight: "700",
      color: theme.colors.textSecondary,
    },
    statNumberOrange: {
      fontSize: 24,
      fontWeight: "700",
      color: theme.colors.accentOrange,
    },
    statLabel: {
      fontSize: theme.fontSize.sm,
      color: theme.colors.textTertiary,
      marginTop: theme.spacing.xs,
    },
    statSublabel: {
      fontSize: theme.fontSize.sm,
      color: theme.colors.textInactive,
    },
    statSublabelOrange: {
      fontSize: theme.fontSize.sm,
      color: theme.colors.accentOrange,
    },
    divider: {
      borderBottomWidth: theme.spacing.xxl,
      borderBottomColor: theme.colors.separator,
    },

    // Sections
    section: {
      marginBottom: theme.spacing.xxl,
      paddingBottom: theme.spacing.xxl,
      borderBottomWidth: theme.spacing.xs,
      borderBottomColor: theme.colors.separator,
    },
    sectionLast: {
      marginBottom: theme.spacing.xxl,
    },
    sectionTitle: {
      fontSize: theme.fontSize.md,
      color: theme.colors.textPrimary,
      marginBottom: theme.spacing.md,
      letterSpacing: 1,
      fontWeight: "600",
    },
    description: {
      fontSize: theme.fontSize.sm,
      color: theme.colors.textPrimary,
      lineHeight: 22,
    },

    // Favorite Plant
    favoritePlant: {
      flexDirection: "row",
      gap: theme.spacing.lg,
    },
    plantImage: {
      width: theme.imageSize.plants,
      height: theme.imageSize.plants,
      borderRadius: theme.radius.sm,
    },
    plantInfo: {
      flex: 1,
      justifyContent: "center",
    },
    plantName: {
      fontSize: theme.fontSize.md,
      fontWeight: "600",
      color: theme.colors.textPrimary,
    },
    plantStats: {
      fontSize: theme.fontSize.sm,
      color: theme.colors.textTertiary,
      marginTop: theme.spacing.xs,
    },
    plantBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: theme.spacing.xs,
      marginTop: theme.spacing.sm,
    },
    plantBadgeText: {
      fontSize: theme.fontSize.sm,
      color: theme.colors.textInactive,
    },

    // Categories
    categoriesHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: theme.spacing.sm,
      marginBottom: theme.spacing.lg,
    },
    categoriesGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: theme.spacing.sm,
    },
    categoryCard: {
      width: "48%",
      padding: theme.spacing.md,
      borderLeftWidth: theme.spacing.xs,
    },
    categoryGreen: {
      backgroundColor: theme.colors.categories.green.bg,
      borderLeftColor: theme.colors.categories.green.border,
    },
    categoryBrown: {
      backgroundColor: theme.colors.categories.brown.bg,
      borderLeftColor: theme.colors.categories.brown.border,
    },
    categoryPink: {
      backgroundColor: theme.colors.categories.pink.bg,
      borderLeftColor: theme.colors.categories.pink.border,
    },
    categoryYellow: {
      backgroundColor: theme.colors.categories.yellow.bg,
      borderLeftColor: theme.colors.categories.yellow.border,
    },
    categoryNumber: {
      fontSize: theme.fontSize.lg,
      fontWeight: "700",
      color: theme.colors.textPrimary,
    },
    categoryLabel: {
      fontSize: theme.fontSize.sm,
      color: theme.colors.textSecondary,
      marginTop: 2,
    },

    // Footer
    footer: {
      backgroundColor: theme.colors.bgFooter,
      padding: theme.spacing.lg,
      borderTopWidth: theme.spacing.xs,
      borderTopColor: theme.colors.borderFooter,
      marginHorizontal: -16,
    },
    footerContent: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: theme.spacing.sm,
    },
    footerText: {
      fontSize: theme.fontSize.sm,
      color: theme.colors.textPrimary,
    },
  });

//Vamos a crear un hook, podemos crear una carpeta para estas en la sección de styles
//O junto a los styles.

//Creamos un record con ambos styles, modo claro y oscuro
const stylesByMode = {
  light: createUserStyles(getAppTheme("light")),
  dark: createUserStyles(getAppTheme("dark")),
};

//Segun el tema, exportamos los estilos correctamos y el mismo
//tema para los que no son estilos
export function useProfileTheme() {
  const theme = useAppTheme();
  return { theme, styles: stylesByMode[theme.mode] };
}
