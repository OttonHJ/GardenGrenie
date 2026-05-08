import { Plant } from "@/src/components/PlantCard";
import { usePlants } from "@/src/context/PlantContext";
import {
  AppTheme,
  getAppTheme,
  useProfileTheme,
} from "@/src/theme/designSystem";
import { isWateringDue } from "@/src/utils/plantUtils";
import React, { useMemo, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// ─── Utilidades ────────────────────────────────────────────────────────────────

const MONTH_NAMES = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];
const DAY_NAMES = ["D", "L", "K", "M", "J", "V", "S"];

const CATEGORY_COLORS: Record<string, string> = {
  suculentas: "#5db89a",
  tropicales: "#66BB6A",
  aromaticas: "#FFCA28",
  cactaceas:  "#EF5350",
  orquideas:  "#CE93D8",
  helechos:   "#81C784",
  palmeras:   "#FFA726",
};

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

function toDateKey(date: Date): string {
  // Usar fecha local (no UTC) para evitar desfase por zona horaria
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function addMonths(date: Date, n: number): Date {
  const d = new Date(date);
  d.setDate(1);
  d.setMonth(d.getMonth() + n);
  return d;
}

function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  d.setDate(d.getDate() + (day === 0 ? -6 : 1 - day));
  d.setHours(0, 0, 0, 0);
  return d;
}

// ─── Tipos ─────────────────────────────────────────────────────────────────────

interface WateringEvent {
  plant: Plant;
  date: string; // "YYYY-MM-DD"
  isOverdue: boolean;
}

// ─── Componente ────────────────────────────────────────────────────────────────

