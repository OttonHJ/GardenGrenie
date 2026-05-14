import { Plant } from "@/src/components/PlantCard";
import {
  AppTheme,
  getAppTheme,
  useProfileTheme,
} from "@/src/theme/designSystem";
import { isWateringDue } from "@/src/utils/plantUtils";
import React from "react";
import {
  Image,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// ─── Constantes ────────────────────────────────────────────────────────────────

const CATEGORY_COLORS: Record<string, string> = {
  suculentas: "#5db89a",
  tropicales: "#66BB6A",
  aromaticas: "#FFCA28",
  cactaceas:  "#EF5350",
  orquideas:  "#CE93D8",
  helechos:   "#81C784",
  palmeras:   "#FFA726",
};

// ─── Tipos ─────────────────────────────────────────────────────────────────────

interface ModalPlantDetailProps {
  plant: Plant | null;
  visible: boolean;
  onClose: () => void;
  onWater: (plantId: string) => void;
  onEdit: (plant: Plant) => void;
}

// ─── Componente ────────────────────────────────────────────────────────────────

export function ModalPlantDetail({
  plant,
  visible,
  onClose,
  onWater,
  onEdit,
}: ModalPlantDetailProps) {
  const { theme, styles } = useProfileTheme(stylesByMode);
  const insets = useSafeAreaInsets();

  if (!plant) return null;

  const isUrgent = isWateringDue(plant.nextWatering);
  const catColor = CATEGORY_COLORS[plant.category] ?? theme.colors.accentGreen;

  const sunlightLabel =
    plant.sunlight === "low"
      ? "Poca luz"
      : plant.sunlight === "medium"
        ? "Luz media"
        : "Luz directa";

  const handleWater = () => {
    onWater(plant.id);
    onClose();
  };

  const handleEdit = () => {
    onClose();
    setTimeout(() => onEdit(plant), 300);
  };

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
      >
        <View
          style={[
            styles.sheet,
            {
              paddingBottom: insets.bottom + 16,
              backgroundColor: theme.colors.bgSecondary,
            },
          ]}
        >
          {/* Drag handle */}
          <View
            style={[styles.handle, { backgroundColor: theme.colors.borderPrimary }]}
          />

          {/* Hero: imagen + nombre + categoría */}
          <View style={styles.heroRow}>
            {plant.image ? (
              <Image source={{ uri: plant.image }} style={styles.heroImage} />
            ) : (
              <View
                style={[
                  styles.heroImage,
                  styles.heroImageFallback,
                  { backgroundColor: theme.colors.categories.green.bg },
                ]}
              >
                <Text style={styles.heroEmoji}>🌱</Text>
              </View>
            )}
            <View style={styles.heroInfo}>
              <Text style={[styles.plantName, { color: theme.colors.textPrimary }]}>
                {plant.name}
              </Text>
              {plant.scientificName ? (
                <Text
                  style={[
                    styles.scientificName,
                    { color: theme.colors.textSecondary },
                  ]}
                >
                  {plant.scientificName}
                </Text>
              ) : null}
              <View
                style={[
                  styles.categoryBadge,
                  { backgroundColor: catColor + "22", borderColor: catColor },
                ]}
              >
                <Text style={[styles.categoryText, { color: catColor }]}>
                  {plant.category}
                </Text>
              </View>
            </View>
          </View>

          {/* Stats */}
          <View
            style={[
              styles.statsRow,
              { borderColor: theme.colors.borderPrimary },
            ]}
          >
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: theme.colors.textPrimary }]}>
                {plant.waterFrequency}
              </Text>
              <Text style={[styles.statLabel, { color: theme.colors.textTertiary }]}>
                💧 Riego
              </Text>
            </View>
            <View
              style={[
                styles.statDivider,
                { backgroundColor: theme.colors.borderPrimary },
              ]}
            />
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: theme.colors.textPrimary }]}>
                {sunlightLabel}
              </Text>
              <Text style={[styles.statLabel, { color: theme.colors.textTertiary }]}>
                ☀️ Luz
              </Text>
            </View>
            <View
              style={[
                styles.statDivider,
                { backgroundColor: theme.colors.borderPrimary },
              ]}
            />
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: theme.colors.textPrimary }]}>
                {plant.temperature}
              </Text>
              <Text style={[styles.statLabel, { color: theme.colors.textTertiary }]}>
                🌡️ Temp
              </Text>
            </View>
          </View>

          {/* Próximo riego */}
          <View
            style={[
              styles.nextWatering,
              {
                backgroundColor: isUrgent
                  ? theme.colors.accentOrange + "22"
                  : theme.colors.bgPrimary,
                borderColor: isUrgent
                  ? theme.colors.accentOrange
                  : theme.colors.borderPrimary,
              },
            ]}
          >
            <Text
              style={[
                styles.nextWateringText,
                {
                  color: isUrgent
                    ? theme.colors.accentOrange
                    : theme.colors.textTertiary,
                },
              ]}
            >
              {isUrgent ? "⚠️ Riego vencido · " : "📅 Próximo riego · "}
              {plant.nextWatering}
            </Text>
          </View>

          {/* Historial de riegos */}
          {(plant.wateringHistory ?? []).length > 0 && (
            <View style={[styles.historySection, { borderColor: theme.colors.borderPrimary }]}>
              <Text style={[styles.historyTitle, { color: theme.colors.textTertiary }]}>
                ÚLTIMOS RIEGOS
              </Text>
              <View style={styles.historyList}>
                {(plant.wateringHistory ?? []).slice(0, 8).map((date, i) => (
                  <View
                    key={date + i}
                    style={[styles.historyChip, { backgroundColor: theme.colors.accentGreen + "18" }]}
                  >
                    <Text style={[styles.historyChipText, { color: theme.colors.accentGreen }]}>
                      💧 {date}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Acciones */}
          <View style={styles.actionsRow}>
            <TouchableOpacity
              style={[
                styles.actionBtn,
                { backgroundColor: theme.colors.accentGreen + "22" },
              ]}
              onPress={handleWater}
              activeOpacity={0.7}
            >
              <Text
                style={[styles.actionBtnText, { color: theme.colors.accentGreen }]}
              >
                💧 Regar
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.actionBtn,
                { backgroundColor: theme.colors.categories.yellow.bg },
              ]}
              onPress={handleEdit}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.actionBtnText,
                  { color: theme.colors.categories.yellow.border },
                ]}
              >
                ✏️ Editar
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

