import {
  ACHIEVEMENTS,
  ACHIEVEMENTS_TOTAL,
  Achievement,
  AchievementCategory,
  AchievementRarity,
  RARITY_LABELS,
} from "@/src/utils/achievementUtils";
import {
  AppTheme,
  getAppTheme,
  useProfileTheme,
} from "@/src/theme/designSystem";
import React, { useState } from "react";
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// ─── Props ─────────────────────────────────────────────────────────────────────

interface ModalAchievementsProps {
  visible: boolean;
  onClose: () => void;
  unlockedIds: string[];
}

// ─── Filtros de categoría ──────────────────────────────────────────────────────

type TabId = "todos" | AchievementCategory;

const TABS: { id: TabId; label: string }[] = [
  { id: "todos", label: "Todos" },
  { id: "plantas", label: "🌱 Plantas" },
  { id: "riego", label: "💧 Riego" },
  { id: "racha", label: "🔥 Racha" },
  { id: "oculto", label: "🔮 Ocultos" },
];

// ─── Componente principal ──────────────────────────────────────────────────────

export function ModalAchievements({
  visible,
  onClose,
  unlockedIds,
}: ModalAchievementsProps) {
  const { theme, styles } = useProfileTheme(stylesByMode);
  const [activeTab, setActiveTab] = useState<TabId>("todos");
  const { height: windowHeight } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const unlockedSet = new Set(unlockedIds);
  const totalUnlocked = unlockedIds.length;

  const filtered =
    activeTab === "todos"
      ? ACHIEVEMENTS
      : ACHIEVEMENTS.filter((a) => a.category === activeTab);

  // Ordenar: desbloqueados primero, luego bloqueados
  const sorted = [...filtered].sort((a, b) => {
    const aU = unlockedSet.has(a.id) ? 0 : 1;
    const bU = unlockedSet.has(b.id) ? 0 : 1;
    return aU - bU;
  });

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      {/* backdrop ocupa toda la pantalla y empuja el sheet hacia abajo */}
      <View style={styles.backdrop}>
        <TouchableOpacity
          style={StyleSheet.absoluteFillObject}
          activeOpacity={1}
          onPress={onClose}
        />
        <View
          style={[
            styles.sheet,
            {
              backgroundColor: theme.colors.bgSecondary,
              flex: 1,
              maxHeight: windowHeight * 0.85,
              paddingBottom: Math.max(insets.bottom, theme.spacing.lg),
            },
          ]}
        >
        <View style={styles.handle} />

        {/* Encabezado */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.colors.textPrimary }]}>
            🏆 Mis Logros
          </Text>
          <View
            style={[
              styles.countBadge,
              { backgroundColor: theme.colors.categories.green.bg },
            ]}
          >
            <Text
              style={[
                styles.countText,
                { color: theme.colors.categories.green.border },
              ]}
            >
              {totalUnlocked} / {ACHIEVEMENTS_TOTAL}
            </Text>
          </View>
        </View>

        {/* Barra de progreso global */}
        <View
          style={[
            styles.progressBar,
            { backgroundColor: theme.colors.borderPrimary },
          ]}
        >
          <View
            style={[
              styles.progressFill,
              {
                backgroundColor: theme.colors.accentGreen,
                width: `${(totalUnlocked / ACHIEVEMENTS_TOTAL) * 100}%`,
              },
            ]}
          />
        </View>

        {/* Tabs de categoría */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsRow}
        >
          {TABS.map((tab) => (
            <TouchableOpacity
              key={tab.id}
              style={[
                styles.tab,
                {
                  backgroundColor:
                    activeTab === tab.id
                      ? theme.colors.accentGreen
                      : theme.colors.bgPrimary,
                  borderColor:
                    activeTab === tab.id
                      ? theme.colors.accentGreen
                      : theme.colors.borderPrimary,
                },
              ]}
              onPress={() => setActiveTab(tab.id)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.tabText,
                  {
                    color:
                      activeTab === tab.id
                        ? "#ffffff"
                        : theme.colors.textTertiary,
                  },
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Lista de logros */}
        <ScrollView
          style={[styles.list, { flex: 1 }]}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
        >
          {sorted.map((achievement) => (
            <AchievementCard
              key={achievement.id}
              achievement={achievement}
              unlocked={unlockedSet.has(achievement.id)}
            />
          ))}
        </ScrollView>

        {/* Botón cerrar */}
        <TouchableOpacity
          style={[styles.closeBtn, { backgroundColor: theme.colors.accentGreen }]}
          onPress={onClose}
          activeOpacity={0.8}
        >
          <Text style={styles.closeBtnText}>Cerrar</Text>
        </TouchableOpacity>
        </View>{/* end sheet */}
      </View>{/* end backdrop */}
    </Modal>
  );
}

// ─── Tarjeta individual ────────────────────────────────────────────────────────

function AchievementCard({
  achievement,
  unlocked,
}: {
  achievement: Achievement;
  unlocked: boolean;
}) {
  const { theme, styles } = useProfileTheme(cardStylesByMode);
  const isHiddenAndLocked = achievement.hidden && !unlocked;

  const rarityColors = getRarityColors(achievement.rarity, theme);

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: unlocked
            ? rarityColors.bg
            : theme.colors.bgPrimary,
          borderColor: unlocked
            ? rarityColors.border
            : theme.colors.borderPrimary,
          opacity: unlocked ? 1 : 0.55,
        },
      ]}
    >
      <Text style={styles.icon}>
        {isHiddenAndLocked ? "❓" : achievement.icon}
      </Text>
      <View style={styles.info}>
        <Text style={[styles.achievementTitle, { color: theme.colors.textPrimary }]}>
          {isHiddenAndLocked ? "???" : achievement.title}
        </Text>
        <Text style={[styles.description, { color: theme.colors.textTertiary }]}>
          {isHiddenAndLocked ? "Logro oculto — ¡descúbrelo!" : achievement.description}
        </Text>
      </View>
      <View
        style={[
          styles.rarityBadge,
          { backgroundColor: unlocked ? rarityColors.border : theme.colors.borderPrimary },
        ]}
      >
        <Text style={styles.rarityText}>
          {RARITY_LABELS[achievement.rarity].toUpperCase()}
        </Text>
      </View>
    </View>
  );
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

