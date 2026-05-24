export default {
  preset: "jest-expo",

  // Archivos de prueba — solo busca en tests/
  testMatch: [
    "<rootDir>/tests/unit/**/*.test.{ts,tsx}",
    "<rootDir>/tests/integration/**/*.test.{ts,tsx}",
  ],

  // Setup: mocks de Firebase, Reanimated, GestureHandler, AsyncStorage
  setupFilesAfterEnv: ["<rootDir>/tests/jest.setup.js"],

  // Transforma módulos nativos que usan ESM (sin / al final para cubrir expo-modules-core, etc.)
  transformIgnorePatterns: [
    "node_modules/(?!(react-native|@react-native|@react-native-community|expo|@expo|expo-router|@react-navigation|react-native-reanimated|react-native-gesture-handler|react-native-safe-area-context|react-native-screens|@react-native-async-storage|firebase|@firebase|lucide-react-native|react-native-svg))",
  ],

  // Alias @/ → raíz del proyecto (igual que tsconfig)
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
  },

  // Reportes de cobertura sobre src/
  collectCoverageFrom: [
    "src/**/*.{ts,tsx}",
    "!src/**/*.d.ts",
  ],
};
