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
  Pencil,
  Sun,
  ThermometerSun,
  Trash2,
} from "lucide-react-native";
import React, { useState } from "react";
import {
  Alert,
  Image,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// ─── Tipos ─────────────────────────────────────────────────────────────────────

export interface Plant {
  id: string;
  name: string;
  scientificName: string;
  image: string | number; // string = URI remota/local, number = require() asset
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
  onEdit?: (plant: Plant) => void;
  onWater?: (plantId: string) => void;
  onDelete?: (plantId: string) => void;
}

// ─── Componente ────────────────────────────────────────────────────────────────

export default function PlantCard({
  plant,
  colors,
  onPress,
  onEdit,
  onWater,
  onDelete,
}: PlantCardProps) {
  const { styles } = useProfileTheme(stylesByMode);
  const [menuVisible, setMenuVisible] = useState(false);
  const isUrgent = isWateringDue(plant.nextWatering);

  // ── Handlers del menú ───────────────────────────────────────────────────────

  const handleWater = () => {
    setMenuVisible(false);
    const match = plant.waterFrequency.match(/\d+/);
    const days = match ? parseInt(match[0]) : 7;
    onWater?.(plant.id);
    Alert.alert(
      "💧 Riego registrado",
      `${plant.name} fue regada hoy.\nPróximo riego en ${days} días.`,
    );
  };

  const handleDelete = () => {
    setMenuVisible(false);
    Alert.alert(
      "Eliminar planta",
      `¿Estás seguro de que quieres eliminar "${plant.name}"?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: () => onDelete?.(plant.id),
        },
      ],
    );
  };

  const handleEdit = () => {
    setMenuVisible(false);
    onEdit?.(plant);
  };

  // ── Info de luz solar ───────────────────────────────────────────────────────

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

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <>
      <TouchableOpacity
        style={[
          styles.card,
          {
            backgroundColor: colors.bgSecondary,
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
        {/* Imagen */}
        {plant.image ? (
          <Image
            source={
              typeof plant.image === "number"
                ? plant.image
                : { uri: plant.image as string }
            }
            style={styles.plantImage}
          />
        ) : (
          <View
            style={[
              styles.plantImage,
              styles.plantImageFallback,
              { backgroundColor: colors.categories.green.bg },
            ]}
          >
            <Text style={styles.plantImageEmoji}>🌱</Text>
          </View>
        )}

        {/* Información */}
        <View style={styles.plantInfo}>
          {/* Nombre + botón menú */}
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
              onPress={() => setMenuVisible(true)}
              style={styles.optionsButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <MoreVertical size={18} color={colors.textTertiary} />
            </TouchableOpacity>
          </View>

          {/* Badge categoría */}
          <View
            style={[
              styles.categoryBadge,
              { backgroundColor: colors.bgPrimary },
            ]}
          >
            <Text
              style={[styles.categoryText, { color: colors.textSecondary }]}
            >
              {plant.category}
            </Text>
          </View>

          {/* Stats */}
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Droplets size={14} color={colors.accentGreen} />
              <View style={styles.statTextContainer}>
                <Text
                  style={[styles.statLabel, { color: colors.textTertiary }]}
                >
                  Riego
                </Text>
                <Text style={[styles.statValue, { color: colors.textPrimary }]}>
                  {plant.waterFrequency}
                </Text>
              </View>
            </View>
            <View style={styles.statItem}>
              <Sun size={14} color={sunlightInfo.color} />
              <View style={styles.statTextContainer}>
                <Text
                  style={[styles.statLabel, { color: colors.textTertiary }]}
                >
                  Luz
                </Text>
                <Text style={[styles.statValue, { color: colors.textPrimary }]}>
                  {sunlightInfo.text}
                </Text>
              </View>
            </View>
            <View style={styles.statItem}>
              <ThermometerSun size={14} color={colors.accentOrange} />
              <View style={styles.statTextContainer}>
                <Text
                  style={[styles.statLabel, { color: colors.textTertiary }]}
                >
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
                backgroundColor: isUrgent
                  ? colors.accentOrange + "22"
                  : colors.bgFooter,
                borderColor: isUrgent
                  ? colors.accentOrange
                  : colors.borderFooter,
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

      {/* ── Menú contextual ── */}
      <Modal
        visible={menuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <TouchableOpacity
          style={styles.menuOverlay}
          activeOpacity={1}
          onPress={() => setMenuVisible(false)}
        >
          <View
            style={[styles.menuSheet, { backgroundColor: colors.bgSecondary }]}
          >
            {/* Cabecera */}
            <Text style={[styles.menuTitle, { color: colors.textPrimary }]}>
              {plant.name}
            </Text>
            <View
              style={[
                styles.menuDivider,
                { backgroundColor: colors.borderPrimary },
              ]}
            />

            {/* Registrar riego */}
            <TouchableOpacity
              style={styles.menuItem}
              onPress={handleWater}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.menuIconWrap,
                  { backgroundColor: colors.categories.green.bg },
                ]}
              >
                <Droplets size={18} color={colors.accentGreen} />
              </View>
              <View style={styles.menuItemText}>
                <Text
                  style={[styles.menuItemTitle, { color: colors.textPrimary }]}
                >
                  Registrar riego
                </Text>
                <Text
                  style={[styles.menuItemSub, { color: colors.textTertiary }]}
                >
                  Marcar como regada hoy
                </Text>
              </View>
            </TouchableOpacity>

            {/* Editar */}
            <TouchableOpacity
              style={styles.menuItem}
              onPress={handleEdit}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.menuIconWrap,
                  { backgroundColor: colors.categories.yellow.bg },
                ]}
              >
                <Pencil size={18} color={colors.categories.yellow.border} />
              </View>
              <View style={styles.menuItemText}>
                <Text
                  style={[styles.menuItemTitle, { color: colors.textPrimary }]}
                >
                  Editar planta
                </Text>
                <Text
                  style={[styles.menuItemSub, { color: colors.textTertiary }]}
                >
                  Modificar nombre, categoría y más
                </Text>
              </View>
            </TouchableOpacity>

            {/* Eliminar */}
            <TouchableOpacity
              style={styles.menuItem}
              onPress={handleDelete}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.menuIconWrap,
                  { backgroundColor: colors.categories.pink.bg },
                ]}
              >
                <Trash2 size={18} color={colors.categories.pink.border} />
              </View>
              <View style={styles.menuItemText}>
                <Text
                  style={[
                    styles.menuItemTitle,
                    { color: colors.categories.pink.border },
                  ]}
                >
                  Eliminar planta
                </Text>
                <Text
                  style={[styles.menuItemSub, { color: colors.textTertiary }]}
                >
                  Esta acción no se puede deshacer
                </Text>
              </View>
            </TouchableOpacity>

            {/* Cancelar */}
            <TouchableOpacity
              style={styles.menuCancel}
              onPress={() => setMenuVisible(false)}
            >
              <Text
                style={[styles.menuCancelText, { color: colors.textTertiary }]}
              >
                Cancelar
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

// ─── Estilos ───────────────────────────────────────────────────────────────────

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    // Tarjeta
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
    plantImageFallback: {
      justifyContent: "center",
      alignItems: "center",
    },
    plantImageEmoji: {
      fontSize: 32,
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
    titleContainer: { flex: 1 },
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
    statTextContainer: { flexDirection: "column" },
    statLabel: { fontSize: 9, lineHeight: 10 },
    statValue: { fontSize: 11, fontWeight: "600", lineHeight: 13 },
    nextWatering: {
      flexDirection: "row",
      alignItems: "center",
      gap: theme.spacing.xs,
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xs,
      borderRadius: theme.spacing.xs,
      borderWidth: 1,
    },
    nextWateringText: { fontSize: 10 },

    // Menú contextual
    menuOverlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.5)",
      justifyContent: "flex-end",
    },
    menuSheet: {
      borderTopLeftRadius: theme.radius.lg,
      borderTopRightRadius: theme.radius.lg,
      paddingHorizontal: theme.spacing.lg,
      paddingBottom: theme.spacing.xxl,
      paddingTop: theme.spacing.md,
    },
    menuTitle: {
      fontSize: theme.fontSize.md,
      fontWeight: "700",
      textAlign: "center",
      paddingVertical: theme.spacing.sm,
    },
    menuDivider: {
      height: 1,
      marginBottom: theme.spacing.sm,
    },
    menuItem: {
      flexDirection: "row",
      alignItems: "center",
      gap: theme.spacing.md,
      paddingVertical: theme.spacing.md,
    },
    menuIconWrap: {
      width: 40,
      height: 40,
      borderRadius: theme.radius.sm,
      justifyContent: "center",
      alignItems: "center",
    },
    menuItemText: { flex: 1 },
    menuItemTitle: {
      fontSize: theme.fontSize.sm,
      fontWeight: "600",
    },
    menuItemSub: {
      fontSize: 11,
      marginTop: 2,
    },
    menuCancel: {
      alignItems: "center",
      paddingVertical: theme.spacing.md,
      marginTop: theme.spacing.xs,
    },
    menuCancelText: {
      fontSize: theme.fontSize.sm,
      fontWeight: "600",
    },
  });

const stylesByMode = {
  light: createStyles(getAppTheme("light")),
  dark: createStyles(getAppTheme("dark")),
};
