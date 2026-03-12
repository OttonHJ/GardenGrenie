import { ColorSchemeName, useColorScheme } from "react-native";

//Vamos a crear un archivo desingSystem.ts
//En donde vamos a manejar los temas claro y obscuro de los dispositivos

type ThemeMode = "light" | "dark"; //Asegura que solo recibamos estos valores

interface ThemeColors {
  //Colores pantallas
  bgPrimary: string;
  bgSecondary: string;
  bgFooter: string;
  bgPrivacyToggle: string;

  //Colores de texto
  textPrimary: string;
  textSecondary: string;
  textTertiary: string;
  textInactive: string;

  //Colores de border
  borderPrimary: string;
  borderToggle: string;
  borderPrivacy: string;
  borderFooter: string;
  separator: string;

  //Colores para highlights
  accentOrange: string;
  accentGreen: string;

  //Colores para los toggle buttons
  toggleTrack: string;
  toggleTrackActive: string;
  toggleThumb: string;

  //Colores para los Tiles de categorias
  categories: {
    green: { bg: string; border: string };
    brown: { bg: string; border: string };
    pink: { bg: string; border: string };
    yellow: { bg: string; border: string };
  };
}

//Como manejar lo espacios en la app
interface ThemeSpacing {
  xxs: number;
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  xxl: number;
}

//Como manejar los border radius
interface ThemeRadius {
  xxs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  full: number;
}

//Como manejar los font
interface ThemeFontSize {
  sm: number;
  md: number;
  lg: number;
  xl: number;
}
interface ThemeFontFam {
  standardFont: string;
}
interface ThemeFontWeight {
  semiBold: string;
  bold: string;
}

//Como manejar el tamaño de imagenes
interface ThemeImageSize {
  icon: number;
  profile: number;
  plants: number;
}
//Ahora una interface en donde juntemos cada una de la interfaces con las propiedades
export interface AppTheme {
  mode: ThemeMode;
  colors: ThemeColors;
  spacing: ThemeSpacing;
  radius: ThemeRadius;
  fontSize: ThemeFontSize;
  fontFam: ThemeFontFam;
  fontWeight: ThemeFontWeight;
  imageSize: ThemeImageSize;
}

//Aqui asignamos los valores a las interfaces. Definir objetos
const sharedImageSize: ThemeImageSize = {
  icon: 25,
  profile: 114,
  plants: 80,
};

const sharedSpacing: ThemeSpacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
};

const shareRadius: ThemeRadius = {
  xxs: 2,
  sm: 12,
  md: 18,
  lg: 24,
  xl: 30,
  full: 56,
};

//Aqui definimos los tamaños del font
const sharedFontSize: ThemeFontSize = {
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
};

//Aqui definimos los colores para el modo claro
const lightColors: ThemeColors = {
  //Colores de pantallas
  bgPrimary: "#eeede5",
  bgSecondary: "#f0f9f5",
  bgFooter: "#fef9f0",
  bgPrivacyToggle: "#f0f9f5",

  //Colores de texto
  textPrimary: "#1a4037",
  textSecondary: "#164439",
  textTertiary: "#7a7a7a",
  textInactive: "#5d8679",

  //Colores de bordes
  borderPrimary: "#e8ebe5",
  borderToggle: "#c9e4de",
  borderPrivacy: "#6b9e8b",
  borderFooter: "#f4d5a1",
  separator: "#535f47",

  //Colores para highlights
  accentOrange: "#d97326",
  accentGreen: "#6b9e8b",

  //Colores para los toggle buttons
  toggleTrack: "#c9e4de",
  toggleTrackActive: "#6b9e8b",
  toggleThumb: "#ffffff",

  //Colores para los Tiles de categorias
  categories: {
    green: { bg: "#f0f9f5", border: "#6b9e8b" },
    brown: { bg: "#f9f5f0", border: "#9e8b6b" },
    pink: { bg: "#f9f0f5", border: "#9e6b8b" },
    yellow: { bg: "#f5f9f0", border: "#8b9e6b" },
  },
};

//Aqui definimos colores para el modo obscuro
const darkColors: ThemeColors = {
  //Colores de pantallas
  bgPrimary: "#0f1a16",
  bgSecondary: "#1a2822",
  bgFooter: "#2a2318",
  bgPrivacyToggle: "#1a2822",

  //Colores de texto
  textPrimary: "#e8f5f1",
  textSecondary: "#9fc5b8",
  textTertiary: "#a8b0ac",
  textInactive: "#7a9188",

  //Colores de border
  borderPrimary: "#2d3d37",
  borderToggle: "#4a7066",
  borderPrivacy: "#4a7066",
  borderFooter: "#d9a556",
  separator: "#535f47",

  //Colores para highlights
  accentOrange: "#ff8c42",
  accentGreen: "#5db89a",

  //Colores para los toggle buttons
  toggleTrack: "#2d3d37",
  toggleTrackActive: "#5db89a",
  toggleThumb: "#e8f5f1",

  //Colores para los Tiles de categorias
  categories: {
    green: { bg: "#1e3a32", border: "#6db89a" },
    brown: { bg: "#3a2e1e", border: "#b89a6d" },
    pink: { bg: "#3a1e32", border: "#b86d9a" },
    yellow: { bg: "#2e3a1e", border: "#9ab86d" },
  },
};

//Aqui definimos la familia del font
const sharedFontFam: ThemeFontFam = {
  standardFont: "Roboto",
};

//Aqui definimos el font weight
const sharedFontWeight: ThemeFontWeight = {
  semiBold: "600",
  bold: "700",
};

//Con esto podemos definir cual interfas se utilisa con cual modo, un record para asignar quien con quien
const themes: Record<ThemeMode, AppTheme> = {
  light: {
    mode: "light",
    colors: lightColors,
    spacing: sharedSpacing,
    radius: shareRadius,
    fontSize: sharedFontSize,
    fontFam: sharedFontFam,
    fontWeight: sharedFontWeight,
    imageSize: sharedImageSize,
  },
  dark: {
    mode: "dark",
    colors: darkColors,
    spacing: sharedSpacing,
    radius: shareRadius,
    fontSize: sharedFontSize,
    fontFam: sharedFontFam,
    fontWeight: sharedFontWeight,
    imageSize: sharedImageSize,
  },
};

//Ahora hacemos una funcion que valida el null o undefined del colorschemename
export function getAppTheme(mode: ColorSchemeName): AppTheme {
  if (mode === "dark") {
    return themes.dark;
  }
  return themes.light;
}

//Un hook para que el dispoitivo tome el modo actual y aplique los cambios
export function useAppTheme(): AppTheme {
  const mode = useColorScheme();
  return getAppTheme(mode);
}

//Segun el tema, exportamos los estilos correctamos y el mismo
//tema para los que no son estilos
export function useProfileTheme(stylesByMode) {
  const theme = useAppTheme();
  return { theme, styles: stylesByMode[theme.mode] };
}