// ─── Estilos ───────────────────────────────────────────────────────────────────

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.5)",
      justifyContent: "flex-end",
    },
    sheet: {
      borderTopLeftRadius: theme.radius.lg,
      borderTopRightRadius: theme.radius.lg,
      paddingHorizontal: theme.spacing.lg,
      paddingTop: theme.spacing.sm,
    },
    handle: {
      width: 36,
      height: 4,
      borderRadius: 2,
      alignSelf: "center",
      marginBottom: theme.spacing.md,
    },
    heroRow: {
      flexDirection: "row",
      gap: theme.spacing.md,
      marginBottom: theme.spacing.lg,
      alignItems: "center",
    },
    heroImage: {
      width: 72,
      height: 72,
      borderRadius: theme.radius.sm,
    },
    heroImageFallback: {
      justifyContent: "center",
      alignItems: "center",
    },
    heroEmoji: {
      fontSize: 32,
    },
    heroInfo: {
      flex: 1,
      gap: theme.spacing.xs,
    },
    plantName: {
      fontSize: theme.fontSize.lg,
      fontWeight: "700",
    },
    scientificName: {
      fontSize: theme.fontSize.sm,
      fontStyle: "italic",
    },
    categoryBadge: {
      alignSelf: "flex-start",
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xxs,
      borderRadius: theme.radius.xxs * 4,
      borderWidth: 1,
    },
    categoryText: {
      fontSize: theme.fontSize.sm,
      fontWeight: "600",
      textTransform: "uppercase",
      letterSpacing: 0.5,
    },
    statsRow: {
      flexDirection: "row",
      borderWidth: 1,
      borderRadius: theme.radius.sm,
      marginBottom: theme.spacing.md,
      overflow: "hidden",
    },
    statItem: {
      flex: 1,
      alignItems: "center",
      paddingVertical: theme.spacing.md,
      gap: theme.spacing.xxs,
    },
    statValue: {
      fontSize: theme.fontSize.sm,
      fontWeight: "600",
    },
    statLabel: {
      fontSize: theme.fontSize.sm,
    },
    statDivider: {
      width: 1,
    },
    nextWatering: {
      borderRadius: theme.radius.sm,
      borderWidth: 1,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      marginBottom: theme.spacing.lg,
    },
    nextWateringText: {
      fontSize: theme.fontSize.sm,
      fontWeight: "500",
    },
    actionsRow: {
      flexDirection: "row",
      gap: theme.spacing.md,
    },
    actionBtn: {
      flex: 1,
      alignItems: "center",
      paddingVertical: theme.spacing.md,
      borderRadius: theme.radius.sm,
    },
    actionBtnText: {
      fontSize: theme.fontSize.sm,
      fontWeight: "700",
    },
    historySection: {
      borderWidth: 1,
      borderRadius: theme.radius.sm,
      padding: theme.spacing.md,
      marginBottom: theme.spacing.lg,
    },
    historyTitle: {
      fontSize: theme.fontSize.sm,
      fontWeight: "600",
      letterSpacing: 0.8,
      marginBottom: theme.spacing.sm,
    },
    historyList: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: theme.spacing.xs,
    },
    historyChip: {
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xxs,
      borderRadius: theme.radius.xxs * 4,
    },
    historyChipText: {
      fontSize: theme.fontSize.sm,
      fontWeight: "500",
    },
  });

const stylesByMode = {
  light: createStyles(getAppTheme("light")),
  dark: createStyles(getAppTheme("dark")),
};