function getRarityColors(rarity: AchievementRarity, theme: AppTheme) {
  switch (rarity) {
    case "legendario":
      return {
        bg: theme.colors.categories.pink.bg,
        border: theme.colors.categories.pink.border,
      };
    case "epico":
      return {
        bg: theme.colors.categories.yellow.bg,
        border: theme.colors.categories.yellow.border,
      };
    case "raro":
      return {
        bg: theme.colors.categories.green.bg,
        border: theme.colors.categories.green.border,
      };
    default:
      return {
        bg: theme.colors.categories.brown.bg,
        border: theme.colors.categories.brown.border,
      };
  }
}

// ─── Estilos modal ─────────────────────────────────────────────────────────────

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    backdrop: {
      flex: 1,
      justifyContent: "flex-end",
      backgroundColor: "rgba(0,0,0,0.5)",
    },
    sheet: {
      borderTopLeftRadius: theme.radius.lg,
      borderTopRightRadius: theme.radius.lg,
      paddingHorizontal: theme.spacing.lg,
    },
    handle: {
      width: theme.spacing.xl * 2,
      height: theme.spacing.xs,
      backgroundColor: theme.colors.borderPrimary,
      borderRadius: theme.radius.full,
      alignSelf: "center",
      marginVertical: theme.spacing.md,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: theme.spacing.sm,
    },
    title: {
      fontSize: theme.fontSize.lg,
      fontWeight: "700",
    },
    countBadge: {
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xxs,
      borderRadius: theme.radius.full,
    },
    countText: {
      fontSize: theme.fontSize.sm,
      fontWeight: "700",
    },
    progressBar: {
      height: 6,
      borderRadius: theme.radius.full,
      marginBottom: theme.spacing.md,
      overflow: "hidden",
    },
    progressFill: {
      height: "100%",
      borderRadius: theme.radius.full,
    },
    tabsRow: {
      gap: theme.spacing.xs,
      paddingBottom: theme.spacing.sm,
    },
    tab: {
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.xs,
      borderRadius: theme.radius.full,
      borderWidth: 1,
    },
    tabText: {
      fontSize: theme.fontSize.sm,
      fontWeight: "600",
    },
    list: {
      marginTop: theme.spacing.xs,
    },
    listContent: {
      gap: theme.spacing.sm,
      paddingBottom: theme.spacing.lg,
    },
    closeBtn: {
      borderRadius: theme.radius.sm,
      paddingVertical: theme.spacing.md,
      alignItems: "center",
      marginTop: theme.spacing.sm,
    },
    closeBtnText: {
      fontSize: theme.fontSize.sm,
      fontWeight: "700",
      color: "#ffffff",
    },
  });

// ─── Estilos tarjeta ───────────────────────────────────────────────────────────

const createCardStyles = (theme: AppTheme) =>
  StyleSheet.create({
    card: {
      flexDirection: "row",
      alignItems: "center",
      gap: theme.spacing.sm,
      padding: theme.spacing.md,
      borderRadius: theme.radius.sm,
      borderWidth: 1,
    },
    icon: {
      fontSize: 26,
    },
    info: {
      flex: 1,
      gap: 2,
    },
    achievementTitle: {
      fontSize: theme.fontSize.sm,
      fontWeight: "700",
    },
    description: {
      fontSize: 11,
      lineHeight: 16,
    },
    rarityBadge: {
      paddingHorizontal: theme.spacing.xs,
      paddingVertical: 2,
      borderRadius: theme.radius.xs,
    },
    rarityText: {
      color: "#ffffff",
      fontSize: 10,
      fontWeight: "700",
      letterSpacing: 0.5,
    },
  });

const stylesByMode = {
  light: createStyles(getAppTheme("light")),
  dark: createStyles(getAppTheme("dark")),
};

const cardStylesByMode = {
  light: createCardStyles(getAppTheme("light")),
  dark: createCardStyles(getAppTheme("dark")),
};
