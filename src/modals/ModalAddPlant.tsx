import { Plant } from "@/src/components/PlantCard";
import {
  AppTheme,
  getAppTheme,
  useProfileTheme,
} from "@/src/theme/designSystem";
import { calcNextWatering } from "@/src/utils/plantUtils";
import React, { useState } from "react";
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

// ─── Tipos internos ────────────────────────────────────────────────────────────

type Step = "options" | "form";
type Origin = "manual" | "camera" | "gallery";

interface FormState {
  name: string;
  scientificName: string;
  category: string;
  location: "interior" | "exterior";
  sunlight: "low" | "medium" | "high";
  temperature: string;
  waterFrequencyDays: number;
}

const EMPTY_FORM: FormState = {
  name: "",
  scientificName: "",
  category: "suculentas",
  location: "interior",
  sunlight: "medium",
  temperature: "18–25°C",
  waterFrequencyDays: 7,
};

const CATEGORIES = ["suculentas", "tropicales", "aromaticas", "cactaceas"];
const WATER_FREQUENCIES = [
  { label: "c/3 días", days: 3 },
  { label: "c/7 días", days: 7 },
  { label: "c/10 días", days: 10 },
  { label: "c/14 días", days: 14 },
];

// ─── Componente ────────────────────────────────────────────────────────────────

interface AddPlantModalProps {
  visible: boolean;
  editingPlant?: Plant | null;
  onClose: () => void;
  onPlantAdded: (plant: Plant) => void;
  onPlantEdited?: (plant: Plant) => void;
}

