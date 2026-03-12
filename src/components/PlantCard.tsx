import {
    Calendar,
    Droplets,
    MoreVertical,
    Sun,
    ThermometerSun,
} from "lucide-react-native";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface PlantCardProps {
  plant: {
    id: string;
    name: string;
    scientificName: string;
    image: string;
    lastWatered: string;
    nextWatering: string;
    sunlight: "low" | "medium" | "high";
    temperature: string;
    waterFrequency: string;
    location: "interior" | "exterior";
    category: string;
  };
  colors: any;
  onPress?: () => void;
  onOptionsPress?: () => void;
}

export default function PlantCard({
  plant,
  colors,
  onPress,
  onOptionsPress,
}: PlantCardProps) {
  // Determinar el nivel de luz solar
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
          borderLeftColor:
            plant.location === "interior"
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

        {/* Próximo riego */}
        <View
          style={[
            styles.nextWatering,
            {
              backgroundColor: colors.bgFooter,
              borderColor: colors.borderFooter,
            },
          ]}
        >
          <Calendar size={12} color={colors.textTertiary} />
          <Text
            style={[styles.nextWateringText, { color: colors.textTertiary }]}
          >
            Próximo riego: {plant.nextWatering}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  plantImage: {
    width: 90,
    height: 90,
    borderRadius: 8,
  },
  plantInfo: {
    flex: 1,
    marginLeft: 12,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 6,
  },
  titleContainer: {
    flex: 1,
  },
  plantName: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 2,
  },
  scientificName: {
    fontSize: 11,
    fontStyle: "italic",
  },
  optionsButton: {
    padding: 2,
  },
  categoryBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    marginBottom: 10,
  },
  categoryText: {
    fontSize: 9,
    fontWeight: "600",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  statsContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 10,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
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
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1,
  },
  nextWateringText: {
    fontSize: 10,
  },
});
