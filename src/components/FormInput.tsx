import InputPassword from "@/src/components/InputPassword";
import InputText, { InputTextProps } from "@/src/components/InputText";
import {
    AppTheme,
    getAppTheme,
    useProfileTheme,
} from "@/src/theme/designSystem";
import React from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";

// ─── Tipos ─────────────────────────────────────────────────────────────────────

// Tipos de input disponibles. Cada uno configura automáticamente
// los props nativos necesarios sin que el padre los especifique:
// "text"      → TextInput estándar
// "password"  → InputPassword con toggle de visibilidad
// "email"     → TextInput con keyboardType email-address + autoCapitalize none
// "formatted" → TextInput que aplica transform en cada cambio de valor
// "date"      → TextInput DD/MM/AAAA con slashes auto-insertados
type InputType = "text" | "password" | "email" | "formatted" | "date";

function maskDate(raw: string, prev: string): string {
  // Si el usuario borró un slash, también elimina el dígito anterior
  if (raw.length < prev.length && prev === raw + "/") {
    raw = raw.slice(0, -1);
  }
  const digits = raw.replace(/\D/g, "").slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

export interface FormInputProps extends InputTextProps {
  // Texto que aparece encima del campo
  label: string;
  // Mensaje de error que viene de RHF (fieldState.error?.message)
  // Si es undefined o "", no se muestra el bloque de error
  error?: string;
  // Muestra un asterisco naranja junto al label cuando es true
  required?: boolean;
  // Determina qué componente interno se renderiza
  type?: InputType;
  // Función que transforma el valor antes de pasarlo a RHF.
  // Solo aplica cuando type="formatted".
  // Ejemplo: (v) => v.toLowerCase().replace(/\s/g, "")
  transform?: (value: string) => string;
}

// ─── Componente ────────────────────────────────────────────────────────────────

const FormInput = React.forwardRef<TextInput, FormInputProps>(
  (
    {
      label,
      error,
      required = false,
      type = "text",
      transform,
      onChangeText,
      style,
      ...rest
    },
    ref,
  ) => {
    const { theme, styles } = useProfileTheme(stylesByMode);

    // Hay error cuando el string existe y no está vacío
    const hasError = !!error;

    const prevDateRef = React.useRef("");

    const handleChangeText = (value: string) => {
      if (type === "formatted" && transform) {
        onChangeText?.(transform(value));
      } else if (type === "date") {
        const formatted = maskDate(value, prevDateRef.current);
        prevDateRef.current = formatted;
        onChangeText?.(formatted);
      } else {
        onChangeText?.(value);
      }
    };

    // ── Renderizado del input según el tipo ─────────────────────────────────

    const renderInput = () => {
      // Contraseña: usa InputPassword que encapsula el toggle de visibilidad
      if (type === "password") {
        return (
          <InputPassword
            ref={ref}
            hasError={hasError}
            onChangeText={handleChangeText}
            style={style}
            {...rest}
          />
        );
      }

      // Email: agrega props de teclado y capitalización automáticamente
      // para que el padre no tenga que recordar agregarlos
      if (type === "email") {
        return (
          <InputText
            ref={ref}
            hasError={hasError}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            onChangeText={handleChangeText}
            style={style}
            {...rest}
          />
        );
      }

      if (type === "date") {
        return (
          <InputText
            ref={ref}
            hasError={hasError}
            keyboardType="numeric"
            maxLength={10}
            onChangeText={handleChangeText}
            style={style}
            {...rest}
          />
        );
      }

      // Text y formatted usan InputText estándar.
      // La diferencia entre ambos está en handleChangeText arriba.
      return (
        <InputText
          ref={ref}
          hasError={hasError}
          onChangeText={handleChangeText}
          style={style}
          {...rest}
        />
      );
    };

    return (
      // Contenedor vertical: label → input → error (si existe)
      <View style={styles.container}>
        {/* Label con asterisco opcional para campos obligatorios */}
        <View style={styles.labelRow}>
          <Text style={[styles.label, { color: theme.colors.textSecondary }]}>
            {label}
          </Text>
          {required && (
            <Text
              style={[styles.required, { color: theme.colors.accentOrange }]}
            >
              {" *"}
            </Text>
          )}
        </View>

        {/* Input — el tipo determina cuál componente se renderiza */}
        {renderInput()}

        {/* Error inline — solo aparece cuando hay mensaje de error.
            El ⚠️ permite identificar el error sin depender únicamente
            del color rojo, mejorando la accesibilidad */}
        {hasError && (
          <Text
            style={[
              styles.errorText,
              { color: theme.colors.categories.pink.border },
            ]}
          >
            {"⚠️ "}
            {error}
          </Text>
        )}
      </View>
    );
  },
);

FormInput.displayName = "FormInput";

export default FormInput;

// ─── Estilos ───────────────────────────────────────────────────────────────────

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    // Espaciado superior entre campos consecutivos del formulario
    container: {
      marginTop: theme.spacing.lg,
    },
    // Row para label + asterisco en la misma línea
    labelRow: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: theme.spacing.xs,
    },
    label: {
      fontSize: theme.fontSize.sm,
      fontWeight: "600",
    },
    // El asterisco usa accentOrange del DS para indicar campo obligatorio
    required: {
      fontSize: theme.fontSize.sm,
      fontWeight: "700",
    },
    // Error debajo del campo — sm para no competir visualmente con el label
    errorText: {
      fontSize: theme.fontSize.sm,
      marginTop: theme.spacing.xs,
      fontWeight: "500",
    },
  });

const stylesByMode = {
  light: createStyles(getAppTheme("light")),
  dark: createStyles(getAppTheme("dark")),
};
