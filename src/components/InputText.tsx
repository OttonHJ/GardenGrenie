import {
    AppTheme,
    getAppTheme,
    useProfileTheme,
} from "@/src/theme/designSystem";
import React, { useState } from "react";
import { StyleSheet, TextInput, TextInputProps } from "react-native";

// ─── Tipos ─────────────────────────────────────────────────────────────────────

export interface InputTextProps extends TextInputProps {
  hasError?: boolean;
}

// ─── Componente ────────────────────────────────────────────────────────────────

const InputText = React.forwardRef<TextInput, InputTextProps>(
  ({ hasError = false, style, onFocus, onBlur, ...rest }, ref) => {
    const { theme, styles } = useProfileTheme(stylesByMode);
    const [isFocused, setIsFocused] = useState(false);

    const borderColor = hasError
      ? theme.colors.categories.pink.border
      : isFocused
        ? theme.colors.accentGreen
        : theme.colors.borderPrimary;

    const handleFocus = (e: any) => {
      setIsFocused(true);
      onFocus?.(e);
    };

    const handleBlur = (e: any) => {
      setIsFocused(false);
      onBlur?.(e);
    };

    return (
      <TextInput
        ref={ref}
        style={[
          styles.input,
          {
            backgroundColor: theme.colors.bgSecondary,
            borderColor,
            color: theme.colors.textPrimary,
          },
          style,
        ]}
        placeholderTextColor={theme.colors.textTertiary}
        onFocus={handleFocus}
        onBlur={handleBlur}
        {...rest}
      />
    );
  },
);

InputText.displayName = "InputText";

export default InputText;

// ─── Estilos ───────────────────────────────────────────────────────────────────

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    input: {
      borderRadius: theme.radius.sm,
      borderWidth: theme.spacing.xxs,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.md,
      fontSize: theme.fontSize.sm,
    },
  });

const stylesByMode = {
  light: createStyles(getAppTheme("light")),
  dark: createStyles(getAppTheme("dark")),
};
