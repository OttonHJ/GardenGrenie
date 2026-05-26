// React Native Gesture Handler mock
import "react-native-gesture-handler/jestSetup";

// React Native Reanimated mock
jest.mock("react-native-reanimated", () =>
  require("react-native-reanimated/mock")
);

// Firebase mock — evita conexión real a Firestore/Auth en pruebas
jest.mock("firebase/app", () => ({
  initializeApp: jest.fn(() => ({})),
  getApps: jest.fn(() => []),
  getApp: jest.fn(() => ({})),
}));

jest.mock("firebase/auth", () => ({
  getAuth: jest.fn(() => ({})),
  signInWithEmailAndPassword: jest.fn(),
  createUserWithEmailAndPassword: jest.fn(),
  signOut: jest.fn(),
  onAuthStateChanged: jest.fn((auth, cb) => {
    cb(null);
    return jest.fn();
  }),
  GoogleAuthProvider: jest.fn(),
  signInWithCredential: jest.fn(),
}));

jest.mock("firebase/firestore", () => ({
  getFirestore: jest.fn(() => ({})),
  collection: jest.fn(),
  doc: jest.fn(),
  getDoc: jest.fn(),
  getDocs: jest.fn(),
  addDoc: jest.fn(),
  setDoc: jest.fn(),
  updateDoc: jest.fn(),
  deleteDoc: jest.fn(),
  onSnapshot: jest.fn(() => jest.fn()),
  query: jest.fn(),
  where: jest.fn(),
  orderBy: jest.fn(),
  serverTimestamp: jest.fn(() => new Date().toISOString()),
  Timestamp: {
    fromDate: jest.fn((d) => ({ toDate: () => d })),
    now: jest.fn(() => ({ toDate: () => new Date() })),
  },
}));

jest.mock("firebase/storage", () => ({
  getStorage: jest.fn(() => ({})),
  ref: jest.fn(),
  uploadBytes: jest.fn().mockResolvedValue({}),
  getDownloadURL: jest.fn(() => Promise.resolve("https://mock-url.com/photo")),
}));

// AsyncStorage mock
jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock")
);

// expo-router mock
jest.mock("expo-router", () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  })),
  useLocalSearchParams: jest.fn(() => ({})),
  Link: "Link",
}));

// Silencia warnings de act() en pruebas de componentes async
global.console.error = jest.fn((msg, ...args) => {
  if (typeof msg === "string" && msg.includes("act(")) return;
  console.warn(msg, ...args);
});
