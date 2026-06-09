import FormInput from "@/src/components/FormInput";
import { Toast } from "@/src/components/Toast";
import { storage } from "@/src/config/firebase";
import { useAuth } from "@/src/context/AuthContext";
import { ProfileFormData, profileSchema } from "@/src/schemas";
import {
    AppTheme,
    getAppTheme,
    useProfileTheme,
} from "@/src/theme/designSystem";
import { zodResolver } from "@hookform/resolvers/zod";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import React, { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// ─── Tipos ─────────────────────────────────────────────────────────────────────

interface ScreenEditProfileProps {
  // Controla la visibilidad desde ScreenProfile
  visible: boolean;
  // Callback para cerrar la pantalla
  onClose: () => void;
}

// ─── Componente ────────────────────────────────────────────────────────────────

export function ScreenEditProfile({
  visible,
  onClose,
}: ScreenEditProfileProps) {
  const insets = useSafeAreaInsets();
  const { theme, styles } = useProfileTheme(stylesByMode);

  // Datos del usuario autenticado — profile viene del listener de Firestore
  // en AuthContext, se actualiza automáticamente cuando Firestore cambia
  const { user, profile, updateUserProfile } = useAuth();

  const [isLoading, setIsLoading] = useState(false);
  const [photoLoading, setPhotoLoading] = useState(false);
  const [globalError, setGlobalError] = useState("");

  // Control del Toast de éxito
  const [toastVisible, setToastVisible] = useState(false);

  // ── Configuración de React Hook Form ──────────────────────────────────────

  const {
    control, // conecta los campos con RHF
    handleSubmit, // envuelve el onSubmit con la validación de Zod
    reset, // pre-pobla el formulario con datos existentes
    formState: { errors }, // errores de validación por campo
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    // Valores iniciales vacíos — se reemplazan en el useEffect de abajo
    defaultValues: {
      displayName: "",
      username: "",
      birthday: "",
      bio: "",
    },
  });

  // ── Pre-poblar formulario con datos actuales del usuario ──────────────────

  useEffect(() => {
    // Cuando la pantalla se abre y profile ya está disponible,
    // poblar los campos con los datos actuales de Firestore.
    // reset() de RHF reemplaza todos los valores en un solo paso
    // sin disparar validación ni marcar los campos como "tocados"
    if (visible && profile) {
      reset({
        displayName: profile.displayName ?? "",
        username: profile.username ?? "",
        birthday: profile.birthday ?? "",
        bio: profile.bio ?? "",
      });
      // Limpiar mensajes anteriores al abrir
      setGlobalError("");
      setToastVisible(false);
    }
  }, [visible, profile, reset]);

  // ── Foto de perfil ────────────────────────────────────────────────────────

  const uploadPhoto = async (uri: string) => {
    if (!user) return;
    setPhotoLoading(true);
    setGlobalError("");
    try {
      const response = await fetch(uri);
      const blob = await response.blob();
      const photoRef = ref(storage, `users/${user.uid}/profile.jpg`);
      await uploadBytes(photoRef, blob);
      const downloadURL = await getDownloadURL(photoRef);
      await updateUserProfile({ photoURL: downloadURL });
      setToastVisible(true);
    } catch {
      setGlobalError("No se pudo actualizar la foto. Intenta de nuevo.");
    } finally {
      setPhotoLoading(false);
    }
  };

  const handlePhotoChange = () => {
    Alert.alert("Foto de perfil", "¿Cómo quieres actualizar tu foto?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Galería",
        onPress: async () => {
          const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
          if (status !== "granted") {
            Alert.alert("Permiso requerido", "Se necesita acceso a la galería.");
            return;
          }
          const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.7,
          });
          if (!result.canceled) await uploadPhoto(result.assets[0].uri);
        },
      },
      {
        text: "Cámara",
        onPress: async () => {
          const { status } = await ImagePicker.requestCameraPermissionsAsync();
          if (status !== "granted") {
            Alert.alert("Permiso requerido", "Se necesita acceso a la cámara.");
            return;
          }
          const result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.7,
          });
          if (!result.canceled) await uploadPhoto(result.assets[0].uri);
        },
      },
    ]);
  };

  // ── Handler de guardado ───────────────────────────────────────────────────

  const onSubmit = async (data: ProfileFormData) => {
    setGlobalError("");
    setIsLoading(true);

    try {
      // Llamar al método del contexto que actualiza Firestore + Firebase Auth
      await updateUserProfile({
        displayName: data.displayName,
        username: data.username,
        birthday: data.birthday ?? "",
        bio: data.bio ?? "",
      });

      // Mostrar toast de éxito — se auto-descarta en 3 segundos
      setToastVisible(true);

      // Cerrar la pantalla después de un breve delay para que
      // el usuario pueda ver el toast de confirmación
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (e: any) {
      // Error de red o Firestore — se muestra en el banner global
      // no en un campo específico porque no es un error de validación
      setGlobalError("No se pudieron guardar los cambios. Intenta de nuevo.");
    } finally {
      setIsLoading(false);
    }
  };

  // ── Pantalla de carga mientras profile no está disponible ─────────────────

  if (!visible) return null;

  if (!profile) {
    return (
      <View style={[styles.loadingContainer, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color={theme.colors.accentGreen} />
        <Text
          style={[styles.loadingText, { color: theme.colors.textTertiary }]}
        >
          Cargando perfil...
        </Text>
      </View>
    );
  }

  return (
    // View raíz con position relative para que el Toast absoluto
    // se posicione relativo a esta pantalla
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {/* Toast de éxito — position absolute sobre toda la pantalla */}
      <Toast
        visible={toastVisible}
        type="success"
        message="Perfil actualizado correctamente"
        onDismiss={() => setToastVisible(false)}
      />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          style={styles.flex}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: insets.bottom + 24 },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* ── Encabezado ── */}
          <View style={styles.header}>
            {/* Botón de cierre — vuelve a ScreenProfile sin guardar */}
            <TouchableOpacity
              onPress={onClose}
              style={styles.closeBtn}
              accessibilityLabel="Cerrar sin guardar"
              accessibilityRole="button"
            >
              <Text
                style={[
                  styles.closeBtnText,
                  { color: theme.colors.accentGreen },
                ]}
              >
                ← Volver
              </Text>
            </TouchableOpacity>

            <Text style={[styles.title, { color: theme.colors.textPrimary }]}>
              Editar perfil
            </Text>
            <Text
              style={[styles.subtitle, { color: theme.colors.textTertiary }]}
            >
              Los cambios se guardan en tu cuenta
            </Text>
          </View>

          {/* ── Banner de error global ──
              Solo aparece cuando hay un error de red o Firestore,
              no para errores de validación de campos individuales */}
          {globalError !== "" && (
            <View
              style={[
                styles.errorBanner,
                {
                  backgroundColor: theme.colors.categories.pink.bg,
                  borderColor: theme.colors.categories.pink.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.errorBannerText,
                  { color: theme.colors.categories.pink.border },
                ]}
              >
                {globalError}
              </Text>
              {/* Botón × para cerrar el banner manualmente */}
              <TouchableOpacity onPress={() => setGlobalError("")}>
                <Text
                  style={[
                    styles.errorBannerClose,
                    { color: theme.colors.categories.pink.border },
                  ]}
                >
                  ×
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* ── Avatar ── */}
          <View style={styles.avatarSection}>
            <View style={styles.avatarWrapper}>
              <Image
                key={profile?.photoURL ?? "placeholder"}
                source={
                  profile?.photoURL
                    ? { uri: profile.photoURL }
                    : require("@/assets/images/profilePlaceholder.png")
                }
                cachePolicy="none"
                style={styles.avatar}
              />
              {photoLoading && (
                <View style={styles.avatarOverlay}>
                  <ActivityIndicator color="#ffffff" />
                </View>
              )}
            </View>
            <TouchableOpacity
              onPress={handlePhotoChange}
              disabled={photoLoading}
              style={{ opacity: photoLoading ? 0.5 : 1 }}
            >
              <Text style={[styles.changePhotoText, { color: theme.colors.accentGreen }]}>
                Cambiar foto
              </Text>
            </TouchableOpacity>
          </View>

          {/* ── Formulario ── */}

          {/* Nombre — type text estándar */}
          <Controller
            control={control}
            name="displayName"
            render={({ field: { onChange, onBlur, value, ref } }) => (
              <FormInput
                ref={ref}
                label="Nombre"
                type="text"
                required
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.displayName?.message}
                placeholder="Tu nombre completo"
                autoCapitalize="words"
              />
            )}
          />

          {/* Alias — type formatted que fuerza minúsculas y elimina espacios */}
          <Controller
            control={control}
            name="username"
            render={({ field: { onChange, onBlur, value, ref } }) => (
              <FormInput
                ref={ref}
                label="Alias"
                type="formatted"
                required
                transform={(v) => v.toLowerCase().replace(/\s/g, "")}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.username?.message}
                placeholder="ej. maria.gonzalez"
                autoCapitalize="none"
                autoCorrect={false}
              />
            )}
          />

          {/* Fecha de nacimiento — type formatted con teclado numérico */}
          <Controller
            control={control}
            name="birthday"
            render={({ field: { onChange, onBlur, value, ref } }) => (
              <FormInput
                ref={ref}
                label="Fecha de nacimiento"
                type="date"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.birthday?.message}
                placeholder="DD/MM/AAAA"
              />
            )}
          />

          {/* Bio — multiline, máximo 160 caracteres */}
          <Controller
            control={control}
            name="bio"
            render={({ field: { onChange, onBlur, value, ref } }) => (
              <FormInput
                ref={ref}
                label="Bio"
                type="text"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.bio?.message}
                placeholder="Cuéntanos sobre ti y tus plantas..."
                multiline
                numberOfLines={4}
                // textAlignVertical asegura que el texto empiece arriba en Android
                textAlignVertical="top"
                style={styles.bioInput}
              />
            )}
          />

          {/* ── Botón guardar ── */}
          <TouchableOpacity
            style={[
              styles.saveBtn,
              {
                backgroundColor: theme.colors.accentGreen,
                // Opacidad reducida mientras carga para indicar que no está disponible
                opacity: isLoading ? 0.7 : 1,
              },
            ]}
            onPress={handleSubmit(onSubmit)}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            {isLoading ? (
              // Spinner durante el guardado — reemplaza el texto del botón
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.saveBtnText}>Guardar cambios</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

// ─── Estilos ───────────────────────────────────────────────────────────────────

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    // Raíz con position absolute para overlay completo sobre ScreenProfile
    root: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: theme.colors.bgPrimary,
    },
    flex: {
      flex: 1,
    },
    scrollContent: {
      paddingHorizontal: theme.spacing.lg,
    },
    // Pantalla de carga mientras profile es null
    loadingContainer: {
      flex: 1,
      backgroundColor: theme.colors.bgPrimary,
      justifyContent: "center",
      alignItems: "center",
      gap: theme.spacing.md,
    },
    loadingText: {
      fontSize: theme.fontSize.sm,
    },
    // Encabezado con botón volver + título
    header: {
      marginTop: theme.spacing.xl,
      marginBottom: theme.spacing.lg,
    },
    closeBtn: {
      marginBottom: theme.spacing.lg,
    },
    closeBtnText: {
      fontSize: theme.fontSize.sm,
      fontWeight: "600",
    },
    title: {
      fontSize: theme.fontSize.lg,
      fontWeight: "700",
    },
    subtitle: {
      fontSize: theme.fontSize.sm,
      marginTop: theme.spacing.xs,
    },
    // Banner de error global — parte superior del formulario
    errorBanner: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      borderRadius: theme.radius.sm,
      borderWidth: theme.spacing.xxs,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      marginBottom: theme.spacing.md,
    },
    errorBannerText: {
      fontSize: theme.fontSize.sm,
      fontWeight: "600",
      flex: 1,
    },
    errorBannerClose: {
      fontSize: theme.fontSize.lg,
      fontWeight: "300",
      marginLeft: theme.spacing.sm,
    },
    // Campo bio con altura fija para múltiples líneas
    bioInput: {
      height: 100,
      paddingTop: theme.spacing.sm,
    },
    avatarSection: {
      alignItems: "center",
      marginBottom: theme.spacing.xl,
    },
    avatarWrapper: {
      width: 90,
      height: 90,
      borderRadius: 45,
      overflow: "hidden",
      marginBottom: theme.spacing.sm,
    },
    avatar: {
      width: 90,
      height: 90,
    },
    avatarOverlay: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0,0,0,0.5)",
      justifyContent: "center",
      alignItems: "center",
    },
    changePhotoText: {
      fontSize: theme.fontSize.sm,
      fontWeight: "600",
    },
    // Botón principal de guardado
    saveBtn: {
      borderRadius: theme.radius.sm,
      paddingVertical: theme.spacing.md + 2,
      alignItems: "center",
      marginTop: theme.spacing.xl,
    },
    saveBtnText: {
      color: "#ffffff",
      fontSize: theme.fontSize.sm,
      fontWeight: "700",
    },
  });

const stylesByMode = {
  light: createStyles(getAppTheme("light")),
  dark: createStyles(getAppTheme("dark")),
};
