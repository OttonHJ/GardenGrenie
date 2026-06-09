import { Toast } from "@/src/components/Toast";
import { useAuth } from "@/src/context/AuthContext";
import {
  AppTheme,
  getAppTheme,
  useProfileTheme,
} from "@/src/theme/designSystem";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface ScreenSecurityProps {
  visible: boolean;
  onClose: () => void;
}

export function ScreenSecurity({ visible, onClose }: ScreenSecurityProps) {
  const insets = useSafeAreaInsets();
  const { theme, styles } = useProfileTheme(stylesByMode);
  const { user, profile, updateUserProfile, changePassword, deleteAccount } = useAuth();

  const isEmailUser = user?.providerData.some((p) => p.providerId === "password") ?? false;

  const [currentPwd, setCurrentPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [pwdLoading, setPwdLoading] = useState(false);
  const [pwdError, setPwdError] = useState("");
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [profilePublicLoading, setProfilePublicLoading] = useState(false);
  const [showDeletePanel, setShowDeletePanel] = useState(false);
  const [deletePwd, setDeletePwd] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  if (!visible) return null;

  const handleTogglePublic = async (value: boolean) => {
    setProfilePublicLoading(true);
    try {
      await updateUserProfile({ profilePublic: value });
    } finally {
      setProfilePublicLoading(false);
    }
  };

  const handleChangePassword = async () => {
    setPwdError("");
    if (!currentPwd) { setPwdError("Ingresa tu contraseña actual."); return; }
    if (newPwd.length < 8) { setPwdError("La nueva contraseña debe tener al menos 8 caracteres."); return; }
    if (newPwd !== confirmPwd) { setPwdError("Las contraseñas nuevas no coinciden."); return; }

    setPwdLoading(true);
    try {
      await changePassword(currentPwd, newPwd);
      setCurrentPwd("");
      setNewPwd("");
      setConfirmPwd("");
      setToastMessage("Contraseña actualizada correctamente");
      setToastVisible(true);
    } catch (e: any) {
      const code = e?.code ?? "";
      if (code === "auth/wrong-password" || code === "auth/invalid-credential") {
        setPwdError("Contraseña actual incorrecta.");
      } else {
        setPwdError("No se pudo cambiar la contraseña. Intenta de nuevo.");
      }
    } finally {
      setPwdLoading(false);
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Eliminar cuenta",
      "Esta acción es permanente y no se puede deshacer. Se eliminarán todos tus datos, plantas y configuraciones.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Continuar",
          style: "destructive",
          onPress: () => {
            if (isEmailUser) {
              setShowDeletePanel(true);
              setDeletePwd("");
              setDeleteError("");
            } else {
              Alert.alert(
                "Confirmar eliminación",
                "¿Seguro que deseas eliminar tu cuenta de Google vinculada?",
                [
                  { text: "Cancelar", style: "cancel" },
                  {
                    text: "Sí, eliminar",
                    style: "destructive",
                    onPress: async () => {
                      setDeleteLoading(true);
                      try {
                        await deleteAccount(null);
                      } catch {
                        Alert.alert("Error", "No se pudo eliminar la cuenta. Intenta cerrar sesión y volver a iniciar sesión antes de intentarlo.");
                      } finally {
                        setDeleteLoading(false);
                      }
                    },
                  },
                ],
              );
            }
          },
        },
      ],
    );
  };

  const handleConfirmDelete = async () => {
    if (!deletePwd) { setDeleteError("Ingresa tu contraseña para confirmar."); return; }
    setDeleteLoading(true);
    setDeleteError("");
    try {
      await deleteAccount(deletePwd);
    } catch (e: any) {
      const code = e?.code ?? "";
      if (code === "auth/wrong-password" || code === "auth/invalid-credential") {
        setDeleteError("Contraseña incorrecta.");
      } else {
        setDeleteError("No se pudo eliminar la cuenta. Intenta de nuevo.");
      }
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <Toast
        visible={toastVisible}
        type="success"
        message={toastMessage}
        onDismiss={() => setToastVisible(false)}
      />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          style={styles.flex}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 40 }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Encabezado */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn} accessibilityRole="button">
              <Text style={[styles.closeBtnText, { color: theme.colors.accentGreen }]}>← Volver</Text>
            </TouchableOpacity>
            <Text style={[styles.title, { color: theme.colors.textPrimary }]}>Seguridad</Text>
            <Text style={[styles.subtitle, { color: theme.colors.textTertiary }]}>
              Gestiona el acceso y la privacidad de tu cuenta
            </Text>
          </View>

          {/* ── Proveedor vinculado ── */}
          <View style={[styles.card, { backgroundColor: theme.colors.bgSecondary, borderColor: theme.colors.borderPrimary }]}>
            <Text style={[styles.sectionLabel, { color: theme.colors.textTertiary }]}>CUENTA VINCULADA</Text>
            <View style={[
              styles.providerBadge,
              { backgroundColor: isEmailUser ? theme.colors.categories.green.bg : theme.colors.categories.brown.bg,
                borderColor: isEmailUser ? theme.colors.categories.green.border : theme.colors.categories.brown.border }
            ]}>
              <Text style={[styles.providerText, { color: isEmailUser ? theme.colors.categories.green.border : theme.colors.categories.brown.border }]}>
                {isEmailUser ? "📧  Email / Contraseña" : "🔵  Google"}
              </Text>
            </View>
          </View>

          {/* ── Visibilidad del perfil ── */}
          <View style={[styles.card, { backgroundColor: theme.colors.bgSecondary, borderColor: theme.colors.borderPrimary }]}>
            <Text style={[styles.sectionLabel, { color: theme.colors.textTertiary }]}>PRIVACIDAD</Text>
            <View style={styles.switchRow}>
              <View style={styles.switchTextBlock}>
                <Text style={[styles.switchTitle, { color: theme.colors.textPrimary }]}>Perfil público</Text>
                <Text style={[styles.switchDesc, { color: theme.colors.textTertiary }]}>
                  {profile?.profilePublic
                    ? "Tu perfil es visible para otros usuarios"
                    : "Tu perfil es privado"}
                </Text>
              </View>
              {profilePublicLoading
                ? <ActivityIndicator color={theme.colors.accentGreen} />
                : <Switch
                    value={profile?.profilePublic ?? false}
                    onValueChange={handleTogglePublic}
                    trackColor={{ false: theme.colors.borderPrimary, true: theme.colors.accentGreen }}
                    thumbColor="#ffffff"
                  />
              }
            </View>
          </View>

          {/* ── Cambiar contraseña ── */}
          <View style={[styles.card, { backgroundColor: theme.colors.bgSecondary, borderColor: theme.colors.borderPrimary }]}>
            <Text style={[styles.sectionLabel, { color: theme.colors.textTertiary }]}>CONTRASEÑA</Text>

            {isEmailUser ? (
              <>
                <PasswordField
                  placeholder="Contraseña actual"
                  value={currentPwd}
                  onChangeText={setCurrentPwd}
                  theme={theme}
                  styles={styles}
                />
                <PasswordField
                  placeholder="Nueva contraseña (mín. 8 caracteres)"
                  value={newPwd}
                  onChangeText={setNewPwd}
                  theme={theme}
                  styles={styles}
                />
                <PasswordField
                  placeholder="Confirmar nueva contraseña"
                  value={confirmPwd}
                  onChangeText={setConfirmPwd}
                  theme={theme}
                  styles={styles}
                />

                {pwdError !== "" && (
                  <Text style={[styles.fieldError, { color: theme.colors.categories.pink.border }]}>
                    {pwdError}
                  </Text>
                )}

                <TouchableOpacity
                  style={[styles.actionBtn, { backgroundColor: theme.colors.accentGreen, opacity: pwdLoading ? 0.7 : 1 }]}
                  onPress={handleChangePassword}
                  disabled={pwdLoading}
                  activeOpacity={0.8}
                >
                  {pwdLoading
                    ? <ActivityIndicator color="#ffffff" />
                    : <Text style={styles.actionBtnText}>Actualizar contraseña</Text>
                  }
                </TouchableOpacity>
              </>
            ) : (
              <View style={[styles.infoBox, { backgroundColor: theme.colors.categories.brown.bg, borderColor: theme.colors.categories.brown.border }]}>
                <Text style={[styles.infoText, { color: theme.colors.textSecondary }]}>
                  Tu cuenta está vinculada con Google. Para cambiar tu contraseña visita la configuración de tu cuenta de Google.
                </Text>
              </View>
            )}
          </View>

          {/* ── Zona de peligro ── */}
          <View style={[styles.card, { backgroundColor: theme.colors.bgSecondary, borderColor: theme.colors.categories.pink.border }]}>
            <Text style={[styles.sectionLabel, { color: theme.colors.categories.pink.border }]}>ZONA DE PELIGRO</Text>
            <Text style={[styles.dangerDesc, { color: theme.colors.textTertiary }]}>
              Eliminar tu cuenta borrará permanentemente todos tus datos, plantas y configuraciones. Esta acción no se puede deshacer.
            </Text>

            {showDeletePanel && isEmailUser ? (
              <>
                <TextInput
                  placeholder="Contraseña para confirmar"
                  placeholderTextColor={theme.colors.textTertiary}
                  value={deletePwd}
                  onChangeText={setDeletePwd}
                  secureTextEntry
                  style={[styles.pwdInput, { color: theme.colors.textPrimary, borderColor: theme.colors.categories.pink.border, backgroundColor: theme.colors.bgPrimary }]}
                />
                {deleteError !== "" && (
                  <Text style={[styles.fieldError, { color: theme.colors.categories.pink.border }]}>{deleteError}</Text>
                )}
                <View style={styles.deleteActions}>
                  <TouchableOpacity
                    style={[styles.dangerBtn, { flex: 1, borderColor: theme.colors.borderPrimary }]}
                    onPress={() => { setShowDeletePanel(false); setDeleteError(""); }}
                  >
                    <Text style={[styles.dangerBtnText, { color: theme.colors.textTertiary }]}>Cancelar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.dangerBtnFilled, { flex: 1, backgroundColor: theme.colors.categories.pink.border, opacity: deleteLoading ? 0.7 : 1 }]}
                    onPress={handleConfirmDelete}
                    disabled={deleteLoading}
                  >
                    {deleteLoading
                      ? <ActivityIndicator color="#ffffff" />
                      : <Text style={styles.dangerBtnFilledText}>Confirmar</Text>
                    }
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <TouchableOpacity
                style={[styles.dangerBtn, { borderColor: theme.colors.categories.pink.border, opacity: deleteLoading ? 0.6 : 1 }]}
                onPress={handleDeleteAccount}
                disabled={deleteLoading}
                activeOpacity={0.8}
              >
                {deleteLoading
                  ? <ActivityIndicator color={theme.colors.categories.pink.border} />
                  : <Text style={[styles.dangerBtnText, { color: theme.colors.categories.pink.border }]}>Eliminar cuenta</Text>
                }
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

