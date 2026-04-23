import {
    AppTheme,
    getAppTheme,
    useProfileTheme,
} from "@/src/theme/designSystem";
import React, { useCallback, useEffect, useRef } from "react";
import {
    Animated,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// ─── Tipos ─────────────────────────────────────────────────────────────────────

// Tres variantes visuales según el contexto del mensaje:
// "success" → verde  — confirmación de guardado exitoso
// "error"   → rojo   — fallo de red o error del servidor
// "info"    → neutro — mensajes informativos sin urgencia
type ToastType = "success" | "error" | "info";

export interface ToastProps {
  message: string;
  type?: ToastType;
  // Controla si el toast es visible desde el padre
  visible: boolean;
  // Callback que el padre usa para marcar el toast como no visible
  // Se llama tanto en el auto-dismiss como en el cierre manual
  onDismiss: () => void;
  // Duración en ms antes del auto-dismiss. Default: 3000
  duration?: number;
}

// ─── Componente ────────────────────────────────────────────────────────────────

export function Toast({
  message,
  type = "success",
  visible,
  onDismiss,
  duration = 3000,
}: ToastProps) {
  const { theme, styles } = useProfileTheme(stylesByMode);
  const insets = useSafeAreaInsets();

  // Valor animado que controla la posición vertical del toast.
  // Inicia en -100 (fuera de pantalla hacia arriba)
  const translateY = useRef(new Animated.Value(-100)).current;

  // Timer para el auto-dismiss — guardado en ref para poder cancelarlo
  // si el usuario cierra manualmente antes de que expire
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Función de cierre ──────────────────────────────────────────────────────

  const dismiss = useCallback(() => {
    // Cancelar el timer si todavía estaba corriendo
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    // Animar la salida hacia arriba antes de notificar al padre
    Animated.timing(translateY, {
      toValue: -100,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      // Solo notificar al padre cuando la animación terminó
      onDismiss();
    });
  }, [translateY, onDismiss]);

  // ── Efecto principal — reacciona a cambios en visible ─────────────────────

  useEffect(() => {
    if (visible) {
      // Animar la entrada desde arriba hacia su posición final (0)
      Animated.timing(translateY, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();

      // Programar el auto-dismiss después de la duración configurada
      timerRef.current = setTimeout(() => {
        dismiss();
      }, duration);
    } else {
      // Si visible cambia a false desde el padre, asegurarse de
      // que la posición vuelva al estado inicial sin animación
      translateY.setValue(-100);
    }

    // Limpiar el timer cuando el componente se desmonta o visible cambia
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [visible, duration, dismiss, translateY]);

  // ── Colores según el tipo ──────────────────────────────────────────────────

  // Cada tipo tiene un par de colores del Design System:
  // fondo claro + texto/borde en el color de acento correspondiente
  const colorMap: Record<
    ToastType,
    { bg: string; text: string; border: string }
  > = {
    success: {
      bg: theme.colors.categories.green.bg,
      text: theme.colors.accentGreen,
      border: theme.colors.accentGreen,
    },
    error: {
      bg: theme.colors.categories.pink.bg,
      text: theme.colors.categories.pink.border,
      border: theme.colors.categories.pink.border,
    },
    info: {
      bg: theme.colors.bgSecondary,
      text: theme.colors.textSecondary,
      border: theme.colors.borderPrimary,
    },
  };

  const colors = colorMap[type];

  // Íconos por tipo para comunicar el mensaje sin depender solo del color
  const iconMap: Record<ToastType, string> = {
    success: "✅",
    error: "❌",
    info: "ℹ️",
  };

  // No renderizar nada si no es visible y ya está fuera de pantalla.
  // Esto evita que el componente ocupe espacio cuando no se usa.
  if (!visible) return null;

  return (
    // Animated.View aplica la transformación de traslación vertical
    <Animated.View
      style={[
        styles.container,
        {
          // paddingTop suma el safe area para no quedar bajo la barra de estado
          paddingTop: insets.top + 8,
          backgroundColor: colors.bg,
          borderBottomColor: colors.border,
          transform: [{ translateY }],
        },
      ]}
    >
      {/* Contenido del toast: ícono + mensaje + botón de cierre */}
      <View style={styles.content}>
        {/* Ícono según el tipo */}
        <Text style={styles.icon}>{iconMap[type]}</Text>

        {/* Mensaje — flex:1 para que el texto no empuje el botón × */}
        <Text
          style={[styles.message, { color: colors.text }]}
          numberOfLines={2}
        >
          {message}
        </Text>

        {/* Botón de cierre manual — hitSlop amplía el área táctil */}
        <TouchableOpacity
          onPress={dismiss}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessibilityLabel="Cerrar notificación"
          accessibilityRole="button"
        >
          <Text style={[styles.closeBtn, { color: colors.text }]}>×</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

// ─── Estilos ───────────────────────────────────────────────────────────────────

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    // Posición absoluta en la parte superior para no desplazar el contenido.
    // zIndex alto para aparecer sobre cualquier otro elemento de la pantalla.
    container: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      zIndex: 1000,
      borderBottomWidth: theme.spacing.xxs,
      paddingHorizontal: theme.spacing.lg,
      paddingBottom: theme.spacing.md,
    },
    // Row interno que alinea ícono, mensaje y botón horizontalmente
    content: {
      flexDirection: "row",
      alignItems: "center",
      gap: theme.spacing.sm,
    },
    icon: {
      fontSize: theme.fontSize.md,
    },
    // flex:1 para que el mensaje ocupe el espacio disponible entre ícono y ×
    message: {
      flex: 1,
      fontSize: theme.fontSize.sm,
      fontWeight: "600",
      lineHeight: 18,
    },
    // Botón × visualmente más grande que el texto del mensaje
    closeBtn: {
      fontSize: theme.fontSize.lg,
      fontWeight: "300",
      lineHeight: theme.spacing.xxl,
    },
  });

const stylesByMode = {
  light: createStyles(getAppTheme("light")),
  dark: createStyles(getAppTheme("dark")),
};
