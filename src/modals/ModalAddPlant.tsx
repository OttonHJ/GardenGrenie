import { Plant } from "@/src/components/PlantCard";
import { storage } from "@/src/config/firebase";
import { useAuth } from "@/src/context/AuthContext";
import { ModalCamera } from "@/src/modals/ModalCamera";
import PermissionService from "@/src/services/permissionService";
import {
  PlantIdentification,
  identifyPlant,
} from "@/src/services/plantIdService";
import {
  enqueue,
  persistImageLocally,
} from "@/src/services/offlineSyncService";
import { useNetworkStatus } from "@/src/hooks/useNetworkStatus";
import {
  AppTheme,
  getAppTheme,
  useProfileTheme,
} from "@/src/theme/designSystem";
import { calcNextWatering, todayDateString } from "@/src/utils/plantUtils";
import * as ImagePicker from "expo-image-picker";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
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

const CATEGORIES = ["suculentas", "tropicales", "aromaticas", "cactaceas", "orquideas", "helechos", "palmeras"];
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
  const { user } = useAuth();
  const { isConnected } = useNetworkStatus();
  const isEditMode = !!editingPlant;

  const [step, setStep] = useState<Step>("options");
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [imageUri, setImageUri] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);
  const [cameraVisible, setCameraVisible] = useState(false);

  // Estado de la identificación por IA
  const [isIdentifying, setIsIdentifying] = useState(false);
  const [identification, setIdentification] = useState<PlantIdentification | null>(null);

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

      setForm(resolvedForm);
      setStep(isEditMode ? "form" : "options");
      setImageUri(editingPlant?.image ?? "");
    } else {
      setStep("options");
      setForm(EMPTY_FORM);
      setImageUri("");
      setIdentification(null);
      setIsIdentifying(false);
    }
  }, [visible, editingPlant]);

  const handleClose = () => {
    onClose();
  };

  /*
   * Toma el resultado de plant.id y llena los campos del formulario.
   * Solo sobreescribe campos vacíos — si el usuario ya escribió algo, lo respeta.
   */
  const applyIdentification = (result: PlantIdentification) => {
    setIdentification(result);
    if (!result.identified) return;
    setForm((prev) => ({
      ...prev,
      name: prev.name || result.name,
      scientificName: prev.scientificName || result.scientificName,
      category: result.category || prev.category,
      waterFrequencyDays: result.waterFrequencyDays,
    }));
  };

  /*
   * Después de tomar una foto con la cámara, navega al formulario
   * e intenta identificar la planta en segundo plano.
   */
  const handleCameraCapture = async (uri: string) => {
    setImageUri(uri);
    setCameraVisible(false);
    setStep("form");
    setIsIdentifying(true);
    try {
      const result = await identifyPlant(uri);
      applyIdentification(result);
    } catch {
      setIdentification({ identified: false, name: "", scientificName: "", probability: 0, waterFrequencyDays: 7, category: "tropicales", description: "", allSuggestions: [] });
    } finally {
      setIsIdentifying(false);
    }
  };

  const handleOptionSelect = async (option: "camera" | "gallery" | "manual") => {
    if (option === "camera") {
      setCameraVisible(true);
      return;
    } else if (option === "gallery") {
      const status = await PermissionService.requestMediaLibraryPermission();
      if (!PermissionService.isGranted(status)) {
        Alert.alert("Permiso requerido", "Necesitamos acceso a la galería.");
        setStep("form");
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: "images",
        quality: 0.7,
      });
      if (!result.canceled) {
        const uri = result.assets[0].uri;
        setImageUri(uri);
        setStep("form");
        // Identifica la planta seleccionada de galería igual que con la cámara
        setIsIdentifying(true);
        try {
          const identified = await identifyPlant(uri);
          applyIdentification(identified);
        } catch {
          setIdentification({ identified: false, name: "", scientificName: "", probability: 0, waterFrequencyDays: 7, category: "tropicales", description: "", allSuggestions: [] });
        } finally {
          setIsIdentifying(false);
        }
        return;
      }
    }

    setStep("form");
  };

  const handlePickImage = () => {
    Alert.alert("Agregar foto", "¿Cómo quieres agregar la foto?", [
      { text: "Tomar foto", onPress: () => handleOptionSelect("camera") },
      { text: "Elegir de galería", onPress: () => handleOptionSelect("gallery") },
      { text: "Cancelar", style: "cancel" },
    ]);
  };

  const uploadImage = async (uri: string, plantId: string): Promise<string> => {
    if (!uri || !user) return "";

    const ext = uri.split("?")[0].split(".").pop()?.toLowerCase() ?? "jpg";
    const mimeMap: Record<string, string> = {
      jpg: "image/jpeg",
      jpeg: "image/jpeg",
      png: "image/png",
      webp: "image/webp",
      heic: "image/heic",
    };
    const contentType = mimeMap[ext] ?? "image/jpeg";

    const blob = await new Promise<Blob>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.onload = () => resolve(xhr.response);
      xhr.onerror = () => reject(new Error("No se pudo leer la imagen"));
      xhr.responseType = "blob";
      xhr.open("GET", uri, true);
      xhr.send(null);
    });

    if (blob.size > 5 * 1024 * 1024) {
      throw new Error("La imagen no puede superar los 5 MB.");
    }

    const storageRef = ref(storage, `users/${user.uid}/plants/${plantId}`);
    await uploadBytes(storageRef, blob, { contentType });
    return await getDownloadURL(storageRef);
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      Alert.alert("Campo requerido", "El nombre de la planta es obligatorio.");
      return;
    }

    setIsSaving(true);
    try {
      const freqOption =
        WATER_FREQUENCIES.find((f) => f.days === form.waterFrequencyDays) ??
        WATER_FREQUENCIES[1];

      if (isEditMode && editingPlant) {
        const finalImage = imageUri !== (editingPlant.image as string)
          ? await uploadImage(imageUri, editingPlant.id)
          : imageUri;
        const updatedPlant: Plant = {
          ...editingPlant,
          name: form.name.trim(),
          scientificName: form.scientificName.trim(),
          category: form.category,
          location: form.location,
          sunlight: form.sunlight,
          temperature: form.temperature,
          waterFrequency: freqOption.label,
          image: finalImage,
        };
        onPlantEdited?.(updatedPlant);
      } else {
        const plantId = Date.now().toString();

        if (!isConnected) {
          // Offline: queue image upload (if any), save metadata via Firestore SDK (queues offline)
          let pendingUpload = false;
          if (imageUri && user) {
            const localPath = await persistImageLocally(imageUri, plantId);
            await enqueue({
              plantId,
              userId: user.uid,
              imagePath: localPath,
              needsIdentification: !form.scientificName.trim(),
            });
            pendingUpload = true;
          }
          const newPlant: Plant = {
            id: plantId,
            createdAt: Date.now(),
            name: form.name.trim(),
            scientificName: form.scientificName.trim(),
            image: imageUri || "",
            lastWatered: todayDateString(),
            nextWatering: calcNextWatering(form.waterFrequencyDays),
            sunlight: form.sunlight,
            temperature: form.temperature,
            waterFrequency: freqOption.label,
            location: form.location,
            category: form.category,
            pendingUpload,
            description: identification?.description ?? "",
          };
          onPlantAdded(newPlant);
        } else {
          const finalImage = await uploadImage(imageUri, plantId);
          const newPlant: Plant = {
            id: plantId,
            createdAt: Date.now(),
            name: form.name.trim(),
            scientificName: form.scientificName.trim(),
            image: finalImage,
            lastWatered: todayDateString(),
            nextWatering: calcNextWatering(form.waterFrequencyDays),
            sunlight: form.sunlight,
            temperature: form.temperature,
            waterFrequency: freqOption.label,
            location: form.location,
            category: form.category,
            description: identification?.description ?? "",
          };
          onPlantAdded(newPlant);
        }
      }
      handleClose();
    } catch (e: any) {
      console.error("[ModalAddPlant save error]", e?.code, e?.message, e);
      Alert.alert("Error", "No se pudo guardar la planta. Intenta de nuevo.");
    } finally {
      setIsSaving(false);
    }
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

      {/* Banner de identificación por IA */}
      {isIdentifying && (
        <View style={[styles.infoBanner, { backgroundColor: theme.colors.bgPrimary, borderColor: theme.colors.borderPrimary }]}>
          <ActivityIndicator size="small" color={theme.colors.accentGreen} />
          <Text style={[styles.infoBannerText, { color: theme.colors.textSecondary, marginLeft: 8 }]}>
            Identificando planta con IA...
          </Text>
        </View>
      )}

      {/* Resultado de identificación — muestra nombre y % de confianza */}
      {!isIdentifying && identification?.identified && (
        <View style={[styles.infoBanner, {
          backgroundColor: theme.colors.categories.green.bg,
          borderColor: theme.colors.categories.green.border,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }]}>
          <Text style={[styles.infoBannerText, { color: theme.colors.categories.green.border, flex: 1 }]}>
            🌿 {identification.scientificName} — {Math.round(identification.probability * 100)}% de confianza
          </Text>
          <TouchableOpacity onPress={() => setIdentification(null)}>
            <Text style={{ color: theme.colors.categories.green.border, fontSize: 18, marginLeft: 8 }}>×</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Aviso si no se pudo identificar */}
      {!isIdentifying && identification !== null && !identification.identified && (
        <View style={[styles.infoBanner, { backgroundColor: theme.colors.categories.yellow.bg, borderColor: theme.colors.categories.yellow.border }]}>
          <Text style={[styles.infoBannerText, { color: theme.colors.categories.yellow.border }]}>
            {!isConnected
              ? "Sin conexión — la planta será identificada automáticamente al reconectar."
              : "No se pudo identificar la planta. Completá los datos manualmente."}
          </Text>
        </View>
      )}

      {/* Vista previa de imagen */}
      {imageUri ? (
        <TouchableOpacity
          style={styles.imagePreviewContainer}
          onPress={handlePickImage}
          activeOpacity={0.8}
        >
          <Image source={{ uri: imageUri }} style={styles.imagePreview} />
          <TouchableOpacity
            style={styles.removeImageButton}
            onPress={() => setImageUri("")}
          >
            <Text style={styles.removeImageText}>✕</Text>
          </TouchableOpacity>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          style={[styles.imagePlaceholder, { borderColor: theme.colors.borderPrimary }]}
          onPress={handlePickImage}
          activeOpacity={0.7}
        >
          <Text style={styles.imagePlaceholderIcon}>🌿</Text>
          <Text style={[styles.imagePlaceholderText, { color: theme.colors.textTertiary }]}>
            Agregar foto
          </Text>
        </TouchableOpacity>
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
          disabled={isSaving}
        >
          <Text style={styles.backButtonText}>← Volver</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.saveButton, isSaving && { opacity: 0.7 }]}
          onPress={handleSave}
          activeOpacity={0.8}
          disabled={isSaving}
        >
          {isSaving ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.saveButtonText}>
              {isEditMode ? "Guardar cambios" : "Guardar planta"}
            </Text>
          )}
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
      <ModalCamera
        visible={cameraVisible}
        onCapture={handleCameraCapture}
        onClose={() => setCameraVisible(false)}
      />
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
    imagePreviewContainer: {
      alignSelf: "center",
      marginTop: theme.spacing.md,
      marginBottom: theme.spacing.sm,
    },
    imagePreview: {
      width: 120,
      height: 120,
      borderRadius: theme.radius.md,
    },
    removeImageButton: {
      position: "absolute",
      top: -8,
      right: -8,
      backgroundColor: theme.colors.accentOrange,
      borderRadius: theme.radius.full,
      width: 24,
      height: 24,
      alignItems: "center",
      justifyContent: "center",
    },
    removeImageText: {
      color: "#ffffff",
      fontSize: 12,
      fontWeight: "700",
    },
    imagePlaceholder: {
      alignSelf: "center",
      marginTop: theme.spacing.md,
      marginBottom: theme.spacing.sm,
      width: 120,
      height: 120,
      borderRadius: theme.radius.md,
      borderWidth: 1,
      borderStyle: "dashed",
      alignItems: "center",
      justifyContent: "center",
      gap: theme.spacing.xs,
    },
    imagePlaceholderIcon: {
      fontSize: 32,
    },
    imagePlaceholderText: {
      fontSize: theme.fontSize.sm,
      fontWeight: "600",
    },
  });

const stylesByMode = {
  light: createStyles(getAppTheme("light")),
  dark: createStyles(getAppTheme("dark")),
};
