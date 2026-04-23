import InputText, { InputTextProps } from "@/src/components/InputText";
import {
    AppTheme,
    getAppTheme,
    useProfileTheme,
} from "@/src/theme/designSystem";
import React, { useState } from "react";
import {
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

// ─── Tipos ─────────────────────────────────────────────────────────────────────

// Hereda todos los props de InputText. El padre no necesita manejar
// secureTextEntry ni el toggle de visibilidad — este componente lo encapsula.
export interface InputPasswordProps extends Omit<
  InputTextProps,
  "secureTextEntry"
> {
  hasError?: boolean;
}

// ─── Componente ────────────────────────────────────────────────────────────────

const InputPassword = React.forwardRef<TextInput, InputPasswordProps>(
  ({ hasError = false, style, ...rest }, ref) => {
    const { theme, styles } = useProfileTheme(stylesByMode);

    // Estado interno — el padre no necesita controlar esto
    const [showPassword, setShowPassword] = useState(false);

    return (
      // Row que contiene el campo y el botón de visibilidad lado a lado
      <View style={styles.row}>
        {/* InputText toma flex:1 para ocupar todo el espacio disponible
            dejando solo el espacio necesario para el botón */}
        <InputText
          ref={ref}
          secureTextEntry={!showPassword}
          hasError={hasError}
          // autoCorrect y autoCapitalize desactivados — siempre necesarios
          // en campos de contraseña para evitar sugerencias del sistema
          autoCorrect={false}
          autoCapitalize="none"
          style={[styles.input, style]}
          {...rest}
        />

        {/* Botón de toggle — cambia el ícono según el estado actual.
            El hitSlop amplía el área táctil sin cambiar el tamaño visual */}
        <TouchableOpacity
          style={[
            styles.eyeBtn,
            {
              borderColor: hasError
                ? theme.colors.categories.pink.border
                : theme.colors.borderPrimary,
              backgroundColor: theme.colors.bgSecondary,
            },
          ]}
          onPress={() => setShowPassword((prev) => !prev)}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          // Evitar que este botón interfiera con el submit del formulario
          accessibilityLabel={
            showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
          }
          accessibilityRole="button"
        >
          <Text style={styles.eyeIcon}>{showPassword ? "🙈" : "👁️"}</Text>
        </TouchableOpacity>
      </View>
    );
  },
);

InputPassword.displayName = "InputPassword";

export default InputPassword;

// ─── Estilos ───────────────────────────────────────────────────────────────────

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    // Row principal — alinea campo y botón horizontalmente
    row: {
      flexDirection: "row",
      gap: theme.spacing.sm,
    },
    // El campo ocupa todo el espacio disponible en el row
    input: {
      flex: 1,
    },
    // Botón cuadrado con mismo alto que el campo de texto
    eyeBtn: {
      borderRadius: theme.radius.sm,
      borderWidth: theme.spacing.xxs,
      paddingHorizontal: theme.spacing.md,
      justifyContent: "center",
      alignItems: "center",
    },
    eyeIcon: {
      fontSize: theme.fontSize.md,
    },
  });

const stylesByMode = {
  light: createStyles(getAppTheme("light")),
  dark: createStyles(getAppTheme("dark")),
};
