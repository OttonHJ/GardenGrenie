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

export function AddPlantModal({
  visible,
  editingPlant,
  onClose,
  onPlantAdded,
  onPlantEdited,
}: AddPlantModalProps) {
  const { theme, styles } = useProfileTheme(stylesByMode);
  const isEditMode = !!editingPlant;

  const initialForm = (): FormState => {
    if (!editingPlant) return EMPTY_FORM;
    const match = editingPlant.waterFrequency.match(/\d+/);
    const days = match ? parseInt(match[0]) : 7;
    return {
      name: editingPlant.name,
      scientificName: editingPlant.scientificName,
      category: editingPlant.category,
      location: editingPlant.location,
      sunlight: editingPlant.sunlight,
      temperature: editingPlant.temperature,
      waterFrequencyDays: days,
    };
  };

  const [step, setStep] = useState<Step>("options");
  const [form, setForm] = useState<FormState>(EMPTY_FORM);

  React.useEffect(() => {
    if (visible) {
      // Apertura: sincronizar estado siempre desde cero
      setForm(initialForm());
      setStep(isEditMode ? "form" : "options");
    } else {
      // Cierre: resetear para que la próxima apertura empiece limpia
      setStep("options");
      setForm(EMPTY_FORM);
    }
  }, [visible, editingPlant]);

  const handleClose = () => {
    onClose(); // el useEffect [visible] se encarga del reset
  };

  const handleOptionSelect = (option: "camera" | "gallery" | "manual") => {
    if (option === "camera") {
      // expo-camera se integrará aquí en la siguiente iteración
      Alert.alert(
        "Cámara",
        "La integración con expo-camera se implementará en la siguiente iteración.",
        [{ text: "OK", onPress: () => setStep("form") }],
      );
    } else if (option === "gallery") {
      // expo-image-picker se integrará aquí en la siguiente iteración
      Alert.alert(
        "Galería",
        "La integración con expo-image-picker se implementará en la siguiente iteración.",
        [{ text: "OK", onPress: () => setStep("form") }],
      );
    } else {
      setStep("form");
    }
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
      width: 40,
      height: 4,
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
    },
    sheetSubtitle: {
      fontSize: theme.fontSize.sm,
      color: theme.colors.textTertiary,
      textAlign: "center",
      marginTop: theme.spacing.xxs,
      marginBottom: theme.spacing.lg,
    },

    // Opciones
    option: {
      flexDirection: "row",
      alignItems: "center",
      gap: theme.spacing.md,
      backgroundColor: theme.colors.bgPrimary,
      borderRadius: theme.radius.sm,
      padding: theme.spacing.md,
      marginBottom: theme.spacing.sm,
      borderWidth: 1,
      borderColor: theme.colors.borderPrimary,
    },
    optionHighlighted: {
      borderColor: theme.colors.accentGreen,
    },
    optionIcon: {
      fontSize: 24,
    },
    optionText: {
      flex: 1,
    },
    optionTitle: {
      fontSize: theme.fontSize.sm,
      fontWeight: "600",
      color: theme.colors.textPrimary,
    },
    optionSub: {
      fontSize: 11,
      color: theme.colors.textTertiary,
      marginTop: 2,
    },
    optionArrow: {
      fontSize: 20,
      color: theme.colors.textTertiary,
    },
    cancelButton: {
      alignItems: "center",
      paddingVertical: theme.spacing.md,
      marginTop: theme.spacing.xs,
    },
    cancelText: {
      fontSize: theme.fontSize.sm,
      color: theme.colors.textTertiary,
    },

    // Formulario
    label: {
      fontSize: theme.fontSize.sm,
      fontWeight: "600",
      color: theme.colors.textSecondary,
      marginTop: theme.spacing.md,
      marginBottom: theme.spacing.xs,
    },
    required: {
      color: theme.colors.accentOrange,
    },
    input: {
      backgroundColor: theme.colors.bgPrimary,
      borderRadius: theme.radius.sm,
      borderWidth: 1,
      borderColor: theme.colors.borderPrimary,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      fontSize: theme.fontSize.sm,
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
      paddingVertical: theme.spacing.xs,
      backgroundColor: theme.colors.bgPrimary,
      borderWidth: 1,
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
      fontSize: theme.fontSize.sm,
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
      fontSize: theme.fontSize.sm,
      fontWeight: "700",
      color: "#ffffff",
    },
  });

const stylesByMode = {
  light: createStyles(getAppTheme("light")),
  dark: createStyles(getAppTheme("dark")),
};
