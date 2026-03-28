import { auth, db } from "@/src/config/firebase";
import {
  GoogleSignin,
} from "@react-native-google-signin/google-signin";
import {
  GoogleAuthProvider,
  User,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithCredential,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from "firebase/auth";
import { doc, onSnapshot, serverTimestamp, setDoc } from "firebase/firestore";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";

GoogleSignin.configure({
  webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
});

// ─── Tipos ─────────────────────────────────────────────────────────────────────

export interface UserProfile {
  displayName: string;
  email: string;
  photoURL: string;
  username: string;
  birthday: string;
  bio: string;
  profilePublic: boolean;
}

interface AuthContextValue {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  register: (name: string, email: string, password: string, username: string, birthday: string) => Promise<void>;
  logout: () => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
}

// ─── Contexto ──────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | null>(null);

// ─── Provider ──────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timeout = setTimeout(() => setLoading(false), 8000);
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      clearTimeout(timeout);
      setUser(firebaseUser);
      if (!firebaseUser) setProfile(null);
      setLoading(false);
    });
    return () => {
      clearTimeout(timeout);
      unsubscribe();
    };
  }, []);

  // Listener en tiempo real al doc del usuario en Firestore
  useEffect(() => {
    if (!user) return;
    const ref = doc(db, "users", user.uid);
    const unsubscribe = onSnapshot(ref, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setProfile({
          displayName: data.displayName ?? "",
          email: data.email ?? "",
          photoURL: data.photoURL ?? "",
          username: data.username ?? "",
          birthday: data.birthday ?? "",
          bio: data.bio ?? "",
          profilePublic: data.profilePublic ?? false,
        });
      }
    });
    return unsubscribe;
  }, [user]);

  const saveUserDoc = useCallback(async (
    firebaseUser: User,
    extra?: { username?: string; birthday?: string },
  ) => {
    const ref = doc(db, "users", firebaseUser.uid);
    const base = {
      displayName: firebaseUser.displayName ?? "",
      email: firebaseUser.email ?? "",
      photoURL: firebaseUser.photoURL ?? "",
      updatedAt: serverTimestamp(),
    };
    if (extra) {
      await setDoc(ref, { ...base, username: extra.username ?? "", birthday: extra.birthday ?? "", bio: "" }, { merge: true });
    } else {
      await setDoc(ref, base, { merge: true });
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { user } = await signInWithEmailAndPassword(auth, email, password);
    await saveUserDoc(user);
  }, [saveUserDoc]);

  const loginWithGoogle = useCallback(async () => {
    await GoogleSignin.hasPlayServices();
    const signInResult = await GoogleSignin.signIn();
    const idToken = signInResult.data?.idToken;
    if (!idToken) throw new Error("No se obtuvo el token de Google");
    const credential = GoogleAuthProvider.credential(idToken);
    const { user } = await signInWithCredential(auth, credential);
    await saveUserDoc(user);
  }, [saveUserDoc]);

  const register = useCallback(async (name: string, email: string, password: string, username: string, birthday: string) => {
    const { user } = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(user, { displayName: name });
    await saveUserDoc(user, { username, birthday });
  }, [saveUserDoc]);

  const logout = useCallback(async () => {
    await signOut(auth);
    await GoogleSignin.signOut();
  }, []);

  const sendPasswordReset = useCallback(async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  }, []);

  return (
    <AuthContext.Provider value={{ user, profile, loading, login, loginWithGoogle, register, logout, sendPasswordReset }}>
      {children}
    </AuthContext.Provider>
  );
}

// ─── Hook ──────────────────────────────────────────────────────────────────────

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  return ctx;
}
