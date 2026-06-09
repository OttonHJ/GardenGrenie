import { auth, db } from "@/src/config/firebase";
import { ACHIEVEMENTS_DEFAULT } from "@/src/utils/achievementUtils";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import {
  EmailAuthProvider,
  GoogleAuthProvider,
  User,
  createUserWithEmailAndPassword,
  deleteUser,
  onAuthStateChanged,
  reauthenticateWithCredential,
  sendPasswordResetEmail,
  signInWithCredential,
  signInWithEmailAndPassword,
  signOut,
  updatePassword,
  updateProfile,
} from "firebase/auth";
import {
  deleteDoc,
  doc,
  onSnapshot,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

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
  register: (
    name: string,
    email: string,
    password: string,
    username: string,
    birthday: string,
  ) => Promise<void>;
  logout: () => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
  // Actualiza los campos editables del perfil en Firestore y en Firebase Auth
  updateUserProfile: (data: {
    displayName?: string;
    username?: string;
    birthday?: string;
    bio?: string;
    photoURL?: string;
    profilePublic?: boolean;
  }) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  deleteAccount: (currentPassword: string | null) => Promise<void>;
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

  const saveUserDoc = useCallback(
    async (
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
        await setDoc(
          ref,
          {
            ...base,
            username: extra.username ?? "",
            birthday: extra.birthday ?? "",
            bio: "",
            achievements: ACHIEVEMENTS_DEFAULT,
          },
          { merge: true },
        );
      } else {
        await setDoc(ref, base, { merge: true });
      }
    },
    [],
  );

  const login = useCallback(
    async (email: string, password: string) => {
      const { user } = await signInWithEmailAndPassword(auth, email, password);
      await saveUserDoc(user);
    },
    [saveUserDoc],
  );

  const loginWithGoogle = useCallback(async () => {
    await GoogleSignin.hasPlayServices();
    const signInResult = await GoogleSignin.signIn();
    const idToken = signInResult.data?.idToken;
    if (!idToken) throw new Error("No se obtuvo el token de Google");
    const credential = GoogleAuthProvider.credential(idToken);
    const { user } = await signInWithCredential(auth, credential);
    await saveUserDoc(user);
  }, [saveUserDoc]);

  const register = useCallback(
    async (
      name: string,
      email: string,
      password: string,
      username: string,
      birthday: string,
    ) => {
      const { user } = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );
      await updateProfile(user, { displayName: name });
      await saveUserDoc(user, { username, birthday });
    },
    [saveUserDoc],
  );

  const logout = useCallback(async () => {
    await signOut(auth);
    await GoogleSignin.signOut();
  }, []);

  const sendPasswordReset = useCallback(async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  }, []);

  const changePassword = useCallback(
    async (currentPassword: string, newPassword: string) => {
      if (!auth.currentUser?.email) throw new Error("No hay usuario autenticado");
      const cred = EmailAuthProvider.credential(auth.currentUser.email, currentPassword);
      await reauthenticateWithCredential(auth.currentUser, cred);
      await updatePassword(auth.currentUser, newPassword);
    },
    [],
  );

  const deleteAccount = useCallback(
    async (currentPassword: string | null) => {
      if (!auth.currentUser) throw new Error("No hay usuario autenticado");
      if (currentPassword && auth.currentUser.email) {
        const cred = EmailAuthProvider.credential(auth.currentUser.email, currentPassword);
        await reauthenticateWithCredential(auth.currentUser, cred);
      }
      const uid = auth.currentUser.uid;
      await deleteDoc(doc(db, "users", uid));
      await deleteUser(auth.currentUser);
    },
    [],
  );

  // ── Actualización de perfil ────────────────────────────────────────────────
  const updateUserProfile = useCallback(
    async (data: {
      displayName?: string;
      username?: string;
      birthday?: string;
      bio?: string;
      photoURL?: string;
    }) => {
      // No puede ejecutarse sin usuario autenticado
      if (!user) throw new Error("No hay usuario autenticado");

      const ref = doc(db, "users", user.uid);

      // Construir el objeto a actualizar — solo los campos que llegan en data
      // evitando sobreescribir campos que no se están editando
      const updateData: Record<string, any> = {
        updatedAt: serverTimestamp(),
      };

      if (data.displayName !== undefined)
        updateData.displayName = data.displayName;
      if (data.username !== undefined) updateData.username = data.username;
      if (data.birthday !== undefined) updateData.birthday = data.birthday;
      if (data.bio !== undefined) updateData.bio = data.bio;
      if (data.photoURL !== undefined) updateData.photoURL = data.photoURL;
      if (data.profilePublic !== undefined) updateData.profilePublic = data.profilePublic;

      await updateDoc(ref, updateData);

      // Sincronizar displayName y photoURL en Firebase Auth
      if (auth.currentUser && (data.displayName !== undefined || data.photoURL !== undefined)) {
        await updateProfile(auth.currentUser, {
          ...(data.displayName !== undefined && { displayName: data.displayName }),
          ...(data.photoURL !== undefined && { photoURL: data.photoURL }),
        });
      }
    },
    [user],
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        login,
        loginWithGoogle,
        register,
        logout,
        sendPasswordReset,
        updateUserProfile,
        changePassword,
        deleteAccount,
      }}
    >
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
