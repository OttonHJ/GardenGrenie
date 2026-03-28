import { auth } from "@/src/config/firebase";
import { exchangeCodeAsync, makeRedirectUri } from "expo-auth-session";
import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";
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
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";

WebBrowser.maybeCompleteAuthSession();

const WEB_CLIENT_ID =
  "990735411747-6mpv7kjfl4mp8ac4vqtu3g98qev4a3hh.apps.googleusercontent.com";

const GOOGLE_TOKEN_ENDPOINT = "https://oauth2.googleapis.com/token";

// ─── Tipos ─────────────────────────────────────────────────────────────────────

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
}

// ─── Contexto ──────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | null>(null);

// ─── Provider ──────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const redirectUri = makeRedirectUri({ scheme: "react-app" });

  const [request, , promptAsync] = Google.useAuthRequest({
    webClientId: WEB_CLIENT_ID,
    androidClientId:
      "990735411747-q6fjehof4iods2mcmjd98ivdllcj1omu.apps.googleusercontent.com",
    iosClientId:
      "990735411747-j7j3vcfor0tvdiqfutniom4equkfqh0f.apps.googleusercontent.com",
    redirectUri,
    usePKCE: true,
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  }, []);

  const loginWithGoogle = useCallback(async () => {
    const result = await promptAsync();

    if (result.type === "success" && request) {
      const tokenResponse = await exchangeCodeAsync(
        {
          clientId: WEB_CLIENT_ID,
          code: result.params.code,
          redirectUri,
          extraParams: request.codeVerifier
            ? { code_verifier: request.codeVerifier }
            : {},
        },
        { tokenEndpoint: GOOGLE_TOKEN_ENDPOINT }
      );
      const credential = GoogleAuthProvider.credential(
        tokenResponse.idToken ?? null,
        tokenResponse.accessToken
      );
      await signInWithCredential(auth, credential);
    } else if (result.type === "error") {
      throw new Error(result.error?.message ?? "Error al iniciar sesión con Google");
    }
  }, [promptAsync, request, redirectUri]);

  const register = useCallback(async (name: string, email: string, password: string) => {
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(credential.user, { displayName: name });
  }, []);

  const logout = useCallback(async () => {
    await signOut(auth);
  }, []);

  const sendPasswordReset = useCallback(async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, loginWithGoogle, register, logout, sendPasswordReset }}>
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