export function ModalAddPlant({
  visible,
  editingPlant,
  onClose,
  onPlantAdded,
  onPlantEdited,
}: AddPlantModalProps) {
  const { theme, styles } = useProfileTheme(stylesByMode);
  const isEditMode = !!editingPlant;

  const [step, setStep] = useState<Step>("options");
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [origin, setOrigin] = useState<Origin>("manual");

  React.useEffect(() => {
    if (visible) {
      const days = editingPlant?.waterFrequency.match(/\d+/)?.[0];
      const resolvedForm: FormState = editingPlant
        ? {
            name: editingPlant.name,
            scientificName: editingPlant.scientificName,
            category: editingPlant.category,
            location: editingPlant.location,
            sunlight: editingPlant.sunlight,
            temperature: editingPlant.temperature,
            waterFrequencyDays: days ? parseInt(days) : 7,
          }
        : EMPTY_FORM;

      // Apertura: sincronizar estado siempre desde cero
      setForm(resolvedForm);
      setStep(isEditMode ? "form" : "options");
      setOrigin("manual");
    } else {
      // Cierre: resetear para que la próxima apertura empiece limpia
      setStep("options");
      setForm(EMPTY_FORM);
      setOrigin("manual");
    }
  }, [visible, editingPlant]);

  const handleClose = () => {
    onClose(); // el useEffect [visible] se encarga del reset
  };

  const handleOptionSelect = (option: "camera" | "gallery" | "manual") => {
    setOrigin(option);
    setStep("form");
  };

  const handleSave = () => {
    if (!form.name.trim()) {
      Alert.alert("Campo requerido", "El nombre de la planta es obligatorio.");
      return;
    }

    const freqOption =
      WATER_FREQUENCIES.find((f) => f.days === form.waterFrequencyDays) ??
      WATER_FREQUENCIES[1];

    if (isEditMode && editingPlant) {
      // ── Modo edición: conservar id, imagen y fechas originales ──
      const updatedPlant: Plant = {
        ...editingPlant,
        name: form.name.trim(),
        scientificName: form.scientificName.trim(),
        category: form.category,
        location: form.location,
        sunlight: form.sunlight,
        temperature: form.temperature,
        waterFrequency: freqOption.label,
      };
      onPlantEdited?.(updatedPlant);
    } else {
      // ── Modo creación ──
      const newPlant: Plant = {
        id: Date.now().toString(),
        createdAt: Date.now(),
        name: form.name.trim(),
        scientificName: form.scientificName.trim(),
        image: "",
        lastWatered: new Date().toISOString().split("T")[0],
        nextWatering: calcNextWatering(form.waterFrequencyDays),
        sunlight: form.sunlight,
        temperature: form.temperature,
        waterFrequency: freqOption.label,
        location: form.location,
        category: form.category,
      };
      onPlantAdded(newPlant);
    }

    handleClose();
  };

  // ── Pantalla de opciones ──
  const renderOptions = () => (
    <View style={styles.sheet}>
      <View style={styles.handle} />
      <Text style={styles.sheetTitle}>Agregar planta</Text>
      <Text style={styles.sheetSubtitle}>¿Cómo quieres agregarla?</Text>

      <TouchableOpacity
        style={styles.option}
        onPress={() => handleOptionSelect("camera")}
        activeOpacity={0.8}
      >
        <Text style={styles.optionIcon}>📷</Text>
        <View style={styles.optionText}>
          <Text style={styles.optionTitle}>Tomar fotografía</Text>
          <Text style={styles.optionSub}>
            Usa la cámara para fotografiar tu planta
          </Text>
        </View>
        <Text style={styles.optionArrow}>›</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.option}
        onPress={() => handleOptionSelect("gallery")}
        activeOpacity={0.8}
      >
        <Text style={styles.optionIcon}>🖼️</Text>
        <View style={styles.optionText}>
          <Text style={styles.optionTitle}>Elegir de galería</Text>
          <Text style={styles.optionSub}>Selecciona una foto existente</Text>
        </View>
        <Text style={styles.optionArrow}>›</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.option, styles.optionHighlighted]}
        onPress={() => handleOptionSelect("manual")}
        activeOpacity={0.8}
      >
        <Text style={styles.optionIcon}>✏️</Text>
        <View style={styles.optionText}>
          <Text style={styles.optionTitle}>Ingresar manualmente</Text>
          <Text style={styles.optionSub}>Escribe los datos de tu planta</Text>
        </View>
        <Text style={styles.optionArrow}>›</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.cancelButton} onPress={handleClose}>
        <Text style={styles.cancelText}>Cancelar</Text>
      </TouchableOpacity>
    </View>
  );

  // ── Formulario ──
  const renderForm = () => (
    <ScrollView style={styles.sheet} contentContainerStyle={styles.formContent}>
      <View style={styles.handle} />
      <Text style={styles.sheetTitle}>
        {isEditMode ? "Editar planta" : "Nueva planta"}
      </Text>

      {/* Banner informativo para cámara/galería */}
      {!isEditMode && origin !== "manual" && (
        <View
          style={[
            styles.infoBanner,
            {
              backgroundColor: theme.colors.categories.yellow.bg,
              borderColor: theme.colors.categories.yellow.border,
            },
          ]}
        >
          <Text
            style={[
              styles.infoBannerText,
              { color: theme.colors.categories.yellow.border },
            ]}
          >
            {origin === "camera" ? "📷" : "🖼️"} La integración con{" "}
            {origin === "camera" ? "la cámara" : "la galería"} estará disponible
            próximamente. Completa los datos manualmente.
          </Text>
        </View>
      )}

      {/* Nombre */}
      <Text style={styles.label}>
        Nombre <Text style={styles.required}>*</Text>
      </Text>
      <TextInput
        style={styles.input}
        placeholder="ej. Monstera Deliciosa"
        placeholderTextColor={theme.colors.textTertiary}
        value={form.name}
        onChangeText={(v) => setForm({ ...form, name: v })}
      />

      {/* Nombre científico */}
      <Text style={styles.label}>Nombre científico</Text>
      <TextInput
        style={styles.input}
        placeholder="ej. Monstera deliciosa"
        placeholderTextColor={theme.colors.textTertiary}
        value={form.scientificName}
        onChangeText={(v) => setForm({ ...form, scientificName: v })}
      />

      {/* Categoría */}
      <Text style={styles.label}>Categoría</Text>
      <View style={styles.chipRow}>
        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[
              styles.formChip,
              form.category === cat && styles.formChipActive,
            ]}
            onPress={() => setForm({ ...form, category: cat })}
          >
            <Text
              style={[
                styles.formChipText,
                form.category === cat && styles.formChipTextActive,
              ]}
            >
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Ubicación */}
      <Text style={styles.label}>Ubicación</Text>
      <View style={styles.chipRow}>
        {(["interior", "exterior"] as const).map((loc) => (
          <TouchableOpacity
            key={loc}
            style={[
              styles.formChip,
              form.location === loc && styles.formChipActive,
            ]}
            onPress={() => setForm({ ...form, location: loc })}
          >
            <Text
              style={[
                styles.formChipText,
                form.location === loc && styles.formChipTextActive,
              ]}
            >
              {loc === "interior" ? "🏠 Interior" : "🌞 Exterior"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Luz solar */}
      <Text style={styles.label}>Luz solar</Text>
      <View style={styles.chipRow}>
        {(
          [
            { id: "low", label: "🌥️ Poca" },
            { id: "medium", label: "🌤️ Media" },
            { id: "high", label: "☀️ Directa" },
          ] as const
        ).map((opt) => (
          <TouchableOpacity
            key={opt.id}
            style={[
              styles.formChip,
              form.sunlight === opt.id && styles.formChipActive,
            ]}
            onPress={() => setForm({ ...form, sunlight: opt.id })}
          >
            <Text
              style={[
                styles.formChipText,
                form.sunlight === opt.id && styles.formChipTextActive,
              ]}
            >
              {opt.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Frecuencia de riego */}
      <Text style={styles.label}>Frecuencia de riego</Text>
      <View style={styles.chipRow}>
        {WATER_FREQUENCIES.map((f) => (
          <TouchableOpacity
            key={f.days}
            style={[
              styles.formChip,
              form.waterFrequencyDays === f.days && styles.formChipActive,
            ]}
            onPress={() => setForm({ ...form, waterFrequencyDays: f.days })}
          >
            <Text
              style={[
                styles.formChipText,
                form.waterFrequencyDays === f.days && styles.formChipTextActive,
              ]}
            >
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Temperatura */}
      <Text style={styles.label}>Temperatura ideal</Text>
      <TextInput
        style={styles.input}
        placeholder="ej. 18–25°C"
        placeholderTextColor={theme.colors.textTertiary}
        value={form.temperature}
        onChangeText={(v) => setForm({ ...form, temperature: v })}
      />

      {/* Botones */}
      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => setStep("options")}
        >
          <Text style={styles.backButtonText}>← Volver</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSave}
          activeOpacity={0.8}
        >
          <Text style={styles.saveButtonText}>
            {isEditMode ? "Guardar cambios" : "Guardar planta"}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={handleClose}
      />
      {step === "options" ? renderOptions() : renderForm()}
    </Modal>
  );
}

// ─── Estilos ────────────────────────────────────────────────────────────────────

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.5)",
    },
    sheet: {
      backgroundColor: theme.colors.bgSecondary,
      borderTopLeftRadius: theme.radius.lg,
      borderTopRightRadius: theme.radius.lg,
      paddingHorizontal: theme.spacing.lg,
      paddingBottom: theme.spacing.xxl,
      maxHeight: "85%",
    },
    formContent: {
      paddingBottom: theme.spacing.xxl,
    },
    handle: {
      width: theme.spacing.xl * 2,
      height: theme.spacing.xs,
      backgroundColor: theme.colors.borderPrimary,
      borderRadius: theme.radius.full,
      alignSelf: "center",
      marginVertical: theme.spacing.md,
    },
    sheetTitle: {
      fontSize: theme.fontSize.lg,
      fontWeight: "700",
      color: theme.colors.textPrimary,
      textAlign: "center",
      marginBottom: theme.spacing.sm,
    },
    sheetSubtitle: {
      fontSize: theme.fontSize.md,
      color: theme.colors.textTertiary,
      textAlign: "center",
      marginTop: theme.spacing.xs,
      marginBottom: theme.spacing.xl,
    },

    // Opciones
    option: {
      flexDirection: "row",
      alignItems: "center",
      gap: theme.spacing.md,
      backgroundColor: theme.colors.bgPrimary,
      borderRadius: theme.radius.sm,
      padding: theme.spacing.lg,
      marginBottom: theme.spacing.sm,
      borderWidth: theme.spacing.xxs,
      borderColor: theme.colors.borderPrimary,
    },
    optionHighlighted: {
      borderColor: theme.colors.accentGreen,
    },
    optionIcon: {
      fontSize: theme.fontSize.xl,
    },
    optionText: {
      flex: 1,
    },
    optionTitle: {
      fontSize: theme.fontSize.md - 2,
      fontWeight: "600",
      color: theme.colors.textPrimary,
    },
    optionSub: {
      fontSize: theme.fontSize.sm,
      color: theme.colors.textTertiary,
      marginTop: 2,
    },
    optionArrow: {
      fontSize: theme.fontSize.xl,
      color: theme.colors.textTertiary,
    },
    cancelButton: {
      alignItems: "center",
      paddingVertical: theme.spacing.md,
      marginTop: theme.spacing.xs,
    },
    cancelText: {
      fontSize: theme.fontSize.md,
      color: theme.colors.textTertiary,
      fontWeight: "600",
    },

    // Formulario
    label: {
      fontSize: theme.fontSize.md,
      fontWeight: "600",
      color: theme.colors.textSecondary,
      marginTop: theme.spacing.lg,
      marginBottom: theme.spacing.sm,
    },
    required: {
      color: theme.colors.accentOrange,
    },
    input: {
      backgroundColor: theme.colors.bgPrimary,
      borderRadius: theme.radius.sm,
      borderWidth: theme.spacing.xxs,
      borderColor: theme.colors.borderPrimary,
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.md,
      fontSize: theme.fontSize.md - 2,
      color: theme.colors.textPrimary,
    },
    chipRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: theme.spacing.sm,
    },
    formChip: {
      borderRadius: theme.radius.full,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      backgroundColor: theme.colors.bgPrimary,
      borderWidth: theme.spacing.xxs,
      borderColor: theme.colors.borderPrimary,
    },
    formChipActive: {
      backgroundColor: theme.colors.toggleTrackActive,
      borderColor: theme.colors.toggleTrackActive,
    },
    formChipText: {
      fontSize: theme.fontSize.sm,
      fontWeight: "600",
      color: theme.colors.textSecondary,
    },
    formChipTextActive: {
      color: "#ffffff",
    },
    buttonRow: {
      flexDirection: "row",
      gap: theme.spacing.md,
      marginTop: theme.spacing.xl,
    },
    backButton: {
      flex: 1,
      borderRadius: theme.radius.sm,
      paddingVertical: theme.spacing.md,
      borderWidth: 1,
      borderColor: theme.colors.borderPrimary,
      alignItems: "center",
    },
    backButtonText: {
      fontSize: theme.fontSize.md,
      fontWeight: "600",
      color: theme.colors.textSecondary,
    },
    saveButton: {
      flex: 2,
      backgroundColor: theme.colors.accentOrange,
      borderRadius: theme.radius.sm,
      paddingVertical: theme.spacing.md,
      alignItems: "center",
    },
    saveButtonText: {
      fontSize: theme.fontSize.md,
      fontWeight: "700",
      color: "#ffffff",
    },
    infoBanner: {
      borderRadius: theme.radius.sm,
      borderWidth: theme.spacing.xxs,
      padding: theme.spacing.md,
      marginBottom: theme.spacing.md,
    },
    infoBannerText: {
      fontSize: theme.fontSize.sm,
      lineHeight: 18,
    },
  });

const stylesByMode = {
  light: createStyles(getAppTheme("light")),
  dark: createStyles(getAppTheme("dark")),
};