function PasswordField({
  placeholder,
  value,
  onChangeText,
  theme,
  styles,
}: {
  placeholder: string;
  value: string;
  onChangeText: (v: string) => void;
  theme: AppTheme;
  styles: ReturnType<typeof createStyles>;
}) {
  return (
    <TextInput
      placeholder={placeholder}
      placeholderTextColor={theme.colors.textTertiary}
      value={value}
      onChangeText={onChangeText}
      secureTextEntry
      style={[
        styles.pwdInput,
        { color: theme.colors.textPrimary, borderColor: theme.colors.borderPrimary, backgroundColor: theme.colors.bgPrimary },
      ]}
    />
  );
}

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    root: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: theme.colors.bgPrimary,
    },
    flex: { flex: 1 },
    scrollContent: {
      paddingHorizontal: theme.spacing.lg,
    },
    header: {
      marginTop: theme.spacing.xl,
      marginBottom: theme.spacing.lg,
    },
    closeBtn: { marginBottom: theme.spacing.lg },
    closeBtnText: { fontSize: theme.fontSize.sm, fontWeight: "600" },
    title: { fontSize: theme.fontSize.lg, fontWeight: "700" },
    subtitle: { fontSize: theme.fontSize.sm, marginTop: theme.spacing.xs },
    card: {
      borderRadius: theme.radius.sm,
      borderWidth: 1,
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.md,
      marginBottom: theme.spacing.lg,
      gap: theme.spacing.md,
    },
    sectionLabel: {
      fontSize: 11,
      fontWeight: "700",
      letterSpacing: 0.8,
    },
    providerBadge: {
      alignSelf: "flex-start",
      borderWidth: 1,
      borderRadius: theme.radius.full,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.xs,
    },
    providerText: { fontSize: theme.fontSize.sm, fontWeight: "600" },
    switchRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: theme.spacing.md,
    },
    switchTextBlock: { flex: 1 },
    switchTitle: { fontSize: theme.fontSize.sm, fontWeight: "600" },
    switchDesc: { fontSize: 12, marginTop: 2 },
    pwdInput: {
      borderWidth: 1,
      borderRadius: theme.radius.sm,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm + 2,
      fontSize: theme.fontSize.sm,
    },
    fieldError: {
      fontSize: theme.fontSize.sm,
      fontWeight: "600",
    },
    actionBtn: {
      borderRadius: theme.radius.sm,
      paddingVertical: theme.spacing.md + 2,
      alignItems: "center",
      marginTop: theme.spacing.xs,
    },
    actionBtnText: { color: "#ffffff", fontSize: theme.fontSize.sm, fontWeight: "700" },
    infoBox: {
      borderWidth: 1,
      borderRadius: theme.radius.sm,
      padding: theme.spacing.md,
    },
    infoText: { fontSize: theme.fontSize.sm, lineHeight: 20 },
    dangerDesc: { fontSize: theme.fontSize.sm, lineHeight: 20 },
    dangerBtn: {
      borderWidth: 1.5,
      borderRadius: theme.radius.sm,
      paddingVertical: theme.spacing.md,
      alignItems: "center",
    },
    dangerBtnText: { fontSize: theme.fontSize.sm, fontWeight: "700" },
    deleteActions: {
      flexDirection: "row",
      gap: theme.spacing.sm,
    },
    dangerBtnFilled: {
      borderRadius: theme.radius.sm,
      paddingVertical: theme.spacing.md,
      alignItems: "center",
    },
    dangerBtnFilledText: { fontSize: theme.fontSize.sm, fontWeight: "700", color: "#ffffff" },
  });

const stylesByMode = {
  light: createStyles(getAppTheme("light")),
  dark: createStyles(getAppTheme("dark")),
};
