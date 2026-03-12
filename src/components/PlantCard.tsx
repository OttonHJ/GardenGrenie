import {
  AppTheme,
  getAppTheme,
  useProfileTheme,
} from "@/src/theme/designSystem";
import { isWateringDue } from "@/src/utils/plantUtils";
import {
  Calendar,
  Droplets,
  MoreVertical,
  Sun,
  ThermometerSun,
} from "lucide-react-native";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export interface Plant {
  id: string;
  name: string;
  scientificName: string;
  image: string;
  lastWatered: string;
  nextWatering: string; // formato ISO: "2025-08-20"
  sunlight: "low" | "medium" | "high";
  temperature: string;
  waterFrequency: string;
  location: "interior" | "exterior";
  category: string;
}

interface PlantCardProps {
  plant: Plant;
  colors: AppTheme["colors"];
  onPress?: () => void;
  onOptionsPress?: () => void;
}

export default function PlantCard({
  plant,
  colors,
  onPress,
  onOptionsPress,
}: PlantCardProps) {
  // CAMBIO 2: integrado al Design System con useProfileTheme
  const { styles } = useProfileTheme(stylesByMode);

  // CAMBIO 3: detectar urgencia de riego
  const isUrgent = isWateringDue(plant.nextWatering);

  const getSunlightInfo = () => {
    switch (plant.sunlight) {
      case "low":
        return { text: "Poca luz", color: colors.categories.yellow.border };
      case "medium":
        return { text: "Luz media", color: colors.accentOrange };
      case "high":
        return { text: "Luz directa", color: colors.categories.brown.border };
      default:
        return { text: "Poca luz", color: colors.textTertiary };
    }
  };

  const sunlightInfo = getSunlightInfo();

  return (
    <TouchableOpacity
      style={[
        styles.card,
        {
          backgroundColor: colors.bgSecondary,
          // CAMBIO 3: borde izquierdo naranja cuando el riego está vencido
          borderLeftColor: isUrgent
            ? colors.accentOrange
            : plant.location === "interior"
              ? colors.categories.green.border
              : colors.categories.brown.border,
        },
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Imagen de la planta */}
      <Image source={{ uri: plant.image }} style={styles.plantImage} />

      {/* Información de la planta */}
      <View style={styles.plantInfo}>
        {/* Nombre y opciones */}
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Text style={[styles.plantName, { color: colors.textPrimary }]}>
              {plant.name}
            </Text>
            <Text
              style={[styles.scientificName, { color: colors.textSecondary }]}
            >
              {plant.scientificName}
            </Text>
          </View>
          <TouchableOpacity
            onPress={onOptionsPress}
            style={styles.optionsButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <MoreVertical size={18} color={colors.textTertiary} />
          </TouchableOpacity>
        </View>

        {/* Badge de categoría */}
        <View
          style={[styles.categoryBadge, { backgroundColor: colors.bgPrimary }]}
        >
          <Text style={[styles.categoryText, { color: colors.textSecondary }]}>
            {plant.category}
          </Text>
        </View>

        {/* Estadísticas de cuidado */}
        <View style={styles.statsContainer}>
          {/* Riego */}
          <View style={styles.statItem}>
            <Droplets size={14} color={colors.accentGreen} />
            <View style={styles.statTextContainer}>
              <Text style={[styles.statLabel, { color: colors.textTertiary }]}>
                Riego
              </Text>
              <Text style={[styles.statValue, { color: colors.textPrimary }]}>
                {plant.waterFrequency}
              </Text>
            </View>
          </View>

          {/* Luz solar */}
          <View style={styles.statItem}>
            <Sun size={14} color={sunlightInfo.color} />
            <View style={styles.statTextContainer}>
              <Text style={[styles.statLabel, { color: colors.textTertiary }]}>
                Luz
              </Text>
              <Text style={[styles.statValue, { color: colors.textPrimary }]}>
                {sunlightInfo.text}
              </Text>
            </View>
          </View>

          {/* Temperatura */}
          <View style={styles.statItem}>
            <ThermometerSun size={14} color={colors.accentOrange} />
            <View style={styles.statTextContainer}>
              <Text style={[styles.statLabel, { color: colors.textTertiary }]}>
                Temp
              </Text>
              <Text style={[styles.statValue, { color: colors.textPrimary }]}>
                {plant.temperature}
              </Text>
            </View>
          </View>
        </View>

        <View
          style={[
            styles.nextWatering,
            {
              backgroundColor: isUrgent
                ? colors.accentOrange + "22"
                : colors.bgFooter,
              borderColor: isUrgent ? colors.accentOrange : colors.borderFooter,
            },
          ]}
        >
          <Calendar
            size={12}
            color={isUrgent ? colors.accentOrange : colors.textTertiary}
          />
          <Text
            style={[
              styles.nextWateringText,
              { color: isUrgent ? colors.accentOrange : colors.textTertiary },
            ]}
          >
            {isUrgent ? "⚠️ " : ""}Próximo riego: {plant.nextWatering}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

///Ahora en vez de crear una hoja de styles como lo hicimos anteriormente,
//vamos a hacer lo siguiente
const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    card: {
      flexDirection: "row",
      borderRadius: theme.radius.sm,
      padding: theme.spacing.md,
      marginBottom: theme.spacing.md,
      borderLeftWidth: theme.spacing.xs,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 2,
    },
    plantImage: {
      width: theme.imageSize.plants,
      height: theme.imageSize.plants,
      borderRadius: theme.radius.xxs * 4,
    },
    plantInfo: {
      flex: 1,
      marginLeft: theme.spacing.md,
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: theme.spacing.sm,
    },
    titleContainer: {
      flex: 1,
    },
    plantName: {
      fontSize: theme.fontSize.md - 1,
      fontWeight: "600",
      marginBottom: theme.spacing.xxs,
    },
    scientificName: {
      fontSize: theme.fontSize.sm - 1,
      fontStyle: "italic",
    },
    optionsButton: {
      padding: theme.spacing.xxs,
    },
    categoryBadge: {
      alignSelf: "flex-start",
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xxs + 1,
      borderRadius: theme.spacing.xs,
      marginBottom: theme.spacing.sm + 2,
    },
    categoryText: {
      fontSize: 9,
      fontWeight: "600",
      letterSpacing: 0.5,
      textTransform: "uppercase",
    },
    statsContainer: {
      flexDirection: "row",
      gap: theme.spacing.md,
      marginBottom: theme.spacing.sm + 2,
    },
    statItem: {
      flexDirection: "row",
      alignItems: "center",
      gap: theme.spacing.xs,
    },
    statTextContainer: {
      flexDirection: "column",
    },
    statLabel: {
      fontSize: 9,
      lineHeight: 10,
    },
    statValue: {
      fontSize: 11,
      fontWeight: "600",
      lineHeight: 13,
    },
    nextWatering: {
      flexDirection: "row",
      alignItems: "center",
      gap: theme.spacing.xs,
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xs,
      borderRadius: theme.spacing.xs,
      borderWidth: 1,
    },
    nextWateringText: {
      fontSize: 10,
    },
  });

// Pre-compilar ambos modos para useProfileTheme
const stylesByMode = {
  light: createStyles(getAppTheme("light")),
  dark: createStyles(getAppTheme("dark")),
};
