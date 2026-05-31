import { Plant } from "@/src/components/PlantCard";
import {
  AppTheme,
  getAppTheme,
  useProfileTheme,
} from "@/src/theme/designSystem";
import { todayDateString } from "@/src/utils/plantUtils";
import {
  AtRiskPlant,
  RiskLevel,
  calcAtRiskPlants,
  validateVacationDates,
} from "@/src/utils/vacationUtils";
import React, { useEffect, useState } from "react";
import {
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// ─── Constantes calendario ─────────────────────────────────────────────────────

const MONTH_NAMES = [
  "Enero","Febrero","Marzo","Abril","Mayo","Junio",
  "Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre",
];
const DAY_NAMES = ["D", "L", "M", "M", "J", "V", "S"];

// ─── Tipos ─────────────────────────────────────────────────────────────────────

interface ModalVacationModeProps {
  visible: boolean;
  plants: Plant[];
  initialStartDate?: string;
  initialEndDate?: string;
  onClose: () => void;
  onActivate: (startDate: string, endDate: string) => void;
  onDeactivate: () => void;
  isActive: boolean;
}

type PickerTarget = "start" | "end" | null;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDisplay(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  return `${String(d).padStart(2, "0")}/${String(m).padStart(2, "0")}/${y}`;
}

function dateKey(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

const RISK_CONFIG: Record<RiskLevel, { emoji: string; label: string; color: string }> = {
  critical: { emoji: "🔴", label: "Crítico",    color: "#d9534f" },
  warning:  { emoji: "🟡", label: "Precaución", color: "#d97326" },
  safe:     { emoji: "🟢", label: "Segura",     color: "#6b9e8b" },
};

// ─── Mini Calendario ──────────────────────────────────────────────────────────

interface MiniCalendarProps {
  selected: string;
  minDate: string;
  onSelect: (dateStr: string) => void;
  theme: AppTheme;
}

function MiniCalendar({ selected, minDate, onSelect, theme }: MiniCalendarProps) {
  const [sel] = useState(() => {
    const [y, m] = selected.split("-").map(Number);
    return { year: y, month: m - 1 };
  });
  const [year, setYear] = useState(sel.year);
  const [month, setMonth] = useState(sel.month);

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const goBack = () => {
    if (month === 0) { setYear(y => y - 1); setMonth(11); }
    else setMonth(m => m - 1);
  };
  const goForward = () => {
    if (month === 11) { setYear(y => y + 1); setMonth(0); }
    else setMonth(m => m + 1);
  };

  const s = theme.spacing;
  const c = theme.colors;
  const f = theme.fontSize;
  const r = theme.radius;

  return (
    <View style={{ backgroundColor: c.bgPrimary, borderRadius: r.sm, padding: s.sm, marginBottom: s.md }}>
      {/* Navegación mes */}
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: s.sm }}>
        <TouchableOpacity onPress={goBack} style={{ padding: s.sm }}>
          <Text style={{ color: c.textPrimary, fontSize: f.md }}>‹</Text>
        </TouchableOpacity>
        <Text style={{ color: c.textPrimary, fontWeight: "600", fontSize: f.sm }}>
          {MONTH_NAMES[month]} {year}
        </Text>
        <TouchableOpacity onPress={goForward} style={{ padding: s.sm }}>
          <Text style={{ color: c.textPrimary, fontSize: f.md }}>›</Text>
        </TouchableOpacity>
      </View>

      {/* Cabecera días */}
      <View style={{ flexDirection: "row" }}>
        {DAY_NAMES.map((d, i) => (
          <Text key={i} style={{ flex: 1, textAlign: "center", fontSize: 10, color: c.textTertiary, marginBottom: 4 }}>
            {d}
          </Text>
        ))}
      </View>

      {/* Grid días */}
      <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
        {cells.map((day, i) => {
          if (day === null) {
            return <View key={`e-${i}`} style={{ width: "14.28%", aspectRatio: 1 }} />;
          }
          const key = dateKey(year, month, day);
          const isSelected = key === selected;
          const isDisabled = key < minDate;

          return (
            <TouchableOpacity
              key={key}
              disabled={isDisabled}
              onPress={() => onSelect(key)}
              style={{
                width: "14.28%",
                aspectRatio: 1,
                alignItems: "center",
                justifyContent: "center",
                opacity: isDisabled ? 0.3 : 1,
              }}
            >
              <View style={{
                width: 30,
                height: 30,
                borderRadius: 15,
                backgroundColor: isSelected ? c.accentGreen : "transparent",
                alignItems: "center",
                justifyContent: "center",
              }}>
                <Text style={{ fontSize: 12, color: isSelected ? "#fff" : c.textPrimary }}>
                  {day}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

// ─── Modal principal ──────────────────────────────────────────────────────────

export function ModalVacationMode({
  visible,
  plants,
  initialStartDate,
  initialEndDate,
  onClose,
  onActivate,
  onDeactivate,
  isActive,
}: ModalVacationModeProps) {
  const { theme, styles } = useProfileTheme(stylesByMode);
  const insets = useSafeAreaInsets();

  const today = todayDateString();
  const [startDate, setStartDate] = useState(initialStartDate ?? today);
  const [endDate, setEndDate] = useState(initialEndDate ?? today);
  const [activePicker, setActivePicker] = useState<PickerTarget>(null);

  const [atRisk, setAtRisk] = useState<AtRiskPlant[]>([]);
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (visible) {
      setStartDate(initialStartDate ?? today);
      setEndDate(initialEndDate ?? today);
      setActivePicker(null);
    }
  }, [visible]);

  useEffect(() => {
    const error = validateVacationDates(startDate, endDate);
    setValidationError(error);
    if (!error) {
      setAtRisk(calcAtRiskPlants(plants, startDate, endDate));
    } else {
      setAtRisk([]);
    }
  }, [startDate, endDate, plants]);

  const canActivate = !validationError && plants.length > 0;

  const handleActivate = () => {
    if (!canActivate) return;
    onActivate(startDate, endDate);
    onClose();
  };

  const togglePicker = (target: PickerTarget) => {
    setActivePicker(prev => (prev === target ? null : target));
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose} />
      <View style={[styles.sheet, { paddingBottom: insets.bottom + 16 }]}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>🌴 Modo Vacaciones</Text>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.closeBtn}>✕</Text>
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} style={styles.body}>
          <Text style={styles.sectionLabel}>Rango de ausencia</Text>

          {/* Botones de fecha */}
          <View style={styles.dateRow}>
            <TouchableOpacity
              style={[styles.dateButton, activePicker === "start" && styles.dateButtonActive]}
              onPress={() => togglePicker("start")}
            >
              <Text style={styles.dateLabel}>Desde</Text>
              <Text style={styles.dateValue}>{formatDisplay(startDate)}</Text>
            </TouchableOpacity>

            <Text style={styles.dateSeparator}>→</Text>

            <TouchableOpacity
              style={[styles.dateButton, activePicker === "end" && styles.dateButtonActive]}
              onPress={() => togglePicker("end")}
            >
              <Text style={styles.dateLabel}>Hasta</Text>
              <Text style={styles.dateValue}>{formatDisplay(endDate)}</Text>
            </TouchableOpacity>
          </View>

          {/* Calendarios inline */}
          {activePicker === "start" && (
            <MiniCalendar
              selected={startDate}
              minDate={today}
              onSelect={(d) => { setStartDate(d); setActivePicker(null); }}
              theme={theme}
            />
          )}
          {activePicker === "end" && (
            <MiniCalendar
              selected={endDate}
              minDate={startDate}
              onSelect={(d) => { setEndDate(d); setActivePicker(null); }}
              theme={theme}
            />
          )}

          {/* Error de validación */}
          {validationError && (
            <Text style={styles.errorText}>⚠️ {validationError}</Text>
          )}

          {/* Estados de plantas */}
          {!validationError && plants.length === 0 && (
            <Text style={styles.emptyText}>Primero agrega plantas a tu jardín</Text>
          )}

          {!validationError && plants.length > 0 && atRisk.length === 0 && (
            <View style={styles.safeCard}>
              <Text style={styles.safeText}>✅ Tus plantas están bien durante tu ausencia</Text>
            </View>
          )}

          {atRisk.length > 0 && (
            <>
              <Text style={styles.sectionLabel}>
                {atRisk.length} planta{atRisk.length !== 1 ? "s" : ""} necesitan atención
              </Text>
              {atRisk.map(({ plant, firstRiskDate, riskLevel }) => {
                const cfg = RISK_CONFIG[riskLevel];
                return (
                  <View key={plant.id} style={styles.plantRow}>
                    {plant.image ? (
                      <Image source={{ uri: plant.image }} style={styles.plantImg} />
                    ) : (
                      <View style={[styles.plantImg, styles.plantImgPlaceholder]}>
                        <Text style={styles.plantImgEmoji}>🪴</Text>
                      </View>
                    )}
                    <View style={styles.plantInfo}>
                      <Text style={styles.plantName}>{plant.name}</Text>
                      <Text style={styles.plantDate}>
                        Riego el {formatDisplay(firstRiskDate)}
                      </Text>
                    </View>
                    <View style={[styles.riskBadge, { borderColor: cfg.color }]}>
                      <Text style={styles.riskEmoji}>{cfg.emoji}</Text>
                      <Text style={[styles.riskLabel, { color: cfg.color }]}>{cfg.label}</Text>
                    </View>
                  </View>
                );
              })}
            </>
          )}
        </ScrollView>

        {/* Botones de acción */}
        <View style={styles.actions}>
          {isActive && (
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => { onDeactivate(); onClose(); }}
            >
              <Text style={styles.cancelBtnText}>Cancelar vacación</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[styles.activateBtn, !canActivate && styles.activateBtnDisabled]}
            onPress={handleActivate}
            disabled={!canActivate}
          >
            <Text style={styles.activateBtnText}>
              {isActive ? "Actualizar fechas" : "Activar modo vacaciones"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

// ─── Estilos ──────────────────────────────────────────────────────────────────

export const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.45)",
    },
    sheet: {
      backgroundColor: theme.colors.bgSecondary,
      borderTopLeftRadius: theme.radius.xl,
      borderTopRightRadius: theme.radius.xl,
      maxHeight: "85%",
      paddingTop: theme.spacing.lg,
      paddingHorizontal: theme.spacing.lg,
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: theme.spacing.lg,
    },
    title: {
      fontSize: theme.fontSize.lg,
      fontWeight: "700",
      color: theme.colors.textPrimary,
    },
    closeBtn: {
      fontSize: theme.fontSize.lg,
      color: theme.colors.textTertiary,
      padding: theme.spacing.xs,
    },
    body: {
      flexGrow: 0,
    },
    sectionLabel: {
      fontSize: theme.fontSize.sm,
      fontWeight: "600",
      color: theme.colors.textTertiary,
      letterSpacing: 0.8,
      textTransform: "uppercase",
      marginBottom: theme.spacing.sm,
      marginTop: theme.spacing.md,
    },
    dateRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: theme.spacing.sm,
      marginBottom: theme.spacing.sm,
    },
    dateButton: {
      flex: 1,
      backgroundColor: theme.colors.bgPrimary,
      borderRadius: theme.radius.sm,
      borderWidth: 1,
      borderColor: theme.colors.borderPrimary,
      padding: theme.spacing.md,
      alignItems: "center",
    },
    dateButtonActive: {
      borderColor: theme.colors.accentGreen,
    },
    dateLabel: {
      fontSize: theme.fontSize.sm,
      color: theme.colors.textTertiary,
      marginBottom: 2,
    },
    dateValue: {
      fontSize: theme.fontSize.md,
      fontWeight: "600",
      color: theme.colors.textPrimary,
    },
    dateSeparator: {
      fontSize: theme.fontSize.md,
      color: theme.colors.textTertiary,
    },
    errorText: {
      color: "#d9534f",
      fontSize: theme.fontSize.sm,
      marginTop: theme.spacing.sm,
      marginBottom: theme.spacing.sm,
    },
    emptyText: {
      color: theme.colors.textTertiary,
      fontSize: theme.fontSize.sm,
      textAlign: "center",
      marginTop: theme.spacing.xxl,
      marginBottom: theme.spacing.xxl,
    },
    safeCard: {
      backgroundColor: theme.colors.bgFooter,
      borderRadius: theme.radius.sm,
      padding: theme.spacing.lg,
      marginTop: theme.spacing.md,
      marginBottom: theme.spacing.md,
      alignItems: "center",
    },
    safeText: {
      color: theme.colors.textPrimary,
      fontSize: theme.fontSize.sm,
      textAlign: "center",
    },
    plantRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: theme.spacing.sm,
      paddingVertical: theme.spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.borderPrimary,
    },
    plantImg: {
      width: 44,
      height: 44,
      borderRadius: theme.radius.xs,
    },
    plantImgPlaceholder: {
      backgroundColor: theme.colors.bgPrimary,
      alignItems: "center",
      justifyContent: "center",
    },
    plantImgEmoji: {
      fontSize: 22,
    },
    plantInfo: {
      flex: 1,
    },
    plantName: {
      fontSize: theme.fontSize.sm,
      fontWeight: "600",
      color: theme.colors.textPrimary,
    },
    plantDate: {
      fontSize: theme.fontSize.sm,
      color: theme.colors.textTertiary,
      marginTop: 2,
    },
    riskBadge: {
      borderWidth: 1,
      borderRadius: theme.radius.xs,
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xxs,
      alignItems: "center",
    },
    riskEmoji: {
      fontSize: 12,
    },
    riskLabel: {
      fontSize: 10,
      fontWeight: "600",
    },
    actions: {
      gap: theme.spacing.sm,
      marginTop: theme.spacing.lg,
    },
    activateBtn: {
      backgroundColor: theme.colors.accentGreen,
      borderRadius: theme.radius.sm,
      padding: theme.spacing.md,
      alignItems: "center",
    },
    activateBtnDisabled: {
      opacity: 0.4,
    },
    activateBtnText: {
      color: "#fff",
      fontWeight: "700",
      fontSize: theme.fontSize.sm,
    },
    cancelBtn: {
      borderWidth: 1,
      borderColor: "#d9534f",
      borderRadius: theme.radius.sm,
      padding: theme.spacing.md,
      alignItems: "center",
    },
    cancelBtnText: {
      color: "#d9534f",
      fontWeight: "600",
      fontSize: theme.fontSize.sm,
    },
  });

const stylesByMode = {
  light: createStyles(getAppTheme("light")),
  dark: createStyles(getAppTheme("dark")),
};