export function ScreenCalendar() {
  const insets = useSafeAreaInsets();
  const { theme, styles } = useProfileTheme(stylesByMode);
  const { plants, waterPlant } = usePlants();

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayKey = toDateKey(today);

  // Mes visible en el calendario
  const [viewDate, setViewDate] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1),
  );
  const [selectedDay, setSelectedDay] = useState<string>(todayKey);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  // ── Mapa de eventos: fecha → plantas ──────────────────────────────────────
  const eventMap = useMemo(() => {
    const map: Record<string, WateringEvent[]> = {};
    for (const plant of plants) {
      const key = plant.nextWatering;
      if (!map[key]) map[key] = [];
      map[key].push({
        plant,
        date: key,
        isOverdue: isWateringDue(plant.nextWatering) && key !== todayKey,
      });
    }
    return map;
  }, [plants]);

  // ── Días del mes visible ───────────────────────────────────────────────────
  const daysInMonth = getDaysInMonth(year, month);
  const firstDayOfWeek = getFirstDayOfMonth(year, month);
  const totalCells = Math.ceil((firstDayOfWeek + daysInMonth) / 7) * 7;

  // ── Eventos del día seleccionado ───────────────────────────────────────────
  const selectedEvents = eventMap[selectedDay] ?? [];

  // ── Eventos vencidos (para resumen) ───────────────────────────────────────
  const overdueEvents = useMemo(
    () =>
      plants.filter(
        (p) => isWateringDue(p.nextWatering) && p.nextWatering !== todayKey,
      ),
    [plants],
  );

  // ── Resumen semanal ────────────────────────────────────────────────────────
  const weekDays = useMemo(() => {
    const start = getWeekStart(today);
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return { date: d, key: toDateKey(d) };
    });
  }, []);

  const weeklyData = useMemo(() => {
    const weekKeys = new Set(weekDays.map((d) => d.key));
    const wateredThisWeek = plants.filter((p) => weekKeys.has(p.lastWatered)).length;
    const pendingToday = eventMap[todayKey]?.length ?? 0;
    return { wateredThisWeek, pendingToday };
  }, [plants, weekDays, eventMap, todayKey]);

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingTop: insets.top, paddingBottom: insets.bottom + 80 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            backgroundColor: theme.colors.bgSecondary,
            borderBottomColor: theme.colors.borderPrimary,
          },
        ]}
      >
        <Text style={[styles.headerTitle, { color: theme.colors.textPrimary }]}>
          📅 Calendario de riegos
        </Text>
        <Text style={[styles.headerSub, { color: theme.colors.textTertiary }]}>
          {plants.length} planta{plants.length !== 1 ? "s" : ""} registradas
        </Text>
      </View>

      {/* Banner de vencidos */}
      {overdueEvents.length > 0 && (
        <View
          style={[
            styles.overdueBanner,
            {
              backgroundColor: theme.colors.accentOrange + "22",
              borderColor: theme.colors.accentOrange,
            },
          ]}
        >
          <Text
            style={[
              styles.overdueBannerText,
              { color: theme.colors.accentOrange },
            ]}
          >
            ⚠️ {overdueEvents.length} planta
            {overdueEvents.length !== 1 ? "s" : ""} con riego vencido
          </Text>
        </View>
      )}

      {/* Resumen semanal */}
      <View
        style={[
          styles.weeklySummary,
          {
            backgroundColor: theme.colors.bgSecondary,
            borderColor: theme.colors.borderPrimary,
          },
        ]}
      >
        <Text style={[styles.weeklySummaryTitle, { color: theme.colors.textTertiary }]}>
          ESTA SEMANA
        </Text>

        <View style={styles.weekStrip}>
          {weekDays.map(({ date, key }) => {
            const isToday = key === todayKey;
            const isPast = key < todayKey;
            const hasWatered = plants.some((p) => p.lastWatered === key);
            const hasEvent = !!eventMap[key];
            let icon = "";
            if (hasWatered) icon = "✅";
            else if (hasEvent) {
              if (isPast) icon = "⚠️";
              else if (isToday) icon = "💧";
              else icon = "·";
            }
            return (
              <View
                key={key}
                style={[
                  styles.weekDayItem,
                  isToday && {
                    backgroundColor: theme.colors.accentGreen + "22",
                    borderRadius: theme.radius.sm,
                  },
                ]}
              >
                <Text style={[styles.weekDayName, { color: isToday ? theme.colors.accentGreen : theme.colors.textTertiary }]}>
                  {DAY_NAMES[date.getDay()]}
                </Text>
                <Text style={[styles.weekDayNum, { color: isToday ? theme.colors.accentGreen : theme.colors.textPrimary }]}>
                  {date.getDate()}
                </Text>
                <Text style={styles.weekDayIcon}>{icon}</Text>
              </View>
            );
          })}
        </View>

        <View style={styles.weekStatRow}>
          <View style={[styles.weekStatChip, { backgroundColor: theme.colors.accentGreen + "22" }]}>
            <Text style={[styles.weekStatNum, { color: theme.colors.accentGreen }]}>
              {weeklyData.wateredThisWeek}
            </Text>
            <Text style={[styles.weekStatLabel, { color: theme.colors.accentGreen }]}>
              Regadas
            </Text>
          </View>
          <View style={[styles.weekStatChip, { backgroundColor: theme.colors.accentGreen + "15" }]}>
            <Text style={[styles.weekStatNum, { color: theme.colors.accentGreen }]}>
              {weeklyData.pendingToday}
            </Text>
            <Text style={[styles.weekStatLabel, { color: theme.colors.accentGreen }]}>
              Hoy
            </Text>
          </View>
          <View style={[styles.weekStatChip, { backgroundColor: theme.colors.accentOrange + "22" }]}>
            <Text style={[styles.weekStatNum, { color: theme.colors.accentOrange }]}>
              {overdueEvents.length}
            </Text>
            <Text style={[styles.weekStatLabel, { color: theme.colors.accentOrange }]}>
              Vencidas
            </Text>
          </View>
        </View>
      </View>

      {/* Navegación de mes */}
      <View
        style={[
          styles.monthNav,
          {
            backgroundColor: theme.colors.bgSecondary,
            borderBottomColor: theme.colors.borderPrimary,
          },
        ]}
      >
        <TouchableOpacity
          onPress={() => setViewDate(addMonths(viewDate, -1))}
          style={styles.navBtn}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={[styles.navArrow, { color: theme.colors.accentGreen }]}>
            ‹
          </Text>
        </TouchableOpacity>
        <Text style={[styles.monthTitle, { color: theme.colors.textPrimary }]}>
          {MONTH_NAMES[month]} {year}
        </Text>
        <TouchableOpacity
          onPress={() => setViewDate(addMonths(viewDate, 1))}
          style={styles.navBtn}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={[styles.navArrow, { color: theme.colors.accentGreen }]}>
            ›
          </Text>
        </TouchableOpacity>
      </View>

      {/* Grilla del calendario */}
      <View
        style={[
          styles.calendarGrid,
          {
            backgroundColor: theme.colors.bgSecondary,
            borderColor: theme.colors.borderPrimary,
          },
        ]}
      >
        {/* Cabecera días de semana */}
        <View style={styles.weekRow}>
          {DAY_NAMES.map((d) => (
            <View key={d} style={styles.dayCell}>
              <Text
                style={[styles.dayName, { color: theme.colors.textTertiary }]}
              >
                {d}
              </Text>
            </View>
          ))}
        </View>

        {/* Celdas del mes */}
        {Array.from({ length: totalCells })
          .reduce<React.ReactNode[][]>((rows, _, idx) => {
            const rowIdx = Math.floor(idx / 7);
            if (!rows[rowIdx]) rows[rowIdx] = [];
            const dayNum = idx - firstDayOfWeek + 1;
            const isCurrentMonth = dayNum >= 1 && dayNum <= daysInMonth;

            let cellKey = "";
            if (isCurrentMonth) {
              const cellDate = new Date(year, month, dayNum);
              cellKey = toDateKey(cellDate);
            }

            const isToday = cellKey === todayKey;
            const isSelected = cellKey === selectedDay;
            const cellEvents = cellKey ? (eventMap[cellKey] ?? []) : [];
            const categoryDots = Array.from(
              cellEvents.reduce<Map<string, string>>((map, e) => {
                if (!map.has(e.plant.category)) {
                  map.set(
                    e.plant.category,
                    e.isOverdue
                      ? theme.colors.accentOrange
                      : (CATEGORY_COLORS[e.plant.category] ?? theme.colors.accentGreen),
                  );
                }
                return map;
              }, new Map()),
            ).map(([cat, color]) => ({ cat, color }));

            rows[rowIdx].push(
              <TouchableOpacity
                key={idx}
                style={[
                  styles.dayCell,
                  isSelected && {
                    backgroundColor: theme.colors.accentGreen,
                    borderRadius: theme.radius.full,
                  },
                  isToday &&
                    !isSelected && {
                      borderWidth: 1,
                      borderColor: theme.colors.accentGreen,
                      borderRadius: theme.radius.full,
                    },
                ]}
                onPress={() =>
                  isCurrentMonth && cellKey && setSelectedDay(cellKey)
                }
                activeOpacity={isCurrentMonth ? 0.7 : 1}
              >
                <Text
                  style={[
                    styles.dayNum,
                    {
                      color: isSelected
                        ? "#fff"
                        : isCurrentMonth
                          ? theme.colors.textPrimary
                          : theme.colors.borderPrimary,
                    },
                    isToday &&
                      !isSelected && { color: theme.colors.accentGreen },
                  ]}
                >
                  {isCurrentMonth ? dayNum : ""}
                </Text>
                {categoryDots.length > 0 && (
                  <View style={styles.dotRow}>
                    {categoryDots.map(({ cat, color }) => (
                      <View key={cat} style={[styles.eventDot, { backgroundColor: color }]} />
                    ))}
                  </View>
                )}
              </TouchableOpacity>,
            );
            return rows;
          }, [])
          .map((row, i) => (
            <View key={i} style={styles.weekRow}>
              {row}
            </View>
          ))}
      </View>

      {/* Lista de eventos del día seleccionado */}
      <View style={styles.eventsSection}>
        <Text
          style={[
            styles.eventsSectionTitle,
            { color: theme.colors.textTertiary },
          ]}
        >
          {selectedDay === todayKey
            ? "HOY"
            : selectedDay < todayKey
              ? "VENCIDO — " + selectedDay
              : selectedDay}
        </Text>

        {selectedEvents.length === 0 ? (
          <View
            style={[
              styles.emptyDay,
              {
                backgroundColor: theme.colors.bgSecondary,
                borderColor: theme.colors.borderPrimary,
              },
            ]}
          >
            <Text
              style={[
                styles.emptyDayText,
                { color: theme.colors.textTertiary },
              ]}
            >
              Sin riegos programados
            </Text>
          </View>
        ) : (
          selectedEvents.map(({ plant, isOverdue }) => (
            <View
              key={plant.id}
              style={[
                styles.eventRow,
                {
                  backgroundColor: theme.colors.bgSecondary,
                  borderColor: theme.colors.borderPrimary,
                  borderLeftColor: isOverdue
                    ? theme.colors.accentOrange
                    : theme.colors.accentGreen,
                },
              ]}
            >
              <View style={styles.eventInfo}>
                <Text
                  style={[
                    styles.eventName,
                    { color: theme.colors.textPrimary },
                  ]}
                >
                  {isOverdue ? "⚠️ " : "💧 "}
                  {plant.name}
                </Text>
                <Text
                  style={[
                    styles.eventMeta,
                    { color: theme.colors.textTertiary },
                  ]}
                >
                  {plant.scientificName} · {plant.waterFrequency} ·{" "}
                  {plant.location}
                </Text>
              </View>
              <TouchableOpacity
                style={[
                  styles.waterBtn,
                  {
                    backgroundColor: theme.colors.accentGreen + "22",
                  },
                ]}
                onPress={() => waterPlant(plant.id)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.waterBtnText,
                    { color: theme.colors.accentGreen },
                  ]}
                >
                  💧 Regar
                </Text>
              </TouchableOpacity>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

// ─── Estilos ───────────────────────────────────────────────────────────────────

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.bgPrimary,
    },
    header: {
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.md,
      borderBottomWidth: theme.spacing.xxs,
    },
    headerTitle: {
      fontSize: theme.fontSize.md,
      fontWeight: "700",
    },
    headerSub: {
      fontSize: theme.fontSize.sm,
      marginTop: theme.spacing.xxs,
    },
    overdueBanner: {
      marginHorizontal: theme.spacing.lg,
      marginTop: theme.spacing.md,
      borderRadius: theme.radius.sm,
      borderWidth: theme.spacing.xxs,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
    },
    overdueBannerText: {
      fontSize: theme.fontSize.sm,
      fontWeight: "600",
    },
    monthNav: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.sm,
      marginTop: theme.spacing.md,
      borderBottomWidth: 1,
    },
    navBtn: {
      padding: theme.spacing.xs,
    },
    navArrow: {
      fontSize: theme.fontSize.xl,
      fontWeight: "300",
      lineHeight: theme.spacing.xxl,
    },
    monthTitle: {
      fontSize: theme.fontSize.md,
      fontWeight: "600",
    },
    calendarGrid: {
      marginHorizontal: theme.spacing.lg,
      marginTop: theme.spacing.sm,
      borderRadius: theme.radius.sm,
      borderWidth: theme.spacing.xxs,
      overflow: "hidden",
      paddingVertical: theme.spacing.xs,
    },
    weekRow: {
      flexDirection: "row",
    },
    dayCell: {
      flex: 1,
      aspectRatio: 1,
      alignItems: "center",
      justifyContent: "center",
    },
    dayName: {
      fontSize: theme.fontSize.sm,
      fontWeight: "600",
    },
    dayNum: {
      fontSize: theme.fontSize.md,
      fontWeight: "500",
    },
    dotRow: {
      flexDirection: "row",
      gap: 2,
      marginTop: theme.spacing.xxs,
    },
    eventDot: {
      width: 5,
      height: 5,
      borderRadius: 3,
    },
    eventsSection: {
      marginHorizontal: theme.spacing.lg,
      marginTop: theme.spacing.lg,
    },
    eventsSectionTitle: {
      fontSize: theme.fontSize.sm,
      fontWeight: "600",
      letterSpacing: 0.8,
      marginBottom: theme.spacing.sm,
    },
    emptyDay: {
      borderRadius: theme.radius.sm,
      borderWidth: theme.spacing.xxs,
      padding: theme.spacing.lg,
      alignItems: "center",
    },
    emptyDayText: {
      fontSize: theme.fontSize.sm,
    },
    eventRow: {
      flexDirection: "row",
      alignItems: "center",
      borderRadius: theme.radius.sm,
      borderWidth: theme.spacing.xxs - 1,
      borderLeftWidth: theme.spacing.xs,
      padding: theme.spacing.md,
      marginBottom: theme.spacing.sm,
    },
    eventInfo: {
      flex: 1,
    },
    eventName: {
      fontSize: theme.fontSize.sm,
      fontWeight: "600",
    },
    eventMeta: {
      fontSize: theme.fontSize.sm,
      marginTop: theme.spacing.xxs,
    },
    waterBtn: {
      borderRadius: theme.radius.sm,
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xs,
    },
    waterBtnText: {
      fontSize: theme.fontSize.sm,
      fontWeight: "600",
    },
    weeklySummary: {
      marginHorizontal: theme.spacing.lg,
      marginTop: theme.spacing.md,
      borderRadius: theme.radius.sm,
      borderWidth: theme.spacing.xxs,
      padding: theme.spacing.md,
    },
    weeklySummaryTitle: {
      fontSize: theme.fontSize.sm,
      fontWeight: "600",
      letterSpacing: 0.8,
      marginBottom: theme.spacing.sm,
    },
    weekStrip: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: theme.spacing.md,
    },
    weekDayItem: {
      alignItems: "center",
      paddingVertical: theme.spacing.xxs,
      paddingHorizontal: theme.spacing.xs,
      minWidth: 36,
    },
    weekDayName: {
      fontSize: theme.fontSize.sm,
      fontWeight: "600",
    },
    weekDayNum: {
      fontSize: theme.fontSize.md,
      fontWeight: "500",
      marginTop: theme.spacing.xxs,
    },
    weekDayIcon: {
      fontSize: 12,
      marginTop: theme.spacing.xxs,
      height: 16,
    },
    weekStatRow: {
      flexDirection: "row",
      gap: theme.spacing.sm,
    },
    weekStatChip: {
      flex: 1,
      alignItems: "center",
      borderRadius: theme.radius.sm,
      paddingVertical: theme.spacing.sm,
    },
    weekStatNum: {
      fontSize: theme.fontSize.lg,
      fontWeight: "700",
    },
    weekStatLabel: {
      fontSize: theme.fontSize.sm,
      marginTop: theme.spacing.xxs,
    },
  });

const stylesByMode = {
  light: createStyles(getAppTheme("light")),
  dark: createStyles(getAppTheme("dark")),
};
